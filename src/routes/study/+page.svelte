<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	type StudyCard = NonNullable<PageData['cards']>[number];

	let flipped = false;
	let deckName = 'JLPT N5 Core';
	let deckId = '';
	let cardCount = 0;
	let completedCount = 0;
	let sessionPhase: 'main' | 'stash' | 'done' = 'main';
	let order: string[] = [];
	let mainIndex = 0;
	let stash: string[] = [];
	let cards: StudyCard[] = [];
	let cardMap = new Map<string, StudyCard>();
	let easyIdsList: string[] = [];
	let hardIdsList: string[] = [];
	let easyIdsSet = new Set<string>();
	let hardIdsSet = new Set<string>();
	let activeId: string | null = null;
	let currentCard: StudyCard | null = null;

	const stateVersion = 1;
	let initializedDeckId = '';
	let initializedCount = 0;

	$: if (browser && deckId && cardMap.size > 0) {
		loadProgress();
	}
	$: deckName = $page.data.deck?.name ?? 'JLPT N5 Core';
	$: deckId = $page.data.deck?.id ?? $page.url.searchParams.get('deck') ?? '';
	$: cards = $page.data.cards ?? [];
	$: cardCount = cards.length;
	$: cardMap = new Map(cards.map((card) => [card.id, card]));
	$: easyIdsSet = new Set(easyIdsList);
	$: hardIdsSet = new Set(hardIdsList);
	$: completedCount = Math.min(easyIdsList.length, cardCount);

	$: if (browser && deckId && cardCount > 0) {
		initializeSession();
	}
	$: if (browser && deckId && cardCount > 0 && order.length === 0) {
		resetSession();
	}
	$: {
		if (cardCount > 0) {
			sessionPhase;
			order;
			mainIndex;
			stash;
			cardMap;
			updateActiveCard();
		}
	}
	$: if (browser && deckId && cardCount > 0 && order.length > 0 && !currentCard && sessionPhase !== 'done') {
		mainIndex = 0;
		sessionPhase = 'main';
	}

	type StudyState = {
		version: number;
		order: string[];
		mainIndex: number;
		stash: string[];
		sessionPhase: 'main' | 'stash' | 'done';
	};

	type ProgressState = {
		version: number;
		easyIds: string[];
		hardIds: string[];
	};

	function initializeSession() {
		if (!deckId || cardCount === 0) {
			return;
		}

		if (
			initializedDeckId === deckId &&
			initializedCount === cardCount &&
			order.length === cardCount &&
			order.length > 0
		) {
			return;
		}
		initializedDeckId = deckId;
		initializedCount = cardCount;

		const stored = loadState();
		if (stored && isStateValid(stored)) {
			const normalized = normalizeState(stored);
			order = sanitizeOrder(normalized.order);
			mainIndex = normalized.mainIndex;
			stash = sanitizeStash(normalized.stash);
			sessionPhase = normalized.sessionPhase;
			skipEasyCards();
			saveState();
			const candidateId =
				sessionPhase === 'main'
					? order[mainIndex] ?? null
					: sessionPhase === 'stash'
						? stash[0] ?? null
						: null;
			if (candidateId && (currentCard || sessionPhase === 'done')) {
				return;
			}
		}

		const shuffled = shuffle(cards.map((card) => card.id));
		order = sanitizeOrder(shuffled);
		mainIndex = 0;
		stash = [];
		sessionPhase = 'main';
		skipEasyCards();
		saveState();
	}

	function isStateValid(stored: StudyState) {
		if (stored.version !== stateVersion) {
			return false;
		}
		const ids = new Set(cards.map((card) => card.id));
		if (stored.order.length !== ids.size) {
			return false;
		}
		for (const id of stored.order) {
			if (!ids.has(id)) {
				return false;
			}
		}
		return true;
	}

	function normalizeState(stored: StudyState): StudyState {
		let nextPhase = stored.sessionPhase;
		let nextMainIndex = stored.mainIndex;
		let nextStash = [...stored.stash];

		if (nextMainIndex < 0) {
			nextMainIndex = 0;
		}
		if (nextMainIndex >= stored.order.length) {
			nextMainIndex = stored.order.length;
			nextPhase = nextStash.length > 0 ? 'stash' : 'done';
		}
		if (nextPhase === 'stash' && nextStash.length === 0) {
			nextPhase = 'done';
		}

		return {
			...stored,
			mainIndex: nextMainIndex,
			stash: nextStash,
			sessionPhase: nextPhase
		};
	}

	function sanitizeOrder(list: string[]) {
		const ids = new Set(cardMap.keys());
		const filtered = list.filter((id) => ids.has(id));
		if (filtered.length !== ids.size) {
			return shuffle(Array.from(ids));
		}
		return filtered;
	}

	function sanitizeStash(list: string[]) {
		return list.filter((id) => cardMap.has(id));
	}

	function updateActiveCard() {
		activeId =
			sessionPhase === 'main'
				? order[mainIndex] ?? null
				: sessionPhase === 'stash'
					? stash[0] ?? null
					: null;
		currentCard = activeId ? cardMap.get(activeId) ?? null : null;
	}

	function skipEasyCards() {
		if (sessionPhase !== 'main' || order.length === 0) {
			return;
		}
		let nextIndex = mainIndex;
		while (nextIndex < order.length && easyIdsSet.has(order[nextIndex])) {
			nextIndex += 1;
		}
		if (nextIndex !== mainIndex) {
			mainIndex = nextIndex;
			advancePhaseIfNeeded();
			saveState();
		}
	}


	function handleHard() {
		const card = currentCard;
		if (!card) {
			resetSession();
			return;
		}
		if (sessionPhase === 'main') {
			if (!hardIdsSet.has(card.id)) {
				hardIdsList = [...hardIdsList, card.id];
				saveProgress();
			}
			if (!stash.includes(card.id)) {
				stash = [...stash, card.id];
			}
			mainIndex += 1;
			advancePhaseIfNeeded();
			skipEasyCards();
			updateActiveCard();
		} else if (sessionPhase === 'stash') {
			stash = stash.length > 1 ? [...stash.slice(1), stash[0]] : stash;
			updateActiveCard();
		}
		flipped = false;
		saveState();
	}

	function handleEasy() {
		const card = currentCard;
		if (!card) {
			resetSession();
			return;
		}
		if (!easyIdsSet.has(card.id)) {
			easyIdsList = [...easyIdsList, card.id];
			saveProgress();
		}
		if (hardIdsSet.has(card.id)) {
			hardIdsList = hardIdsList.filter((id) => id !== card.id);
			saveProgress();
		}
		if (sessionPhase === 'main') {
			mainIndex += 1;
			advancePhaseIfNeeded();
			skipEasyCards();
			updateActiveCard();
		} else if (sessionPhase === 'stash') {
			stash = stash.slice(1);
			if (stash.length === 0) {
				sessionPhase = 'done';
			}
			updateActiveCard();
		}
		flipped = false;
		saveState();
	}

	function advancePhaseIfNeeded() {
		if (mainIndex >= order.length) {
			sessionPhase = stash.length > 0 ? 'stash' : 'done';
		}
	}

	function handleReset() {
		resetSession();
	}

	function resetSession() {
		order = sanitizeOrder(cards.map((card) => card.id));
		mainIndex = 0;
		stash = [];
		sessionPhase = 'main';
		flipped = false;
		skipEasyCards();
		updateActiveCard();
		saveState();
	}

	function loadState(): StudyState | null {
		if (!browser) {
			return null;
		}
		const raw = localStorage.getItem(stateKey());
		if (!raw) {
			return null;
		}
		try {
			return JSON.parse(raw) as StudyState;
		} catch {
			return null;
		}
	}

	function saveState() {
		if (!browser || !deckId) {
			return;
		}
		const payload: StudyState = {
			version: stateVersion,
			order,
			mainIndex,
			stash,
			sessionPhase
		};
		localStorage.setItem(stateKey(), JSON.stringify(payload));
	}

	function loadProgress() {
		if (!browser || !deckId) {
			return;
		}
		const raw = localStorage.getItem(progressKey());
		if (!raw) {
			easyIdsList = [];
			hardIdsList = [];
			return;
		}
		try {
			const parsed = JSON.parse(raw) as ProgressState;
			if (parsed.version !== stateVersion) {
				easyIdsList = [];
				hardIdsList = [];
				return;
			}
			const ids = new Set(cardMap.keys());
			easyIdsList = ids.size ? parsed.easyIds.filter((id) => ids.has(id)) : parsed.easyIds;
			hardIdsList = ids.size ? parsed.hardIds.filter((id) => ids.has(id)) : parsed.hardIds;
		} catch {
			easyIdsList = [];
			hardIdsList = [];
		}
	}

	function saveProgress() {
		if (!browser || !deckId) {
			return;
		}
		const payload: ProgressState = {
			version: stateVersion,
			easyIds: easyIdsList,
			hardIds: hardIdsList
		};
		localStorage.setItem(progressKey(), JSON.stringify(payload));
	}

	function stateKey() {
		return `study_state_${deckId}`;
	}

	function progressKey() {
		return `study_progress_${deckId}`;
	}

	function shuffle(list: string[]) {
		const array = [...list];
		for (let i = array.length - 1; i > 0; i -= 1) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}

	function progressValue() {
		if (cardCount === 0) {
			return 0;
		}
		return Math.min(100, Math.round((completedCount / cardCount) * 100));
	}

	function progressWidth() {
		const value = progressValue();
		if (value === 0) {
			return 0;
		}
		return Math.max(4, value);
	}

	function handleExit() {
		goto('/decks');
	}

</script>

<div class="mx-auto flex min-h-screen w-full max-w-md flex-col overflow-x-hidden bg-[#101922] text-white shadow-2xl">
	<header class="flex items-center justify-between px-4 pt-6 pb-2">
		<div class="flex w-12 justify-start">
			<button
				class="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/10"
				type="button"
				on:click={handleExit}
			>
				<span class="material-symbols-outlined">close</span>
			</button>
		</div>
		<h2 class="flex-1 text-center text-lg font-bold tracking-tight text-white">{deckName}</h2>
		<div class="flex w-12 justify-end">
			<button
				class="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/10"
				type="button"
			>
				<span class="material-symbols-outlined">more_horiz</span>
			</button>
		</div>
	</header>

	<div class="flex flex-col gap-2 px-6 py-2">
		<div class="flex items-end justify-between">
			<span class="text-xs font-medium uppercase tracking-wider text-slate-400">Session Progress</span>
			<span class="text-sm font-bold text-green-400">{completedCount}/{cardCount}</span>
		</div>
		<div class="h-3 w-full overflow-hidden rounded-full bg-slate-800">
			<div
				class="h-full rounded-full bg-green-500 transition-[width] duration-300"
				style={`width: ${progressWidth()}%;`}
			></div>
		</div>
		{#if stash.length > 0 && sessionPhase !== 'done'}
			<p class="text-xs text-slate-500">Stash queued: {stash.length}</p>
		{/if}
	</div>

	<main class="relative z-10 flex flex-1 flex-col items-center justify-center p-6">
		{#if !$page.data.deck}
			<div class="rounded-2xl border border-dashed border-slate-700 bg-[#15202b] p-6 text-center">
				<p class="text-sm font-semibold text-slate-200">Deck not found</p>
				<p class="mt-2 text-xs text-slate-400">Return to your deck list to start a session.</p>
				<button
					class="mt-4 inline-flex items-center justify-center rounded-full bg-[#137fec] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-600"
					type="button"
					on:click={handleExit}
				>
					Back to decks
				</button>
			</div>
		{:else if cardCount === 0}
			<div class="rounded-2xl border border-dashed border-slate-700 bg-[#15202b] p-6 text-center">
				<p class="text-sm font-semibold text-slate-200">This deck is empty</p>
				<p class="mt-2 text-xs text-slate-400">Import more cards to start studying.</p>
			</div>
		{:else if sessionPhase === 'done'}
			<div class="rounded-2xl border border-slate-700 bg-[#15202b] p-6 text-center">
				<p class="text-lg font-semibold text-white">Yeeay!</p>
				<p class="mt-2 text-sm text-slate-400">
					Congratulations on finishing your flash card deck.
				</p>
				<div class="mt-5 flex flex-col gap-3">
					<button
						class="flex h-11 w-full items-center justify-center rounded-full bg-[#137fec] text-sm font-semibold text-white"
						type="button"
						on:click={handleExit}
					>
						Back to decks
					</button>
					<button
						class="flex h-11 w-full items-center justify-center rounded-full border border-slate-700 text-sm font-semibold text-slate-200"
						type="button"
						on:click={handleReset}
					>
						Restart session
					</button>
				</div>
			</div>
		{:else}
			{#if !currentCard}
				<div class="relative w-full max-h-[500px] aspect-[4/5]">
					<div
						class="relative flex h-full w-full flex-col items-center justify-center rounded-3xl border border-slate-700 bg-[#15202b] p-8 text-center"
					>
						<p class="text-sm font-semibold text-slate-200">Loading card...</p>
						<p class="mt-2 text-xs text-slate-400">Please wait a moment.</p>
					</div>
				</div>
			{:else}
				<button
					class="relative w-full max-h-[500px] aspect-[4/5] cursor-pointer"
					type="button"
					on:click={() => (flipped = !flipped)}
				>
					<div
						class="relative flex h-full w-full flex-col items-center justify-center rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] transition-transform duration-500"
					>
						<div class="absolute top-6 right-6">
							<span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-500"
								>{flipped ? 'Meaning' : 'Word'}</span
							>
						</div>
						<div class="flex flex-1 flex-col items-center justify-center gap-6">
							{#if flipped}
								<h1 class="mt-4 text-4xl font-extrabold text-slate-900">
									{currentCard.back_text}
								</h1>
								{#if currentCard.reading_text}
									<p class="text-lg font-medium text-[#137fec]">{currentCard.reading_text}</p>
								{/if}
							{:else}
								<h1 class="mt-4 text-6xl font-extrabold text-slate-900">
									{currentCard.front_text}
								</h1>
								<p class="text-lg text-slate-400">Tap to reveal</p>
							{/if}
						</div>
						<div class="absolute bottom-6 flex items-center gap-1 text-sm font-medium text-slate-300">
							<span class="material-symbols-outlined text-base">touch_app</span>
							Tap to flip
						</div>
					</div>
					<div
						class="absolute left-4 top-4 -z-10 h-full w-full rounded-3xl border border-white/5 bg-white/10"
					></div>
					<div
						class="absolute left-8 top-8 -z-20 h-full w-full rounded-3xl border border-white/5 bg-white/5"
					></div>
				</button>
			{/if}
		{/if}
	</main>

	<footer class="px-8 pt-4 pb-10">
		<div class="flex items-center justify-center gap-8">
			<div class="flex flex-col items-center gap-3">
				<button
					class="group flex h-16 w-16 items-center justify-center rounded-full bg-red-500 shadow-lg shadow-red-500/20 transition-all hover:bg-red-600 active:scale-95"
					type="button"
					on:click={handleHard}
					disabled={cardCount === 0 || sessionPhase === 'done'}
				>
					<span class="material-symbols-outlined text-3xl text-white">close</span>
				</button>
				<span class="text-xs font-semibold uppercase tracking-wider text-red-400">Hard</span>
			</div>
			<div class="flex flex-col items-center gap-3">
				<button
					class="group flex h-16 w-16 items-center justify-center rounded-full bg-green-500 shadow-lg shadow-green-500/20 transition-all hover:bg-green-600 active:scale-95"
					type="button"
					on:click={handleEasy}
					disabled={cardCount === 0 || sessionPhase === 'done'}
				>
					<span class="material-symbols-outlined text-3xl text-white">check</span>
				</button>
				<span class="text-xs font-semibold uppercase tracking-wider text-green-400">Easy</span>
			</div>
		</div>
	</footer>
</div>

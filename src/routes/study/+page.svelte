<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import EmptyStatePanel from '$lib/components/EmptyStatePanel.svelte';
	import StudyActionFooter from '$lib/components/study/StudyActionFooter.svelte';
	import StudyCard from '$lib/components/study/StudyCard.svelte';
	import StudyHeader from '$lib/components/study/StudyHeader.svelte';
	import StudyProgress from '$lib/components/study/StudyProgress.svelte';

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
	$: if (
		browser &&
		deckId &&
		cardCount > 0 &&
		order.length > 0 &&
		!currentCard &&
		sessionPhase !== 'done'
	) {
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
					? (order[mainIndex] ?? null)
					: sessionPhase === 'stash'
						? (stash[0] ?? null)
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
				? (order[mainIndex] ?? null)
				: sessionPhase === 'stash'
					? (stash[0] ?? null)
					: null;
		currentCard = activeId ? (cardMap.get(activeId) ?? null) : null;
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
		if (!browser || !deckId) return;

		localStorage.removeItem(stateKey());
		localStorage.removeItem(progressKey());

		window.location.reload();
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

	function handleExit() {
		goto('/decks');
	}

	function handleShuffle() {
		order = shuffle(cards.map((card) => card.id));
		mainIndex = 0;
		flipped = false;
		skipEasyCards();
		updateActiveCard();
		saveState();
	}
</script>

<div
	class="mx-auto flex min-h-screen w-full max-w-md flex-col overflow-x-hidden bg-[#101922] text-white shadow-2xl"
>
	<StudyHeader title={deckName} on:exit={handleExit} on:shuffle={handleShuffle} />
	<StudyProgress {completedCount} {cardCount} stashCount={stash.length} {sessionPhase} />

	<main class="relative z-10 flex flex-1 flex-col items-center justify-center p-6">
		{#if !$page.data.deck}
			<EmptyStatePanel
				title="Deck not found"
				description="Return to your deck list to start a session."
			>
				<button
					slot="action"
					class="inline-flex items-center justify-center rounded-full bg-[#137fec] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-600"
					type="button"
					on:click={handleExit}
				>
					Back to decks
				</button>
			</EmptyStatePanel>
		{:else if cardCount === 0}
			<EmptyStatePanel
				title="This deck is empty"
				description="Import more cards to start studying."
			/>
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
		{:else if !currentCard}
			<div class="relative aspect-[4/5] max-h-[500px] w-full">
				<div
					class="relative flex h-full w-full flex-col items-center justify-center rounded-3xl border border-slate-700 bg-[#15202b] p-8 text-center"
				>
					<p class="text-sm font-semibold text-slate-200">Loading card...</p>
					<p class="mt-2 text-xs text-slate-400">Please wait a moment.</p>
				</div>
			</div>
		{:else}
			<StudyCard card={currentCard} {flipped} on:toggle={() => (flipped = !flipped)} />
		{/if}
	</main>
	<StudyActionFooter
		disabled={cardCount === 0 || sessionPhase === 'done'}
		on:hard={handleHard}
		on:easy={handleEasy}
	/>
</div>

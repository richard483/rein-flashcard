import { validateToken } from '$lib/server/auth';

export const CARD_LAYOUTS = [
	'character-front',
	'character-reading-front',
	'meaning-front',
	'reading-front'
] as const;

export type CardLayout = (typeof CARD_LAYOUTS)[number];

export type ExternalDeckCard = {
	front: string;
	back: string;
	reading?: string;
};

type ExternalDeckUpdate = {
	name?: string;
	card_layout?: CardLayout;
};

export function jsonResponse(body: Record<string, unknown>, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});
}

export function normalizeText(value: unknown) {
	return typeof value === 'string' ? value.trim() : '';
}

function getCookieValue(request: Request, name: string) {
	const cookieHeader = request.headers.get('cookie');
	if (!cookieHeader) {
		return null;
	}

	for (const segment of cookieHeader.split(';')) {
		const [rawName, ...rawValueParts] = segment.trim().split('=');
		if (rawName !== name) {
			continue;
		}

		const value = rawValueParts.join('=').trim();
		return value ? decodeURIComponent(value) : null;
	}

	return null;
}

export async function getBearerUser(request: Request, fetcher: typeof fetch) {
	const authorization = request.headers.get('authorization');
	const tokenMatch = authorization?.match(/^Bearer\s+(.+)$/i);
	const accessToken = tokenMatch?.[1] ?? getCookieValue(request, 'access_token');

	return accessToken ? validateToken(accessToken, fetcher) : null;
}

export function parseCreateDeckBody(body: unknown) {
	if (!body || typeof body !== 'object') {
		return null;
	}

	const record = body as Record<string, unknown>;
	const name = normalizeText(record.name);
	const source = normalizeText(record.source);
	const rawCards = record.cards;

	if (!name || !source) {
		return null;
	}

	if (rawCards !== undefined && !Array.isArray(rawCards)) {
		return null;
	}

	const cards: ExternalDeckCard[] = [];
	for (const item of rawCards ?? []) {
		const card = parseCardBody(item);
		if (!card) {
			return null;
		}
		cards.push(card);
	}

	return { name, source, cards };
}

export function parseRenameDeckBody(body: unknown) {
	if (!body || typeof body !== 'object') {
		return null;
	}

	const record = body as Record<string, unknown>;
	const name = normalizeText(record.name);
	const hasCardLayout = 'card_layout' in record;
	const cardLayout = normalizeCardLayout(record.card_layout);
	const updates: ExternalDeckUpdate = {};

	if (hasCardLayout && !cardLayout) {
		return null;
	}

	if (name) {
		updates.name = name;
	}

	if (cardLayout) {
		updates.card_layout = cardLayout;
	}

	return Object.keys(updates).length > 0 ? updates : null;
}

export function parseCardBody(body: unknown): ExternalDeckCard | null {
	if (!body || typeof body !== 'object') {
		return null;
	}

	const record = body as Record<string, unknown>;
	const front = normalizeText(record.front);
	const back = normalizeText(record.back);
	const reading = normalizeText(record.reading);

	if (!front || !back) {
		return null;
	}

	return {
		front,
		back,
		...(reading ? { reading } : {})
	};
}

export function normalizeCardLayout(value: unknown): CardLayout | null {
	return typeof value === 'string' && CARD_LAYOUTS.includes(value as CardLayout)
		? (value as CardLayout)
		: null;
}

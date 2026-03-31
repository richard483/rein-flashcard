import { validateToken } from '$lib/server/auth';

export type ExternalDeckCard = {
	front: string;
	back: string;
	reading?: string;
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

export async function getBearerUser(request: Request, fetcher: typeof fetch) {
	const authorization = request.headers.get('authorization');
	const tokenMatch = authorization?.match(/^Bearer\s+(.+)$/i);
	if (!tokenMatch) {
		return null;
	}

	return validateToken(tokenMatch[1], fetcher);
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

	const name = normalizeText((body as Record<string, unknown>).name);
	return name ? { name } : null;
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

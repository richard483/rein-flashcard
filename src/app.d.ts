// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface PageData {
			user: { id: string; username: string } | null;
			decks?: { id: string; name: string; created_at: string; card_count: number }[];
			deck?: { id: string; name: string } | null;
			cards?: {
				id: string;
				front_text: string;
				back_text: string;
				reading_text: string | null;
				position: number;
			}[];
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};

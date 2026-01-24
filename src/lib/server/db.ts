import { PRIVATE_DB_HOST, PRIVATE_DB_NAME, PRIVATE_DB_PASSWORD, PRIVATE_DB_PORT, PRIVATE_DB_USER } from '$env/static/private';
import { Pool } from 'pg';

export const pool = new Pool({
	host: PRIVATE_DB_HOST,
	port: Number(PRIVATE_DB_PORT || 5432),
	database: PRIVATE_DB_NAME,
	user: PRIVATE_DB_USER,
	password: PRIVATE_DB_PASSWORD,
	max: 10
});

export async function query<T>(text: string, params: unknown[] = []) {
	try {
		const result = await pool.query<T>(text, params);
		return result.rows;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		const code = (error as { code?: string }).code;
		console.error('DB query failed', {
			message,
			code,
			host: PRIVATE_DB_HOST,
			port: Number(PRIVATE_DB_PORT || 5432),
			database: PRIVATE_DB_NAME,
			user: PRIVATE_DB_USER
		});
		throw error;
	}
}

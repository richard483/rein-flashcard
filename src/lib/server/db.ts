import { env } from '$env/dynamic/private';
import { Pool } from 'pg';

export const pool = new Pool({
	host: env.PRIVATE_DB_HOST,
	port: Number(env.PRIVATE_DB_PORT || 5432),
	database: env.PRIVATE_DB_NAME,
	user: env.PRIVATE_DB_USER,
	password: env.PRIVATE_DB_PASSWORD,
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

import { env } from '$env/dynamic/private';
import { Pool, type QueryResultRow } from 'pg';

const dbConfig = {
	host: env.PRIVATE_DB_HOST,
	port: Number(env.PRIVATE_DB_PORT || 5432),
	database: env.PRIVATE_DB_NAME,
	user: env.PRIVATE_DB_USER,
	password: env.PRIVATE_DB_PASSWORD,
	max: 10
};

export const pool = new Pool(dbConfig);

export async function query<T extends QueryResultRow>(text: string, params: unknown[] = []) {
	try {
		const result = await pool.query<T>(text, params);
		return result.rows;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		const code = (error as { code?: string }).code;
		console.error('DB query failed', {
			message,
			code,
			host: dbConfig.host,
			port: dbConfig.port,
			database: dbConfig.database,
			user: dbConfig.user
		});
		throw error;
	}
}

export type CsvRow = string[];

export function parseCsv(input: string): CsvRow[] {
	const rows: CsvRow[] = [];
	let currentRow: string[] = [];
	let currentField = '';
	let inQuotes = false;

	for (let i = 0; i < input.length; i += 1) {
		const char = input[i];
		const nextChar = input[i + 1];

		if (char === '"' && inQuotes && nextChar === '"') {
			currentField += '"';
			i += 1;
			continue;
		}

		if (char === '"') {
			inQuotes = !inQuotes;
			continue;
		}

		if (!inQuotes && (char === ',' || char === '\n' || char === '\r')) {
			if (char === '\r' && nextChar === '\n') {
				i += 1;
			}
			currentRow.push(currentField.trim());
			currentField = '';
			if (char !== ',') {
				if (currentRow.some((value) => value.length > 0)) {
					rows.push(currentRow);
				}
				currentRow = [];
			}
			continue;
		}

		currentField += char;
	}

	if (currentField.length > 0 || currentRow.length > 0) {
		currentRow.push(currentField.trim());
		if (currentRow.some((value) => value.length > 0)) {
			rows.push(currentRow);
		}
	}

	return rows;
}

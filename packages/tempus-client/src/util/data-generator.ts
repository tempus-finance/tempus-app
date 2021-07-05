// Functions for generating dummy data

export function generateChartData(chartEntryCount: number) {
	const data = [];
	for (let i = 0; i < chartEntryCount; i++) {
		data.push({
			name: i,
			value: Math.random() * 100,
		});
	}
	return data;
}

export function generatedArrayOfIntegers(count: number) {
	const numbers: number[] = [];
	for (let i = 0; i < count; i++) {
		numbers.push(i + 1);
	}
	return numbers;
}

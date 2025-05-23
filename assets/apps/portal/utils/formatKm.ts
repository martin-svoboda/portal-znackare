export function formatKm(km?: string | null): string {
	if (!km || isNaN(Number(km))) return "";
	return parseFloat(km).toLocaleString("cs-CZ", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 3,
	});
}

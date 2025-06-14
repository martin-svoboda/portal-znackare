export function formatKm(km?: string | null): string {
	if (!km || isNaN(Number(km))) return "";
	return parseFloat(km).toLocaleString("cs-CZ", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 3,
	});
}

export function getHeadingsFromHtml(html: string) {
	const container = document.createElement('div');
	container.innerHTML = html;
	const headings = [...container.querySelectorAll('h2, h3')].map(el => ({
		id: el.id,
		level: Number(el.tagName[1]),
		text: el.textContent || '',
	}));
	return headings;
}

/**
 * Přidá automaticky id do H2-H6, pokud ho nemají.
 * Zachovává původní id, pokud existuje.
 */
export function addHeadingIdsToHtml(html: string): string {
	// Pomocná funkce na vytvoření slug/id z textu nadpisu
	function slugify(str: string): string {
		return str
			.toLowerCase()
			.normalize('NFD') // diakritika pryč
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^a-z0-9]+/g, '-') // vše ostatní na pomlčku
			.replace(/^-+|-+$/g, '') // trim začátek/konec
			.replace(/-{2,}/g, '-'); // více pomlček na jednu
	}

	// Regular Expression pro <h2> až <h6>
	return html.replace(
		/<h([2-6])([^>]*)>([\s\S]*?)<\/h\1>/gi,
		(match, level, attrs, text) => {
			// Pokud už id existuje, necháme jak je
			if (/id=("|')[^"']+("|')/i.test(attrs)) return match;
			// Vyextrahujeme plain text (i kdyby byl uvnitř <span> apod.)
			const tmp = document.createElement('div');
			tmp.innerHTML = text;
			const headingText = tmp.textContent || tmp.innerText || '';
			const id = slugify(headingText);
			// Přidáme id do atributů
			return `<h${level}${attrs} id="${id}">${text}</h${level}>`;
		}
	);
}
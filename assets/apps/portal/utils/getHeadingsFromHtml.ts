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

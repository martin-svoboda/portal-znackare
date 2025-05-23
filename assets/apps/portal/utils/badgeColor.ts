export function getBadgeColor(val: string) {
	return val === "červená" ? "red"
		: val === "modrá" ? "blue"
			: val === "zelená" ? "green"
				: val === "žlutá" ? "yellow"
					: val === "bílá" ? "gray"
						: "gray";
}

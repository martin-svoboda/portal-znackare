export function barvaDlePresunu(val: string | undefined) {
	if (!val) return "";
	const v = val.trim().toLowerCase();
	switch (v) {
		case "PTZ":
			return "#f5f5f5";  // bílá (RAL 1013 - perlová bílá)
		case "LTZ":
			return "#f7951d";  // oranžová (RAL 2009 - dopravní oranžová)
		case "CTZ":
			return "#ffe000";  // žlutá (RAL 1003 - signální žlutá)
		default:
			return "#f5f5f5";     // fallback (bílá)
	}
}

// utils/colors.ts

export function barvaDleJmena(val: string | undefined) {
	if (!val) return "";
	const v = val.trim().toLowerCase();
	switch (v) {
		case "červená":
			return "#cc1122";   // RAL 3020 (červená signální) – přibližně #cc1122
		case "modrá":
			return "#2277bb";   // RAL 5015 (modrá nebeská) – přibližně #2277bb
		case "zelená":
			return "#01876e";   // RAL 6024 (zelená dopravní) – přibližně #01876e
		case "žlutá":
			return "#ffe000";   // RAL 1003 (žlutá signální)
		case "bílá":
			return "#f5f5f5";   // RAL 1013 (bílá perlová)
		case "oranžová":
			return "#f7951d";   // RAL 2009 (oranžová dopravní)
		case "khaki":
			return "#6A5F31";   // RAL 7008 (Khaki Gray)
		case "hnědá":
			return "#59351F";   // RAL 8007 (hnědá)
		default:
			return "#cccccc";   // fallback šedá
	}
}

export function barvaMantine(val: string) {
	if (!val) return "gray";
	const v = val.trim().toLowerCase();
	switch (v) {
		case "červená":
			return "red";
		case "modrá":
			return "blue";
		case "zelená":
			return "green";
		case "žlutá":
			return "yellow.4";
		case "bílá":
			return "orange.0";
		case "oranžová":
			return "orange";
		default:
			return "gray";
	}
}

import React from "react";
import {barvaUpozornovaci, barvaVedouci} from "../utils/colors";

type ZnackaProps = {
	color?: string; // Vedoucí barva (např. modrá)
	shape?: "pasova" | "hrad" | "studanka" | "vrchol" | "zajimavost" | "mistni" | "NS";
	move?: "PTZ" | "LTZ" | "CTZ";
	size?: number;
};

export const Znacka = ({
						   color = "",
						   shape = "pasova",
						   move = "PTZ",
						   size = 100,
					   }: ZnackaProps) => {
	let upozorneni = barvaUpozornovaci(move);
	let vedouci = barvaVedouci(color);

	if (shape === "NS") {
		upozorneni = barvaUpozornovaci("PTZ");
		vedouci = barvaVedouci("zelená");
	}

	switch (shape) {
		case "pasova":
			// Tři pásy: horní a dolní upozorňovací, střední vedoucí, mezery 5 px
			return (
				<svg width={size} height={size} viewBox="0 0 100 100">
					{/* Horní pruh */}
					<rect x={0} y={0} width={100} height={30} fill={upozorneni}/>
					{/* Prostřední pruh */}
					<rect x={0} y={35} width={100} height={30} fill={vedouci}/>
					{/* Dolní pruh */}
					<rect x={0} y={70} width={100} height={30} fill={upozorneni}/>
				</svg>
			);
		case "hrad":
			// Okolní čtverec s výřezem "hradu" (L tvar), mezera 5 bodů
			// Vnitřní tvar: 60x60 na středu, vnější výřez: 70x70
			return (
				<svg width={size} height={size} viewBox="0 0 100 100">
					{/* Pozadí - upozorňovací tvar s výřezem */}
					<defs>
						<clipPath id="clipHrad">
							{/* L tvar 70x70 (větší o 5 px na každou stranu) */}
							<polygon points="15,15 85,15 85,35 95,35 95,95 15,95"/>
						</clipPath>
					</defs>
					<rect x={0} y={0} width={100} height={100} fill={upozorneni} clipPath="url(#clipHrad)"/>
					{/* Vnitřní L tvar (hrad) */}
					<polygon points="20,20 80,20 80,30 90,30 90,90 20,90" fill={vedouci}/>
				</svg>
			);
		case "studanka":
			// Pozadí: půlkruh průměr 70, vnitřní půlkruh 60, mezera 5px, spodní hrana na spodní straně čtverce
			return (
				<svg width={size} height={size} viewBox="0 0 100 100">
					{/* Pozadí s výřezem */}
					<defs>
						<clipPath id="clipStud">
							<path d="M15,50 a35,35 0 1,0 70,0"/>
						</clipPath>
					</defs>
					<rect x={0} y={0} width={100} height={100} fill={upozorneni} clipPath="url(#clipStud)"/>
					{/* Vnitřní půlkruh */}
					<path
						d="M20,55 a30,30 0 1,0 60,0"
						fill={vedouci}
					/>
				</svg>
			);
		case "vrchol":
			// Pozadí: rovnostranný trojúhelník stranou 70 (výška ≈ 60.6), vnitřní 60 (výška ≈ 52), mezera 5px, spodní hrana 15px odspodu
			// Trojúhelník na střed, základna vodorovně
			return (
				<svg width={size} height={size} viewBox="0 0 100 100">
					{/* Pozadí s výřezem */}
					<defs>
						<clipPath id="clipVrchol">
							<polygon points="50,14.7 85,75 15,75" />
						</clipPath>
					</defs>
					<rect x={0} y={0} width={100} height={100} fill={upozorneni} clipPath="url(#clipVrchol)"/>
					{/* Vnitřní trojúhelník */}
					<polygon
						points="50,22.2 80,70 20,70"
						fill={vedouci}
					/>
				</svg>
			);
		case "zajimavost":
			// Vnitřní "ponorka": obdélník 100x60, nahoře mezera 5, dole mezera 5, na horní hraně dva čtverce 30x30 vlevo i vpravo, upozorňovací horní a dolní pruh
			return (
				<svg width={size} height={size} viewBox="0 0 100 100">
					{/* Dolní upozorňovací pruh */}
					<rect x={0} y={85} width={100} height={15} fill={upozorneni}/>
					{/* Horní upozorňovací pruh + čtverce */}
					<rect x={0} y={0} width={100} height={15} fill={upozorneni}/>
					<rect x={0} y={15} width={30} height={30} fill={upozorneni}/>
					<rect x={70} y={15} width={30} height={30} fill={upozorneni}/>
					{/* Vnitřní ponorka */}
					<rect x={0} y={65} width={100} height={30} fill={vedouci}/>
					<rect x={35} y={20} width={30} height={30} fill={vedouci}/>
				</svg>
			);
		case "mistni":
			// Čtverec 100x100, rozdělený diagonálou s 5px mezerou
			return (
				<svg width={size} height={size} viewBox="0 0 100 100">
					{/* Levý spodní trojúhelník (upozorňovací barva) */}
					<polygon
						points="0,100 0,0 95,95 95,100"
						fill={upozorneni}
					/>
					{/* Pravý horní trojúhelník (vedoucí barva) */}
					<polygon
						points="100,0 100,100 5,5 5,0"
						fill={vedouci}
					/>
				</svg>
			);
		case "NS":
			// Čtverec 100x100, diagonální pruh 30px ve vedoucí barvě, oddělený mezerou 5px,
			// zbylé dva trojúhelníky upozorňovací barvy
			return (
				<svg width={size} height={size} viewBox="0 0 100 100">
					{/* Levý spodní trojúhelník (upozorňovací barva) */}
					<polygon
						points="0,100 0,0 32.5,0 0,32.5"
						fill={upozorneni}
					/>
					{/* Pravý horní trojúhelník (upozorňovací barva) */}
					<polygon
						points="100,0 100,100 67.5,100 100,67.5"
						fill={upozorneni}
					/>
					{/* Diagonální pruh (vedoucí barva, šířka 30, s mezerou 5px) */}
					<polygon
						points="5,0 32.5,0 100,67.5 100,95 95,100 67.5,100 0,32.5 0,5"
						fill={vedouci}
					/>
				</svg>
			);
		default:
			return null;
	}
};

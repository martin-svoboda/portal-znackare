import React from "react";
import {barvaDlePresunu, barvaDleJmena, barvaDleKodu} from "../shared/colors";

type ZnackaProps = {
	color?: string; // Vedoucí barva (např. modrá)
	shape?: string; // tvar odbočky nebo druh přesunu
	move?: string; // typ přesunu (PZT, LZT, CZS, CZT, JZT, VZT, 0/null)
	size?: number;
};

/**
 * Shapes
 *
 * odbočky
 * B = bezbarvá
 * P = pomník
 * S = pramen
 * T = trasa
 * V = vyhlídka
 * Z = zřícenina
 *
 * druhy
 * PA = pásové
 * MI = místní
 * NS = NS zvlášť
 * SN = NS souběžná
 * VY = významové
 * VO = vozíčkářská
 * DO = CTZ silniční
 * CT = CTZ terénní
 * NE = bezbarvá
 *
 * přesuny (move)
 * PZT = pěší
 * LZT = lyčařská
 * CZS = cyklo silniční
 * CZT = cyklo terénní
 * JZT = jezdecká
 * VZT = vozíčkářská
 * 0/null = spojka tras
 */

export const Znacka = ({
						   color = "",
						   shape = "PA",
						   move = "PZT",
						   size = 100,
					   }: ZnackaProps) => {
	let upozorneni = barvaDlePresunu(move);
	let vedouci = barvaDleKodu(color);

	console.log("Znacka", color, shape, move, size);
	console.log("Znacka barvy", upozorneni, vedouci);
	if (shape === "NS" || shape === "SN") {
		upozorneni = barvaDlePresunu("PZT");
		vedouci = barvaDleKodu("ZE");
	}

	switch (shape) {
		case "PA":
			// Tři pásy: horní a dolní upozorňovací, střední vedoucí, mezery 5 px
			return (
				<svg width={size} height={size} viewBox="0 0 120 120">
					<rect x={0} y={0} width={120} height={120} fill={barvaDleKodu("KH")}/>
					<rect x={10} y={10} width={100} height={30} fill={upozorneni}/>
					<rect x={10} y={45} width={100} height={30} fill={vedouci}/>
					<rect x={10} y={80} width={100} height={30} fill={upozorneni}/>
				</svg>
			);
		case "Z":
			// Okolní čtverec s výřezem "hradu" (L tvar), mezera 5 bodů
			// Vnitřní tvar: 60x60 na středu, vnější výřez: 70x70
			return (
				<svg width={size} height={size} viewBox="0 0 120 120">

					<defs>
						<clipPath id="clipHrad">
							<polygon points="15,15 85,15 85,35 95,35 95,95 15,95"/>
						</clipPath>
					</defs>
					<rect x={0} y={0} width={120} height={120} fill={barvaDleKodu("KH")}/>
					<rect x={10} y={10} width={100} height={100} fill={upozorneni} clipPath="url(#clipHrad)"/>
					<polygon points="20,20 80,20 80,30 90,30 90,90 20,90" fill={vedouci}/>
				</svg>
			);
		case "S":
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
		case "V":
			// Pozadí: rovnostranný trojúhelník stranou 70 (výška ≈ 60.6), vnitřní 60 (výška ≈ 52), mezera 5px, spodní hrana 15px odspodu
			// Trojúhelník na střed, základna vodorovně
			return (
				<svg width={size} height={size} viewBox="0 0 100 100">
					{/* Pozadí s výřezem */}
					<defs>
						<clipPath id="clipVrchol">
							<polygon points="50,14.7 85,75 15,75"/>
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
		case "P":
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
		case "MI":
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
		case "SN":
			// Čtverec 100x100, diagonální pruh 30px ve vedoucí barvě, oddělený mezerou 5px,
			// zbylé dva trojúhelníky upozorňovací barvy
			return (
				<svg width={size} height={size} viewBox="0 0 120 120">
					<rect x="0" y="0" width="120" height="120" fill={barvaDleKodu("KH")}/>
					<path
						d="M88.69,109.988l-78.608,-78.609l0,-21.336l0.056,-0.055l20.979,-0l78.965,78.965l0,21.035l-21.392,-0Z"
						fill={vedouci}/>
					<path
						d="M10.048,38.416l71.716,71.716l-71.716,0l0,-71.716Zm100,43.432l-71.716,-71.716l71.716,0l0,71.716Z"
						fill={upozorneni}/>
				</svg>
			);
		default:
			return (
				<svg width={size} height={size} viewBox="0 0 120 120">
					<rect x="0" y="0" width="120" height="120" fill={barvaDleKodu("KH")}/>
					<rect x="10" y="10" width="100" height="100" fill={upozorneni}/>
				</svg>
			);
	}
};

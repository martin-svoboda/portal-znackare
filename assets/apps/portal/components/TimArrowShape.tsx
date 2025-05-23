import React from "react";

type TimArrowShapeProps = {
	color: string;
	shape?: "pasova" | "hrad" | "studanka" | "vrchol" | "zajimavost";
};

export const TimArrowShape = ({
								  color,
								  shape = "pasova",
							  }: TimArrowShapeProps) => {

	switch (shape) {
		case "pasova":
			return (
				<svg width={40} height={25} viewBox="0 0 40 25">
					<polygon
						points="0,0 0,25 40,25 40,0"
						fill={color}
					/>
				</svg>
			);
		case "hrad":
			return (
				<svg width={30} height={30} viewBox="0 0 30 30">
					<polygon
						points="0,0 20,0 20,10 30,10 30,30 0,30"
						fill={color}
					/>
				</svg>
			);
		case "studanka":
			return (
				<svg width={30} height={15} viewBox="0 0 30 15">
					<path d="M0,0 A15,15 0 0,0 30,0" fill={color}/>
				</svg>
			);
		case "vrchol":
			return (
				<svg width={30} height={26} viewBox="0 0 30 26">
					<polygon
						points="15,0 30,26 0,26"
						fill={color}
					/>
				</svg>
			);
		case "zajimavost":
			return (
				<svg width={100} height={60} viewBox="0 0 100 60">
					{/* Tělo */}
					<rect x={0} y={30} width={100} height={30} fill={color}/>
					{/* Čtverec nahoře uprostřed */}
					<rect x={35} y={0} width={30} height={30} fill={color}/>
				</svg>
			);
		default:
			return null;
	}
};

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
				<svg width={40} height={26} viewBox="0 0 40 26">
					<path
						d="M20,13.21l0,-10.262l-10.263,-0l0,20.525l20.526,-0l-0,-10.263l-10.263,0Z"
						fill={color}/>
				</svg>
			);
		case "studanka":
			return (
				<svg width={40} height={26} viewBox="0 0 40 26">
					<path
						d="M32.118,12.877l0,0.005c0,6.448 -5.101,11.683 -11.385,11.683c-6.283,0 -11.384,-5.235 -11.384,-11.683l-0,-0.005l22.769,-0Z"
						fill={color}/>
				</svg>
			);
		case "vrchol":
			return (
				<svg width={40} height={26} viewBox="0 0 40 26">
					<path d="M20.467,4.305l10.858,19.906l-21.716,0l10.858,-19.906Z" fill={color}/>
				</svg>
			);
		case "zajimavost":
			return (
				<svg width={40} height={26} viewBox="0 0 40 26">
					<path
						d="M24.646,13.215l0,-8.892l-8.892,0l0,8.892l-10.373,-0l-0,8.892l29.639,-0l-0,-8.892l-10.374,-0Z"
						fill={color}/>
				</svg>
			);
		default:
			return null;
	}
};

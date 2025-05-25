import {
	IconSquare,
	IconSquareArrowRight,
	IconEdit,
	IconCheckbox,
	IconCopyCheck,
	IconCash, IconHammer, IconBrush, IconTool, IconSignLeft,
} from '@tabler/icons-react';
import {Badge, ThemeIcon} from '@mantine/core';
import {Znacka} from "./Znacka";
import {barvaDleJmena} from "../utils/colors";

type PrikazTypeIconProps = {
	type: string;
	color?: string; // Vedoucí barva (např. modrá)
	shape?: "pasova" | "hrad" | "studanka" | "vrchol" | "zajimavost" | "mistni" | "NS";
	move?: "PTZ" | "LTZ" | "CTZ";
	size?: number;
};

const druhZPIkona: Record<string, any> = {
	O: IconBrush,      // Obnova – štětec
	N: IconTool,       // Nová – nářadí
	S: IconSignLeft,   // Směrovky/rozcestníky – směrovka
};

export function PrikazTypeIcon({
								   type,
								   color = "",
								   shape = "",
								   move = "",
								   size = 28
							   }: PrikazTypeIconProps) {
	if ("O" === type) {
		return (<Znacka move={move} color={color} size={size} shape={shape}/>);
	}

	const IconComponent = druhZPIkona[type] || IconHammer; // Default: kladivo

	return (
		<ThemeIcon
			color={barvaDleJmena("khaki")}
			variant="outline"
			style={{
				width: `${size}px`,
				height: `${size}px`,
				background: "white"
			}}
		>
			<IconComponent style={{width: '80%', height: '80%'}}/>
		</ThemeIcon>
	);
}

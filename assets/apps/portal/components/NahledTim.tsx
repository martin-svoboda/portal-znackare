import React, {useRef, useLayoutEffect, useState} from "react";
import {Paper, Flex, Group, Text, Box} from "@mantine/core";
import {formatKm} from "../shared/formatting";
import {TimArrowShape} from "./TimArrowShape"; // Importuj svoji komponentu
import {barvaDleJmena} from "../shared/colors";

function getItemLines(item: any) {
	return [1, 2, 3]
		.map(i => {
			const text = item[`Radek${i}`]?.trim();
			const km = item[`KM${i}`] && Number(item[`KM${i}`]) > 0 ? formatKm(item[`KM${i}`]) : null;
			return text ? {text, km} : null;
		})
		.filter(Boolean);
}

const NahledTim = ({item}: { item: any }) => {
	const lines = getItemLines(item);
	const showArrow =
		item.Druh_Predmetu === "S" || item.Druh_Predmetu === "D";
	const direction = item.Smerovani;

	const [height, setHeight] = useState<number>(60); // Default výška
	const paperRef = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		if (paperRef.current) {
			setHeight(paperRef.current.offsetHeight);
		}
	}, [lines]);

	const vedouciBarva = item.Barva ? barvaDleJmena(item.Barva) : 'transparent';

	const barvaPodkladu = (val: string | undefined) => {
		if (!val) return "orange.0";
		const v = val.trim().toLowerCase();
		switch (v) {
			case "PTZ":
				return "orange.0";
			case "LTZ":
				return "orange.6";
			case "CTZ":
				return "yellow.4";
			default:
				return "orange.0";
		}
	}

	let itemStyle: { padding: string; clipPath?: string } = {
		padding: "5px"
	}
	let shapeStyle: {} = {
		display: "none",
	}
	if (showArrow && direction === "L") {
		itemStyle = {
			padding: "5px 5px 5px 45px",
			clipPath: "polygon(40px 0, 100% 0, 100% 100%, 40px 100%, 0px 50%)"
		}
		shapeStyle = {
			left: "0",
			transform: "translateY(-50%)"
		}
	}
	if (showArrow && direction === "P") {
		itemStyle = {
			padding: "5px 45px 5px 5px",
			clipPath: "polygon(calc(100% - 40px) 0, 100% 50%, calc(100% - 40px) 100%, 0 100%, 0 0)"
		}
		shapeStyle = {
			right: "0",
			transform: "translateY(-50%)"
		}
	}

	return (
		<Flex align="center" gap={0}>
			<Paper
				ref={paperRef}
				shadow="xs"
				style={itemStyle}
				withBorder
				bg={barvaPodkladu(item.Druh_Presunu)}
				pos="relative"
			>
				{showArrow && direction && <Box
					pos="absolute"
					top="50%"
					w="40px"
					h="25px"
					style={shapeStyle}
				>
					<TimArrowShape color={vedouciBarva} shape="pasova"/>
				</Box>}
				<Flex
					w="200"
					mih="60"
					gap={0}
					justify="center"
					align="center"
					direction="column"
				>
					{lines.length > 0 ? (
						lines.map((line, idx) => (
							<Group
								key={idx}
								justify={line.km ? "space-between" : "center"}
								w="100%"
								gap={0}
							>
								<Text ta="center" fw={700} size="sm" c="dark"
									  style={{
										  fontStretch: (line?.text?.length > 20 ? 'ultra-condensed' : 'condensed'),
									  }}
								>
									{line?.text}
								</Text>
								{line.km && <Text size="sm" c="dark">{line.km} km</Text>}
							</Group>
						))
					) : (
						<Text size="sm" c="dimmed" ta="center">Žádný popis</Text>
					)}
				</Flex>
			</Paper>
		</Flex>
	);
};

export default NahledTim;

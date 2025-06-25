import React, {useRef, useLayoutEffect, useState} from "react";
import {Paper, Flex, Group, Text, Box} from "@mantine/core";
import {formatKm} from "../shared/formatting";
import {TimArrowShape} from "./TimArrowShape"; // Importuj svoji komponentu
import {barvaDleJmena} from "../shared/colors";
import {replaceTextWithIcons} from "../shared/textIconReplacer";

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
		const v = val.trim().toUpperCase();
		switch (v) {
			case "PZT":
				return "orange.0";
			case "LZT":
				return "orange.5";
			case "CZT":
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
								style={{minHeight: lines.length == 1 ? '40px' : 'auto'}}
							>
								<Box style={{
									display: 'flex',
									justifyContent: line.km ? 'flex-start' : 'center',
									flex: 1,
									width: '55%',
								}}>
									<Text ta="center" fw={700} size="sm" c="black"
										  style={{
											  transform: `scaleX(${line?.text?.length > 20 ? '0.75' : '0.85'})`,
											  whiteSpace: 'nowrap',
											  transformOrigin: line.km ? 'left center' : 'center'
										  }}
									>
										{line?.text?.split(/(\([^)]*\))/).flatMap((part, i) => {
											if (part.startsWith('(') && part.endsWith(')')) {
												return <small key={i}>{part}</small>;
											}
											// Použij novou globální funkci pro nahrazení ikon
											return <span key={i}>{replaceTextWithIcons(part, 10)}</span>;
										})}
									</Text>
								</Box>
								{line.km && <Text size="sm" c="black">{line.km} km</Text>}
							</Group>
						))
					) : (
						<Text size="sm" c="dimmed" ta="center">Žádný popis</Text>
					)}
					<Group
						justify="space-between"
						w="100%"
						gap={0}
					>
						<Text ta="center" size="xs" c="black">{item.Rok}</Text>
						<Text ta="right" size="xs" c="black">{item.EvCi_TIM + item.Premet_Index}</Text>
					</Group>
				</Flex>
			</Paper>
		</Flex>
	);
};

export default NahledTim;

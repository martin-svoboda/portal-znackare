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
		const v = val.trim().toUpperCase();
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

	const textIcon = (val: string) => {
		switch (val) {
			case "BUS":
				return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="15" viewBox="0 0 24 24"><path fill="currentColor" d="M3 6c-1.11 0-2 .89-2 2v7h2a3 3 0 0 0 3 3a3 3 0 0 0 3-3h6a3 3 0 0 0 3 3a3 3 0 0 0 3-3h2V8c0-1.11-.89-2-2-2zm-.5 1.5h4V10h-4zm5.5 0h4V10H8zm5.5 0h4V10h-4zm5.5 0h2.5V13L19 11zm-13 6A1.5 1.5 0 0 1 7.5 15A1.5 1.5 0 0 1 6 16.5A1.5 1.5 0 0 1 4.5 15A1.5 1.5 0 0 1 6 13.5m12 0a1.5 1.5 0 0 1 1.5 1.5a1.5 1.5 0 0 1-1.5 1.5a1.5 1.5 0 0 1-1.5-1.5a1.5 1.5 0 0 1 1.5-1.5"/></svg>;
			case "ŽST":
				return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="15" viewBox="0 0 30 30"><path fill="currentColor" d="M4.25 12.68v-.32c0-.1.03-.18.1-.25s.15-.1.25-.1h7.58c.1 0 .18.03.25.1s.1.15.1.25v.32c0 .1-.03.18-.1.25s-.15.1-.25.1h-.44v1.65h2.12c.02-.28.14-.52.35-.71s.46-.29.75-.29s.53.1.74.29s.32.43.35.71h1.32v-3.39a.52.52 0 0 1-.35-.16c-.1-.1-.15-.23-.15-.37v-.31c0-.14.05-.27.16-.38s.24-.16.39-.16h1.99c.15 0 .28.05.38.16s.15.23.15.38v.31c0 .14-.05.27-.14.37s-.2.16-.34.16v3.39h1.56c.27 0 .51.1.71.3s.3.44.3.71v2.93l3.73 4.87h-4.74v-3.04h-.71c.11.26.16.54.16.83c0 .61-.21 1.12-.64 1.56c-.43.43-.95.65-1.55.65c-.61 0-1.12-.22-1.56-.65a2.13 2.13 0 0 1-.65-1.56c0-.29.05-.57.16-.83h-1c.11.27.17.55.17.83c0 .61-.22 1.12-.65 1.56s-.95.65-1.56.65s-1.12-.22-1.55-.65s-.64-.95-.64-1.56c0-.29.05-.57.16-.83H9.97c.12.29.18.57.18.83c0 .61-.22 1.12-.65 1.56s-.95.65-1.56.65s-1.12-.22-1.56-.65s-.65-.95-.65-1.56c0-.29.06-.57.17-.84c-.24-.04-.45-.15-.61-.34s-.24-.41-.24-.66v-.86h-.02v-5.55H4.6c-.1 0-.18-.03-.25-.1a.33.33 0 0 1-.1-.25m2.05 3.94c0 .21.07.39.22.54s.33.22.54.22H8.5c.21 0 .39-.07.53-.22s.22-.33.22-.54v-2.3a.7.7 0 0 0-.22-.53a.7.7 0 0 0-.53-.22H7.07c-.21 0-.39.07-.54.23c-.15.15-.22.32-.22.52v2.3zm9.48-11.19c0 .41.16.76.47 1.04c0 .2.09.43.26.68s.36.4.56.44c.04.22.15.41.31.57c.16.15.36.25.59.3c-.11.11-.16.24-.16.39q0 .27.18.45t.45.18c.18 0 .33-.06.46-.19c.13-.12.19-.28.19-.45c0-.02 0-.05-.01-.09s-.01-.08-.01-.1h.03c.21 0 .39-.08.54-.23s.23-.34.23-.55c0-.1-.04-.22-.12-.38c.17-.09.31-.25.41-.47h.45c.39-.02.73-.17 1-.45c.28-.28.42-.61.42-1.01q0-.51-.33-.9c-.22-.26-.5-.43-.83-.52c-.08-.4-.29-.73-.62-.99s-.71-.39-1.12-.39s-.77.13-1.08.38s-.52.58-.62.97h-.11q-.615 0-1.08.39c-.31.25-.46.57-.46.93"/></svg>;
			default:
				return null;
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
								<Box style={{
									display: 'flex',
									justifyContent: line.km ? 'flex-start' : 'center',
									flex: 1,
									width: '55%',
								}}>
									<Text ta="center" fw={700} size="sm" c="dark"
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

											return part.split(/(&[A-ZÁĚŠČŘŽÝÚŮÍÓ]+)/i).map((subpart, j) => {
												if (subpart.startsWith('&')) {
													const iconKey = subpart.slice(1);
													const icon = textIcon(iconKey);
													return icon ? <span key={`${i}-${j}`}>{icon}</span> : subpart;
												}
												return subpart;
											});
										})}
									</Text>
								</Box>
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

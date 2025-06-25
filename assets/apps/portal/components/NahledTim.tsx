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

	const textIcon = (val: string) => {
		switch (val) {
			case "BUS":
				return <svg width="23" height="11" viewBox="0 0 30 16" version="1.1" xmlns="http://www.w3.org/2000/svg"><circle cx="6.737" cy="12.873" r="2.794"/> <circle cx="23.458" cy="12.873" r="2.794"/> <path d="M2.909,12.875l-2.918,-0c-0,-0 0.019,-8.987 -0,-11.051c-0.009,-0.892 0.363,-1.411 1.066,-1.443c2.429,-0.109 25.689,0 25.689,0c-0,0 0.491,0.11 0.875,0.878c0.445,0.89 1.724,3.349 2.213,4.228c0.161,0.289 0.175,0.995 0.175,0.995l0,6.393l-2.77,-0l-0,-0.002c-0,-2.1 -1.705,-3.804 -3.805,-3.804c-2.099,-0 -3.804,1.704 -3.804,3.804l0,0.002l-9.112,-0l-0,-0.002c-0,-2.1 -1.705,-3.804 -3.804,-3.804c-2.1,-0 -3.805,1.704 -3.805,3.804l0,0.002Zm23.608,-10.936l-3.686,-0l0,4.164l5.736,0l-2.05,-4.164Zm-19.063,-0l-6.091,-0l0,3.911l6.091,-0l-0,-3.911Zm7.156,-0l-6.091,-0l0,3.911l6.091,-0l-0,-3.911Zm7.156,-0l-6.091,-0l0,3.911l6.091,-0l-0,-3.911Z"/> </svg>;
			case "ŽST":
				return <svg width="23" height="11" viewBox="0 0 30 16" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M25.162,12.904l-6.052,0c-0.071,-1.527 -1.333,-2.745 -2.878,-2.745c-1.544,-0 -2.807,1.218 -2.878,2.745l-1.574,0c-0.071,-1.527 -1.333,-2.745 -2.877,-2.745c-1.287,-0 -2.377,0.844 -2.747,2.009c-0.074,0.234 -0.247,0.736 -0.247,0.736l0,1.703l-1.18,0l-0,-0.926l-2.412,-0.001l-0.002,-10.676l-2.326,0l0,-2.252l9.417,0l-0,2.622l6.018,-0l-0,-2.549l2.237,0l-0,2.549l6.493,-0l-0,-3.444l3.051,0l0,3.444l1.012,-0l-0,0.53l0.908,0l0,5.985l-0.908,0l-0,1.563l1.794,0l-0,1.452l-3.659,0l-0,2.142l-1.19,0l-0,-2.142Zm-16.654,-9.965l-5.09,-0l0,3.074l5.09,0l-0,-3.074Z"/><circle cx="8.871" cy="13.36" r="2.492"/><circle cx="16.252" cy="13.36" r="2.492"/><circle cx="23.207" cy="14.587" r="1.483"/><circle cx="28.293" cy="14.587" r="1.483"/></svg>;
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
								{line.km && <Text size="sm" c="black">{line.km} km</Text>}
							</Group>
						))
					) : (
						<Text size="sm" c="dimmed" ta="center">Žádný popis</Text>
					)}
					<Text ta="right" size="xs" c="black">{item.EvCi_TIM + item.Premet_Index}</Text>
				</Flex>
			</Paper>
		</Flex>
	);
};

export default NahledTim;

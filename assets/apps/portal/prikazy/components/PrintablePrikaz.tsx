import React from 'react';
import {Box, Text, Flex, Badge} from '@mantine/core';
import {formatKm, formatUsekType} from '../../shared/formatting';
import {PrikazHead} from './PrikazHead';
import NahledTim from '../../components/NahledTim';
import {Znacka} from '../../components/Znacka';
import {barvaDleJmena} from '../../shared/colors';
import {replaceTextWithIcons} from '../../shared/textIconReplacer';

interface PrintablePrikazProps {
	head: any;
	useky: any[];
	delka?: number | null;
	groupedData: any[];
}

const PrintablePrikaz: React.FC<PrintablePrikazProps> = ({
															 head,
															 useky,
															 delka,
															 groupedData
														 }) => {
	// Pokud head není dostupný, vrátíme prázdný div
	if (!head) {
		return <div style={{backgroundColor: 'white', padding: '20px'}}>Načítání...</div>;
	}
	// Globální styl pro tisk - bílé pozadí, černý text
	const printContainerStyle = {
		backgroundColor: 'white',
		color: 'black',
		fontFamily: 'system-ui, -apple-system, sans-serif',
		fontSize: '10px',
		lineHeight: '1.4',
		padding: '20px',
		maxWidth: '210mm', // A4 šířka
		margin: '0 auto',
		'--mantine-color-scheme': 'light' // Vynutí světlý motiv pro všechny Mantine komponenty
	} as React.CSSProperties;


	// Vytvoříme TIM prvky
	const timItems = groupedData.flatMap(group =>
		group.items?.map((item: any) => ({
			...item,
			groupInfo: {
				EvCi_TIM: group.EvCi_TIM,
				Naz_TIM: group.Naz_TIM,
				Stav_TIM: group.Stav_TIM,
				NP: group.NP
			}
		})) || []
	);



	return (
		<div style={printContainerStyle} data-color-scheme="light">
			{/* Hlavička s původní PrikazHead komponentou - bez stavu, kraje a obvodu */}
			<Box mb="sm" className="form-header">
				<Text size="xl" fw="bold" mb="lg" ta="center" c="black">
					Kontrolní formulář - Značkařský příkaz {head?.Cislo_ZP}
				</Text>

				{/* Použijeme PrikazHead s simple=true */}
				<Box
					style={{
						backgroundColor: 'white',
						border: '1px solid #ddd',
						borderRadius: 'sm',
						boxShadow: 'none'
					}}
					p="sm"
				>
					<PrikazHead head={head} delka={delka} simple={true}/>
				</Box>
			</Box>

			{/* Úseky tras - s existujícími komponentami */}
			{useky.length > 0 && (
				<Box mb="sm" className="useky-section">

						{useky.map((usek, index) => (
							<Flex key={usek.Kod_ZU}
								  align="center"
								  gap="md"
								  p="xs"
								  style={{
									  borderBottom: index < useky.length - 1 ? '1px solid #eee' : 'none'
								  }}
							>
								<Znacka color={usek.Barva_Naz} size={30}/>
								<Box flex={1}>
									<Text size="sm" fw={500} c="black">
										{replaceTextWithIcons(usek.Nazev_ZU, 12)}
									</Text>
								</Box>
								<Text size="sm" c="black">{formatUsekType(usek.UsekZP_Typ)}</Text>
								<Text size="sm" c="black">{formatKm(usek.Delka_ZU)} km</Text>
								<Badge
									color={barvaDleJmena(usek.Barva_Naz)}
									variant="light"
									style={{backgroundColor: barvaDleJmena(usek.Barva_Naz), color: 'white'}}
								>
									{usek.Barva_Naz}
								</Badge>
							</Flex>
						))}
				</Box>
			)}

			{/* TIM prvky jako jedna tabulka se dvěma sloupci */}
			<Box>
				<Text fw="bold" mb="md" c="black">Informační prvky na trase - kontrolní formulář:</Text>

				<table className="print-table" style={{
					width: '100%',
					border: '1px solid #333',
					borderCollapse: 'collapse',
					fontSize: '11px',
					backgroundColor: 'white'
				}}>
					<thead>
					<tr style={{backgroundColor: '#f5f5f5'}}>
						{/* Levý sloupec hlavička */}
						<th style={{border: '1px solid #333', padding: '6px', fontWeight: 'bold', width: '80px'}} rowSpan="2">
							Náhled TIM
						</th>
						<th style={{border: '1px solid #333', padding: '6px', fontWeight: 'bold'}}>
							Číslo TIM
						</th>
						<th style={{border: '1px solid #333', padding: '6px', fontWeight: 'bold', width: '50px'}}>
							Rok
						</th>
						<th style={{border: '1px solid #333', padding: '6px', fontWeight: 'bold', width: '40px'}}>
							L/P
						</th>
						<th style={{border: '1px solid #333', padding: '6px', fontWeight: 'bold', width: '50px'}}>
							Stav
						</th>

						{/* Pravý sloupec hlavička */}
						<th style={{border: '1px solid #333', padding: '6px', fontWeight: 'bold', width: '80px'}} rowSpan="2">
							Náhled TIM
						</th>
						<th style={{border: '1px solid #333', padding: '6px', fontWeight: 'bold'}}>
							Číslo TIM
						</th>
						<th style={{border: '1px solid #333', padding: '6px', fontWeight: 'bold', width: '50px'}}>
							Rok
						</th>
						<th style={{border: '1px solid #333', padding: '6px', fontWeight: 'bold', width: '40px'}}>
							L/P
						</th>
						<th style={{border: '1px solid #333', padding: '6px', fontWeight: 'bold', width: '50px'}}>
							Stav
						</th>
					</tr>
					<tr style={{backgroundColor: '#f5f5f5'}}>
						{/* Levý sloupec druhý řádek hlavičky */}
						<th style={{border: '1px solid #333', padding: '6px', fontWeight: 'bold'}}>
							Barva
						</th>
						<th style={{border: '1px solid #333', padding: '6px', fontWeight: 'bold'}} colSpan="3">
							Poznámka
						</th>

						{/* Pravý sloupec druhý řádek hlavičky */}
						<th style={{border: '1px solid #333', padding: '6px', fontWeight: 'bold'}}>
							Barva
						</th>
						<th style={{border: '1px solid #333', padding: '6px', fontWeight: 'bold'}} colSpan="3">
							Poznámka
						</th>
					</tr>
					</thead>
					<tbody>
					{timItems.map((item, index) => {
						if (index % 2 === 0) {
							// Párové indexy - levý sloupec
							const rightItem = timItems[index + 1]; // Odpovídající pravý prvek
							return (
								<TimTableRowTwoColumns
									key={index}
									leftItem={item}
									rightItem={rightItem}
								/>
							);
						}
						// Liché indexy se nezobrazují samostatně, jsou součástí párových
						return null;
					})}
					</tbody>
				</table>
			</Box>
		</div>
	);
};

// Komponenta pro řádek s dvěma TIM prvky vedle sebe
const TimTableRowTwoColumns: React.FC<{ leftItem: any; rightItem?: any }> = ({leftItem, rightItem}) => {
	const cellStyle = {
		border: '1px solid #333',
		padding: '6px',
		verticalAlign: 'top' as const,
		fontSize: '10px'
	};

	const inputCellStyle = {
		...cellStyle,
		backgroundColor: '#fafafa',
		minHeight: '18px'
	};

	const timCellStyle = {
		...cellStyle,
		width: '80px',
		height: '80px', // Zvětšíme výšku aby se náhled vešel přes 2 řádky
		padding: '3px'
	};

	return (
		<>
			{/* První řádek - čísla TIM, rok, L/P, stav */}
			<tr>
				{/* Levý sloupec */}
				<td style={timCellStyle} rowSpan={2}>
					<div style={{transform: 'scale(0.8)', transformOrigin: 'center', width: '74px', height: '74px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
						<NahledTim item={leftItem}/>
					</div>
				</td>
				<td style={cellStyle}>
					{leftItem.groupInfo.EvCi_TIM + leftItem.Premet_Index}
				</td>
				<td style={inputCellStyle}></td>
				<td style={inputCellStyle}></td>
				<td style={inputCellStyle}></td>

				{/* Pravý sloupec */}
				{rightItem ? (
					<>
						<td style={timCellStyle} rowSpan={2}>
							<div style={{transform: 'scale(0.8)', transformOrigin: 'center', width: '74px', height: '74px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
								<NahledTim item={rightItem}/>
							</div>
						</td>
						<td style={cellStyle}>
							{rightItem.groupInfo.EvCi_TIM + rightItem.Premet_Index}
						</td>
						<td style={inputCellStyle}></td>
						<td style={inputCellStyle}></td>
						<td style={inputCellStyle}></td>
					</>
				) : (
					// Prázdné buňky když není pravý prvek
					<>
						<td style={timCellStyle} rowSpan={2}></td>
						<td style={cellStyle}></td>
						<td style={inputCellStyle}></td>
						<td style={inputCellStyle}></td>
						<td style={inputCellStyle}></td>
					</>
				)}
			</tr>

			{/* Druhý řádek - barva a poznámka */}
			<tr>
				{/* Levý sloupec */}
				<td style={cellStyle}>
					{leftItem.Barva}
				</td>
				<td style={{...inputCellStyle, minHeight: '30px'}} colSpan={3}></td>

				{/* Pravý sloupec */}
				{rightItem ? (
					<>
						<td style={cellStyle}>
							{rightItem.Barva}
						</td>
						<td style={{...inputCellStyle, minHeight: '30px'}} colSpan={3}></td>
					</>
				) : (
					// Prázdné buňky když není pravý prvek
					<>
						<td style={cellStyle}></td>
						<td style={{...inputCellStyle, minHeight: '30px'}} colSpan={3}></td>
					</>
				)}
			</tr>
		</>
	);
};

export default PrintablePrikaz;

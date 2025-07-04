import React, {useEffect, useState, useMemo} from "react";

import {
	Container,
	Title,
	Card,
	Group,
	Text,
	Loader,
	Stack,
	Badge,
	Box,
	Divider,
	Paper,
	Flex,
	Table, Button
} from "@mantine/core";
import {IconPrinter} from "@tabler/icons-react";
import {useParams, useNavigate} from "react-router-dom";
import {apiRequest} from "../shared/api";
import {notifications} from "@mantine/notifications";
import {Helmet} from "react-helmet-async";
import {useAuth} from "../auth/AuthContext";
import {
	MantineReactTable,
	useMantineReactTable,
	type MRT_ColumnDef,
} from 'mantine-react-table';
import {MRT_Localization_CS} from "mantine-react-table/locales/cs";
import {BreadcrumbsNav} from "../shared/BreadcrumbsNav";
import NahledTim from "../components/NahledTim";
import {barvaDleKodu} from "../shared/colors";
import {Znacka} from "../components/Znacka";
import MapaTrasy from "../components/MapaTrasy";
import {PrikazStavBadge} from "./PrikazStavBadge";
import {PrikazTypeIcon} from "./PrikazTypeIcon";
import RequireLogin from "../auth/RequireLogin";
import {formatKm, formatUsekType, formatTimStatus} from "../shared/formatting";
import {PrikazHead} from "./components/PrikazHead";
import {replaceTextWithIcons} from "../shared/textIconReplacer";
import PrintablePrikaz from "./components/PrintablePrikaz";
import {usePdfGenerator} from "./hooks/usePdfGenerator";

function groupByEvCiTIM(rows: any[]) {
	const groups: Record<string, any> = {};
	rows.forEach(row => {
		if (!row.EvCi_TIM) return;
		if (!groups[row.EvCi_TIM]) {
			groups[row.EvCi_TIM] = {
				EvCi_TIM: row.EvCi_TIM,
				Naz_TIM: row.Naz_TIM,
				Stav_TIM: row.Stav_TIM,
				Stav_TIM_Nazev: row.Stav_TIM_Nazev,
				NP: row.NP,
				GPS_Sirka: row.GPS_Sirka,
				GPS_Delka: row.GPS_Delka,
				items: []
			}
		}
		groups[row.EvCi_TIM].items.push(row);
	});
	return Object.values(groups);
}

// Breadcrumbs
const breadcrumb = [
	{title: "Nástěnka", href: "/nastenka"},
	{title: "Příkazy", href: "/prikazy"},
];

const isNezpracovany = (stav) => stav === 'Přidělený' || stav === 'Vystavený';

const PrikazUseky = ({useky}: { useky: any[] }) => {
	const rows = useky.map((usek) => (
		<Table.Tr key={usek.Kod_ZU}>
			<Table.Td><Znacka color={usek.Barva_Kod} move={usek.Druh_Presunu} shape={usek.Druh_Odbocky_Kod || usek.Druh_Znaceni_Kod} size={30}/></Table.Td>
			<Table.Td>{replaceTextWithIcons(usek.Nazev_ZU, 14)}</Table.Td>
			<Table.Td>{formatKm(usek.Delka_ZU)} Km</Table.Td>
			<Table.Td><Badge autoContrast color={barvaDleKodu(usek.Barva_Kod)}>{usek.Barva_Naz}</Badge></Table.Td>
			<Table.Td>{usek.Druh_Odbocky || usek.Druh_Znaceni}</Table.Td>
		</Table.Tr>
	));

	return (
		<>
			<Table>
				<Table.Thead>
					<Table.Tr>
						<Table.Th></Table.Th>
						<Table.Th>Název úseku</Table.Th>
						<Table.Th>Délka</Table.Th>
						<Table.Th>Barva</Table.Th>
						<Table.Th>Druh</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>{rows}</Table.Tbody>
			</Table>
		</>
	);
}

const Prikaz = () => {
	const {id} = useParams();
	const {getIntAdr} = useAuth();
	const intAdr = getIntAdr();
	const navigate = useNavigate();
	const { generatePDF, isGenerating } = usePdfGenerator();

	const [head, setHead] = useState<any>(null);
	const [predmety, setPredmety] = useState<any[]>([]);
	const [useky, setUseky] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [showPrintPreview, setShowPrintPreview] = useState(false);

	useEffect(() => {
		setLoading(true);
		apiRequest("/prikaz", "GET", {int_adr: intAdr, id})
			.then(result => {
				console.log(result);
				setHead(result.head || {});
				setPredmety(result.predmety || []);
				setUseky(result.useky || []);
			})
			.catch(err => {
				setHead(null);
				setPredmety([]);
				setUseky([]);
			})
			.finally(() => setLoading(false));
	}, [intAdr, id]);

	const tableData = useMemo(
		() => Array.isArray(predmety) ? [...predmety].sort((a, b) => Number(a.Poradi ?? 0) - Number(b.Poradi ?? 0)) : [],
		[predmety]
	);

	const groupedData = useMemo(
		() => groupByEvCiTIM(tableData),
		[tableData]
	);

	const soubeh = useMemo(() => {
		if (head?.Druh_ZP !== "O" || !Array.isArray(predmety)) return [];
		const set = new Set();
		return predmety
			.filter(item => item.Barva && item.Druh_Presunu)
			.map(item => ({
				Barva: item.Barva,
				Barva_Kod: item.Barva_Kod,
				Druh_Presunu: item.Druh_Presunu,
				Druh_Znaceni: item.Druh_Znaceni,
				Druh_Znaceni_Kod: item.Druh_Znaceni_Kod,
				Druh_Odbocky: item.Druh_Odbocky,
				Druh_Odbocky_Kod: item.Druh_Odbocky_Kod
			}))
			.filter((item) => {
				const key = `${item.Barva}|${item.Barva_Kod}|${item.Druh_Presunu}|${item.Druh_Znaceni_Kod || ''}|${item.Druh_Odbocky_Kod || ''}`;
				if (set.has(key)) return false;
				set.add(key);
				return true;
			});
	}, [predmety]);

	const delka = useMemo(() => {
		if (undefined == useky || head?.Druh_ZP !== "O" || !Array.isArray(useky) || useky.length === 0) return null;
		return useky.reduce((sum, usek) => sum + Number(usek.Delka_ZU || 0), 0);
	}, [useky, head?.Druh_ZP]);

	const mapPoints = useMemo(
			() =>
				groupedData
					.filter(d => !!d.GPS_Sirka && !!d.GPS_Delka)
					.map(d => ({
						lat: Number(d.GPS_Sirka),   // GPS_Sirka = latitude
						lon: Number(d.GPS_Delka),   // GPS_Delka = longitude
						content: (
							<p>
								<strong>{d.Naz_TIM}</strong>
								<br/>
								{d.EvCi_TIM}
							</p>
						),
					})),
			[groupedData]
		)
	;

	const mapData = useMemo(() => {
		const firstUsek = useky?.[0];
		const druhPresunu = firstUsek?.Druh_Presunu;

		return {
			points: mapPoints,
			route: "O" === head?.Druh_ZP,
			mapset: druhPresunu === "LZT" ? "winter" : "outdoor",
			type: druhPresunu === "CZT" ? "bike_mountain" :
				  druhPresunu === "CZS" ? "bike_road" : "foot_fast"
		};
	}, [mapPoints, head?.Druh_ZP, useky]);

	const columns = useMemo<MRT_ColumnDef<any>[]>(
		() => [
			{
				accessorKey: 'EvCi_TIM',
				header: 'Ev. číslo',
				size: 80,
			},
			{
				accessorKey: 'Naz_TIM',
				header: 'Místo',
				size: 100,
				Cell: ({row}) => {
					return replaceTextWithIcons(row.original.Naz_TIM, 14)
				}
			},
			{accessorKey: "NP", header: "Montáž", size: 100},
			{
				accessorKey: "Stav_TIM_Nazev",
				header: "Stav",
				size: 40,
			},
		],
		[]
	);

	const handleHlaseni = () => {
		// Předáme data přes state při navigaci
		navigate(`/prikaz/${id}/hlaseni`, {
			state: {
				head,
				predmety,
				useky,
				delka
			}
		});
	};

	const handlePrintPDF = async () => {
		const filename = `prikaz_${head?.Cislo_ZP || id}_kontrolni_formular.pdf`;
		await generatePDF('printable-prikaz', filename);
	};

	const table = useMantineReactTable({
		columns,
		data: groupedData,
		enableFacetedValues: true,
		enableColumnFilters: false,
		enableColumnActions: false,
		enableColumnOrdering: false,
		enableColumnResizing: false,
		enablePagination: false,
		enableSorting: false,
		enableRowActions: false,
		enableTopToolbar: false,
		enableBottomToolbar: false,
		state: {isLoading: loading},
		localization: MRT_Localization_CS,
		initialState: {
			density: 'xs',
			expanded: {},
			columnVisibility: {
				NP: window.innerWidth > 768,
				Stav_TIM: window.innerWidth > 768,
			}
		},
		mantineTableProps: {
			withTableBorder: false,
			highlightOnHover: false,
		},
		mantinePaperProps: {
			style: {'--mrt-base-background-color': "light-dark(white, var(--mantine-color-dark-6))"},
			shadow: 'none',
			withBorder: false
		},
		mantineTableBodyCellProps: {style: {whiteSpace: 'normal'}},
		renderDetailPanel: ({row}) => (
			<>
				<Text size="sm" c="dimmed" hiddenFrom="sm">Montáž: {row.original.NP}</Text>
				<Text size="sm" c="dimmed" hiddenFrom="sm">Stav: {row.original.Stav_TIM_Nazev}</Text>
				<Stack gap="sm">
					{row.original.items?.map((item: any, i: number) => {

						return (
							<>
								<Divider/>
								<Flex w="100%" key={i} gap="md" align="center" wrap="wrap">
									<NahledTim item={item}/>
									<Flex
										gap="md"
										justify="center"
										wrap="wrap"
									>
										<Box>
											<Text fw={700}>{item.Druh_Predmetu_Naz}</Text>
											{item.Smerovani && (
												<Text size="sm" c="dimmed">
													{item.Smerovani === 'P' ? 'Pravá' : item.Smerovani === 'L' ? 'Levá' : item.Smerovani}
												</Text>
											)}
											{item.Druh_Odbocky && (
												<Text size="sm" c="dimmed">
													{item.Druh_Odbocky}
												</Text>
											)}
										</Box>
										<Box>
											{item.Barva && (
												<Badge autoContrast
													   color={barvaDleKodu(item.Barva_Kod)}>{item.Barva}</Badge>
											)}
										</Box>
										<Box>
											<Text size="sm" c="dimmed">{item.Druh_Presunu} {item.Druh_Znaceni}</Text>
											<Text size="sm">ID: {item.EvCi_TIM + item.Predmet_Index}</Text>
										</Box>
									</Flex>
								</Flex>
							</>
						)
					})}
				</Stack>
			</>
		),
	});

	return (
		<RequireLogin>
			<Container size="lg" px={0} my="md">
				<Helmet>
					<title>{`Příkaz ${head?.Cislo_ZP || id || ''} | ${(window as any).kct_portal?.bloginfo?.name || 'Portal'}`}</title>
				</Helmet>
				<BreadcrumbsNav items={breadcrumb}/>
				<Title mb="xl" order={2}>
					Značkařský příkaz {head?.Cislo_ZP || id}
				</Title>
				<Card shadow="sm" mb="xl">
					{loading ? (
						<Loader/>
					) : (
						<PrikazHead head={head} delka={delka}/>
					)}
				</Card>
				{head && head.Stav_ZP_Naz && isNezpracovany(head.Stav_ZP_Naz) && (
					<Group>
						<Button
							color="blue"
							onClick={handleHlaseni}
						>
							Podat hlášení
						</Button>
						<Button
							variant="outline"
							leftSection={<IconPrinter size={16} />}
							onClick={handlePrintPDF}
							loading={isGenerating}
						>
							Kontrolní formulář PDF
						</Button>
						{(window as any).kct_portal?.is_admin && (
							<Button
								variant="outline"
								onClick={() => setShowPrintPreview(!showPrintPreview)}
							>
								{showPrintPreview ? 'Skrýt náhled' : 'Zobrazit náhled formuláře'}
							</Button>
						)}
					</Group>
				)}
				{(useky.length > 0 || soubeh.length > 1) &&
					<Card shadow="sm" padding="sm" mb="xl">
						<Title order={3} mb="sm">Úseky tras k obnově</Title>
						<PrikazUseky useky={useky}/>
						{soubeh && soubeh.length > 1 && (
							<>
								<Divider my="xs"/>

								<Group gap="xs" wrap="wrap">
									<Text fw={700} fz="md">
										Možný souběh/křížení tras:
									</Text>
									{soubeh.map((row, index) => (
										<Znacka color={row.Barva_Kod} move={row.Druh_Presunu} shape={row.Druh_Odbocky_Kod || row.Druh_Znaceni_Kod} size={30}/>
									))}
								</Group>
							</>
						)}
					</Card>
				}
				<Card shadow="sm" padding="sm" mb="xl">
					<Title order={3} mb="sm">Informační místa na trase</Title>
					<MantineReactTable table={table}/>
				</Card>
				{mapPoints.length > 0 && (
					<Card shadow="sm" mb="xl">
						{loading ? (
							<Loader/>
						) : (
							<MapaTrasy data={mapData}/>
						)}
					</Card>
				)}

				{/* Podmíněný náhled formuláře */}
				{showPrintPreview && (
					<Card shadow="sm" mb="xl">
						<Title order={3} mb="md">Náhled kontrolního formuláře</Title>
						<Box style={{
							border: '2px solid #e9ecef',
							borderRadius: '8px',
							overflow: 'auto',
							maxHeight: '80vh'
						}}>
							<PrintablePrikaz
								head={head}
								predmety={predmety}
								useky={useky}
								delka={delka}
								groupedData={groupedData}
							/>
						</Box>
					</Card>
				)}

				{/* Skrytá printovací komponenta */}
				<div
					id="printable-prikaz"
					style={{
						position: 'absolute',
						left: '-9999px',
						top: '-9999px',
						width: '210mm', // A4 šířka
						backgroundColor: 'white'
					}}
				>
					<PrintablePrikaz
						head={head}
						predmety={predmety}
						useky={useky}
						delka={delka}
						groupedData={groupedData}
					/>
				</div>
			</Container>
		</RequireLogin>
	);
};

export default Prikaz;

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
	Table,
	Divider, Paper, Flex,
} from "@mantine/core";
import {IconCashBanknotePlus, IconChecklist, IconCrown, IconEdit, IconHome2} from "@tabler/icons-react";
import {useParams} from "react-router-dom";
import {apiRequest} from "../utils/apiClient";
import {notifications} from "@mantine/notifications";
import {Helmet} from "react-helmet-async";
import {useAuth} from "../context/AuthContext";
import {
	MantineReactTable,
	useMantineReactTable,
	type MRT_ColumnDef,
} from 'mantine-react-table';
import {MRT_Localization_CS} from "mantine-react-table/locales/cs";
import {Menu, Select} from "@mantine/core/lib";
import {BreadcrumbsNav} from "./BreadcrumbsNav";

// Utility pro zarovnání a zpracování kilometrů
const formatKm = (km?: string | null) =>
	km && !isNaN(Number(km)) ? parseFloat(km).toLocaleString("cs-CZ", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 3
	}) : "";

// Drobežková navigace
const breadcrumb = [
	{title: "Nástěnka", href: "/nastenka"},
	{title: "Příkazy", href: "/prikazy"},
];

// Komponenta jednoho člena týmu s případnou korunou
const Member = ({name, isLeader}: { name: string; isLeader: boolean }) =>
	!name?.trim() ? null : (
		<Group gap="xs" align="center" wrap="nowrap">
			<Text span fw={isLeader ? 700 : 400}>
				{name}
			</Text>
			{isLeader && (
				<IconCrown color="#ffd700" size={18} title="Vedoucí" aria-label="Vedoucí"/>
			)}
		</Group>
	);

// Patička hlavičky
const PrikazHead = ({head}: { head: any }) => {
	return (
		<Stack gap="md">
			<Group gap="xl" align="start" wrap="wrap">
				<Stack gap="xs">
					<Text fw={700} fz="xl">{head.Cislo_ZP}</Text>
					<Text c="dimmed" fz="sm">{head.Druh_ZP_Naz}</Text>
					<Badge color="blue" mt={4}>{head.Stav_ZP_Naz}</Badge>
				</Stack>
				<Stack gap="sm">
					<Text size="sm">Kraj: <b>{head.KKZ}</b></Text>
					<Text size="sm">Obvod: <b>{head.ZO}</b></Text>
				</Stack>
				<Stack gap="sm">
					{[1, 2, 3].map(i =>
						<Member
							key={i}
							name={head[`Znackar${i}`]}
							isLeader={head[`Je_Vedouci${i}`] === "1"}
						/>
					)}
				</Stack>
				<Stack gap="xs">
					<Text size="sm">Předpokládané trvání cesty: <b>{head.Doba}</b> den/dnů</Text>
					<Text size="sm">pro <b>{head.Pocet_clenu}</b> člennou skupinu</Text>
					{head.ZvysenaSazba === "1" && <Badge color="yellow" mt={4}>Zvýšená sazba</Badge>}
				</Stack>
			</Group>
			{head.Poznamka_ZP && (
				<>
					<Divider my="xs"/>
					<Stack gap="xs">
						<Text fw={700} fz="md">Popis činnosti</Text>
						<Text style={{whiteSpace: "pre-line"}}>
							{head.Poznamka_ZP}
						</Text>
					</Stack>
				</>
			)}
		</Stack>
	);
};

const Prikaz = () => {
	const {id} = useParams();
	const {getIntAdr} = useAuth();
	const intAdr = getIntAdr();

	const [head, setHead] = useState<any>(null);
	const [data, setData] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setLoading(true);
		apiRequest("/prikaz", "GET", {int_adr: intAdr, id})
			.then(result => {
				setHead(result.head || {});
				setData(result.data || []);
			})
			.catch(err => {
				setHead(null);
				setData([]);
			})
			.finally(() => setLoading(false));
	}, [intAdr, id]);

	// Pro správné řazení podle pořadí
	const tableData = useMemo(
		() => Array.isArray(data) ? [...data].sort((a, b) => Number(a.Poradi ?? 0) - Number(b.Poradi ?? 0)) : [],
		[data]
	);


	const columns = useMemo<MRT_ColumnDef<any>[]>(
		() => [
			// Skupinové sloupce (na grouping)
			{
				accessorKey: 'Naz_TIM',
				header: 'Místo',
				size: 180,
				enableGrouping: true,
			},
			// Detaily
			{
				accessorKey: 'EvCi_TIM',
				header: 'Ev. číslo',
				size: 80,
				enableGrouping: true,
			},
			{accessorKey: "Radek1", header: "Místo / směr", size: 100},
			{accessorKey: "Stav_TIM", header: "Stav", size: 40},
			{
				accessorKey: "BARVA",
				header: "Barva",
				size: 80,
				Cell: ({cell}) => {
					const colorMap: Record<string, string> = {
						"červená": "red",
						"modrá": "blue",
						"zelená": "green",
						"žlutá": "yellow",
						"bílá": "gray",
					};
					const value = cell.getValue<string>()?.toLowerCase()?.trim() || "";
					if (!value) return null;
					const color = colorMap[value] || "gray";
					return <Badge color={color} variant="filled">{cell.getValue<string>()}</Badge>;
				},
			},
			{accessorKey: "Poradi", header: "Pořadí", size: 10, enableHiding: false, enableSorting: true,},
		],
		[]
	);

	const table = useMantineReactTable({
		columns,
		data: tableData,
		enableGrouping: true,
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
			expanded: false,
			grouping: ['Naz_TIM'],
			sorting: [{id: 'Poradi', desc: false}],
			columnVisibility: {Poradi: false, Trida_OTZ: false}
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
		renderDetailPanel: ({row}) => {
			// Vytvoříme pole pro 1–3 řádky textu + km
			const lines = [1, 2, 3]
				.map(i => {
					const text = row.original[`Radek${i}`]?.trim();
					const km = row.original[`KM${i}`] && Number(row.original[`KM${i}`]) > 0 ? formatKm(row.original[`KM${i}`]) : null;
					return text
						? {text, km}
						: null;
				})
				.filter(Boolean);

			return (
				<>
					<Text fw={700} size="sm" c="dimmed">Druh předmětu: {row.original.Druh_Predmetu}</Text>
					<Text size="sm" c="dimmed">Montáž: {row.original.NP}</Text>
					<Text fw={700} my="sm" size="sm">Náhled:</Text>
					<Paper shadow="xs" p={"xs"} style={{width: 'fit-content'}} withBorder bg="orange.0">
						<Flex
							miw="200"
							mih="60"
							gap={0}
							justify="center"
							align="center"
							direction="column"
						>
							{lines.length > 0 ? (
								lines.map((line, idx) => (
									<Group key={idx} justify={!(line) || line.km ? "space-between" : "center"} w="100%">
										<Text fw={700} size="sm" c="dark"
											  style={{fontStretch: 'condensed'}}>{line?.text}</Text>
										{!(line) || line.km && <Text size="sm" c="dark">{line.km} km</Text>}
									</Group>
								))
							) : (
								<Text size="sm" c="dimmed" ta="center">Žádný popis</Text>
							)}
						</Flex>
					</Paper>
				</>
			);
		}
	});

	return (
		<Container size="lg" px={0} my="md">
			<Helmet>
				<title>Příkaz {head?.Cislo_ZP || id} | {window.kct_portal?.bloginfo?.name}</title>
			</Helmet>
			<BreadcrumbsNav items={breadcrumb}/>
			<Title mb="xl" order={2}>
				Značkařský příkaz {head?.Cislo_ZP || id}
			</Title>
			<Card shadow="sm" mb="xl">
				{loading ? (
					<Loader/>
				) : (
					<PrikazHead head={head}/>
				)}
			</Card>
			<Card shadow="sm" padding="sm">
				<MantineReactTable table={table}/>
			</Card>
		</Container>
	);
};

export default Prikaz;

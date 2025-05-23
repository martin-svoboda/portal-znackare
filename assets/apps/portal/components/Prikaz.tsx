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
} from "@mantine/core";
import {IconCrown} from "@tabler/icons-react";
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
import {BreadcrumbsNav} from "./BreadcrumbsNav";

// Utils
const formatKm = (km?: string | null) =>
	km && !isNaN(Number(km)) ? parseFloat(km).toLocaleString("cs-CZ", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 3
	}) : "";

function getBadgeColor(val: string) {
	const v = val.toLowerCase().trim();
	return v === "červená" ? "red"
		: v === "modrá" ? "blue"
			: v === "zelená" ? "green"
				: v === "žlutá" ? "yellow"
					: v === "bílá" ? "gray"
						: "gray";
}

function getItemLines(item: any) {
	return [1, 2, 3]
		.map(i => {
			const text = item[`Radek${i}`]?.trim();
			const km = item[`KM${i}`] && Number(item[`KM${i}`]) > 0 ? formatKm(item[`KM${i}`]) : null;
			return text ? {text, km} : null;
		})
		.filter(Boolean);
}

function groupByEvCiTIM(rows: any[]) {
	const groups: Record<string, any> = {};
	rows.forEach(row => {
		if (!row.EvCi_TIM) return;
		if (!groups[row.EvCi_TIM]) {
			groups[row.EvCi_TIM] = {
				EvCi_TIM: row.EvCi_TIM,
				Naz_TIM: row.Naz_TIM,
				Stav_TIM: row.Stav_TIM,
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

// Člen týmu s korunou
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

// Hlavicka
const PrikazHead = ({head}: { head: any }) => (
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
				notifications.show({
					color: "red",
					title: "Chyba při načítání příkazu",
					message: err.message,
				});
				setHead(null);
				setData([]);
			})
			.finally(() => setLoading(false));
	}, [intAdr, id]);

	const tableData = useMemo(
		() => Array.isArray(data) ? [...data].sort((a, b) => Number(a.Poradi ?? 0) - Number(b.Poradi ?? 0)) : [],
		[data]
	);

	const groupedData = useMemo(
		() => groupByEvCiTIM(tableData),
		[tableData]
	);

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
			},
			{accessorKey: "NP", header: "Montáž", size: 100},
			{accessorKey: "Stav_TIM", header: "Stav", size: 40},
		],
		[]
	);

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
			expanded: false,
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
				<Text size="sm" c="dimmed" hiddenFrom="sm">Stav: {row.original.Stav_TIM}</Text>
				<Stack gap="sm">
					{row.original.items?.map((item: any, i: number) => {
						const lines = getItemLines(item);
						return (
							<>
								<Divider/>
								<Flex w="100%" key={i} gap="md" align="center" wrap="wrap">
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
													<Group key={idx}
														   justify={line.km ? "space-between" : "center"}
														   w="100%">
														<Text fw={700} size="sm" c="dark"
															  style={{fontStretch: 'condensed'}}>{line?.text}</Text>
														{line.km && <Text size="sm" c="dark">{line.km} km</Text>}
													</Group>
												))
											) : (
												<Text size="sm" c="dimmed" ta="center">Žádný popis</Text>
											)}
										</Flex>
									</Paper>
									<Flex
										gap="md"
										justify="center"
										wrap="wrap"
									>
										<Box>
											<Text fw={700}>{item.Druh_Predmetu}</Text>
											{item.Smerovani && (
												<Text size="xs" c="dimmed">
													{item.Smerovani === 'P' ? 'Pravé' : item.Smerovani === 'L' ? 'Levé' : item.Smerovani}
												</Text>
											)}
										</Box>
										<Box>
											{item.BARVA && (
												<Badge color={getBadgeColor(item.BARVA)}>{item.BARVA}</Badge>
											)}
										</Box>
										<Box>
											<Text size="xs" c="dimmed">{item.Druh_Presunu}</Text>
											<Text size="xs">ID: {item.ID_PREDMETY}</Text>
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

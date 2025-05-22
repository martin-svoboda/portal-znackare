import {
	Container,
	Title,
	Text,
	Table,
	Card,
	Group,
	ActionIcon,
	Box,
	Select,
	Menu,
	Loader, ThemeIcon,
} from '@mantine/core';
import {
	IconEdit,
	IconCashBanknotePlus,
} from '@tabler/icons-react';
import {
	MantineReactTable,
	useMantineReactTable,
	type MRT_ColumnDef,
} from 'mantine-react-table';
import {MRT_Localization_CS} from 'mantine-react-table/locales/cs';
import {useEffect, useMemo, useState} from 'react';
import {useAuth} from '../context/AuthContext';
import {apiRequest} from '../utils/apiClient';
import {notifications} from '@mantine/notifications';
import RequireLogin from './RequireLogin';
import {Helmet} from "react-helmet-async";
import {useNavigate} from "react-router-dom";
import {
	IconBrush,
	IconTool,
	IconHammer,
	IconSignLeft,
	IconCrown
} from "@tabler/icons-react";
import {BreadcrumbsNav} from "./BreadcrumbsNav";

const getAvailableYears = () => {
	const currentYear = new Date().getFullYear();
	return Array.from({length: 5}, (_, i) => `${currentYear - i}`);
};

// Drobežková navigace
const breadcrumb = [
	{title: "Nástěnka", href: "/nastenka"},
];

const ProtectedContent = () => {
	const {getIntAdr} = useAuth();
	const intAdr = getIntAdr();
	const [data, setData] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [year, setYear] = useState<string>('');
	const navigate = useNavigate();

	const fetchData = async (selectedYear?: string) => {
		setLoading(true);
		setError(null);
		try {
			const params: Record<string, any> = {int_adr: intAdr};
			if (selectedYear) params.year = selectedYear;
			const result = await apiRequest('/prikazy', 'GET', params);
			setData(result);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!intAdr) return;
		fetchData();
	}, [intAdr]);

	useEffect(() => {
		if (year) fetchData(year);
	}, [year]);

	const druhZPIkona: Record<string, any> = {
		O: IconBrush,      // Obnova – štětec
		N: IconTool,       // Nová – nářadí
		S: IconSignLeft,   // Směrovky/rozcestníky – směrovka
	};

	const columns = useMemo<MRT_ColumnDef<any>[]>(
		() => [
			{accessorKey: 'Cislo_ZP', header: 'Číslo ZP', size: 100},
			{
				accessorKey: 'Druh_ZP_Naz',
				header: 'Druh ZP',
				size: 120,
				filterVariant: 'select',
				Cell: ({row}) => {
					const kod = row.original.Druh_ZP;
					const IconComponent = druhZPIkona[kod] || IconHammer; // Default: kladivo
					return (
						<Group gap="xs" align="center" wrap="nowrap">
							<ThemeIcon variant="light">
								<IconComponent aria-label={row.original.Druh_ZP_Naz}/>
							</ThemeIcon>
							<span>{row.original.Druh_ZP_Naz}</span>
						</Group>
					);
				},
			},
			{accessorKey: 'Popis_ZP', header: 'Popis', size: 300},
			{accessorKey: 'Stav_ZP_Naz', header: 'Stav', size: 100, filterVariant: 'select'},
			{accessorKey: 'Znackar', header: 'Značkař', size: 100, filterVariant: 'autocomplete'},
			{
				accessorKey: 'Je_Vedouci',
				header: 'Ved.',
				size: 40,
				Cell: ({cell}) =>
					cell.getValue() === '1' || cell.getValue() === 1
						? <ThemeIcon variant="light" color="yellow"><IconCrown title="Vedoucí skupiny" aria-label="Vedoucí"/></ThemeIcon>
						: null,
				enableColumnFilter: false,
				meta: {align: 'center'}
			},
			{accessorKey: 'Vyuctovani', header: 'Vyúčtování', size: 100, filterVariant: 'select'},
		],
		[]
	);

	const table = useMantineReactTable({
		columns,
		data,
		enableFacetedValues: true,
		enableColumnFilters: true,
		enablePagination: data.length > 20,
		enableSorting: false,
		//enableRowActions: true,
		enableDensityToggle: false,
		enableFullScreenToggle: false,
		state: {isLoading: loading},
		localization: MRT_Localization_CS,
		initialState: {columnVisibility: {Znackar: false, Trida_OTZ: false}},
		mantineTableProps: {
			withTableBorder: false,
			highlightOnHover: true,
		},
		mantinePaperProps: {
			style: {'--mrt-base-background-color': "light-dark(white, var(--mantine-color-dark-6))"},
			shadow: 'none',
			withBorder: false
		},
		mantineTableBodyRowProps: ({row}) => ({
			style: {cursor: "pointer"},
			onClick: () => navigate(`/prikaz/${row.original.ID_Znackarske_Prikazy}`),
		}),
		renderTopToolbarCustomActions: () => (
			<Group align="center" gap="xs">
				<Text size="xs" fw={500}>Rok</Text>
				<Select
					size="xs"
					w={100}
					placeholder="Aktuální"
					data={getAvailableYears()}
					value={year}
					onChange={(val) => setYear(val || '')}
					aria-label="Výběr roku"
				/>
			</Group>
		),
		renderRowActionMenuItems: ({row}) => (
			<>
				<Menu.Item
					icon={<IconEdit size={24} stroke={1.2}/>}
					onClick={() => console.info('Upravit', row.original)}
					aria-label="Upravit příkaz"
				>
					Upravit data
				</Menu.Item>
				<Menu.Item
					icon={<IconCashBanknotePlus size={24} stroke={1.2}/>}
					onClick={() => console.info('Vyúčtovat', row.original)}
					aria-label="Vyúčtovat příkaz"
				>
					Vyúčtovat
				</Menu.Item>
			</>
		),
	});

	return (
		<Container size="lg" px={0} my="md">
			<BreadcrumbsNav items={breadcrumb}/>
			<Title mb="md" order={2}>Vaše příkazy</Title>
			<Card shadow="sm" padding="sm">
				<MantineReactTable table={table}/>
			</Card>
		</Container>
	);
};

const Prikazy = () => (
	<>
		<Helmet>
			<title>Příkazy | {window.kct_portal?.bloginfo?.name}</title>
		</Helmet>

		<RequireLogin>
			<ProtectedContent/>
		</RequireLogin>
	</>
);

export default Prikazy;

import React from 'react';
import {
	Container,
	Title,
	Text,
	Table,
	Card,
	Group,
	ActionIcon,
	Anchor,
	useMantineTheme, MantineTheme, Loader
} from '@mantine/core';
import {
	IconFile,
	IconFileTypeDoc,
	IconFileTypeDocx,
	IconFileTypeZip,
	IconFileTypePdf,
	IconDownload,
	IconEye,
	IconBook2
} from '@tabler/icons-react';
import ActionCards from "../shared/ActionCards";
import {Helmet} from "react-helmet-async";
import {useMetodikaTerms, Term} from "./MetodikaTermsContext";

// Pro soubory
type MethodicalFile = {
	title: string;
	description?: string;
	file: string;
	size: number;
	type: string;
};

// Helper – Ikona dle typu souboru
const getFileIcon = (type: string) => {
	const theme = useMantineTheme();

	switch (type) {
		case 'pdf':
			return <IconFileTypePdf size={40} stroke={1} color={theme.colors.red[6]}/>;
		case 'doc':
			return <IconFileTypeDoc size={40} stroke={1} color={theme.colors.blue[6]}/>;
		case 'docx':
			return <IconFileTypeDocx size={40} stroke={1} color={theme.colors.blue[6]}/>;
		case 'zip':
		case 'rar':
			return <IconFileTypeZip size={40} stroke={1} color={theme.colors.cyan[6]}/>;
		default:
			return <IconFile size={40} stroke={1}/>;
	}
};

// Velikost souboru ve formátu KB, MB...
const formatBytes = (size: number) => {
	if (!size || size === 0) return "0 B";
	const units = ["B", "KB", "MB", "GB"];
	const power = Math.floor(Math.log(size) / Math.log(1024));
	return `${(size / Math.pow(1024, power)).toFixed(1)} ${units[power]}`;
};

const Metodika: React.FC = () => {
	const theme = useMantineTheme();
	const {terms, loadingTerms, error} = useMetodikaTerms();
	const elements: MethodicalFile[] = window.kct_portal.settings?.methodical_files || [];
	const blogName = window.kct_portal?.bloginfo?.name;

	// Otypuj karty pro ActionCards
	const cards = terms.map((term: Term) => ({
		key: term.term_id || term.id,
		path: `/metodika/${term.slug}`,
		icon: IconBook2,
		title: term.name,
		text: term.description,
	}));

	const rows = elements.map((item: MethodicalFile) => (
		<Table.Tr key={item.title}>
			<Table.Td>
				<Group gap="sm">
					{getFileIcon(item.type)}
					<div>
						<Text fz="md" fw={500}>{item.title}</Text>
						<Text fz="sm" c="dimmed">{item.description}</Text>
					</div>
				</Group>
			</Table.Td>
			<Table.Td>
				<Text fz="sm" c="dimmed">{formatBytes(item.size)}</Text>
			</Table.Td>
			<Table.Td>
				<Group gap="xs">
					<ActionIcon
						component="a"
						href={item.file}
						target="_blank"
						variant="light"
						color="blue"
						download
						aria-label="Stáhnout soubor"
						title="Stáhnout soubor"
					>
						<IconDownload size={20}/>
					</ActionIcon>
					{['pdf'].includes(item.type) && (
						<ActionIcon
							component="a"
							href={item.file}
							target="_blank"
							variant="light"
							color="green"
							aria-label="Zobrazit soubor"
							title="Zobrazit soubor"
						>
							<IconEye size={20}/>
						</ActionIcon>
					)}
				</Group>
			</Table.Td>
		</Table.Tr>
	));

	return (
		<>
			<Helmet>
				<title>Metodika | {blogName}</title>
			</Helmet>

			<Container size="lg" px={0} my="md">
				<Title mb="md" order={2}>Metodika</Title>

				{loadingTerms && <Loader/>}
				{error && <Text c="red">{error}</Text>}
				{!loadingTerms && terms && <ActionCards cards={cards}/>}

				<Title mt="xl" mb="md" order={3}>Soubory ke stažení</Title>

				<Card shadow="sm" padding="sm" style={{overflowX: 'auto'}}>
					<Table>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>Soubor</Table.Th>
								<Table.Th>Velikost</Table.Th>
								<Table.Th>Akce</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>{rows}</Table.Tbody>
					</Table>
				</Card>
			</Container>
		</>
	);
};

export default Metodika;

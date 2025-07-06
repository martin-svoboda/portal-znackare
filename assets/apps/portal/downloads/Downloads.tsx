import React, { useState, useEffect } from 'react';
import {
	Container,
	Title,
	Text,
	Table,
	Card,
	Group,
	ActionIcon,
	useMantineTheme,
	Loader,
	Alert
} from '@mantine/core';
import {
	IconFile,
	IconFileTypeDoc,
	IconFileTypeDocx,
	IconFileTypeZip,
	IconFileTypePdf,
	IconDownload,
	IconEye,
	IconAlertCircle
} from '@tabler/icons-react';
import {Helmet} from "react-helmet-async";
import { apiRequest } from '../shared/api';

type File = {
	title: string;
	description?: string;
	file: string;
	size: number;
	type: string;
};

type DownloadCategory = {
	category: string;
	files: File[];
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

const Downloads: React.FC = () => {
	const blogName = window.kct_portal?.bloginfo?.name;
	const [downloads, setDownloads] = useState<DownloadCategory[]>([]);
	const [loading, setLoading] = useState(true);

	// Načtení dat z API
	useEffect(() => {
		const fetchDownloads = async () => {
			try {
				setLoading(true);
				const data = await apiRequest<DownloadCategory[]>('/downloads', 'GET');
				setDownloads(data);
			} catch (err) {
				console.error('Error fetching downloads:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchDownloads();
	}, []);

	const rows = (files: File[]) => {
		return files.map((item: File) => (
			<Table.Tr key={item.title}>
				<Table.Td>
					<Group gap="sm">
						{getFileIcon(item.type)}
						<div>
							<Text fz="md" fw={500}>{item.title}</Text>
							{item.description && (
								<Text fz="sm" c="dimmed">{item.description}</Text>
							)}
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
	};

	return (
		<>
			<Helmet>
				<title>Soubory ke stažení | {blogName}</title>
			</Helmet>

			<Container size="lg" px={0} my="md">
				<Title mb="md" order={2}>Soubory ke stažení</Title>

				{loading && <Loader  />}

				{!loading && downloads.length === 0 && (
					<Alert
						icon={<IconAlertCircle size={16} />}
						color="blue"
						mb="md"
					>
						Žádné soubory ke stažení nejsou dostupné.
					</Alert>
				)}

				{!loading && downloads.map((category, index) => (
					<div key={index}>
						<Title mt="xl" mb="md" order={3}>{category.category}</Title>

						<Card shadow="sm" padding="sm" style={{overflowX: 'auto'}}>
							<Table>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>Soubor</Table.Th>
										<Table.Th>Velikost</Table.Th>
										<Table.Th>Akce</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>{rows(category.files)}</Table.Tbody>
							</Table>
						</Card>
					</div>
				))}
			</Container>
		</>
	);
}
;

export default Downloads;

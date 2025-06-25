import React, {useMemo} from "react";
import {
	Stack,
	Card,
	Title,
	Group,
	Text,
	Table,
	Badge,
	Divider,
	Alert,
	Box,
	Grid,
	Paper,
	NumberFormatter
} from "@mantine/core";
import {
	IconCalculator,
	IconCar,
	IconClock,
	IconBed,
	IconReceipt,
	IconArrowRight,
	IconInfoCircle
} from "@tabler/icons-react";
import {HlaseniFormData, CompensationCalculation} from "../types/HlaseniTypes";
import {formatCurrency} from "../../shared/formatting";

interface CompensationSummaryProps {
	formData: HlaseniFormData;
	priceList: any;
	head: any;
	totalLength?: number | null;
}

export const CompensationSummary: React.FC<CompensationSummaryProps> = ({
	formData,
	priceList,
	head,
	totalLength
}) => {
	const teamMembers = useMemo(() => {
		if (!head) return [];
		return [1, 2, 3]
			.map(i => ({
				index: i,
				name: head[`Znackar${i}`],
				isLeader: head[`Je_Vedouci${i}`] === "1"
			}))
			.filter(member => member.name?.trim());
	}, [head]);

	const workHours = useMemo(() => {
		return formData.travelSegments.reduce((total, segment) => {
			const start = new Date(`${segment.startDate.toDateString()} ${segment.startTime}`);
			const end = new Date(`${segment.endDate.toDateString()} ${segment.endTime}`);
			if (end > start) {
				return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
			}
			return total;
		}, 0);
	}, [formData.travelSegments]);

	const compensation = useMemo<CompensationCalculation>(() => {
		if (!priceList) {
			return {
				transportCosts: 0,
				workCompensation: 0,
				accommodationCosts: 0,
				additionalExpenses: 0,
				total: 0,
				breakdown: []
			};
		}

		// Výpočet dopravních nákladů
		let transportCosts = 0;
		formData.travelSegments.forEach(segment => {
			if (segment.transportType === "AUV" || segment.transportType === "AUV-Z") {
				const kmRate = priceList.transport?.find((item: any) => 
					item.type === segment.transportType
				)?.price || 6.6; // Fallback sazba
				transportCosts += segment.kilometers * kmRate;
			} else if (segment.transportType === "AUV-Z-VYSSI") {
				const kmRate = priceList.transport?.find((item: any) => 
					item.type === "AUV-Z-VYSSI"
				)?.price || 9.9; // Vyšší sazba
				transportCosts += segment.kilometers * kmRate;
			} else if (segment.transportType === "veřejná doprava") {
				transportCosts += segment.ticketCosts;
			}
			// Pěšky a kolo = 0 Kč
		});

		// Výpočet kompenzace za práci
		const hourlyRate = priceList.work?.find((item: any) => 
			item.type === "hourly_rate"
		)?.price || 120; // Fallback sazba za hodinu
		const workCompensation = workHours * hourlyRate;

		// Náklady na ubytování
		const accommodationCosts = formData.accommodations.reduce(
			(sum, acc) => sum + acc.amount, 0
		);

		// Vedlejší výdaje
		const additionalExpenses = formData.additionalExpenses.reduce(
			(sum, exp) => sum + exp.amount, 0
		);

		const total = transportCosts + workCompensation + accommodationCosts + additionalExpenses;

		// Rozdělení nákladů podle členů
		const breakdown = teamMembers.map(member => {
			// Pro demo účely rozdělíme náklady rovnoměrně
			// V produkčním prostředí by to bylo podle skutečných aktivit každého člena
			const memberTransportCosts = transportCosts / teamMembers.length;
			const memberWorkCompensation = workCompensation / teamMembers.length;
			
			// Ubytování a vedlejší výdaje podle toho, kdo je uhradil
			const memberAccommodationCosts = formData.accommodations
				.filter(acc => acc.paidByMember === member.index)
				.reduce((sum, acc) => sum + acc.amount, 0);
			
			const memberAdditionalExpenses = formData.additionalExpenses
				.filter(exp => exp.paidByMember === member.index)
				.reduce((sum, exp) => sum + exp.amount, 0);

			const memberTotal = memberTransportCosts + memberWorkCompensation + 
				memberAccommodationCosts + memberAdditionalExpenses;

			return {
				member: member.index,
				name: member.name,
				transportCosts: memberTransportCosts,
				workCompensation: memberWorkCompensation,
				accommodationCosts: memberAccommodationCosts,
				additionalExpenses: memberAdditionalExpenses,
				total: memberTotal,
				redirectedTo: formData.paymentRedirects[member.index]
			};
		});

		return {
			transportCosts,
			workCompensation,
			accommodationCosts,
			additionalExpenses,
			total,
			breakdown
		};
	}, [formData, priceList, workHours, teamMembers]);

	const finalPayments = useMemo(() => {
		// Výpočet finálních výplat po přesměrování
		const payments: Record<number, number> = {};
		
		compensation.breakdown.forEach(member => {
			const targetMember = member.redirectedTo || member.member;
			payments[targetMember] = (payments[targetMember] || 0) + member.total;
		});

		return Object.entries(payments).map(([memberIndex, amount]) => ({
			memberIndex: parseInt(memberIndex),
			memberName: teamMembers.find(m => m.index === parseInt(memberIndex))?.name || '',
			amount
		}));
	}, [compensation.breakdown, teamMembers]);

	if (!priceList) {
		return (
			<Alert icon={<IconInfoCircle size={16} />} color="blue">
				Načítání ceníku pro výpočet kompenzací...
			</Alert>
		);
	}

	return (
		<Stack gap="md">
			{/* Přehled práce */}
			<Card shadow="sm" padding="md">
				<Group justify="space-between" mb="md">
					<Title order={4}>Přehled práce</Title>
					<Badge variant="light" leftSection={<IconClock size={14} />}>
						{workHours.toFixed(1)} hodin
					</Badge>
				</Group>
				
				<Grid>
					<Grid.Col span={6}>
						<Text size="sm" c="dimmed">Celková doba práce</Text>
						<Text fw={500}>{workHours.toFixed(1)} hodin</Text>
					</Grid.Col>
					<Grid.Col span={6}>
						<Text size="sm" c="dimmed">Hodinová sazba</Text>
						<Text fw={500}>{formatCurrency(priceList.work?.find((item: any) => item.type === "hourly_rate")?.price || 120)}</Text>
					</Grid.Col>
				</Grid>
				
				{totalLength && (
					<Box mt="md">
						<Text size="sm" c="dimmed">Délka úseku k obnově</Text>
						<Text fw={500}>{(totalLength / 1000).toFixed(1)} km</Text>
					</Box>
				)}
			</Card>

			{/* Dopravní náklady */}
			<Card shadow="sm" padding="md">
				<Title order={4} mb="md">Dopravní náklady</Title>
				
				<Table>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>Segment</Table.Th>
							<Table.Th>Typ dopravy</Table.Th>
							<Table.Th>Množství</Table.Th>
							<Table.Th>Sazba</Table.Th>
							<Table.Th>Náklady</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{formData.travelSegments.map((segment, index) => {
							let amount = 0;
							let unit = "";
							let rate = 0;
							let costs = 0;

							if (segment.transportType === "AUV" || segment.transportType === "AUV-Z") {
								amount = segment.kilometers;
								unit = "km";
								rate = priceList.transport?.find((item: any) => item.type === segment.transportType)?.price || 6.6;
								costs = amount * rate;
							} else if (segment.transportType === "AUV-Z-VYSSI") {
								amount = segment.kilometers;
								unit = "km";
								rate = priceList.transport?.find((item: any) => item.type === "AUV-Z-VYSSI")?.price || 9.9;
								costs = amount * rate;
							} else if (segment.transportType === "veřejná doprava") {
								costs = segment.ticketCosts;
								unit = "Kč";
							}

							return (
								<Table.Tr key={segment.id}>
									<Table.Td>Segment {index + 1}</Table.Td>
									<Table.Td>
										<Badge variant="light" size="sm">
											{segment.transportType}
										</Badge>
									</Table.Td>
									<Table.Td>
										{amount > 0 ? `${amount} ${unit}` : "-"}
									</Table.Td>
									<Table.Td>
										{rate > 0 ? formatCurrency(rate) : "-"}
									</Table.Td>
									<Table.Td fw={500}>
										{formatCurrency(costs)}
									</Table.Td>
								</Table.Tr>
							);
						})}
					</Table.Tbody>
				</Table>
			</Card>

			{/* Ostatní náklady */}
			{(formData.accommodations.length > 0 || formData.additionalExpenses.length > 0) && (
				<Card shadow="sm" padding="md">
					<Title order={4} mb="md">Ostatní náklady</Title>
					
					{formData.accommodations.length > 0 && (
						<Box mb="md">
							<Group gap="xs" mb="xs">
								<IconBed size={16} />
								<Text fw={500}>Nocležné</Text>
							</Group>
							{formData.accommodations.map(acc => (
								<Group key={acc.id} justify="space-between" mb="xs">
									<Text size="sm">
										{acc.facility}, {acc.place} - {teamMembers.find(m => m.index === acc.paidByMember)?.name}
									</Text>
									<Text fw={500}>{formatCurrency(acc.amount)}</Text>
								</Group>
							))}
						</Box>
					)}

					{formData.additionalExpenses.length > 0 && (
						<Box>
							<Group gap="xs" mb="xs">
								<IconReceipt size={16} />
								<Text fw={500}>Vedlejší výdaje</Text>
							</Group>
							{formData.additionalExpenses.map(exp => (
								<Group key={exp.id} justify="space-between" mb="xs">
									<Text size="sm">
										{exp.description} - {teamMembers.find(m => m.index === exp.paidByMember)?.name}
									</Text>
									<Text fw={500}>{formatCurrency(exp.amount)}</Text>
								</Group>
							))}
						</Box>
					)}
				</Card>
			)}

			{/* Celkový souhrn */}
			<Card shadow="sm" padding="md">
				<Title order={4} mb="md">Celkový souhrn kompenzací</Title>
				
				<Stack gap="xs">
					<Group justify="space-between">
						<Text>Dopravní náklady</Text>
						<Text fw={500}>{formatCurrency(compensation.transportCosts)}</Text>
					</Group>
					<Group justify="space-between">
						<Text>Kompenzace za práci</Text>
						<Text fw={500}>{formatCurrency(compensation.workCompensation)}</Text>
					</Group>
					<Group justify="space-between">
						<Text>Nocležné</Text>
						<Text fw={500}>{formatCurrency(compensation.accommodationCosts)}</Text>
					</Group>
					<Group justify="space-between">
						<Text>Vedlejší výdaje</Text>
						<Text fw={500}>{formatCurrency(compensation.additionalExpenses)}</Text>
					</Group>
					<Divider />
					<Group justify="space-between">
						<Text fw={700} size="lg">Celkem</Text>
						<Text fw={700} size="lg">{formatCurrency(compensation.total)}</Text>
					</Group>
				</Stack>
			</Card>

			{/* Rozdělení podle členů */}
			<Card shadow="sm" padding="md">
				<Title order={4} mb="md">Rozdělení podle členů skupiny</Title>
				
				<Table>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>Člen skupiny</Table.Th>
							<Table.Th>Doprava</Table.Th>
							<Table.Th>Práce</Table.Th>
							<Table.Th>Nocležné</Table.Th>
							<Table.Th>Vedl. výdaje</Table.Th>
							<Table.Th>Celkem</Table.Th>
							<Table.Th>Výplata</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{compensation.breakdown.map(member => {
							const redirectTarget = member.redirectedTo 
								? teamMembers.find(m => m.index === member.redirectedTo)?.name 
								: null;

							return (
								<Table.Tr key={member.member}>
									<Table.Td>
										<Group gap="xs">
											<Text fw={500}>{member.name}</Text>
											{teamMembers.find(m => m.index === member.member)?.isLeader && (
												<Badge size="xs" variant="light">vedoucí</Badge>
											)}
										</Group>
									</Table.Td>
									<Table.Td>{formatCurrency(member.transportCosts)}</Table.Td>
									<Table.Td>{formatCurrency(member.workCompensation)}</Table.Td>
									<Table.Td>{formatCurrency(member.accommodationCosts)}</Table.Td>
									<Table.Td>{formatCurrency(member.additionalExpenses)}</Table.Td>
									<Table.Td fw={500}>{formatCurrency(member.total)}</Table.Td>
									<Table.Td>
										{redirectTarget ? (
											<Group gap="xs">
												<IconArrowRight size={14} />
												<Text size="sm">{redirectTarget}</Text>
											</Group>
										) : (
											<Text size="sm">Sebe</Text>
										)}
									</Table.Td>
								</Table.Tr>
							);
						})}
					</Table.Tbody>
				</Table>
			</Card>

			{/* Finální výplaty */}
			<Card shadow="sm" padding="md">
				<Title order={4} mb="md">Finální výplaty</Title>
				
				<Stack gap="xs">
					{finalPayments.map(payment => (
						<Paper key={payment.memberIndex} withBorder p="sm">
							<Group justify="space-between">
								<Text fw={500}>{payment.memberName}</Text>
								<Text fw={700} size="lg" c="green">
									{formatCurrency(payment.amount)}
								</Text>
							</Group>
						</Paper>
					))}
				</Stack>
			</Card>
		</Stack>
	);
};
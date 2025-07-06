import React, {useMemo} from "react";
import {
	Stack,
	Card,
	Title,
	Group,
	Text,
	Button,
	TextInput,
	Select,
	NumberInput,
	Divider,
	ActionIcon,
	Alert,
	Switch,
	Grid,
	Box,
	Checkbox,
	Badge,
	Flex
} from "@mantine/core";
import {
	IconPlus,
	IconTrash,
	IconCopy,
	IconCar,
	IconBus,
	IconWalk,
	IconBike,
	IconInfoCircle,
	IconBed,
	IconReceipt,
	IconMapPin
} from "@tabler/icons-react";
import {DateInput, DatePickerInput} from "@mantine/dates";
import {HlaseniFormData, TravelSegment, Journey, Accommodation, AdditionalExpense} from "../types/HlaseniTypes";
import {FileUploadZone} from "./FileUploadZone";
import {formatCurrency, formatTime} from "../../shared/formatting";
import '@mantine/dates/styles.css';
import 'dayjs/locale/cs';
import dayjs from 'dayjs';

// Set Czech locale globally for dayjs
dayjs.locale('cs');

interface PartAFormProps {
	formData: HlaseniFormData;
	updateFormData: (updates: Partial<HlaseniFormData>) => void;
	priceList: any;
	head: any;
	canEdit: boolean;
	canEditOthers: boolean;
	onSave: () => void;
}

const transportTypeOptions = [
	{value: "AUV", label: "AUV (Auto vlastní)", icon: IconCar},
	{value: "AUV-Z", label: "AUV-Z (Auto zaměstnavatele)", icon: IconCar},
	{value: "veřejná doprava", label: "Veřejná doprava", icon: IconBus},
	{value: "pěšky", label: "Pěšky", icon: IconWalk},
	{value: "kolo", label: "Kolo", icon: IconBike},
];

export const PartAForm: React.FC<PartAFormProps> = ({
														formData,
														updateFormData,
														priceList,
														head,
														canEdit,
														canEditOthers,
														onSave
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

	// Total work hours calculation is now moved to CompensationSummary component

	const canUseHigherRate = useMemo(() => {
		return head?.ZvysenaSazba === "1" && head?.Druh_ZP !== "O";
	}, [head]);

	const addTravelSegment = () => {
		const lastSegment = formData.travelSegments[formData.travelSegments.length - 1];
		const newSegment: TravelSegment = {
			id: crypto.randomUUID(),
			outbound: {
				date: formData.executionDate,
				startTime: "08:00",
				endTime: "",
				startPlace: lastSegment?.return?.endPlace || "",
				endPlace: "",
				transportType: "AUV",
				kilometers: 0,
				ticketCosts: 0,
				attachments: []
			},
			return: {
				date: formData.executionDate,
				startTime: "",
				endTime: "",
				startPlace: "",
				endPlace: "",
				transportType: "AUV",
				kilometers: 0,
				ticketCosts: 0,
				attachments: []
			}
		};

		updateFormData({
			travelSegments: [...formData.travelSegments, newSegment]
		});
	};

	const updateSegment = (segmentId: string, updates: Partial<TravelSegment>) => {
		updateFormData({
			travelSegments: formData.travelSegments.map(segment =>
				segment.id === segmentId ? {...segment, ...updates} : segment
			)
		});
	};

	const updateJourney = (segmentId: string, journeyType: 'outbound' | 'return', updates: Partial<Journey>) => {
		updateFormData({
			travelSegments: formData.travelSegments.map(segment =>
				segment.id === segmentId
					? {...segment, [journeyType]: {...segment[journeyType], ...updates}}
					: segment
			)
		});
	};

	const copyAsReturnJourney = (segmentId: string) => {
		const segment = formData.travelSegments.find(s => s.id === segmentId);
		if (!segment) return;

		const returnJourney: Journey = {
			...segment.outbound,
			startPlace: segment.outbound.endPlace,
			endPlace: segment.outbound.startPlace,
			startTime: "",
			endTime: ""
		};

		updateJourney(segmentId, 'return', returnJourney);
	};

	const removeSegment = (segmentId: string) => {
		updateFormData({
			travelSegments: formData.travelSegments.filter(segment => segment.id !== segmentId)
		});
	};

	const copySegmentsToTeam = () => {
		// Implementace kopírování segmentů na celou skupinu
		// Toto by mělo vytvořit kopie segmentů pro ostatní členy týmu
	};

	const addAccommodation = () => {
		const newAccommodation: Accommodation = {
			id: crypto.randomUUID(),
			place: "",
			facility: "",
			date: formData.executionDate,
			amount: 0,
			paidByMember: 1,
			attachments: []
		};

		updateFormData({
			accommodations: [...formData.accommodations, newAccommodation]
		});
	};

	const updateAccommodation = (accommodationId: string, updates: Partial<Accommodation>) => {
		updateFormData({
			accommodations: formData.accommodations.map(acc =>
				acc.id === accommodationId ? {...acc, ...updates} : acc
			)
		});
	};

	const removeAccommodation = (accommodationId: string) => {
		updateFormData({
			accommodations: formData.accommodations.filter(acc => acc.id !== accommodationId)
		});
	};

	const addAdditionalExpense = () => {
		const newExpense: AdditionalExpense = {
			id: crypto.randomUUID(),
			description: "",
			date: formData.executionDate,
			amount: 0,
			paidByMember: 1,
			attachments: []
		};

		updateFormData({
			additionalExpenses: [...formData.additionalExpenses, newExpense]
		});
	};

	const updateExpense = (expenseId: string, updates: Partial<AdditionalExpense>) => {
		updateFormData({
			additionalExpenses: formData.additionalExpenses.map(exp =>
				exp.id === expenseId ? {...exp, ...updates} : exp
			)
		});
	};

	const removeExpense = (expenseId: string) => {
		updateFormData({
			additionalExpenses: formData.additionalExpenses.filter(exp => exp.id !== expenseId)
		});
	};

	const getTransportIcon = (type: string) => {
		const option = transportTypeOptions.find(opt => opt.value === type);
		return option ? option.icon : IconCar;
	};

	if (!canEdit) {
		return (
			<Alert icon={<IconInfoCircle size={16}/>} color="blue">
				Nemáte oprávnění upravovat toto hlášení.
			</Alert>
		);
	}

	return (
		<Stack gap="md">
			{/* Datum provedení */}
			<Card shadow="sm" padding="md">
				<Title order={4} mb="md">Základní údaje</Title>
				<DatePickerInput
					label="Datum provedení příkazu"
					placeholder="Vyberte datum"
					locale="cs"
					value={formData.executionDate}
					onChange={(date) => {
						if (date) {
							updateFormData({executionDate: date});
							// Aktualizuj datum u všech segmentů
							const updatedSegments = formData.travelSegments.map(segment => ({
								...segment,
								outbound: {...segment.outbound, date},
								return: {...segment.return, date}
							}));
							updateFormData({travelSegments: updatedSegments});
						}
					}}
					required
					disabled={formData.partACompleted}
					valueFormat="D. M. YYYY"
				/>
			</Card>

			{/* Segmenty cesty */}
			<Card shadow="sm" padding="md">
				<Group justify="space-between" mb="md">
					<Title order={4}>Segmenty cesty</Title>
					<Group>
						<Button
							variant="outline"
							size="sm"
							leftSection={<IconPlus size={16}/>}
							onClick={addTravelSegment}
							disabled={formData.partACompleted}
						>
							Přidat segment
						</Button>
					</Group>
				</Group>

				<Stack gap="md">
					{formData.travelSegments.map((segment, index) => {
						const OutboundIcon = getTransportIcon(segment.outbound.transportType);
						const ReturnIcon = getTransportIcon(segment.return.transportType);

						return (
							<Card key={segment.id} withBorder padding="md">
								<Group justify="space-between" mb="md">
									<Group>
										<Text fw={600} size="lg">Segment {index + 1}</Text>
									</Group>
									<Group>
										{formData.travelSegments.length > 1 && (
											<ActionIcon
												color="red"
												variant="light"
												onClick={() => removeSegment(segment.id)}
												disabled={formData.partACompleted}
											>
												<IconTrash size={16}/>
											</ActionIcon>
										)}
									</Group>
								</Group>

								{/* Cesta tam */}
								<Card withBorder mb="md" p="sm">
									<Grid my="sm">
										<Grid.Col span={3}>
											<Group>
												<OutboundIcon size={20}/>
												<Text fw={500} c="blue">Začátek</Text>
											</Group>
										</Grid.Col>
										<Grid.Col span={6}>
												<DatePickerInput
													locale="cs"
													value={segment.outbound.date}
													onChange={(date) => date && updateJourney(segment.id, 'outbound', {date})}
													disabled={formData.partACompleted}
													valueFormat="D. M. YYYY"
												/>
										</Grid.Col>
									</Grid>

									<Grid my="sm">
										<Grid.Col span={3}>
											<Group>
												<IconMapPin size={20}/>
												<Text>Odjezd z</Text>
											</Group>
										</Grid.Col>
										<Grid.Col span={6}>
											<TextInput
												placeholder="Místo"
												value={segment.outbound.startPlace}
												onChange={(e) => updateJourney(segment.id, 'outbound', {startPlace: e.target.value})}
												disabled={formData.partACompleted}
											/>
										</Grid.Col>
										<Grid.Col span={3}>
											<Group wrap={false}>
												<Text>V</Text>
												<TextInput
													w="70%"
													placeholder="HH:MM"
													value={segment.outbound.startTime}
													onChange={(e) => updateJourney(segment.id, 'outbound', {startTime: e.target.value})}
													disabled={formData.partACompleted}
													pattern="[0-9]{2}:[0-9]{2}"
												/>
											</Group>
										</Grid.Col>
									</Grid>

									<Grid my="sm">
										<Grid.Col span={3}>
											<Group>
												<IconMapPin size={20}/>
												<Text>Příjezd do</Text>
											</Group>
										</Grid.Col>
										<Grid.Col span={6}>
											<TextInput
												placeholder="Místo"
												value={segment.outbound.endPlace}
												onChange={(e) => updateJourney(segment.id, 'outbound', {endPlace: e.target.value})}
												disabled={formData.partACompleted}
											/>
										</Grid.Col>
										<Grid.Col span={3}>
											<Group wrap={false}>
												<Text>V</Text>
												<TextInput
													w="70%"
													placeholder="HH:MM"
													value={segment.outbound.endTime}
													onChange={(e) => updateJourney(segment.id, 'outbound', {endTime: e.target.value})}
													disabled={formData.partACompleted}
													pattern="[0-9]{2}:[0-9]{2}"
												/>
											</Group>
										</Grid.Col>
									</Grid>

									<Grid my="sm">
										<Grid.Col span={6}>
											<Select
												label="Typ dopravy"
												data={[...transportTypeOptions.map(opt => ({
													value: opt.value,
													label: opt.label
												})), ...(canUseHigherRate ? [{
													value: "AUV-Z-VYSSI",
													label: "AUV-Z (Vyšší sazba)"
												}] : [])]}
												value={segment.outbound.transportType}
												onChange={(value) => value && updateJourney(segment.id, 'outbound', {transportType: value as any})}
												disabled={formData.partACompleted}
											/>
										</Grid.Col>
										<Grid.Col span={6}>
											{(segment.outbound.transportType === "AUV" || segment.outbound.transportType === "AUV-Z" || segment.outbound.transportType === "AUV-Z-VYSSI") ? (
												<NumberInput
													label="Kilometry"
													value={segment.outbound.kilometers}
													onChange={(value) => updateJourney(segment.id, 'outbound', {kilometers: Number(value) || 0})}
													min={0}
													step={0.1}
													decimalScale={1}
													disabled={formData.partACompleted}
												/>
											) : (
												<NumberInput
													label="Náklady na jízdenky (Kč)"
													value={segment.outbound.ticketCosts}
													onChange={(value) => updateJourney(segment.id, 'outbound', {ticketCosts: Number(value) || 0})}
													min={0}
													step={0.01}
													decimalScale={2}
													disabled={formData.partACompleted}
												/>
											)}
										</Grid.Col>
									</Grid>

									{segment.outbound.transportType === "veřejná doprava" && (
										<Box mt="sm">
											<Text size="sm" mb="xs">Jízdenky a doklady</Text>
											<FileUploadZone
												files={segment.outbound.attachments}
												onFilesChange={(files) => updateJourney(segment.id, 'outbound', {attachments: files})}
												maxFiles={10}
												accept="image/jpeg,image/png,image/heic,application/pdf"
												disabled={formData.partACompleted}
											/>
										</Box>
									)}

									<Button
										variant="outline"
										size="compact-sm"
										leftSection={<IconCopy size={14}/>}
										onClick={() => copyAsReturnJourney(segment.id)}
										disabled={formData.partACompleted}
									>
										Kopírovat jako zpáteční cestu
									</Button>
								</Card>

								{/* Cesta zpět */}
								<Card withBorder p="sm">
									<Grid my="sm">
										<Grid.Col span={3}>
											<Group>
												<ReturnIcon size={20}/>
												<Text fw={500} c="orange">Návrat</Text>
											</Group>
										</Grid.Col>
										<Grid.Col span={6}>
											<DatePickerInput
												locale="cs"
												value={segment.return.date}
												onChange={(date) => date && updateJourney(segment.id, 'return', {date})}
												disabled={formData.partACompleted}
												valueFormat="D. M. YYYY"
											/>
										</Grid.Col>
									</Grid>

									<Grid my="sm">
										<Grid.Col span={3}>
											<Group>
												<IconMapPin size={20}/>
												<Text>Odjezd z</Text>
											</Group>
										</Grid.Col>
										<Grid.Col span={6}>
											<TextInput
												placeholder="Místo"
												value={segment.return.startPlace}
												onChange={(e) => updateJourney(segment.id, 'return', {startPlace: e.target.value})}
												disabled={formData.partACompleted}
											/>
										</Grid.Col>
										<Grid.Col span={3}>
											<Group wrap="nowrap">
												<Text>V</Text>
												<TextInput
													w="70%"
													placeholder="HH:MM"
													value={segment.return.startTime}
													onChange={(e) => updateJourney(segment.id, 'return', {startTime: e.target.value})}
													disabled={formData.partACompleted}
													pattern="[0-9]{2}:[0-9]{2}"
												/>
											</Group>
										</Grid.Col>
									</Grid>

									<Grid my="sm">
										<Grid.Col span={3}>
											<Group>
												<IconMapPin size={20}/>
												<Text>Příjezd do</Text>
											</Group>
										</Grid.Col>
										<Grid.Col span={6}>
											<TextInput
												placeholder="Místo"
												value={segment.return.endPlace}
												onChange={(e) => updateJourney(segment.id, 'return', {endPlace: e.target.value})}
												disabled={formData.partACompleted}
											/>
										</Grid.Col>
										<Grid.Col span={3}>
											<Group wrap="nowrap">
												<Text>V</Text>
												<TextInput
													w="70%"
													placeholder="HH:MM"
													value={segment.return.endTime}
													onChange={(e) => updateJourney(segment.id, 'return', {endTime: e.target.value})}
													disabled={formData.partACompleted}
													pattern="[0-9]{2}:[0-9]{2}"
												/>
											</Group>
										</Grid.Col>
									</Grid>

									<Grid my="sm">
										<Grid.Col span={6}>
											<Select
												label="Typ dopravy"
												data={[...transportTypeOptions.map(opt => ({
													value: opt.value,
													label: opt.label
												})), ...(canUseHigherRate ? [{
													value: "AUV-Z-VYSSI",
													label: "AUV-Z (Vyšší sazba)"
												}] : [])]}
												value={segment.return.transportType}
												onChange={(value) => value && updateJourney(segment.id, 'return', {transportType: value as any})}
												disabled={formData.partACompleted}
											/>
										</Grid.Col>
										<Grid.Col span={6}>
											{(segment.return.transportType === "AUV" || segment.return.transportType === "AUV-Z" || segment.return.transportType === "AUV-Z-VYSSI") ? (
												<NumberInput
													label="Kilometry"
													value={segment.return.kilometers}
													onChange={(value) => updateJourney(segment.id, 'return', {kilometers: Number(value) || 0})}
													min={0}
													step={0.1}
													decimalScale={1}
													disabled={formData.partACompleted}
												/>
											) : (
												<NumberInput
													label="Náklady na jízdenky (Kč)"
													value={segment.return.ticketCosts}
													onChange={(value) => updateJourney(segment.id, 'return', {ticketCosts: Number(value) || 0})}
													min={0}
													step={0.01}
													decimalScale={2}
													disabled={formData.partACompleted}
												/>
											)}
										</Grid.Col>
									</Grid>

									{segment.return.transportType === "veřejná doprava" && (
										<Box mt="sm">
											<Text size="sm" mb="xs">Jízdenky a doklady</Text>
											<FileUploadZone
												files={segment.return.attachments}
												onFilesChange={(files) => updateJourney(segment.id, 'return', {attachments: files})}
												maxFiles={10}
												accept="image/jpeg,image/png,image/heic,application/pdf"
												disabled={formData.partACompleted}
											/>
										</Box>
									)}
								</Card>
							</Card>
						);
					})}
				</Stack>
			</Card>

			{/* Nastavení řidiče */}
			{formData.travelSegments.some(s =>
				s.outbound.transportType === "AUV" || s.outbound.transportType === "AUV-Z" || s.outbound.transportType === "AUV-Z-VYSSI" ||
				s.return.transportType === "AUV" || s.return.transportType === "AUV-Z" || s.return.transportType === "AUV-Z-VYSSI"
			) && (
				<Card shadow="sm" padding="md">
					<Title order={4} mb="md">Nastavení řidiče</Title>
					<Grid>
						<Grid.Col span={6}>
							<Select
								label="Primární řidič"
								placeholder="Vyberte řidiče"
								data={teamMembers.map(member => ({
									value: member.name,
									label: `${member.name}${member.isLeader ? " (vedoucí)" : ""}`
								}))}
								value={formData.primaryDriver}
								onChange={(value) => value && updateFormData({primaryDriver: value})}
								required
								disabled={formData.partACompleted}
							/>
						</Grid.Col>
						<Grid.Col span={6}>
							<TextInput
								label="Registrační značka"
								placeholder="např. 1A2 3456"
								value={formData.vehicleRegistration}
								onChange={(e) => updateFormData({vehicleRegistration: e.target.value})}
								required
								disabled={formData.partACompleted}
							/>
						</Grid.Col>
					</Grid>
				</Card>
			)}

			{/* Nocležné */}
			<Card shadow="sm" padding="md">
				<Group justify="space-between" mb="md">
					<Title order={4}>Nocležné</Title>
					<Button
						variant="outline"
						size="sm"
						leftSection={<IconBed size={16}/>}
						onClick={addAccommodation}
						disabled={formData.partACompleted}
					>
						Přidat nocležné
					</Button>
				</Group>

				{formData.accommodations.length === 0 ? (
					<Text c="dimmed" ta="center" py="md">
						Žádné nocležné není zadáno
					</Text>
				) : (
					<Stack gap="sm">
						{formData.accommodations.map((accommodation) => (
							<Card key={accommodation.id} withBorder padding="sm">
								<Grid>
									<Grid.Col span={3}>
										<TextInput
											label="Místo"
											value={accommodation.place}
											onChange={(e) => updateAccommodation(accommodation.id, {place: e.target.value})}
											disabled={formData.partACompleted}
										/>
									</Grid.Col>
									<Grid.Col span={3}>
										<TextInput
											label="Zařízení"
											value={accommodation.facility}
											onChange={(e) => updateAccommodation(accommodation.id, {facility: e.target.value})}
											disabled={formData.partACompleted}
										/>
									</Grid.Col>
									<Grid.Col span={2}>
										<DatePickerInput
											label="Datum"
											locale="cs"
											value={accommodation.date}
											onChange={(date) => date && updateAccommodation(accommodation.id, {date})}
											disabled={formData.partACompleted}
										/>
									</Grid.Col>
									<Grid.Col span={2}>
										<NumberInput
											label="Částka (Kč)"
											value={accommodation.amount}
											onChange={(value) => updateAccommodation(accommodation.id, {amount: Number(value) || 0})}
											min={0}
											step={0.01}
											decimalScale={2}
											disabled={formData.partACompleted}
										/>
									</Grid.Col>
									<Grid.Col span={2}>
										<Group justify="space-between" align="end" h="100%">
											<Select
												label="Uhradil"
												data={teamMembers.map(member => ({
													value: member.index.toString(),
													label: member.name
												}))}
												value={accommodation.paidByMember.toString()}
												onChange={(value) => value && updateAccommodation(accommodation.id, {paidByMember: parseInt(value)})}
												disabled={formData.partACompleted}
											/>
											<ActionIcon
												color="red"
												variant="light"
												onClick={() => removeAccommodation(accommodation.id)}
												disabled={formData.partACompleted}
											>
												<IconTrash size={16}/>
											</ActionIcon>
										</Group>
									</Grid.Col>
								</Grid>
								<Box mt="sm">
									<Text size="sm" mb="xs">Doklady</Text>
									<FileUploadZone
										files={accommodation.attachments}
										onFilesChange={(files) => updateAccommodation(accommodation.id, {attachments: files})}
										maxFiles={5}
										accept="image/jpeg,image/png,image/heic,application/pdf"
										disabled={formData.partACompleted}
									/>
								</Box>
							</Card>
						))}
					</Stack>
				)}
			</Card>

			{/* Vedlejší výdaje */}
			<Card shadow="sm" padding="md">
				<Group justify="space-between" mb="md">
					<Title order={4}>Vedlejší výdaje</Title>
					<Button
						variant="outline"
						size="sm"
						leftSection={<IconReceipt size={16}/>}
						onClick={addAdditionalExpense}
						disabled={formData.partACompleted}
					>
						Přidat výdaj
					</Button>
				</Group>

				{formData.additionalExpenses.length === 0 ? (
					<Text c="dimmed" ta="center" py="md">
						Žádné vedlejší výdaje nejsou zadány
					</Text>
				) : (
					<Stack gap="sm">
						{formData.additionalExpenses.map((expense) => (
							<Card key={expense.id} withBorder padding="sm">
								<Grid>
									<Grid.Col span={4}>
										<TextInput
											label="Popis výdaje"
											value={expense.description}
											onChange={(e) => updateExpense(expense.id, {description: e.target.value})}
											disabled={formData.partACompleted}
										/>
									</Grid.Col>
									<Grid.Col span={2}>
										<DatePickerInput
											label="Datum"
											locale="cs"
											value={expense.date}
											onChange={(date) => date && updateExpense(expense.id, {date})}
											disabled={formData.partACompleted}
										/>
									</Grid.Col>
									<Grid.Col span={2}>
										<NumberInput
											label="Částka (Kč)"
											value={expense.amount}
											onChange={(value) => updateExpense(expense.id, {amount: Number(value) || 0})}
											min={0}
											step={0.01}
											decimalScale={2}
											disabled={formData.partACompleted}
										/>
									</Grid.Col>
									<Grid.Col span={2}>
										<Select
											label="Uhradil"
											data={teamMembers.map(member => ({
												value: member.index.toString(),
												label: member.name
											}))}
											value={expense.paidByMember.toString()}
											onChange={(value) => value && updateExpense(expense.id, {paidByMember: parseInt(value)})}
											disabled={formData.partACompleted}
										/>
									</Grid.Col>
									<Grid.Col span={2}>
										<Group justify="end" align="end" h="100%">
											<ActionIcon
												color="red"
												variant="light"
												onClick={() => removeExpense(expense.id)}
												disabled={formData.partACompleted}
											>
												<IconTrash size={16}/>
											</ActionIcon>
										</Group>
									</Grid.Col>
								</Grid>
								<Box mt="sm">
									<Text size="sm" mb="xs">Doklady</Text>
									<FileUploadZone
										files={expense.attachments}
										onFilesChange={(files) => updateExpense(expense.id, {attachments: files})}
										maxFiles={5}
										accept="image/jpeg,image/png,image/heic,application/pdf"
										disabled={formData.partACompleted}
									/>
								</Box>
							</Card>
						))}
					</Stack>
				)}
			</Card>

			{/* Přesměrování výplat */}
			<Card shadow="sm" padding="md">
				<Title order={4} mb="md">Přesměrování výplat</Title>
				<Text size="sm" c="dimmed" mb="md">
					Každý člen skupiny může nastavit, aby jeho kompenzace byla vyplacena jinému členovi skupiny.
				</Text>

				<Stack gap="sm">
					{teamMembers.map((member) => (
						<Group key={member.index} justify="space-between">
							<Text>{member.name}</Text>
							<Select
								placeholder="Výplata pro..."
								data={[
									{value: "", label: "Sebe (výchozí)"},
									...teamMembers
										.filter(m => m.index !== member.index)
										.map(m => ({value: m.index.toString(), label: m.name}))
								]}
								value={formData.paymentRedirects[member.index]?.toString() || ""}
								onChange={(value) => {
									const newRedirects = {...formData.paymentRedirects};
									if (value) {
										newRedirects[member.index] = parseInt(value);
									} else {
										delete newRedirects[member.index];
									}
									updateFormData({paymentRedirects: newRedirects});
								}}
								w={200}
								disabled={formData.partACompleted}
							/>
						</Group>
					))}
				</Stack>
				{canEditOthers && (
					<Checkbox
						defaultChecked
						label="Kopírovat data na celou skupinu"
					/>
				)}
			</Card>
		</Stack>
	);
};

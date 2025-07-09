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
	Grid,
	Box,
	Checkbox,
	ThemeIcon
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
	IconMapPin,
	IconArrowUp,
	IconArrowDown
} from "@tabler/icons-react";
import {DatePickerInput} from "@mantine/dates";
import {HlaseniFormData, TravelSegment, Accommodation, AdditionalExpense} from "../types/HlaseniTypes";
import {FileUploadZone} from "./FileUploadZone";
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
														priceList: _priceList,
														head,
														canEdit,
														canEditOthers
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


	const addTravelSegment = () => {
		const lastSegment = formData.travelSegments[formData.travelSegments.length - 1];
		const newSegment: TravelSegment = {
			id: crypto.randomUUID(),
			date: formData.executionDate,
			startTime: "08:00",
			endTime: "",
			startPlace: lastSegment?.endPlace || "",
			endPlace: "",
			transportType: "AUV",
			kilometers: 0,
			ticketCosts: 0,
			attachments: []
		};

		updateFormData({
			travelSegments: [...formData.travelSegments, newSegment]
		});
	};


	const updateSegmentField = (segmentId: string, updates: Partial<TravelSegment>) => {
		updateFormData({
			travelSegments: formData.travelSegments.map(segment =>
				segment.id === segmentId
					? {...segment, ...updates}
					: segment
			)
		});
	};

	const duplicateSegment = (segmentId: string) => {
		const segment = formData.travelSegments.find(s => s.id === segmentId);
		if (!segment) return;

		const newSegment: TravelSegment = {
			...segment,
			id: crypto.randomUUID(),
			startPlace: segment.endPlace,
			endPlace: segment.startPlace,
			startTime: "",
			endTime: ""
		};

		updateFormData({
			travelSegments: [...formData.travelSegments, newSegment]
		});
	};

	const removeSegment = (segmentId: string) => {
		updateFormData({
			travelSegments: formData.travelSegments.filter(segment => segment.id !== segmentId)
		});
	};

	const moveSegmentUp = (segmentId: string) => {
		const segments = [...formData.travelSegments];
		const currentIndex = segments.findIndex(s => s.id === segmentId);

		if (currentIndex > 0) {
			// Swap with previous segment
			[segments[currentIndex - 1], segments[currentIndex]] = [segments[currentIndex], segments[currentIndex - 1]];
			updateFormData({travelSegments: segments});
		}
	};

	const moveSegmentDown = (segmentId: string) => {
		const segments = [...formData.travelSegments];
		const currentIndex = segments.findIndex(s => s.id === segmentId);

		if (currentIndex < segments.length - 1) {
			// Swap with next segment
			[segments[currentIndex], segments[currentIndex + 1]] = [segments[currentIndex + 1], segments[currentIndex]];
			updateFormData({travelSegments: segments});
		}
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
				<Group>
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
									date
								}));
								updateFormData({travelSegments: updatedSegments});
							}
						}}
						required
						disabled={formData.partACompleted}
						valueFormat="D. M. YYYY"
					/>
					{canEditOthers && (
						<Checkbox
							defaultChecked
							label="Kopírovat data na celou skupinu"
						/>
					)}
				</Group>
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
						if (!segment) return null;
						const TransportIcon = getTransportIcon(segment.transportType || "AUV");

						return (
							<>
								{index > 0 && (<Divider my="sm"/>)}
								<Box key={segment.id} ml="md" pl="lg" style={{borderLeft: "2px solid #4dabf7"}}
									 pos="relative">
									<Group
										pos="absolute"
										top="0"
										right="0"
										style={{zIndex: 10}}
										gap="xs"
									>
										{/* Přesunout nahoru - pouze pokud není první */}
										{index > 0 && (
											<ActionIcon
												variant="light"
												color="blue"
												onClick={() => moveSegmentUp(segment.id)}
												disabled={formData.partACompleted}
												title="Přesunout nahoru"
											>
												<IconArrowUp size={14}/>
											</ActionIcon>
										)}

										{/* Přesunout dolů - pouze pokud není poslední */}
										{index < formData.travelSegments.length - 1 && (
											<ActionIcon
												variant="light"
												color="blue"
												onClick={() => moveSegmentDown(segment.id)}
												disabled={formData.partACompleted}
												title="Přesunout dolů"
											>
												<IconArrowDown size={14}/>
											</ActionIcon>
										)}

										{/* Duplikovat segment */}
										<ActionIcon
											variant="light"
											color="green"
											onClick={() => duplicateSegment(segment.id)}
											disabled={formData.partACompleted}
											title="Duplikovat cestu"
										>
											<IconCopy size={14}/>
										</ActionIcon>
										{formData.travelSegments.length > 1 && (
											<ActionIcon
												color="red"
												variant="light"
												onClick={() => removeSegment(segment.id)}
												disabled={formData.partACompleted}
												title="Smazat cestu"
											>
												<IconTrash size={16}/>
											</ActionIcon>
										)}
									</Group>


									{/* Segment cesty */}
									<Box mb="md">
										<Group mb="md" pos="relative" wrap="wrap" align="start">
											<ThemeIcon radius="xl" size="lg" pos="absolute" left="-38px" top="-5px">
												<TransportIcon/>
											</ThemeIcon>
											<Box w="100px" pl="sm">
												<Text fw={500}>Cesta {index + 1}</Text>
											</Box>
											<Grid w={{base: "100%", xs: "auto"}} flex={{base: "auto", xs: "1"}}>
												<Grid.Col span={{base: 12, xs: 7,}}>
													<DatePickerInput
														locale="cs"
														value={segment.date || formData.executionDate}
														onChange={(date) => date && updateSegmentField(segment.id, {date})}
														disabled={formData.partACompleted}
														valueFormat="D. M. YYYY"
													/>
												</Grid.Col>
												<Grid.Col span={{base: 12, xs: 5,}}>
												</Grid.Col>
											</Grid>
										</Group>

										<Group mb="md" pos="relative" wrap="wrap" align="start">
											<ThemeIcon pos="absolute" left="-32px" size="sm">
												<IconMapPin size={20}/>
											</ThemeIcon>
											<Box w="100px">
												<Text>Odjezd z</Text>
											</Box>
											<Grid flex={{base: "auto", sm: "1"}}>
												<Grid.Col span={{base: 12, sm: 7,}}>
													<TextInput
														placeholder="Místo"
														value={segment.startPlace || ""}
														onChange={(e) => updateSegmentField(segment.id, {startPlace: e.target.value})}
														disabled={formData.partACompleted}
													/>
												</Grid.Col>
												<Grid.Col span={{base: 12, sm: 5,}}>
													<Group>
														<Text>V</Text>
														<TextInput
															flex="1"
															placeholder="HH:MM"
															value={segment.startTime || ""}
															onChange={(e) => updateSegmentField(segment.id, {startTime: e.target.value})}
															disabled={formData.partACompleted}
															pattern="[0-9]{2}:[0-9]{2}"
														/>
													</Group>
												</Grid.Col>
											</Grid>
										</Group>

										<Group mb="md" pos="relative" wrap="wrap" align="start">
											<ThemeIcon pos="absolute" left="-32px" size="sm">
												<IconMapPin size={20}/>
											</ThemeIcon>
											<Box w="100px">
												<Text>Příjezd do</Text>
											</Box>
											<Grid flex={{base: "auto", sm: "1"}}>
												<Grid.Col span={{base: 12, sm: 7,}}>
													<TextInput
														placeholder="Místo"
														value={segment.endPlace || ""}
														onChange={(e) => updateSegmentField(segment.id, {endPlace: e.target.value})}
														disabled={formData.partACompleted}
													/>
												</Grid.Col>
												<Grid.Col span={{base: 12, sm: 5,}}>
													<Group>
														<Text>V</Text>
														<TextInput
															flex="1"
															placeholder="HH:MM"
															value={segment.endTime || ""}
															onChange={(e) => updateSegmentField(segment.id, {endTime: e.target.value})}
															disabled={formData.partACompleted}
															pattern="[0-9]{2}:[0-9]{2}"
														/>
													</Group>
												</Grid.Col>
											</Grid>
										</Group>

										<Grid my="sm">
											<Grid.Col span={{base: 12, sm: 6,}}>
												<Select
													label="Typ dopravy"
													data={transportTypeOptions.map(opt => ({
														value: opt.value,
														label: opt.label
													}))}
													value={segment.transportType || "AUV"}
													onChange={(value) => value && updateSegmentField(segment.id, {transportType: value as any})}
													disabled={formData.partACompleted}
												/>
											</Grid.Col>
											<Grid.Col span={{base: 12, sm: 6,}}>
												{((segment.transportType || "AUV") === "AUV" || (segment.transportType || "") === "AUV-Z") ? (
													<NumberInput
														label="Kilometry"
														value={segment.kilometers || 0}
														onChange={(value) => updateSegmentField(segment.id, {kilometers: Number(value) || 0})}
														min={0}
														step={0.1}
														decimalScale={1}
														disabled={formData.partACompleted}
													/>
												) : (
													<NumberInput
														label="Náklady na jízdenky (Kč)"
														value={segment.ticketCosts || 0}
														onChange={(value) => updateSegmentField(segment.id, {ticketCosts: Number(value) || 0})}
														min={0}
														step={0.01}
														decimalScale={2}
														disabled={formData.partACompleted}
													/>
												)}
											</Grid.Col>
										</Grid>

										{(segment.transportType || "") === "veřejná doprava" && (
											<Box mt="sm">
												<Text size="sm" mb="xs">Jízdenky a doklady</Text>
												<FileUploadZone
													files={segment.attachments || []}
													onFilesChange={(files) => updateSegmentField(segment.id, {attachments: files})}
													maxFiles={10}
													accept="image/jpeg,image/png,image/heic,application/pdf"
													disabled={formData.partACompleted}
												/>
											</Box>
										)}
									</Box>
								</Box>
							</>
						);
					})}
				</Stack>
			</Card>

			{/* Nastavení řidiče */}
			{formData.travelSegments && formData.travelSegments.length > 0 && formData.travelSegments.some(s =>
				s && s.transportType && (s.transportType === "AUV" || s.transportType === "AUV-Z")
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
			</Card>
		</Stack>
	);
};

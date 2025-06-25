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
	Button,
	Divider,
	Tabs,
	Alert,
	Box,
	Grid,
	Paper,
	ActionIcon,
	Flex
} from "@mantine/core";
import {
	IconReportMoney,
	IconRoute,
	IconInfoCircle,
	IconCheck,
	IconAlertTriangle,
	IconPlus,
	IconTrash
} from "@tabler/icons-react";
import {useParams, useLocation, useNavigate} from "react-router-dom";
import {apiRequest} from "../shared/api";
import {notifications} from "@mantine/notifications";
import {Helmet} from "react-helmet-async";
import {useAuth} from "../auth/AuthContext";
import {BreadcrumbsNav} from "../shared/BreadcrumbsNav";
import RequireLogin from "../auth/RequireLogin";
import {formatKm} from "../shared/formatting";
import {PrikazHead} from "./components/PrikazHead";
import {HlaseniFormData, TravelSegment, AdditionalExpense, Accommodation} from "./types/HlaseniTypes";
import {PartAForm} from "./components/PartAForm";
import {PartBForm} from "./components/PartBForm";
import {CompensationSummary} from "./components/CompensationSummary";

const getBreadcrumbs = (id: string | undefined, head: any) => [
	{title: "Nástěnka", href: "/nastenka"},
	{title: "Příkazy", href: "/prikazy"},
	{title: `Příkaz ${head?.Cislo_ZP || id}`, href: `/prikaz/${id}`},
];

const HlaseniPrikazu = () => {
	const {id} = useParams();
	const {getIntAdr, user} = useAuth();
	const intAdr = getIntAdr();
	const location = useLocation();
	const navigate = useNavigate();

	// Převezmi data z location state, pokud existují
	const locationData = location.state as {head?: any, predmety?: any[], useky?: any[], delka?: number} | null;

	const [head, setHead] = useState<any>(locationData?.head || null);
	const [predmety, setPredmety] = useState<any[]>(locationData?.predmety || []);
	const [useky, setUseky] = useState<any[]>(locationData?.useky || []);
	const [loading, setLoading] = useState(!locationData);
	const [saving, setSaving] = useState(false);
	const [activeTab, setActiveTab] = useState<string | null>("part-a");

	const [formData, setFormData] = useState<HlaseniFormData>({
		executionDate: new Date(),
		travelSegments: [{
			id: crypto.randomUUID(),
			startDate: new Date(),
			endDate: new Date(),
			startTime: "",
			endTime: "",
			startPlace: "",
			endPlace: "",
			transportType: "AUV",
			kilometers: 0,
			ticketCosts: 0,
			attachments: []
		}],
		primaryDriver: "",
		vehicleRegistration: "",
		higherKmRate: false,
		accommodations: [],
		additionalExpenses: [],
		partACompleted: false,
		partBCompleted: false,
		timReports: {},
		routeComment: "",
		paymentRedirects: {}
	});

	const [priceList, setPriceList] = useState<any>(null);

	// Načítání dat příkazu pouze pokud nejsou předána přes location
	useEffect(() => {
		if (locationData) {
			// Data už máme z location, nemusíme načítat
			setLoading(false);
			return;
		}

		setLoading(true);
		apiRequest("/prikaz", "GET", {int_adr: intAdr, id})
			.then(result => {
				setHead(result.head || {});
				setPredmety(result.predmety || []);
				setUseky(result.useky || []);
			})
			.catch(err => {
				notifications.show({
					title: "Chyba",
					message: "Nepodařilo se načíst data příkazu",
					color: "red"
				});
				// Pokud se nepodaří načíst data, přesměruj zpět na příkaz
				navigate(`/prikaz/${id}`);
			})
			.finally(() => setLoading(false));
	}, [intAdr, id, locationData, navigate]);

	// Načítání existujícího hlášení
	useEffect(() => {
		if (!head?.Cislo_ZP) return;

		apiRequest("/hlaseni", "GET", {int_adr: intAdr, id})
			.then(result => {
				if (result.data) {
					setFormData(result.data);
				}
			})
			.catch(err => {
				// Hlášení ještě neexistuje, to je v pořádku
			});
	}, [intAdr, id, head?.Cislo_ZP]);

	// Načítání ceníku při změně data provedení
	useEffect(() => {
		if (!formData.executionDate) return;

		const dateStr = formData.executionDate.toISOString().split('T')[0];
		apiRequest("/ceniky", "GET", {date: dateStr})
			.then(result => {
				setPriceList(result);
			})
			.catch(err => {
				notifications.show({
					title: "Upozornění",
					message: "Nepodařilo se načíst ceník pro dané datum",
					color: "yellow"
				});
			});
	}, [formData.executionDate]);

	const totalLength = useMemo(() => {
		if (head?.Druh_ZP !== "O" || !Array.isArray(useky) || useky.length === 0) return null;
		return useky.reduce((sum, usek) => sum + Number(usek.Delka_ZU || 0), 0);
	}, [useky, head?.Druh_ZP]);

	const isLeader = useMemo(() => {
		if (!user || !head) return false;
		return [1, 2, 3].some(i =>
			head[`Znackar${i}`] === user.name && head[`Je_Vedouci${i}`] === "1"
		);
	}, [user, head]);

	const canEditOthers = isLeader;

	const saveForm = async (showNotification = true) => {
		setSaving(true);
		try {
			await apiRequest("/hlaseni", "POST", {
				int_adr: intAdr,
				id,
				data: formData
			});

			if (showNotification) {
				notifications.show({
					title: "Uloženo",
					message: "Hlášení bylo úspěšně uloženo",
					color: "green"
				});
			}
		} catch (err) {
			notifications.show({
				title: "Chyba",
				message: "Nepodařilo se uložit hlášení",
				color: "red"
			});
		} finally {
			setSaving(false);
		}
	};

	const updateFormData = (updates: Partial<HlaseniFormData>) => {
		setFormData(prev => ({...prev, ...updates}));
	};

	const canCompletePartA = useMemo(() => {
		// Kontrola povinných údajů pro dokončení části A
		const hasDriverForCar = formData.travelSegments.some(segment =>
			(segment.transportType === "AUV" || segment.transportType === "AUV-Z") &&
			(!formData.primaryDriver || !formData.vehicleRegistration)
		);

		const hasTicketsForPublicTransport = formData.travelSegments.some(segment =>
			segment.transportType === "veřejná doprava" && segment.attachments.length === 0
		);

		const hasDocumentsForExpenses = [
			...formData.accommodations,
			...formData.additionalExpenses
		].some(expense => expense.attachments.length === 0);

		return !hasDriverForCar && !hasTicketsForPublicTransport && !hasDocumentsForExpenses;
	}, [formData]);

	if (loading) {
		return (
			<RequireLogin>
				<Container size="lg" px={0} my="md">
					<Loader />
				</Container>
			</RequireLogin>
		);
	}

	return (
		<RequireLogin>
			<Container size="lg" px={0} my="md">
				<Helmet>
					<title>{`Hlášení příkazu ${head?.Cislo_ZP || id || ''} | ${(window as any).kct_portal?.bloginfo?.name || 'Portal'}`}</title>
				</Helmet>
				<BreadcrumbsNav items={getBreadcrumbs(id, head)}/>
				<Title mb="xl" order={2}>
					Hlášení o provedení příkazu {head?.Cislo_ZP || id}
				</Title>

				{head && (
					<Card shadow="sm" mb="xl">
						<PrikazHead head={head} delka={totalLength}/>
					</Card>
				)}

				<Tabs value={activeTab} onChange={setActiveTab}>
					<Tabs.List>
						<Tabs.Tab
							value="part-a"
							leftSection={<IconRoute size={14} />}
							rightSection={formData.partACompleted && <IconCheck size={14} color="green" />}
						>
							Část A - Provedení
						</Tabs.Tab>
						{head?.Druh_ZP === "O" && (
							<Tabs.Tab
								value="part-b"
								leftSection={<IconInfoCircle size={14} />}
								rightSection={formData.partBCompleted && <IconCheck size={14} color="green" />}
							>
								Část B - Stav TIM
							</Tabs.Tab>
						)}
						<Tabs.Tab
							value="summary"
							leftSection={<IconReportMoney size={14} />}
						>
							Souhrn a kompenzace
						</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value="part-a" pt="md">
						<PartAForm
							formData={formData}
							updateFormData={updateFormData}
							priceList={priceList}
							head={head}
							canEdit={true}
							canEditOthers={canEditOthers}
							onSave={() => saveForm(false)}
						/>

						<Group justify="space-between" mt="xl">
							<Button
								variant="outline"
								onClick={() => saveForm()}
								loading={saving}
							>
								Uložit změny
							</Button>

							{canCompletePartA ? (
								<Button
									color="green"
									onClick={() => {
										updateFormData({partACompleted: true});
										saveForm();
									}}
									disabled={formData.partACompleted}
								>
									{formData.partACompleted ? "Část A dokončena" : "Označit část A jako hotovou"}
								</Button>
							) : (
								<Alert
									icon={<IconAlertTriangle size={16} />}
									color="orange"
									variant="light"
								>
									Pro dokončení části A je třeba vyplnit všechny povinné údaje
								</Alert>
							)}
						</Group>
					</Tabs.Panel>

					{head?.Druh_ZP === "O" && (
						<Tabs.Panel value="part-b" pt="md">
							<PartBForm
								formData={formData}
								updateFormData={updateFormData}
								head={head}
								useky={useky}
								predmety={predmety}
								canEdit={canEditOthers}
								onSave={() => saveForm(false)}
							/>

							<Group justify="space-between" mt="xl">
								<Button
									variant="outline"
									onClick={() => saveForm()}
									loading={saving}
								>
									Uložit změny
								</Button>

								<Button
									color="green"
									onClick={() => {
										updateFormData({partBCompleted: true});
										saveForm();
									}}
									disabled={formData.partBCompleted || !canEditOthers}
								>
									{formData.partBCompleted ? "Část B dokončena" : "Označit část B jako hotovou"}
								</Button>
							</Group>
						</Tabs.Panel>
					)}

					<Tabs.Panel value="summary" pt="md">
						<CompensationSummary
							formData={formData}
							priceList={priceList}
							head={head}
							totalLength={totalLength}
						/>

						<Group justify="center" mt="xl">
							<Button
								size="lg"
								color="blue"
								disabled={!formData.partACompleted || (head?.Druh_ZP === "O" && !formData.partBCompleted)}
								onClick={() => {
									// Odeslání ke schválení
									apiRequest("/hlaseni/submit", "POST", {int_adr: intAdr, id})
										.then(() => {
											notifications.show({
												title: "Odesláno",
												message: "Hlášení bylo odesláno ke schválení",
												color: "green"
											});
										})
										.catch(() => {
											notifications.show({
												title: "Chyba",
												message: "Nepodařilo se odeslat hlášení",
												color: "red"
											});
										});
								}}
							>
								Odeslat ke schválení
							</Button>
						</Group>
					</Tabs.Panel>
				</Tabs>
			</Container>
		</RequireLogin>
	);
};

export default HlaseniPrikazu;

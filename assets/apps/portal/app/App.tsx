import {
	AppShell,
	Burger,
	Flex,
	Group,
	Text,
	NavLink,
	ActionIcon,
	useMantineColorScheme, Button,
} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import {
	IconHome2,
	IconMoon,
	IconSun,
	IconBooks,
	IconFileDescription,
} from "@tabler/icons-react";
import {Routes, Route, useNavigate, useLocation,} from "react-router-dom";
import React, {useMemo} from "react";
import dayjs from 'dayjs';
import 'dayjs/locale/cs';

// Set Czech locale globally for dayjs
dayjs.locale('cs');

import { useAuth } from "../auth/AuthContext";
import Dashboard from "../user/Dashboard";
import Prikazy from "../prikazy/Prikazy";
import Metodika from "../metodika/Metodika";
import PostPage from "../content/PostPage";
import MetodikaDetail from "../metodika/MetodikaDetail";
import MetodikaTermOverview from "../metodika/MetodikaTermOverview";
import {MetodikaProvider} from "../metodika/MetodikaContext";
import UserMenu from "../auth/UserMenu";
import {MetodikaTermsProvider} from "../metodika/MetodikaTermsContext";
import Prikaz from "../prikazy/Prikaz";
import HlaseniPrikazu from "../prikazy/HlaseniPrikazu";
import Profil from "../user/Profil";
import MetodikaTerm from "../metodika/MetodikaTerm";

const staticNavItems = [
	{path: "/", label: "Úvod", icon: IconHome2},
	{path: "/metodika", label: "Metodika", icon: IconBooks},
];

const ColorSchemeToggle = () => {
	const {colorScheme, toggleColorScheme} = useMantineColorScheme();
	const isDark = colorScheme === "dark";

	return (
		<ActionIcon
			variant="subtle"
			size="lg"
			aria-label="Přepnout motiv světlý/tmavý"
			onClick={toggleColorScheme}
			title="Přepnout motiv"
		>
			{isDark ? <IconSun size={24} stroke={1.2}/> : <IconMoon size={24} stroke={1.2}/>}
		</ActionIcon>
	);
};

const App: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const {logout, loggedIn} = useAuth();
	const [opened, {toggle}] = useDisclosure();

	const isMetodikaDetail = location.pathname.startsWith("/metodika/") && location.pathname.split("/").length > 2;
	const isActive = (path: string) => location.pathname === path;

	const menuItems = useMemo(() => {
		const wpMenu = window.kct_portal?.menu || [];
		const customItems = wpMenu.map((item) => ({
			path: item.url?.replace(window.location.origin, ""),
			label: item.title,
			icon: IconFileDescription,
		}));
		return [...staticNavItems, ...customItems];
	}, []);


	return (
		<AppShell
			header={{height: 60}}
			navbar={{width: {sm: 0}, breakpoint: "sm", collapsed: {mobile: !opened}}}
			padding="md"
		>
			<AppShell.Header withBorder={false}>
				<Flex justify="space-between" align="center" h="100%" px="md">
					<Group>
						<Burger
							opened={opened}
							onClick={toggle}
							size="sm"
							aria-label={opened ? "Zavřít menu" : "Otevřít menu"}
							title={opened ? "Zavřít menu" : "Otevřít menu"}
							hiddenFrom="sm"
						/>
						<Text fz={18} fw={600} component="h1" visibleFrom="md">
							Portál značkaře
						</Text>
						<Text fz={18} fw={600} component="h1" hiddenFrom="md">
							PZ
						</Text>
					</Group>
					<Group gap="0" visibleFrom="sm">
						{menuItems.map((item) => (
							<Button
								key={item.path}
								variant="subtle"
								color="gray"
								active={isActive(item.path)}
								onClick={() => {
									navigate(item.path);
									//if (window.innerWidth < 768) toggle();
								}}
								aria-label={`Přejít na ${item.label}`}
							>
								{item.label}
							</Button>
						))}
					</Group>
					<Group>
						<ColorSchemeToggle/>
						{loggedIn ?
							<UserMenu onSuccess={() => {}}/>
							:
							<Button
								color="blue"
								onClick={() => {
									navigate("/nastenka");
								}}
							>Přihlásit se</Button>
						}
					</Group>
				</Flex>
			</AppShell.Header>

			<AppShell.Navbar p="md" withBorder={false} hiddenFrom="sm">
				<Text fz={18} fw={600}>
					Portál značkaře
				</Text>
				{menuItems.map((item) => (
					<NavLink
						key={item.path}
						variant="subtle"
						color="gray"
						label={item.label}
						active={isActive(item.path)}
						onClick={() => {
							navigate(item.path);
							if (window.innerWidth < 768) toggle();
						}}
						aria-label={`Přejít na ${item.label}`}
					/>
				))}
			</AppShell.Navbar>

			<AppShell.Main
				style={{backgroundColor: "light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))"}}>
				<Routes>
					<Route path="/" element={<PostPage/>}/>
					<Route path="/nastenka" element={<Dashboard/>}/>
					<Route path="/profil" element={<Profil/>}/>
					<Route path="/prikazy" element={<Prikazy/>}/>
					<Route path="/prikaz/:id" element={<Prikaz/>}/>
					<Route path="/prikaz/:id/hlaseni" element={<HlaseniPrikazu/>}/>
					<Route path="/metodika/*" element={
						<MetodikaTermsProvider>
							<Routes>
								<Route path="" element={<Metodika/>}/>
								<Route path=":termSlug/*" element={
									<MetodikaProvider>
										<Routes>
											<Route path="" element={<MetodikaTerm/>}/>
											<Route path=":postSlug" element={<MetodikaDetail/>}/>
										</Routes>
									</MetodikaProvider>
								}/>
							</Routes>
						</MetodikaTermsProvider>
					}/>
					<Route path="*" element={<PostPage/>}/>
				</Routes>
			</AppShell.Main>
		</AppShell>
	)
		;
};

export default App;

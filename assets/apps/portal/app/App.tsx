import {
	AppShell,
	Burger,
	Flex,
	Group,
	Text,
	NavLink,
	ActionIcon,
	useMantineColorScheme, Button, useMantineTheme, Divider,
} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import {
	IconHome2,
	IconMoon,
	IconSun,
	IconBooks,
	IconFileDescription, IconChecklist, IconUser, IconLogout,
    IconLayoutDashboard,
} from "@tabler/icons-react";
import {Routes, Route, useNavigate, useLocation,} from "react-router-dom";
import React, {useMemo} from "react";
import dayjs from 'dayjs';
import 'dayjs/locale/cs';

// Set Czech locale globally for dayjs
dayjs.locale('cs');

import {useAuth} from "../auth/AuthContext";
import Dashboard from "../user/Dashboard";
import Prikazy from "../prikazy/Prikazy";
import Metodika from "../metodika/Metodika";
import PostPage from "../content/PostPage";
import MetodikaDetail from "../metodika/MetodikaDetail";
import {MetodikaProvider} from "../metodika/MetodikaContext";
import {MetodikaTermsProvider} from "../metodika/MetodikaTermsContext";
import Prikaz from "../prikazy/Prikaz";
import HlaseniPrikazu from "../prikazy/HlaseniPrikazu";
import Profil from "../user/Profil";
import MetodikaTerm from "../metodika/MetodikaTerm";
import UserWidget from "../auth/UserWidget";

const staticNavItems = [
	{path: "/metodika", label: "Metodika", icon: IconBooks},
];

const staticUserNavItems = [
	{path: "/nastenka", label: "Moje nástěnka", icon: IconLayoutDashboard},
	{path: "/prikazy", label: "Příkazy", icon: IconChecklist},
	{path: "/profil", label: "Profil", icon: IconUser},
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
	const theme = useMantineTheme();

	const isActive = (path: string) => location.pathname === path;

	const menuItems = useMemo(() => {
		const wpMenu = window.kct_portal?.menu || [];
		const customItems = wpMenu.map((item) => ({
			path: item.url?.replace(window.location.origin, ""),
			label: item.title,
			icon: IconFileDescription,
		}));
		return [...customItems, ...staticNavItems];
	}, []);

	const NavLinkItem = ({item}: {item: {path: string; label: string; icon?: any}}) => {
		return (
			<NavLink
				active={isActive(item.path)}
				label={item.label}
				onClick={() => {
					navigate(item.path);
					if (window.innerWidth < 992) toggle();
				}}
				leftSection={item.icon ? <item.icon size={20} stroke={1.2}/> :
					<IconFileDescription size={20} stroke={1.2}/>}
				aria-label={`Přejít na ${item.label}`}
			/>
		);
	}

	return (
		<AppShell
			header={{height: 60}}
			navbar={{width: 220, breakpoint: 'md', collapsed: {mobile: !opened}}}
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
							hiddenFrom="md"
						/>
						<Text fz={18} fw={600}>
							Portál značkaře
						</Text>
					</Group>
					<Group>
						<ColorSchemeToggle/>
						{loggedIn ?
							<UserWidget/>
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

			<AppShell.Navbar p="md" withBorder={false}>
				<NavLinkItem item={{path: "/", label: "Úvod", icon: IconHome2}}/>
				{menuItems.map((item) => (
					<NavLinkItem key={item.path} item={item}/>
				))}
				<Divider/>
				{loggedIn &&
					<>
						{staticUserNavItems.map((item) => (
							<NavLinkItem key={item.path} item={item}/>
						))}
						<Divider/>
						<NavLink
							label="Odhlásit se"
							onClick={() => {
								logout();
								if (window.innerWidth < 992) toggle();
							}}
							leftSection={<IconLogout size={20} stroke={1.2}/>}
							style={{color: theme.colors.red[6]}}
							aria-label="Odhlásit se"
						/>
					</>
				}
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

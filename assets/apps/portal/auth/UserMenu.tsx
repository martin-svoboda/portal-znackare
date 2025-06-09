import {useAuth} from "./AuthContext";
import React from "react";
import {
	Group,
	Flex,
	Avatar, Menu, Text, useMantineTheme
} from "@mantine/core";
import {useNavigate} from "react-router-dom";
import {IconChecklist, IconHome2, IconLogout, IconUser} from "@tabler/icons-react";


const staticUserNavItems = [
	{path: "/nastenka", label: "Moje nástěnka", icon: IconHome2},
	{path: "/prikazy", label: "Příkazy", icon: IconChecklist},
	{path: "/profil", label: "Profil", icon: IconUser},
];
const UserMenu = ({onSuccess}) => {
	const {logout, loggedIn, user} = useAuth();
	const navigate = useNavigate();
	const theme = useMantineTheme();

	const isActive = (path: string) => location.pathname === path;

	const name = `${user?.Jmeno} ${user?.Prijmeni}`;

	return (
		<Menu position="bottom-end" trigger="hover" openDelay={50} closeDelay={400}>
			<Menu.Target>
				<Group gap="xs">
					<Avatar
						color="blue"
						key={name}
						name={name}
					/>
					<Flex style={{flex: 1}} visibleFrom="md" direction="column">
						<Text size="sm" fw={500} component="strong">
							{user?.Jmeno} {user?.Prijmeni}
						</Text>
						<Text c="dimmed" size="xs">
							{user?.Prukaz_znackare}
						</Text>
					</Flex>
				</Group>
			</Menu.Target>

			<Menu.Dropdown>
				<Flex style={{flex: 1}} hiddenFrom="md" direction="column" p="xs">
					<Text size="sm" fw={500} component="strong">
						{user?.Jmeno} {user?.Prijmeni}
					</Text>
					<Text c="dimmed" size="xs">
						{user?.Prukaz_znackare}
					</Text>
				</Flex>
				<Menu.Divider hiddenFrom="md"/>
				{staticUserNavItems.map((item) => (
					<Menu.Item
						key={item.path}
						active={isActive(item.path)}
						onClick={() => {
							navigate(item.path);
							//if (window.innerWidth < 768) toggle();
						}}
						leftSection={<item.icon size={20} stroke={1.2}/>}
						aria-label={`Přejít na ${item.label}`}
					>
						{item.label}
					</Menu.Item>
				))}
				<Menu.Divider/>
				<Menu.Item
					label="Odhlásit se"
					onClick={logout}
					leftSection={<IconLogout size={20} stroke={1.2}/>}
					style={{color: theme.colors.red[6]}}
					aria-label="Odhlásit se"
				>
					Odhlásit se
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
};

export default UserMenu;

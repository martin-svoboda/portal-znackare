import {Container, SimpleGrid, Title, Card, Group, Text} from "@mantine/core";
import {IconChecklist, IconBooks} from "@tabler/icons-react";
import ActionCards from "../shared/ActionCards";
import RequireLogin from "../auth/RequireLogin";
import {Helmet} from "react-helmet-async";

const cards = [
	{title: 'Příkazy', path: "/prikazy", icon: IconChecklist},
	{title: 'Metodika', path: "/metodika", icon: IconBooks},
];
const Dashboard = () => {
	const blogName = window.kct_portal?.bloginfo?.name

	return <>
		<Helmet>
			<title>Nástěnka značkaře | {blogName}</title>
		</Helmet>

		<RequireLogin>
			<Container size="lg" px={0} my="md">
				<Title mb="md" order={2}>Nástěnka</Title>
				<ActionCards cards={cards}/>
			</Container>
		</RequireLogin>
	</>
}
export default Dashboard;

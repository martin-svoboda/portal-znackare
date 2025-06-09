import {Card, Group, SimpleGrid, Text} from "@mantine/core";
import {useNavigate} from "react-router-dom";
import type {TablerIconsProps} from "@tabler/icons-react";

type ActionCardItem = {
	title: string;
	path: string;
	icon: (props: TablerIconsProps) => JSX.Element;
};

type ActionCardsProps = {
	cards: ActionCardItem[];
};

const ActionCards = ({cards}: ActionCardsProps) => {
	const navigate = useNavigate();

	return (
		<SimpleGrid cols={{base: 2, sm: 3, lg: 4}} mt="md">
			{cards.map((item) => (
				<Card
					key={item.title}
					shadow="sm"
					padding="xl"
					component="a"
					role="link"
					aria-label={`Přejít na ${item.title}`}
					style={{cursor: "pointer", '&:hover': {background: 'red'}}}
					onClick={() => navigate(item.path)}
				>
					<Group>
						<item.icon size={24} stroke={1.2}/>
						<Text size="lg" fw={500}>
							{item.title}
						</Text>
					</Group>
				</Card>
			))}
		</SimpleGrid>
	);
};

export default ActionCards;

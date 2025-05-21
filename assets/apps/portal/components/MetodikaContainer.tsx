import React from "react";
import {Container, Breadcrumbs, Flex, Box, Card} from "@mantine/core";

type MetodikaContainerProps = {
	sidebar: React.ReactNode;
	content: React.ReactNode;
};

const MetodikaContainer: React.FC<MetodikaContainerProps> = ({ sidebar, content }) => {
	return (
		<Container size="lg" px={0} my="md">
			<Flex gap="xl" align="flex-start" direction={{ base: "column", md: "row" }}>
				<Box
					w={{ base: "100%", md: 350 }}
					miw={200}
					pos={{base: "relative", md:"sticky"}}
					style={{
						flexShrink: 0,
					}}
				>
					<Card shadow="sm" padding="md" >
					{sidebar}
					</Card>
				</Box>
				<Box
					w="100%"
					flex={1}
					miw={0}
				>
					{content}
				</Box>
			</Flex>
		</Container>
	);
};

export default MetodikaContainer;

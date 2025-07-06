import React from 'react';
import {
	Container,
	Title,
	Text,
	Loader
} from '@mantine/core';
import {
	IconBook2
} from '@tabler/icons-react';
import ActionCards from "../shared/ActionCards";
import {Helmet} from "react-helmet-async";
import {useMetodikaTerms, Term} from "./MetodikaTermsContext";

const Metodika: React.FC = () => {
	const {terms, loadingTerms, error} = useMetodikaTerms();
	const blogName = window.kct_portal?.bloginfo?.name;

	// Otypuj karty pro ActionCards
	const cards = terms.map((term: Term) => ({
		key: term.term_id || term.id,
		path: `/metodika/${term.slug}`,
		icon: IconBook2,
		title: term.name,
		text: term.description,
	}));

	return (
		<>
			<Helmet>
				<title>Metodika | {blogName}</title>
			</Helmet>

			<Container size="lg" px={0} my="md">
				<Title mb="md" order={2}>Metodika</Title>

				{loadingTerms && <Loader/>}
				{error && <Text c="red">{error}</Text>}
				{!loadingTerms && terms && <ActionCards cards={cards}/>}

			</Container>
		</>
	);
};

export default Metodika;

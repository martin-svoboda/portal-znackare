import React, { useEffect } from 'react';
import { Loader, Text, Stack } from '@mantine/core';
import { useMetodika } from './MetodikaContext';
import { useNavigate } from 'react-router-dom';
import { Helmet } from "react-helmet-async";
import { useMetodikaTerms } from "./MetodikaTermsContext";
import MetodikaContainer from "./MetodikaContainer";
import { BreadcrumbsNav } from "../shared/BreadcrumbsNav";
import { Title } from "@mantine/core";

const MetodikaTerm: React.FC = () => {
	const { terms, loadingTerms, error: termsError } = useMetodikaTerms();
	const { termSlug, posts, loadingPosts, error: postsError } = useMetodika();
	const navigate = useNavigate();

	const term = terms.find(t => t.slug === termSlug);

	const breadcrumb = [
		{ title: "Metodika", href: "/metodika" },
	];

	// Sidebar stále zobrazíme (i prázdný)
	const sidebar = (
		<Stack gap={0}>
			<Title mb="md" order={4}>Kapitoly metodiky</Title>
			{posts && posts.map((post) => (
				<div key={post.id}>
					<Text size="sm">{post.title}</Text>
				</div>
			))}
		</Stack>
	);

	// Loader / Error / Empty, vždy ve stejném layoutu
	let content = null;

	if (loadingTerms || loadingPosts) {
		content = <Loader />;
	} else if (termsError || postsError) {
		content = <Text color="red">{termsError || postsError}</Text>;
	} else if (!posts || posts.length === 0) {
		content = <Text color="red">V této metodice zatím nejsou žádné kapitoly.</Text>;
	}

	// Redirect na první článek pokud je
	useEffect(() => {
		if (!loadingPosts && posts && posts.length > 0 && term) {
			navigate(`/metodika/${term.slug}/${posts[0].slug}`, { replace: true });
		}
	}, [loadingPosts, posts, term, navigate]);

	return (
		<>
			<Helmet>
				<title>{term?.name || 'Metodika'} | {window.kct_portal?.bloginfo?.name}</title>
			</Helmet>
			<MetodikaContainer
				content={
					<>
						<BreadcrumbsNav items={breadcrumb} />
						<Title mb="sm">{term?.name}</Title>
						{term?.description && <Text mb="md">{term.description}</Text>}
						{content}
					</>
				}
				sidebar={sidebar}
			/>
		</>
	);
};

export default MetodikaTerm;

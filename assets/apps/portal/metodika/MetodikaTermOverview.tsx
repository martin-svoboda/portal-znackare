import React from 'react';
import {
	NavLink, Loader, Stack, Container, Title, Anchor, Breadcrumbs, Text
} from '@mantine/core';
import {useMetodika} from './MetodikaContext';
import {useNavigate} from 'react-router-dom';
import {useMediaQuery} from '@mantine/hooks';
import { getHeadingsFromHtml } from '../shared/formatting';
import {Helmet} from "react-helmet-async";
import {useMetodikaTerms} from "./MetodikaTermsContext";
import MetodikaContainer from "./MetodikaContainer";
import {BreadcrumbsNav} from "../shared/BreadcrumbsNav";
import {TableOfContents} from "@mantine/core/lib";

type Term = {
	id: number;
	slug: string;
	name: string;
	description?: string;
};
type Post = {
	id: number | string;
	slug: string;
	title: string;
	content: string;
	perex?: string;
	excerpt?: string;
};

const MetodikaTermOverview: React.FC = () => {
	const {terms, loadingTerms, error: termsError, setSelectedPostSlug} = useMetodikaTerms();
	const {
		termSlug,
		posts,
		loadingPosts,
		error: postsError
	} = useMetodika();
	const navigate = useNavigate();
	const isDesktop = useMediaQuery('(min-width: 768px)');

	const term = terms.find(t => t.slug === termSlug);

	const breadcrumb = [
		{title: "Metodika", href: "/metodika"},
	].filter(item => !!item.title && !!item.href);

	const sidebar = (
		<Stack gap={0}>
			<Title mb="md" order={4}>Kapitoly metodiky</Title>
			{posts.map((post) => (
				<div key={post.id}>
					<NavLink
						key={post.slug}
						active={false}
						label={post.title}
						description={post.perex || post.excerpt}
						onClick={() => navigate(`/metodika/${term?.slug}/${post.slug}`)}
						variant="subtle"
					/>
				</div>
			))}
		</Stack>
	);

	const content = (
		<>
			<BreadcrumbsNav items={breadcrumb}/>
			<Title mb="sm">{term?.name}</Title>
			{term?.description && <Text mb="md">{term.description}</Text>}
			{postsError && <Text c="red">{postsError}</Text>}
			{loadingPosts && <Loader/>}
			{posts ? (
				<Stack gap="xs">
					{posts.map(post => {
						const headings = getHeadingsFromHtml(post.content) as {
							id: string;
							text: string;
							level: number
						}[];
						return (
							<NavLink
								key={post.slug}
								label={post.title}
								description={post.perex || post.excerpt}
								defaultOpened={isDesktop}
								onClick={() => navigate(`/metodika/${term?.slug}/${post.slug}`)}
							>
								{headings.map(h => (
									<NavLink
										key={h.id}
										label={h.text}
										style={{
											paddingLeft: h.level === 3 ? 24 : 12,
											fontWeight: 400
										}}
										component="a"
										href={`/metodika/${term?.slug}/${post.slug}#${h.id}`}
										onClick={e => {
											e.preventDefault(); // lepší než stopPropagation pro anchor
											navigate(`/metodika/${term?.slug}/${post.slug}#${h.id}`);
										}}
									/>
								))}
							</NavLink>
						)
					})}
				</Stack>
			) : (
				<Text c="red">Kapitoly nenalezeny</Text>
			)}
		</>
	);

	return (
		<>
			<Helmet>
				<title>{term?.name || 'Metodika'} | {window.kct_portal?.bloginfo?.name}</title>
			</Helmet>
			<MetodikaContainer content={content} sidebar={sidebar}/>
		</>
	);
};

export default MetodikaTermOverview;

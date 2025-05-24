import React, {useMemo, useRef} from 'react';
import {
	Title, Card, Group, Loader, NavLink, ScrollArea, Stack, Anchor, Text,
} from '@mantine/core';
import {useNavigate, useParams} from 'react-router-dom';
import {Helmet} from 'react-helmet-async';
import {addHeadingIdsToHtml} from '../utils/textHlepers';
import {TableOfContents} from '@mantine/core';
import {useMetodika} from '../context/MetodikaContext';
import {useMetodikaTerms} from '../context/MetodikaTermsContext';
import MetodikaContainer from './MetodikaContainer';
import {BreadcrumbsNav} from "./BreadcrumbsNav";

const MetodikaDetail: React.FC = () => {
	// context
	const {posts, loadingPosts, termSlug, selectedPostSlug, setSelectedPostSlug, error} = useMetodika();
	const {terms} = useMetodikaTerms();

	const {postSlug} = useParams();
	const navigate = useNavigate();
	const contentRef = useRef<HTMLDivElement>(null);
	const blogName = window.kct_portal?.bloginfo?.name;

	// vyhledat aktivní term
	const term = useMemo(() => terms.find(t => t.slug === termSlug), [terms, termSlug]);

	// vyhledat aktuální post podle slug
	const selectedPost = useMemo(() =>
		posts.find(p => p.slug === (selectedPostSlug || postSlug)), [posts, selectedPostSlug, postSlug]
	);

	const postContentWithIds = useMemo(
		() => (selectedPost ? addHeadingIdsToHtml(selectedPost.content || '') : ''),
		[selectedPost]
	);

	const breadcrumb = [
		{ title: "Metodika", href: "/metodika" },
		{ title: term?.name || "", href: `/metodika/${termSlug}` },
	].filter(item => !!item.title && !!item.href);


	// SIDEBAR s menu kapitol + TOC pro aktivní kapitolu
	const sidebar = (
		<Stack gap={0}>
			<Title mb="md" order={4}>Kapitoly metodiky</Title>
			{posts.map((post) => (
				<div key={post.id}>
					<NavLink
						active={String(selectedPost?.slug) === String(post.slug)}
						label={post.title}
						description={post.perex || post.excerpt}
						onClick={() => {
							setSelectedPostSlug(String(post.slug));
							navigate(`/metodika/${termSlug}/${post.slug}`);
						}}
						variant="subtle"
					/>
					{/* Pokud je tato kapitola aktivní, zobrazit Mantine TableOfContents */}
					{String(selectedPost?.slug) === String(post.slug) && (
						<TableOfContents
							variant="light"
							color="blue"
							size="sm"
							radius={0}
							minDepthToOffset={0}
							depthOffset={20}
							scrollSpyOptions={{
								selector: '#mdx :is( h2, h3, h4, h5)',
							}}
							getControlProps={({data}) => ({
								onClick: () => data.getNode().scrollIntoView(),
								children: data.value,
							})}
						/>
					)}
				</div>
			))}
		</Stack>
	);

	// OBSAH PRAVÉHO PANELU
	const content = (
		<>
			{error && <Text c="red">{error}</Text>}
			{loadingPosts && <Loader/>}
			{selectedPost ? (
				<>
					<BreadcrumbsNav items={breadcrumb}/>
					<Title order={2} mb="md">{selectedPost.title}</Title>
					<div id="mdx" ref={contentRef} dangerouslySetInnerHTML={{__html: postContentWithIds}}/>
				</>
			) : (
				<Title order={2}>Kapitola nenalezena</Title>
			)}
		</>
	);

	return (
		<>
			<Helmet>
				<title>{selectedPost?.title || 'Metodika'} | {blogName}</title>
			</Helmet>
			<MetodikaContainer content={content} sidebar={sidebar}/>
		</>
	);
};

export default MetodikaDetail;

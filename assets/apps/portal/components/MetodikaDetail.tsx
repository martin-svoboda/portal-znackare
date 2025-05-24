import React, {useMemo, useRef, useState} from 'react';
import {
	Title, Loader, NavLink, Stack, Text, Button, Drawer, useMantineTheme, Group, ScrollArea
} from '@mantine/core';
import {IconMenu2} from '@tabler/icons-react';
import {useNavigate, useParams} from 'react-router-dom';
import {Helmet} from 'react-helmet-async';
import {addHeadingIdsToHtml} from '../utils/textHlepers';
import {TableOfContents} from '@mantine/core';
import {useMetodika} from '../context/MetodikaContext';
import {useMetodikaTerms} from '../context/MetodikaTermsContext';
import MetodikaContainer from './MetodikaContainer';
import {BreadcrumbsNav} from "./BreadcrumbsNav";
import {useMediaQuery} from '@mantine/hooks';

const MetodikaDetail: React.FC = () => {
	// context
	const {posts, loadingPosts, termSlug, selectedPostSlug, setSelectedPostSlug, error} = useMetodika();
	const {terms} = useMetodikaTerms();

	const {postSlug} = useParams();
	const navigate = useNavigate();
	const contentRef = useRef<HTMLDivElement>(null);
	const blogName = window.kct_portal?.bloginfo?.name;

	// mobile detection
	const theme = useMantineTheme();
	const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
	const [drawerOpened, setDrawerOpened] = useState(false);

	// vyhledat aktivní term
	const term = useMemo(() => terms.find(t => t.slug === termSlug), [terms, termSlug]);

	// vyhledat aktuální post podle slug
	const selectedPost = useMemo(
		() => posts.find(p => p.slug === (selectedPostSlug || postSlug)), [posts, selectedPostSlug, postSlug]
	);

	const postContentWithIds = useMemo(
		() => (selectedPost ? addHeadingIdsToHtml(selectedPost.content || '') : ''),
		[selectedPost]
	);

	const breadcrumb = [
		{title: "Metodika", href: "/metodika"},
		{title: term?.name || "", href: `/metodika/${termSlug}`},
	].filter(item => !!item.title && !!item.href);

	const currentIndex = useMemo(
		() => posts.findIndex((p) => String(p.slug) === String(selectedPost?.slug)),
		[posts, selectedPost]
	);
	const prevPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
	const nextPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

	// SIDEBAR s menu kapitol + TOC pro aktivní kapitolu
	const sidebarContent = (
		<Stack gap={0}>
			<Title mb="md" order={4} visibleFrom="md">Kapitoly metodiky</Title>
			{posts.map((post) => (
				<div key={post.id}>
					<NavLink
						active={String(selectedPost?.slug) === String(post.slug)}
						label={post.title}
						description={post.perex || post.excerpt}
						onClick={() => {
							setSelectedPostSlug(String(post.slug));
							navigate(`/metodika/${termSlug}/${post.slug}`);
							setDrawerOpened(false); // zavřít drawer po kliknutí
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
					<Group justify="space-between" mt="xl">
						{prevPost ? (
							<Button
								variant="subtle"
								onClick={() => {
									setSelectedPostSlug(String(prevPost.slug));
									navigate(`/metodika/${termSlug}/${prevPost.slug}`);
									window.scrollTo({top: 0, behavior: 'smooth'});
								}}
							>
								← {prevPost.title}
							</Button>
						) : <span />}
						{nextPost ? (
							<Button
								variant="subtle"
								onClick={() => {
									setSelectedPostSlug(String(nextPost.slug));
									navigate(`/metodika/${termSlug}/${nextPost.slug}`);
									window.scrollTo({top: 0, behavior: 'smooth'});
								}}
							>
								{nextPost.title} →
							</Button>
						) : <span />}
					</Group>
				</>
			) : (
				<Title order={2}>Kapitola nenalezena</Title>
			)}
		</>
	);

	// Sidebar logic
	const sidebar = isMobile ? (
		<>
			<Button fullWidth
					rightSection={<IconMenu2 size={18} />}
					variant="subtle"
					color="dark"
					justify="space-between"
					onClick={() => setDrawerOpened(true)}
			>
				Kapitoly metodiky
			</Button>
			<Drawer
				opened={drawerOpened}
				onClose={() => setDrawerOpened(false)}
				title="Kapitoly metodiky"
				position="right"
				size="xs"
				overlayProps={{opacity: 0.5, blur: 2}}
				transitionProps={{transition: "slide-left", duration: 250}}
				zIndex={4000}
			>
				<ScrollArea h="80vh" px="xs" py="sm">
					{sidebarContent}
				</ScrollArea>
			</Drawer>
		</>
	) : (
		<ScrollArea h="calc(100vh - 140px)" px="xs" py="sm">
			{sidebarContent}
		</ScrollArea>
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

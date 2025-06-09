import {Text, Container, Title, Divider, Loader} from '@mantine/core';
import {useEffect, useState, useCallback} from 'react';
import {useLocation} from 'react-router-dom';
import {Helmet} from 'react-helmet-async';
import {apiRequest} from "../shared/api";
import {notifications} from "@mantine/notifications";
import RequireLogin from "../auth/RequireLogin";
import {useAuth} from "../auth/AuthContext";
//import GenericPage from './GenericPage';
//import BlogPost from './BlogPost';
//import MetodikaDetail from './MetodikaDetail';

const PostPage = () => {
	const location = useLocation();
	const {loggedIn} = useAuth();

	const [post, setPost] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const blogName = window.kct_portal?.bloginfo?.name
	const slug = location.pathname.split('/').filter(Boolean).pop() || '';

	const fetchPost = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const result = await apiRequest('/post', 'GET', {
				slug,
				logged_in: loggedIn,
			});

			setPost(result);
		} catch (err: any) {
			setError(err.message);
			setPost(null);
		} finally {
			setLoading(false);
		}
	}, [location.pathname, loggedIn]);

	useEffect(() => {
		fetchPost();
	}, [fetchPost]);

	useEffect(() => {
		if (error) {
			notifications.show({
				color: 'red',
				title: 'Chyba při načítání obsahu',
				message: error,
				autoClose: 5000,
			});
		}
	}, [error]);

	console.log(post)

	if (loading) {
		return (
			<Container size="lg" px={0} my="md">
				<Loader/>
			</Container>
		);
	}

	if (!post) {
		return (
			<>
				<Helmet>
					<title>Stránka nenalezena | {blogName}</title>
				</Helmet>

				<Container size="lg" px={0} my="md">
					<Title order={2}>Stránka nenalezena</Title>
					<Text>Požadovaný obsah nebyl nalezen nebo je nedostupný.</Text>
				</Container>
			</>
		);
	}

	// Pokud je stránka chráněná, počkáme na přihlášení a po něm obnovíme data
	if (post.require_login) {
		return (
			<RequireLogin required={true} onLoginSuccess={fetchPost}>
				{/* Komponenta LoginForm se postará o login a pak zavolá fetchPost */}
			</RequireLogin>
		);
	}

	// Vlastní obsah
	return (
		<>
			<Helmet>
				<title>{post.title} | {blogName}</title>
			</Helmet>

			<div dangerouslySetInnerHTML={{__html: post.styles}}/>
			<Container size="lg" px={0} my="md">
				{slug && <Title order={2}>{post.title}</Title> }
				<div dangerouslySetInnerHTML={{__html: post.content}}/>
			</Container>
		</>
	);

	// switch (post.type) {
	// 	// case 'page':
	// 	// 	return <GenericPage post={post} />;
	// 	// case 'post':
	// 	// 	return <BlogPost post={post} />;
	// 	// case 'metodika':
	// 	// 	return <MetodikaDetail post={post} />;
	// 	default:
	// 		return (
	// 			<Container size="lg" px={0} my="xl">
	// 				<Title order={2}>{post.title}</Title>
	// 				<Text>Neznámý typ obsahu: {post.type}</Text>
	// 			</Container>
	// 		);
	// }
};

export default PostPage;

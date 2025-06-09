import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useParams } from "react-router-dom";
import { apiRequest } from "../shared/api";
import { notifications } from "@mantine/notifications";

type Post = {
	id: number | string;
	slug: string;
	title: string;
	content: string;
	perex?: string;
	excerpt?: string;
	// ...další vlastnosti
};

type MetodikaContextType = {
	posts: Post[];
	loadingPosts: boolean;
	selectedPostSlug: string | null;
	setSelectedPostSlug: (slug: string) => void;
	termSlug?: string;
	error?: string;
};

const MetodikaContext = createContext<MetodikaContextType | undefined>(undefined);

export const useMetodika = () => {
	const ctx = useContext(MetodikaContext);
	if (!ctx) throw new Error("useMetodika must be used within MetodikaProvider");
	return ctx;
};

export const MetodikaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const { termSlug, postSlug } = useParams();
	const [posts, setPosts] = useState<Post[]>([]);
	const [selectedPostSlug, setSelectedPostSlug] = useState<string | null>(postSlug || null);
	const [loadingPosts, setLoadingPosts] = useState(true);
	const [error, setError] = useState<string | undefined>(undefined);

	const fetchData = async () => {
		setLoadingPosts(true);
		setError(undefined);
		try {
			if (termSlug) {
				const fetchedPosts = await apiRequest("/metodika", "GET", { term: termSlug });
				setPosts(fetchedPosts);
			} else {
				setPosts([]);
			}
		} catch (err: any) {
			setError(err?.message || "Chyba při načítání dat metodiky");
			notifications.show({
				color: "red",
				title: "Chyba metodiky",
				message: err?.message || "Chyba při načítání dat metodiky",
				autoClose: 6000,
			});
			setPosts([]);
		} finally {
			setLoadingPosts(false);
		}
	};

	// fetch posts vždy, když se změní termSlug
	useEffect(() => { fetchData(); }, [termSlug]);

	// změna selectedPostSlug při změně termSlug nebo postSlug
	useEffect(() => {
		setSelectedPostSlug(postSlug || null);
	}, [termSlug, postSlug]);

	return (
		<MetodikaContext.Provider value={{
			posts,
			loadingPosts,
			selectedPostSlug,
			setSelectedPostSlug,
			termSlug,
			error
		}}>
			{children}
		</MetodikaContext.Provider>
	);
};

import React from "react";
import {NavLink, TableOfContents} from "@mantine/core";
import {useNavigate, useParams} from "react-router-dom";
import {useMetodika} from "./MetodikaContext";
import {useDisclosure} from "@mantine/hooks";

const MetodikaSidebar = () => {
	const [opened, {toggle}] = useDisclosure();
	const navigate = useNavigate();
	const {posts, selectedPostSlug, setSelectedPostSlug, term} = useMetodika();

	return (
		<div>
			{posts.map((post) => (
				<div key={post.ID || post.id}>
					<NavLink
						active={String(selectedPostSlug) === String(post.slug)}
						label={post.title}
						description={post.perex || post.excerpt}
						onClick={() => {
							setSelectedPostSlug(String(post.slug));
							navigate(`/metodika/${term}/${post.slug}`);
						}}
						style={{fontWeight: String(selectedPostSlug) === String(post.slug) ? 600 : 400}}
					/>
					{/* Pokud je tato kapitola aktivní, zobrazit Mantine TableOfContents */}
					{String(selectedPostSlug) === String(post.slug) && (
						<TableOfContents
							key={selectedPostSlug}
							variant="light"
							color="blue"
							size="sm"
							radius="sm"
							scrollSpyOptions={{
								selector: '#mdx :is(h1, h2, h3, h4, h5, h6)',
							}}
							getControlProps={({data}) => ({
								onClick: () => {
									data.getNode().scrollIntoView();
									if (window.innerWidth < 768) toggle();
								},
								children: data.value,
							})}
						/>
					)}
				</div>
			))}
		</div>
	);
};

export default MetodikaSidebar;

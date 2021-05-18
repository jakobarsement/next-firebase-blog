import { useState } from "react";
import { firestore, fromMillis, postToJSON } from "../lib/firebase";
import Head from "next/head";
import PostFeed from "../components/PostFeed";
import Loader from "../components/Loader";
import Link from "next/link";
import styles from "../styles/Home.module.css";

//Max posts to query per page
const LIMIT = 1;

export async function getServerSideProps(context) {
	const postsQuery = firestore
		.collectionGroup("posts")
		.where("published", "==", true)
		.orderBy("createdAt", "desc")
		.limit(LIMIT);

	const posts = (await postsQuery.get()).docs.map(postToJSON);

	return {
		props: { posts },
	};
}
export default function Home(props) {
	const [posts, setPosts] = useState(props.posts);
	const [loading, setLoading] = useState(false);

	const [postsEnd, setPostsEnd] = useState(false);

	const getMorePosts = async () => {
		setLoading(true);
		const last = posts[posts.length - 1];

		const cursor =
			typeof last.createdAt === "number"
				? fromMillis(last.createdAt)
				: last.createdAt;

		const query = firestore
			.collectionGroup("posts")
			.where("published", "==", true)
			.orderBy("createdAt", "desc")
			.startAfter(cursor)
			.limit(LIMIT);
	};
	return (
		<main>
			<PostFeed posts={posts} />
			{!loading && !postsEnd && (
				<button onClick={getMorePosts}>Load more</button>
			)}
			<Loader show={loading} />
			{postsEnd && "You have reached the end!"}
		</main>
	);
}

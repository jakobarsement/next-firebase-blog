import { useState, useEffect } from "react";
import { auth, firestore } from "../lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

//custom hook to read auth record and user profile doc
export function useUserData() {
	const [user] = useAuthState(auth);
	const [username, setUsername] = useState(null);

	useEffect(() => {
		//turn off real-time subscription
		let unsubscribe;

		if (user) {
			const ref = firestore.collection("users").doc(user.uid);
			unsubscribe = ref.onSnapshot((doc) => {
				setUsername(doc.data()?.username);
			});
		} else {
			setUsername(null);
		}
		return unsubscribe;
	}, [user]);
	return { user, username };
}

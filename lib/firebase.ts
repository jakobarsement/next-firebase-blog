import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

const firebaseConfig = {
	apiKey: "AIzaSyBwbtjEaM9NPQOoc7sceYmIQbLURW2cLF0",
	authDomain: "nextfire-fbee6.firebaseapp.com",
	projectId: "nextfire-fbee6",
	storageBucket: "nextfire-fbee6.appspot.com",
	messagingSenderId: "352147058038",
	appId: "1:352147058038:web:af4ed6e354054b6ae89e57",
	measurementId: "G-E8LSVXRH41",
};

if (!firebase.apps.length) {
	firebase.initializeApp(firebaseConfig);
}

//auth exports
export const auth = firebase.auth();
export const googleAuthProvider = new firebase.auth.GoogleAuthProvider();

//firestore exports
export const firestore = firebase.firestore();
export const storage = firebase.storage();

//Helper functions

/**
 * Gets a users/{uid} document with username
 * @param  {string} username
 */
export async function getUserWithUsername(username) {
	console.log(username);
	const usersRef = firestore.collection("users");
	console.log(usersRef);
	const query = usersRef.where("username", "==", username).limit(1);
	console.log(query);
	const userDoc = (await query.get()).docs[0];
	console.log(userDoc);
	return userDoc;
}

/**
 * Converts a firestore document to JSON
 * @param  {DocumentSnapshot} doc
 */
export function postToJSON(doc) {
	const data = doc.data();
	return {
		...data,
		// Gotcha! firestore timestamp NOT serializable to JSON. Must convert to milliseconds
		createdAt: data.createdAt.toMillis(),
		updatedAt: data.updatedAt.toMillis(),
	};
}

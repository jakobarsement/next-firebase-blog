import { auth, firestore, googleAuthProvider } from "../lib/firebase";
import { useState, useCallback, useContext, useEffect } from "react";
import { UserContext } from "../lib/context";
import { debounce } from "lodash";

export default function Enter(props) {
	const { user, username } = useContext(UserContext);

	// 1. user signed out <SignOutButton/>
	// 2. user signed in, but missing username <UsernameForm/>
	// 3. user signed in, has username <SignOutButton/>

	return (
		<main>
			{user ? (
				!username ? (
					<UsernameForm />
				) : (
					<SignOutButton />
				)
			) : (
				<SignInButton />
			)}
		</main>
	);
}

function SignInButton() {
	const signInWithGoogle = async () => {
		await auth.signInWithPopup(googleAuthProvider);
	};
	return (
		<button className="btn-google" onClick={signInWithGoogle}>
			<img src={"/googleG.png"} /> Sign in with Google
		</button>
	);
}

function SignOutButton() {
	return <button onClick={() => auth.signOut()}>Sign Out</button>;
}

function UsernameForm() {
	const [formValue, setFormValue] = useState("");
	const [isValid, setIsValid] = useState(false);
	const [loading, setLoading] = useState(false);

	const { user, username } = useContext(UserContext);

	useEffect(() => {
		checkUsername(formValue);
	}, [formValue]);

	//when username changes in input box
	const onChange = (e) => {
		//force username value to match correct format
		const val = e.target.value.toLowerCase();
		const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/; //NEED TO UNDERSTAND BETTER

		//only set username value if length is < 3 or it passes regex
		if (val.length < 3) {
			setFormValue(val);
			setLoading(false);
			setIsValid(false);
		}
		if (re.test(val)) {
			setFormValue(val);
			setLoading(true);
			setIsValid(false);
		}
	};

	//NEED TO UNDERSTAND BETTER
	const checkUsername = useCallback(
		debounce(async (username) => {
			if (username.length >= 3) {
				const ref = firestore.doc(`usernames/${username}`);
				const { exists } = await ref.get();
				console.log("Firestore read executed!");
				setIsValid(!exists);
				setLoading(false);
			}
		}, 500),
		[]
	);

	useEffect(() => {
		checkUsername(formValue);
	}, [formValue]);

	const onSubmit = async (e) => {
		e.preventDefault();

		//create refs for both documents
		const userDoc = firestore.doc(`users/${user.uid}`);
		const usernameDoc = firestore.doc(`usernames/${formValue}`);

		//commit both docs together as a batch write
		const batch = firestore.batch();
		batch.set(userDoc, {
			username: formValue,
			photoURL: user.photoURL,
			displayName: user.displayName,
		});
		batch.set(usernameDoc, { uid: user.uid });

		await batch.commit();
	};
	return (
		!username && (
			<section>
				<h3>Choose Username</h3>
				<form onSubmit={onSubmit}>
					<input
						name="username"
						placeholder="username"
						value={formValue}
						onChange={onChange} //checking username onChange and using the useEffect above???
					/>
					<UsernameMessage
						username={formValue}
						isValid={isValid}
						loading={loading}
					/>
					<button type="submit" className="btn-green" disabled={!isValid}>
						Choose
					</button>
					<div>
						Username: {formValue}
						<br />
						Loading: {loading.toString()}
						<br />
						Username Valid: {isValid.toString()}
					</div>
				</form>
			</section>
		)
	);
}

function UsernameMessage({ username, isValid, loading }) {
	if (loading) {
		return <p>Checking...</p>;
	} else if (isValid) {
		return <p className="text-success"> {username} is available!</p>;
	} else if (username && !isValid) {
		return <p className="text-danger"> That username is taken!</p>;
	} else {
		return <p></p>;
	}
}

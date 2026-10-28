
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "./firebase";

function getFirebaseAuth() {
  if (!auth) {
    const error = new Error(
      "Firebase is not configured. Check your .env variables and restart Expo."
    );
    Object.assign(error, { code: "app/firebase-not-configured" });
    throw error;
  }

  return auth;
}

export async function signup(
  name: string,
  email: string,
  password: string
): Promise<User> {
  const firebaseAuth = getFirebaseAuth();

  const credential = await createUserWithEmailAndPassword(
    firebaseAuth,
    email.trim(),
    password
  );

  await updateProfile(credential.user, {
    displayName: name.trim(),
  });

  return credential.user;
}

export async function login(
  email: string,
  password: string
): Promise<User> {
  const firebaseAuth = getFirebaseAuth();

  const credential = await signInWithEmailAndPassword(
    firebaseAuth,
    email.trim(),
    password
  );

  return credential.user;
}

export async function resetPassword(email: string): Promise<void> {
  const firebaseAuth = getFirebaseAuth();

  await sendPasswordResetEmail(firebaseAuth, email.trim());
}

export async function logout(): Promise<void> {
  const firebaseAuth = getFirebaseAuth();
  await signOut(firebaseAuth);
}

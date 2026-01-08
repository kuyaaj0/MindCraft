import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "../Database/firebase.js";
import { doc, setDoc } from "firebase/firestore";

const provider = new GoogleAuthProvider();

export async function login() {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  const role = user.email.endsWith("@ed.gov") ? "teacher" : "student";

  await setDoc(doc(db, "users", user.uid), {
    name: user.displayName,
    email: user.email,
    role,
    xp: 0,
    level: 1,
    levelTitle: "Beginner"
  }, { merge: true });

  window.location.href = role === "teacher"
    ? "/teacher/dashboard.html"
    : "/student/dashboard.html";
}

import { db } from "../../js/firebase.js";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

export async function loadStudentLeaderboard() {
  const q = query(
    collection(db, "users"),
    where("role", "==", "student"),
    orderBy("xp", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
}

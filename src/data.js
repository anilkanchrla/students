import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";

export const addStudent = async (data) => {
  await addDoc(collection(db, "students"), data);
};

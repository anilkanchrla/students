import { db, auth } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  query,
  where,
  onAuthStateChanged
} from "firebase/firestore";

// Check if user is authenticated
const isUserAuthenticated = () => {
  return auth.currentUser !== null;
};

// Handle Firebase errors gracefully
const handleFirebaseError = (error, operation) => {
  console.error(`Firebase ${operation} error:`, error.code, error.message);
  
  if (error.code === 'permission-denied') {
    console.error(`❌ PERMISSION DENIED: Update Firestore Security Rules at firebase.google.com`);
    console.error(`   Rules needed: Allow read/write for development`);
  } else if (error.code === 'unauthenticated') {
    console.error(`❌ NOT AUTHENTICATED: User not signed in`);
  } else if (error.code === 'unavailable') {
    console.error(`❌ FIREBASE UNAVAILABLE: Check internet connection or Firebase status`);
  }
  
  return {
    error: true,
    code: error.code,
    message: error.message
  };
};

// ============ AGENTS/USERS FIRESTORE OPERATIONS ============

/**
 * Get all agents from Firebase
 */
export const getAllAgents = async () => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("role", "==", "agent"));
    const snapshot = await getDocs(q);
    const agents = [];
    snapshot.forEach(doc => {
      agents.push({
        uid: doc.id,
        ...doc.data()
      });
    });
    console.log("✓ Firebase: Retrieved", agents.length, "agents");
    return agents;
  } catch (error) {
    if (error.code === 'permission-denied') {
      console.error(
        "❌ Firebase Permission Error: Cannot read agents\n" +
        "   Fix: Update Firebase Security Rules at https://console.firebase.google.com\n" +
        "   Set: match /{document=**} { allow read, write: if true; }"
      );
    } else {
      console.error("⚠ Error fetching agents from Firebase:", error.code, error.message);
    }
    return [];
  }
};

/**
 * Get admin user from Firebase
 */
export const getAdminUser = async () => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("role", "==", "admin"));
    const snapshot = await getDocs(q);
    let adminUser = null;
    snapshot.forEach(doc => {
      adminUser = {
        uid: doc.id,
        ...doc.data()
      };
    });
    return adminUser;
  } catch (error) {
    console.error("Error fetching admin:", error);
    return null;
  }
};

/**
 * Save agent to Firebase (already done in AdminDashboard, but kept for reference)
 */
export const saveAgent = async (agentData) => {
  try {
    if (agentData.uid) {
      const agentRef = doc(db, "users", agentData.uid);
      await setDoc(agentRef, agentData, { merge: true });
    }
    return true;
  } catch (error) {
    console.error("Error saving agent:", error);
    return false;
  }
};

/**
 * Update agent in Firebase
 */
export const updateAgent = async (agentUid, agentData) => {
  try {
    const agentRef = doc(db, "users", agentUid);
    await updateDoc(agentRef, agentData);
    console.log("✓ Firebase: Agent", agentUid, "updated");
    return true;
  } catch (error) {
    if (error.code === 'permission-denied') {
      console.error("❌ Firebase Permission Error: Cannot update agent");
      alert("Permission denied. Check Firebase security rules.");
    } else {
      console.error("⚠ Error updating agent:", error.code, error.message);
    }
    return false;
  }
};

/**
 * Delete agent from Firebase
 */
export const deleteAgent = async (agentUid) => {
  try {
    const agentRef = doc(db, "users", agentUid);
    await deleteDoc(agentRef);
    console.log("✓ Firebase: Agent", agentUid, "deleted");
    return true;
  } catch (error) {
    if (error.code === 'permission-denied') {
      console.error("❌ Firebase Permission Error: Cannot delete agent");
      alert("Permission denied. Check Firebase security rules.");
    } else {
      console.error("⚠ Error deleting agent:", error.code, error.message);
    }
    return false;
  }
};

// ============ STUDENTS FIRESTORE OPERATIONS ============

/**
 * Get all students from Firebase
 */
export const getAllStudents = async () => {
  try {
    const studentsRef = collection(db, "students");
    const snapshot = await getDocs(studentsRef);
    const students = [];
    snapshot.forEach(doc => {
      students.push({
        id: doc.id,
        ...doc.data()
      });
    });
    console.log("✓ Firebase: Retrieved", students.length, "students");
    return students;
  } catch (error) {
    if (error.code === 'permission-denied') {
      console.error(
        "❌ Firebase Permission Error: Cannot read students\n" +
        "   Fix: Update Firebase Security Rules at https://console.firebase.google.com\n" +
        "   Set: match /{document=**} { allow read, write: if true; }"
      );
    } else {
      console.error("⚠ Error fetching students from Firebase:", error.code, error.message);
    }
    return [];
  }
};

/**
 * Get students for specific agent
 */
export const getAgentStudents = async (agentId) => {
  try {
    const studentsRef = collection(db, "students");
    const q = query(studentsRef, where("agentId", "==", agentId));
    const snapshot = await getDocs(q);
    const students = [];
    snapshot.forEach(doc => {
      students.push({
        id: doc.id,
        ...doc.data()
      });
    });
    console.log("Firebase: Retrieved", students.length, "students for agent", agentId);
    return students;
  } catch (error) {
    console.error("Error fetching agent students:", error.code, error.message);
    return [];
  }
};

/**
 * Save new student to Firebase
 */
export const saveNewStudent = async (studentData) => {
  try {
    const studentsRef = collection(db, "students");
    const docRef = await addDoc(studentsRef, {
      ...studentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    console.log("✓ Firebase: Student saved with ID:", docRef.id);
    return {
      id: docRef.id,
      ...studentData
    };
  } catch (error) {
    if (error.code === 'permission-denied') {
      console.error(
        "❌ Firebase Permission Error: Cannot save student\n" +
        "   Fix: Update Firebase Security Rules"
      );
      alert("Permission denied. Check Firebase security rules.");
    } else {
      console.error("⚠ Error saving student:", error.code, error.message);
      alert("Error: " + error.message);
    }
    return null;
  }
};

/**
 * Update existing student in Firebase
 */
export const updateStudent = async (studentId, studentData) => {
  try {
    const studentRef = doc(db, "students", studentId);
    await updateDoc(studentRef, {
      ...studentData,
      updatedAt: new Date().toISOString()
    });
    console.log("✓ Firebase: Student", studentId, "updated");
    return true;
  } catch (error) {
    if (error.code === 'permission-denied') {
      console.error("❌ Firebase Permission Error: Cannot update student");
    } else {
      console.error("⚠ Error updating student:", error.code, error.message);
    }
    return false;
  }
};

/**
 * Delete student from Firebase
 */
export const deleteStudent = async (studentId) => {
  try {
    const studentRef = doc(db, "students", studentId);
    await deleteDoc(studentRef);
    console.log("✓ Firebase: Student", studentId, "deleted");
    return true;
  } catch (error) {
    if (error.code === 'permission-denied') {
      console.error("❌ Firebase Permission Error: Cannot delete student");
      alert("Permission denied. Check Firebase security rules.");
    } else {
      console.error("⚠ Error deleting student:", error.code, error.message);
    }
    return false;
  }
};

/**
 * Get single student by ID
 */
export const getStudentById = async (studentId) => {
  try {
    const studentRef = doc(db, "students", studentId);
    const snapshot = await getDocs(collection(db, "students"));
    let foundStudent = null;
    snapshot.forEach(doc => {
      if (doc.id === studentId) {
        foundStudent = {
          id: doc.id,
          ...doc.data()
        };
      }
    });
    return foundStudent;
  } catch (error) {
    console.error("Error fetching student:", error);
    return null;
  }
};

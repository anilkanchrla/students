import React, { useState, useEffect } from "react";
// import sidebar from "./components/sidebar";
import Registration from "./components/studentdata";
import ApplicationFee from "./components/ApplicationFee";
import RegistrationFee from "./components/RegistrationFee";
// import Payment from "./components/Payment";
import UniversityVisit from "./components/UniversityVisit";
import Admission from "./components/Admission";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import AgentDashboard from "./components/AgentDashboard";
import NavBar from "./components/NavBar";
import Chat from "./components/Chat";
import { getAllAgents, getAllStudents, saveNewStudent, updateStudent } from "./firebaseService";

function App() {
  const [step, setStep] = useState(1); // 1, 2, 3, 4, 5, or 'dashboard'
  // eslint-disable-next-line
  const [currentStudentId, setCurrentStudentId] = useState(null);

  // Auth State
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([
    { username: "admin", password: "123", role: "admin" },
  ]);

  // Students Data
  const [students, setStudents] = useState([]);

  // View As State
  const [viewMode, setViewMode] = useState(null); // null, 'agent_view', 'student_view'
  const [viewTargetId, setViewTargetId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load state from localStorage FIRST (immediate restore), then sync with Firebase
  useEffect(() => {
    // STEP 1: Load from localStorage immediately (fast restore)
    const storedUsers = localStorage.getItem("app_users");
    const storedUser = localStorage.getItem("app_currentUser");
    const storedStudents = localStorage.getItem("app_students");

    if (storedUsers) {
      try {
        setUsers(JSON.parse(storedUsers));
        console.log("✓ Loaded users from localStorage");
      } catch (e) {
        console.error("Error parsing stored users:", e);
      }
    }
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
        console.log("✓ Loaded current user from localStorage");
      } catch (e) {
        console.error("Error parsing stored user:", e);
      }
    }
    if (storedStudents) {
      try {
        setStudents(JSON.parse(storedStudents));
        console.log("✓ Loaded students from localStorage");
      } catch (e) {
        console.error("Error parsing stored students:", e);
      }
    }

    // STEP 2: Now sync with Firebase in background
    const loadDataFromFirebase = async () => {
      try {
        console.log("⏳ Syncing with Firebase...");
        
        // Load agents from Firebase
        const agentsData = await getAllAgents();
        if (agentsData && agentsData.length > 0) {
          console.log("✓ Loaded agents from Firebase:", agentsData.length);
          setUsers(prevUsers => [
            ...prevUsers.filter(u => u.role === 'admin'),
            ...agentsData
          ]);
        } else {
          console.log("ℹ No agents found in Firebase, using localStorage");
        }

        // Load students from Firebase
        const studentsData = await getAllStudents();
        if (studentsData && studentsData.length > 0) {
          console.log("✓ Loaded students from Firebase:", studentsData.length);
          setStudents(studentsData);
        } else {
          console.log("ℹ No students found in Firebase, using localStorage");
        }
      } catch (error) {
        console.error("⚠ Error syncing with Firebase (continuing with localStorage):", error.message);
      } finally {
        setLoading(false);
      }
    };

    loadDataFromFirebase();
  }, []);

  // Save users to local storage whenever they change
  useEffect(() => {
    localStorage.setItem("app_users", JSON.stringify(users));
  }, [users]);

  // Save current user to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("app_currentUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("app_currentUser");
    }
  }, [currentUser]);

  // Save students to Firebase (primary) and localStorage (backup)
  useEffect(() => {
    localStorage.setItem("app_students", JSON.stringify(students));
  }, [students]);

  const handleLogin = (user) => {
    setCurrentUser(user);
    if (user.role !== 'admin') {
      setStep('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setStep(1);
    setCurrentStudentId(null);
    setViewMode(null);
    setViewTargetId(null);
  };

  const handleAddAgent = (newUser) => {
    const exists = users.some((u) =>
      (u.agentId && u.agentId === newUser.agentId) ||
      (u.mobile && u.mobile === newUser.mobile)
    );

    if (exists) {
      return false;
    }

    setUsers([...users, { ...newUser, id: Date.now() }]);
    return true;
  };

  const handleUpdateUser = (updatedUser) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const handleDeleteAgent = (deletedAgent) => {
    // Remove agent from users array
    setUsers(users.filter(u => u.uid !== deletedAgent.uid));
  };

  // Student Management Functions
  const handleNewEnquiry = async (studentData) => {
    const newStudent = {
      ...studentData,
      agentId: currentUser.agentId, // Link to current agent
      agentName: currentUser.name,
      status: "Enquiry",
      currentStage: "Registration",
      createdAt: new Date().toISOString()
    };
    
    try {
      // Save to Firebase first
      const savedStudent = await saveNewStudent(newStudent);
      if (savedStudent) {
        // Update local state with Firebase ID
        setStudents([...students, savedStudent]);
        setCurrentStudentId(savedStudent.id);
        setStep(2); // Move to Fee payment
      } else {
        alert("Error saving student to database");
      }
    } catch (error) {
      console.error("Error creating enquiry:", error);
      alert("Error: " + error.message);
    }
  };

  const updateStudentProgress = async (data, nextStep, stageName) => {
    if (!currentStudentId) return;
    
    const updatedData = {
      ...data,
      status: "In Progress",
      currentStage: stageName
    };

    try {
      // Update in Firebase
      const success = await updateStudent(currentStudentId, updatedData);
      if (success) {
        // Update local state
        setStudents(students.map(s => {
          if (s.id === currentStudentId) {
            return {
              ...s,
              ...updatedData
            };
          }
          return s;
        }));
        setStep(nextStep);
      } else {
        alert("Error updating student progress");
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      alert("Error: " + error.message);
    }
  };

  const getCurrentStudent = () => {
    return students.find(s => s.id === currentStudentId) || {};
  };

  // View Handlers
  const handleViewAgent = (agentId) => {
    setViewMode('agent_view');
    setViewTargetId(agentId);
  };

  const handleViewStudent = (studentId) => {
    setViewMode('student_view');
    setCurrentStudentId(studentId);
    setViewTargetId(studentId);

    // Determine view step based on student status
    const student = students.find(s => s.id === studentId);
    if (student) {
      if (student.status === "Enquiry") setStep(1);
      else if (student.applicationFee === undefined) setStep(2);
      else if (student.registrationFee === undefined) setStep(3);
      else if (!student.currentStage.includes("Confirmation") && student.currentStage !== "Admission Completed") setStep(4);
      else setStep(5);
    }
  };

  const handleExitViewMode = () => {
    setViewMode(null);
    setViewTargetId(null);
    setCurrentStudentId(null);
    setStep(currentUser.role === 'admin' ? 1 : 'dashboard');
  };

  // Determine Render Content
  const renderContent = () => {
    // 1. Admin Normal Mode
    if (currentUser.role === "admin" && !viewMode) {
      return (
        <AdminDashboard
          users={users}
          students={students}
          onAddAgent={handleAddAgent}
          onUpdateUser={handleUpdateUser}
          onViewAgent={handleViewAgent}
          onViewStudent={handleViewStudent}
          onDeleteAgent={handleDeleteAgent}
        />
      );
    }

    // 2. Agent Dashboard (Normal OR Admin Viewing Agent)
    if (
      (currentUser.role !== "admin" && step === 'dashboard') ||
      (viewMode === 'agent_view')
    ) {
      const targetAgentId = viewMode === 'agent_view' ? viewTargetId : currentUser.agentId;
      const targetAgentUser = users.find(u => u.agentId === targetAgentId) || currentUser;

      return (
        <div style={{ position: 'relative' }}>
          {viewMode === 'agent_view' && (
            <button onClick={handleExitViewMode} className="btn btn-danger" style={{ marginBottom: '20px' }}>
              &larr; Exit View Mode (Back to Admin)
            </button>
          )}
          <AgentDashboard
            currentUser={targetAgentUser}
            agentId={targetAgentId}
            students={students}
            onStartNew={() => {
              setCurrentStudentId(null);
              setStep(1);
            }}
            onUpdateUser={handleUpdateUser}
            onViewStudent={handleViewStudent}
          />
        </div>
      );
    }

    // 3. Student Admission Flow (View/Edit)
    return (
      <div style={{ position: 'relative' }}>
        {viewMode && (
          <button onClick={handleExitViewMode} className="btn btn-danger" style={{ marginBottom: '20px' }}>
            &larr; Back to Dashboard
          </button>
        )}
        {step === 1 && (
          <Registration
            setStep={setStep}
            setStudentData={handleNewEnquiry}
            onCancel={() => {
              if (viewMode) handleExitViewMode();
              else setStep('dashboard');
            }}
          />
        )}

        {step === 2 && (
          <ApplicationFee
            setStep={(next) => {
              if (next === 'dashboard') {
                if (viewMode) handleExitViewMode();
                else setStep('dashboard');
              } else {
                updateStudentProgress({}, next, "Application Fee Paid")
              }
            }}
            student={getCurrentStudent()}
            updateStudent={(data) => updateStudentProgress(data, 3, "Application Submitted")}
          />
        )}

        {step === 3 && (
          <RegistrationFee
            setStep={(next) => {
              if (next === 'dashboard') {
                if (viewMode) handleExitViewMode();
                else setStep('dashboard');
              } else {
                updateStudentProgress({}, next, "Registration Fee Paid")
              }
            }}
            student={getCurrentStudent()}
            updateStudent={(data) => updateStudentProgress(data, 4, "Registration Completed, University Visit Pending")}
          />
        )}

        {step === 4 && (
          <UniversityVisit
            setStep={(next) => {
              if (next === 'dashboard') {
                if (viewMode) handleExitViewMode();
                else setStep('dashboard');
              } else {
                // Fallback if component calls setStep directly
                updateStudentProgress({}, next, "Seat Confirmation Pending")
              }
            }}
            student={getCurrentStudent()}
            updateStudent={(data) => updateStudentProgress(data, 5, "Seat Confirmation Pending")}
          />
        )}

        {step === 5 && (
          <Admission
            onHome={() => {
              if (viewMode) handleExitViewMode();
              else setStep('dashboard');
            }}
            student={getCurrentStudent()}
            updateStudent={async (data) => {
              // Update in Firebase
              if (currentStudentId) {
                await updateStudent(currentStudentId, data);
              }
              // Update local state
              setStudents(students.map(s => {
                if (s.id === currentStudentId) {
                  return { ...s, ...data };
                }
                return s;
              }));
            }}
          />
        )}
      </div>
    );
  };

  if (!currentUser) {
    return <Login users={users} onLogin={handleLogin} />;
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f5f5f5' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '20px' }}>📚 University Admin System</div>
          <div style={{ fontSize: '1.1rem', color: '#666', marginBottom: '20px' }}>Loading data from Firebase...</div>
          <div style={{ 
            border: '4px solid #f3f3f3', 
            borderTop: '4px solid #4f46e5', 
            borderRadius: '50%', 
            width: '40px', 
            height: '40px', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <NavBar
        currentUser={currentUser}
        onLogout={handleLogout}
        onHome={() => {
          handleExitViewMode();
        }}
      />
      <div className="app-container">
        {renderContent()}
      </div>
      <Chat currentUser={currentUser} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

export default App;
import React, { useState, useEffect } from "react";
import sidebar from "./components/sidebar";
import Registration from "./components/studentdata";
import ApplicationFee from "./components/ApplicationFee";
import RegistrationFee from "./components/RegistrationFee";
import Payment from "./components/Payment";
import UniversityVisit from "./components/UniversityVisit";
import Admission from "./components/Admission";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import AgentDashboard from "./components/AgentDashboard";
import NavBar from "./components/NavBar";
import Chat from "./components/Chat";

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

  // Load state from local storage on mount
  useEffect(() => {
    const storedUsers = localStorage.getItem("app_users");
    const storedUser = localStorage.getItem("app_currentUser");
    const storedStudents = localStorage.getItem("app_students");

    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    if (storedStudents) {
      setStudents(JSON.parse(storedStudents));
    }
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

  // Save students to local storage
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

  // Student Management Functions
  const handleNewEnquiry = (studentData) => {
    const newStudent = {
      ...studentData,
      id: Date.now(),
      agentId: currentUser.agentId, // Link to current agent
      agentName: currentUser.name,
      status: "Enquiry",
      currentStage: "Registration",
      createdAt: new Date().toISOString()
    };
    setStudents([...students, newStudent]);
    setCurrentStudentId(newStudent.id);
    setStep(2); // Move to Fee payment
  };

  const updateStudentProgress = (data, nextStep, stageName) => {
    setStudents(students.map(s => {
      if (s.id === currentStudentId) {
        return {
          ...s,
          ...data,
          status: "In Progress",
          currentStage: stageName
        };
      }
      return s;
    }));
    setStep(nextStep);
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
            updateStudent={(data) => {
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
    </>
  );
}

export default App;
import React, { useState } from "react";
import { db, auth } from "../firebase";
import { setDoc, doc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

const AdminDashboard = ({ users, students = [], onAddAgent, onUpdateUser, onViewAgent, onViewStudent }) => {
    const [activeTab, setActiveTab] = useState('status'); // 'add', 'view', 'modify', 'status', 'contact'


    // Create Agent State
    const [name, setName] = useState("");
    const [agentId, setAgentId] = useState("");
    const [mobile, setMobile] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    // Edit Agent State
    const [editingAgent, setEditingAgent] = useState(null);
    const [editForm, setEditForm] = useState({ name: "", mobile: "" });
    const [editMessage, setEditMessage] = useState("");

    // Filters State
    const [filterState, setFilterState] = useState("");
    const [filterAgent, setFilterAgent] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    const agents = users.filter((u) => u.role === "agent");

    // --- Actions ---

    const handleAddAgent = async (e) => {
        e.preventDefault();
        
        if (!name || !agentId || !mobile || !email || !password) {
            setMessage("Please fill in all fields");
            return;
        }

        const agentExists = users.some(u => u.name === name || u.mobile === mobile || u.email === email);
        if (agentExists) {
            setMessage("Agent Name, Mobile, or Email already exists!");
            return;
        }

        try {
            // Create Firebase Authentication user
            const credential = await createUserWithEmailAndPassword(auth, email, password);
            console.log("User created with UID:", credential.user.uid);

            // Store agent details in Firestore under 'users' collection
            const agentRef = doc(db, "users", credential.user.uid);
            await setDoc(agentRef, {
                uid: credential.user.uid,
                name: name,
                agentId: agentId,
                mobile: mobile,
                email: email,
                role: "agent",
                createdAt: new Date()
            });

            setMessage("Agent created successfully!");
            setName("");
            setAgentId("");
            setMobile("");
            setEmail("");
            setPassword("");

            // Also call the parent component's callback
            onAddAgent({
                uid: credential.user.uid,
                name,
                agentId,
                mobile,
                email,
                role: "agent",
            });
        } catch (error) {
            console.error("Error creating agent:", error);
            if (error.code === "auth/email-already-in-use") {
                setMessage("Email already in use!");
            } else if (error.code === "auth/weak-password") {
                setMessage("Password should be at least 6 characters!");
            } else {
                setMessage("Error: " + error.message);
            }
        }
    };

    const startEdit = (agent) => {
        setEditingAgent(agent);
        setEditForm({ name: agent.name, mobile: agent.mobile });
        setEditMessage("");
    };

    const handleUpdateAgent = () => {
        if (!editForm.name || !editForm.mobile) {
            setEditMessage("Name and Mobile are required");
            return;
        }

        onUpdateUser({
            ...editingAgent,
            name: editForm.name,
            mobile: editForm.mobile
        });

        setEditMessage("Agent updated successfully!");
        setEditingAgent(null); // Close edit mode
    };

    const filteredStudents = students.filter(student => {
        const matchesState = filterState ? student.State === filterState : true;
        const matchesAgent = filterAgent ? student.agentId === filterAgent : true;

        let matchesStatus = true;
        if (filterStatus) {
            if (filterStatus === "Enquiry") matchesStatus = student.status === "Enquiry";
            else if (filterStatus === "AppFeePaid") matchesStatus = student.applicationFee;
            else if (filterStatus === "RegFeePaid") matchesStatus = student.registrationFee;
            else if (filterStatus === "AdmissionDone") matchesStatus = student.currentStage === "Admission Completed";
        }

        return matchesState && matchesAgent && matchesStatus;
    });

    return (
        <div style={styles.dashboardContainer}>
            {/* --- Left Sidebar --- */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarHeader}>Admin Panel</div>
                <ul style={styles.sidebarMenu}>
                    <li style={activeTab === 'add' ? styles.menuItemActive : styles.menuItem} onClick={() => setActiveTab('add')}>
                        Add Agent
                    </li>
                    <li style={activeTab === 'view' ? styles.menuItemActive : styles.menuItem} onClick={() => setActiveTab('view')}>
                        View Agents
                    </li>
                    <li style={activeTab === 'modify' ? styles.menuItemActive : styles.menuItem} onClick={() => setActiveTab('modify')}>
                        Modify Agent
                    </li>
                    <li style={activeTab === 'status' ? styles.menuItemActive : styles.menuItem} onClick={() => setActiveTab('status')}>
                        Student Status
                    </li>
                    <li style={activeTab === 'contact' ? styles.menuItemActive : styles.menuItem} onClick={() => setActiveTab('contact')}>
                        Contact Us
                    </li>
                </ul>
            </div>

            {/* --- Main Content Area --- */}
            <div style={styles.contentArea}>

                {/* 1. Add Agent View */}
                {activeTab === 'add' && (
                    <div className="card">
                        <h3>Create New Agent</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Agent Name</label>
                                <input className="form-control" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Agent ID</label>
                                <input className="form-control" placeholder="Unique Agent ID" value={agentId} onChange={(e) => setAgentId(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Mobile Number</label>
                                <input className="form-control" placeholder="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input className="form-control" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input className="form-control" type="password" placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                                <button className="btn btn-primary" style={{ marginTop: '24px' }} onClick={handleAddAgent}>Create Agent</button>
                            </div>
                        </div>
                        {message && <p style={{ color: message.includes('success') ? 'green' : 'red', marginTop: '10px' }}>{message}</p>}
                    </div>
                )}

                {/* 2. View Agents View */}
                {activeTab === 'view' && (
                    <div className="card">
                        <h3>All Registered Agents</h3>
                        {agents.length === 0 ? <p>No agents found.</p> : (
                            <div className="table-responsive">
                                <table className="styled-table">
                                    <thead>
                                        <tr><th>Name</th><th>Agent ID</th><th>Mobile</th><th>Actions</th></tr>
                                    </thead>
                                    <tbody>
                                        {agents.map((agent, i) => (
                                            <tr key={i}>
                                                <td>{agent.name}</td>
                                                <td>{agent.agentId}</td>
                                                <td>{agent.mobile}</td>
                                                <td>
                                                    <button onClick={() => onViewAgent(agent.agentId)} className="btn btn-outline" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>
                                                        View Dashboard
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* 3. Modify Agent View */}
                {activeTab === 'modify' && (
                    <div className="card">
                        <h3>Modify Agent Details</h3>

                        {editingAgent ? (
                            <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
                                <h4 style={{ marginTop: 0 }}>Editing: {editingAgent.agentId}</h4>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Name</label>
                                        <input className="form-control" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Mobile</label>
                                        <input className="form-control" value={editForm.mobile} onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Agent ID</label>
                                        <input className="form-control" value={editingAgent.agentId} disabled style={{ background: '#eee' }} />
                                    </div>
                                </div>
                                <div className="btn-row">
                                    <button className="btn btn-outline" onClick={() => setEditingAgent(null)}>Cancel</button>
                                    <button className="btn btn-primary" onClick={handleUpdateAgent}>Save Changes</button>
                                </div>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="styled-table">
                                    <thead>
                                        <tr><th>Name</th><th>Agent ID</th><th>Mobile</th><th>Action</th></tr>
                                    </thead>
                                    <tbody>
                                        {agents.map((agent, i) => (
                                            <tr key={i}>
                                                <td>{agent.name}</td>
                                                <td>{agent.agentId}</td>
                                                <td>{agent.mobile}</td>
                                                <td>
                                                    <button className="btn btn-primary" style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={() => startEdit(agent)}>
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {editMessage && <p style={{ color: 'green', marginTop: '10px' }}>{editMessage}</p>}
                    </div>
                )}

                {/* 4. Student Status (Existing Logic) */}
                {activeTab === 'status' && (
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3 style={{ borderBottom: 'none', margin: 0 }}>Student Status Overview</h3>
                        </div>

                        {/* Filters */}
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                            <div style={{ flex: 1, minWidth: '150px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>State</label>
                                <select onChange={(e) => setFilterState(e.target.value)} className="form-control">
                                    <option value="">All States</option>
                                    {[...new Set(students.map(s => s.State).filter(Boolean))].map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ flex: 1, minWidth: '150px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Agent</label>
                                <select onChange={(e) => setFilterAgent(e.target.value)} className="form-control">
                                    <option value="">All Agents</option>
                                    {agents.map(agent => (
                                        <option key={agent.agentId} value={agent.agentId}>{agent.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ flex: 1, minWidth: '150px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Status</label>
                                <select onChange={(e) => setFilterStatus(e.target.value)} className="form-control">
                                    <option value="">All Statuses</option>
                                    <option value="Enquiry">Enquiry Only</option>
                                    <option value="AppFeePaid">App Fee Paid</option>
                                    <option value="RegFeePaid">Reg Fee Paid</option>
                                    <option value="AdmissionDone">Admission Done</option>
                                </select>
                            </div>
                        </div>

                        {filteredStudents.length === 0 ? <p>No students found.</p> : (
                            <div className="table-responsive">
                                <table className="styled-table">
                                    <thead>
                                        <tr>
                                            <th>Student</th>
                                            <th>State</th>
                                            <th>Agent</th>
                                            <th>App Fee</th>
                                            <th>Reg Fee</th>
                                            <th>Visit</th>
                                            <th>Admission</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStudents.map((student, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <div style={{ fontWeight: 'bold' }}>{student.StudentName}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{student.CourseInterested}</div>
                                                </td>
                                                <td>{student.State || '-'}</td>
                                                <td>{student.agentName || 'N/A'}</td>
                                                <td>{student.applicationFee ? <span className="badge badge-success">Paid</span> : <span className="badge badge-warning">Pending</span>}</td>
                                                <td>{student.registrationFee ? <span className="badge badge-success">Paid</span> : <span className="badge badge-gray">Pending</span>}</td>
                                                <td>{student.currentStage.includes("Confirmation") || student.currentStage === "Admission Completed" ? <span className="badge badge-success">Done</span> : <span className="badge badge-gray">-</span>}</td>
                                                <td>{student.currentStage === "Admission Completed" ? <span className="badge badge-success">Confirmed</span> : <span className="badge badge-gray">-</span>}</td>
                                                <td>
                                                    <button onClick={() => onViewStudent(student.id)} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                                                        View App
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* 5. Contact Us View */}
                {activeTab === 'contact' && (
                    <div className="card">
                        <h3>Contact Support</h3>
                        <p>For any technical issues or support regarding the application, please contact the IT department.</p>

                        <div style={{ marginTop: '20px' }}>
                            <p><strong>Email:</strong> support@university.com</p>
                            <p><strong>Phone:</strong> +91 99999 88888</p>
                            <p><strong>Address:</strong> Admin Block, University Campus</p>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

const styles = {
    dashboardContainer: {
        display: 'flex',
        gap: '20px',
        alignItems: 'flex-start'
    },
    sidebar: {
        width: '250px',
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        flexShrink: 0
    },
    sidebarHeader: {
        background: '#4f46e5',
        color: 'white',
        padding: '20px',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        textAlign: 'center'
    },
    sidebarMenu: {
        listStyle: 'none',
        padding: 0,
        margin: 0
    },
    menuItem: {
        padding: '15px 20px',
        borderBottom: '1px solid #f3f4f6',
        cursor: 'pointer',
        transition: 'background 0.2s',
        color: '#4b5563',
        fontWeight: '500'
    },
    menuItemActive: {
        padding: '15px 20px',
        borderBottom: '1px solid #f3f4f6',
        cursor: 'pointer',
        background: '#eef2ff',
        color: '#4f46e5',
        fontWeight: 'bold',
        borderLeft: '4px solid #4f46e5'
    },
    contentArea: {
        flex: 1,
        minWidth: 0 // Prevents flex child from overflowing
    }
};

export default AdminDashboard;

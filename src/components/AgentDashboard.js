import React, { useState } from "react";

const AgentDashboard = ({ onStartNew, students, agentId, currentUser, onUpdateUser, onViewStudent }) => {
    // Filter students for this agent
    const myStudents = students.filter(s => s.agentId === agentId);

    // Filters State
    const [filterState, setFilterState] = useState("");
    const [filterDistrict, setFilterDistrict] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    // Profile Edit State
    const [showProfile, setShowProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        name: currentUser.name || currentUser.username,
        mobile: currentUser.mobile || ""
    });
    const [profileMessage, setProfileMessage] = useState("");

    const filteredStudents = myStudents.filter(student => {
        const matchesState = filterState ? student.State === filterState : true;
        const matchesDistrict = filterDistrict ? student.District === filterDistrict : true;

        let matchesStatus = true;
        if (filterStatus) {
            if (filterStatus === "Enquiry") matchesStatus = student.status === "Enquiry";
            else if (filterStatus === "AppFeePaid") matchesStatus = student.applicationFee;
            else if (filterStatus === "RegFeePaid") matchesStatus = student.registrationFee;
            else if (filterStatus === "AdmissionDone") matchesStatus = student.currentStage === "Admission Completed";
        }

        return matchesState && matchesDistrict && matchesStatus;
    });

    const handleUpdateProfile = () => {
        if (!profileForm.name || !profileForm.mobile) {
            setProfileMessage("Name and Mobile are required");
            return;
        }

        onUpdateUser({
            ...currentUser,
            name: profileForm.name,
            mobile: profileForm.mobile
        });
        setProfileMessage("Profile updated successfully!");
    };

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>{currentUser.name || currentUser.username}'s Dashboard</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setShowProfile(!showProfile)} className="btn btn-outline">
                        {showProfile ? 'Close Profile' : 'My Profile'}
                    </button>
                    <button onClick={onStartNew} className="btn btn-primary">+ New Student Enquiry</button>
                </div>
            </div>

            {/* --- Profile Section --- */}
            {showProfile && (
                <div className="form-section" style={{ marginBottom: '30px', border: '1px solid #4f46e5' }}>
                    <div className="form-section-title">My Profile</div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Agent Name</label>
                            <input
                                className="form-control"
                                value={profileForm.name}
                                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Mobile Number</label>
                            <input
                                className="form-control"
                                value={profileForm.mobile}
                                onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Agent ID (Read-Only)</label>
                            <input
                                className="form-control"
                                value={currentUser.agentId}
                                disabled
                                style={{ backgroundColor: '#e5e7eb', cursor: 'not-allowed' }}
                            />
                        </div>
                        <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                            <button onClick={handleUpdateProfile} className="btn btn-primary" style={{ marginTop: '24px' }}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                    {profileMessage && <p style={{ color: 'green', marginTop: '10px' }}>{profileMessage}</p>}
                </div>
            )}

            <div className="form-grid" style={{ marginBottom: '30px' }}>
                <div className="card" style={{ boxShadow: 'none', border: '1px solid #eee', background: '#f9f9f9', textAlign: 'center', padding: '15px' }}>
                    <h3 style={{ border: 'none', fontSize: '1rem', color: '#666' }}>Total Enquiries</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4f46e5' }}>{myStudents.length}</div>
                </div>
            </div>

            <div className="form-section">
                <div className="form-section-title" style={{ marginBottom: '10px' }}>My Students Status</div>

                {/* Filters Row */}
                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Filter by State</label>
                        <select
                            onChange={(e) => setFilterState(e.target.value)}
                            className="form-control"
                            style={{ width: '100%' }}
                        >
                            <option value="">All States</option>
                            {[...new Set(myStudents.map(s => s.State).filter(Boolean))].map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Filter by District</label>
                        <select
                            onChange={(e) => setFilterDistrict(e.target.value)}
                            className="form-control"
                            style={{ width: '100%' }}
                        >
                            <option value="">All Districts</option>
                            {[...new Set(myStudents.map(s => s.District).filter(Boolean))].map(dist => (
                                <option key={dist} value={dist}>{dist}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Filter by Status</label>
                        <select
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="form-control"
                            style={{ width: '100%' }}
                        >
                            <option value="">All Statuses</option>
                            <option value="Enquiry">Enquiry Only</option>
                            <option value="AppFeePaid">Application Fee Paid</option>
                            <option value="RegFeePaid">Registration Fee Paid</option>
                            <option value="AdmissionDone">Admission Completed</option>
                        </select>
                    </div>
                </div>

                {filteredStudents.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>No students found matching these filters.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="styled-table">
                            <thead>
                                <tr>
                                    <th>Student Name</th>
                                    <th>State / District</th>
                                    <th>Mobile</th>
                                    <th>App Fee</th>
                                    <th>Reg Fee</th>
                                    <th>Visit</th>
                                    <th>Status</th>
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
                                        <td>
                                            <div>{student.State || '-'}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>{student.District}</div>
                                        </td>
                                        <td>{student.MobileNumber}</td>

                                        {/* Detailed Status Columns */}
                                        <td>
                                            {student.applicationFee ?
                                                <span className="badge badge-success">Paid</span> :
                                                <span className="badge badge-warning">Pending</span>
                                            }
                                        </td>
                                        <td>
                                            {student.registrationFee ?
                                                <span className="badge badge-success">Paid</span> :
                                                <span className="badge badge-gray">Pending</span>
                                            }
                                        </td>
                                        <td>
                                            {student.currentStage.includes("Confirmation") || student.currentStage === "Admission Completed" ?
                                                <span className="badge badge-success">Done</span> :
                                                <span className="badge badge-gray">-</span>
                                            }
                                        </td>
                                        <td>
                                            <span style={getStatusStyle(student.status)} className="badge">
                                                {student.status || "Enquiry"}
                                            </span>
                                        </td>
                                        <td>
                                            <button onClick={() => onViewStudent(student.id)} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
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
        </div>
    );
};

const getStatusStyle = (status) => {
    // We can return styles here that override the class if needed, or just rely on inline for colors
    if (status === "Completed" || status === "Application Submitted") return { backgroundColor: "#d1fae5", color: "#065f46" };
    if (status === "In Progress" || (status && status.includes("Pending"))) return { backgroundColor: "#fef3c7", color: "#92400e" };
    return { backgroundColor: "#f3f4f6", color: "#1f2937" };
};

export default AgentDashboard;

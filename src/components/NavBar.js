import React from "react";

const NavBar = ({ currentUser, onLogout, onHome }) => {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                Student Admission System
            </div>
            <div className="navbar-user">
                <button onClick={onHome} className="btn btn-outline" style={{ fontSize: '0.9rem', padding: '5px 15px' }}>
                    Dashboard
                </button>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '0.9rem' }}>
                    <strong>{currentUser.name || currentUser.username}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#666', textTransform: 'uppercase' }}>{currentUser.role}</span>
                </div>
                <button onClick={onLogout} className="btn btn-danger" style={{ padding: '5px 15px', fontSize: '0.9rem' }}>
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default NavBar;

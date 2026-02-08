import React, { useState } from "react";

const Login = ({ users, onLogin }) => {
  const [identifier, setIdentifier] = useState(""); // Username or Mobile
  const [cred, setCred] = useState(""); // Password or AgentID
  const [error, setError] = useState("");
  const [buttonHover, setButtonHover] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if user is Admin (username OR mobile + password)
    const adminUser = users.find(
      (u) => (u.username === identifier || u.mobile === identifier) && u.password === cred && u.role === "admin"
    );

    // Check if user is Agent (Mobile OR username + AgentID)
    const agentUser = users.find(
      (u) => (u.mobile === identifier || u.username === identifier) && u.agentId === cred && u.role === "agent"
    );

    if (adminUser) {
      onLogin(adminUser);
    } else if (agentUser) {
      onLogin(agentUser);
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={{ textAlign: 'center', color: '#667eea', marginBottom: '30px', fontSize: '32px', fontWeight: '700' }}>Login</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={{ fontWeight: '600', color: '#374151', fontSize: '14px' }}>Mobile Number / Username:</label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            style={styles.input}
            placeholder="Enter Mobile (Agent) or Username (Admin)"
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={{ fontWeight: '600', color: '#374151', fontSize: '14px' }}>Agent ID / Password:</label>
          <input
            type="password"
            value={cred}
            onChange={(e) => setCred(e.target.value)}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            style={styles.input}
            placeholder="Enter ID (Agent) or Password (Admin)"
          />
        </div>
        {error && <p style={styles.error}>{error}</p>}
        <button
          type="submit"
          style={{
            ...styles.button,
            transform: buttonHover ? 'translateY(-2px)' : 'translateY(0)',
            boxShadow: buttonHover ? '0 6px 20px rgba(102, 126, 234, 0.6)' : '0 4px 15px rgba(102, 126, 234, 0.4)',
          }}
          onMouseEnter={() => setButtonHover(true)}
          onMouseLeave={() => setButtonHover(false)}
        >
          Login
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    width: "400px",
    maxWidth: "90%",
    padding: "40px",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  inputGroup: {
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    marginTop: "8px",
    boxSizing: "border-box",
    border: "2px solid #e0e0e0",
    borderRadius: "10px",
    fontSize: "16px",
    transition: "all 0.3s ease",
    outline: "none",
  },
  button: {
    padding: "14px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
    marginTop: "10px",
  },
  error: {
    color: "#dc2626",
    fontSize: "14px",
    backgroundColor: "#fee2e2",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "10px",
    textAlign: "center",
  },
};

export default Login;

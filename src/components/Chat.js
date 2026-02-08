import React, { useState, useEffect, useRef } from "react";

const Chat = ({ currentUser }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    const toggleChat = () => setIsOpen(!isOpen);

    // Load messages from local storage
    const loadMessages = () => {
        const saved = localStorage.getItem("app_chat_messages");
        if (saved) {
            setMessages(JSON.parse(saved));
        }
    };

    // Poll for new messages every 2 seconds
    useEffect(() => {
        loadMessages();
        const interval = setInterval(loadMessages, 2000);
        return () => clearInterval(interval);
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        if (isOpen && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const newMessage = {
            id: Date.now(),
            sender: currentUser.name || currentUser.username,
            role: currentUser.role,
            text: input,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        localStorage.setItem("app_chat_messages", JSON.stringify(updatedMessages));
        setInput("");
    };

    return (
        <div style={styles.wrapper}>
            {isOpen && (
                <div style={styles.window} className="card">
                    <div style={styles.header}>
                        <span>Team Chat 💬</span>
                        <button onClick={toggleChat} style={styles.closeBtn}>×</button>
                    </div>

                    <div style={styles.messages}>
                        {messages.length === 0 && (
                            <p style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>No messages yet. Say hi!</p>
                        )}
                        {messages.map((msg) => {
                            const isMe = msg.sender === (currentUser.name || currentUser.username);
                            return (
                                <div key={msg.id} style={{
                                    ...styles.messageRow,
                                    justifyContent: isMe ? 'flex-end' : 'flex-start'
                                }}>
                                    <div style={{
                                        ...styles.bubble,
                                        background: isMe ? '#4f46e5' : '#f3f4f6',
                                        color: isMe ? 'white' : '#1f2937',
                                        borderBottomRightRadius: isMe ? '2px' : '12px',
                                        borderBottomLeftRadius: isMe ? '12px' : '2px'
                                    }}>
                                        <div style={styles.sender}>
                                            {isMe ? 'You' : msg.sender} <span style={{ fontSize: '0.7em', opacity: 0.8 }}>({msg.role})</span>
                                        </div>
                                        <div>{msg.text}</div>
                                        <div style={{ fontSize: '0.65rem', opacity: 0.7, textAlign: 'right', marginTop: '2px' }}>
                                            {msg.timestamp}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={sendMessage} style={styles.form}>
                        <input
                            style={styles.input}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                        />
                        <button type="submit" style={styles.sendBtn}>➤</button>
                    </form>
                </div>
            )}

            {!isOpen && (
                <button onClick={toggleChat} style={styles.floatBtn}>
                    💬 Chat
                </button>
            )}
        </div>
    );
};

const styles = {
    wrapper: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        fontFamily: 'Inter, sans-serif'
    },
    floatBtn: {
        padding: '15px 25px',
        borderRadius: '30px',
        backgroundColor: '#4f46e5',
        color: 'white',
        border: 'none',
        boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '1rem',
        transition: 'transform 0.2s'
    },
    window: {
        width: '320px',
        height: '450px',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden',
        boxShadow: '0 5px 20px rgba(0,0,0,0.15)',
        marginBottom: '0'
    },
    header: {
        padding: '15px',
        backgroundColor: '#4f46e5',
        color: 'white',
        fontWeight: 'bold',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: 'white',
        fontSize: '1.5rem',
        cursor: 'pointer'
    },
    messages: {
        flex: 1,
        padding: '15px',
        overflowY: 'auto',
        backgroundColor: '#fff'
    },
    messageRow: {
        display: 'flex',
        marginBottom: '10px'
    },
    bubble: {
        padding: '10px 14px',
        borderRadius: '12px',
        maxWidth: '80%',
        wordWrap: 'break-word',
        fontSize: '0.9rem',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    },
    sender: {
        fontSize: '0.75rem',
        fontWeight: 'bold',
        marginBottom: '2px',
        display: 'block'
    },
    form: {
        padding: '10px',
        borderTop: '1px solid #eee',
        display: 'flex',
        gap: '10px',
        backgroundColor: '#f9fafb'
    },
    input: {
        flex: 1,
        padding: '10px',
        borderRadius: '20px',
        border: '1px solid #ddd',
        outline: 'none'
    },
    sendBtn: {
        background: '#4f46e5',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '38px',
        height: '38px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }
};

export default Chat;

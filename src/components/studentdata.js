import React, { useState } from "react";
import { db, storage, auth } from "../firebase";
import { addDoc, collection } from "firebase/firestore";
import { ref as storageRef, uploadString } from "firebase/storage";
import { signInWithEmailAndPassword } from "firebase/auth";

function Registration({ setStep, setStudentData, onCancel }) {
  const [form, setForm] = useState({
    // Source
    Source: "",
    ReferenceName: "",

    // Personal Details
    StudentName: "",
    Gender: "",
    DOB: "",
    Category: "",
    FatherName: "",
    MotherName: "",

    // Contact Details
    MobileNumber: "",
    FatherMobileNumber: "",
    Email: "",
    HouseNo: "",
    StreetVillage: "",
    Mandal: "",
    District: "",
    State: "",
    PinCode: "",

    // Education - SSC
    SSCBoard: "",
    SSCYear: "",
    SSCHallTicket: "",
    SSCMarks: "",

    // Education - Inter/Diploma
    InterGroup: "",
    InterCollege: "",
    InterYear: "",
    InterHallTicket: "",
    InterMarks: "",

    // Certificates Submitted
    Tenth: "",
    InterMediate: "",
    Tc: "",
    Migration: "",
    Income: "",
    Cast: "",
    Photo: "",
    // Hostel Allotment
    BuildingName: "",
    RoomNo: "",
    FloorNo: "",


    // Admission
    CourseInterested: "",
    Remarks: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignIn = async () => {
    if (!loginEmail || !loginPassword) {
      setMessage('Please enter admin email and password');
      return;
    }
    setLoginLoading(true);
    setMessage('');
    try {
      const result = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      console.log('User signed in successfully:', result.user.uid);
      setMessage('✓ Signed in successfully! You can now save student data.');
    } catch (err) {
      console.error('Sign in error', err);
      setMessage('✗ Sign in failed: ' + err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const submitForm = async () => {
    if (!form.StudentName || !form.MobileNumber) {
      setMessage("Please fill in at least Student Name and Mobile Number");
      return;
    }

    // Require an authenticated user to perform writes (avoid permission errors)
    if (!auth.currentUser) {
      setMessage("✗ Please sign in as an admin before saving student data.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      console.log("Current user UID:", auth.currentUser.uid);
      
      // Add student data to Firestore 'students' collection
      const docRef = await addDoc(collection(db, "students"), {
        ...form,
        createdAt: new Date(),
        status: "Enquiry",
        currentStage: "Enquiry",
        applicationFee: false,
        registrationFee: false,
        createdBy: auth.currentUser.uid
      });

      console.log("Student registered with ID:", docRef.id);
      setMessage("✓ Student data saved successfully!");
      
      // Also store a JSON copy of the student data in Firebase Storage
      try {
        const studentJson = JSON.stringify({ ...form, id: docRef.id, createdAt: new Date().toISOString() });
        const fileRef = storageRef(storage, `students/${docRef.id}.json`);
        await uploadString(fileRef, studentJson, 'raw', { contentType: 'application/json' });
        console.log('Student JSON uploaded to Storage:', `students/${docRef.id}.json`);
      } catch (storageErr) {
        console.warn('Failed to upload student JSON to Storage:', storageErr);
        setMessage(prev => prev + ' (storage upload failed)');
      }

      // Call parent component to move to next step
      setStudentData({ ...form, id: docRef.id });
      
      // Reset form after successful submission
      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error saving student data:", error);
      if (error.code === 'permission-denied') {
        setMessage("✗ Permission denied. Ensure Firestore rules allow authenticated writes for the 'students' collection.");
      } else {
        setMessage("✗ Error saving data: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>New Student Enquiry</h2>

      {/* --- Source & Personal --- */}
      <div className="form-section">
        <div className="form-section-title">Personal Details</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Lead Source</label>
            <select name="Source" value={form.Source} onChange={handleChange} className="form-control">
              <option value="">-- Select Source --</option>
              <option value="Facebook">Facebook</option>
              <option value="Instagram">Instagram</option>
              <option value="Google">Google</option>
              <option value="Agent">Agent</option>
              <option value="Student Referral">Student Referral</option>
            </select>
          </div>
          {form.Source === "Student Referral" && (
            <div className="form-group">
              <label>Reference Name</label>
              <input name="ReferenceName" value={form.ReferenceName} onChange={handleChange} className="form-control" />
            </div>
          )}
          <div className="form-group">
            <label>Student Name *</label>
            <input name="StudentName" value={form.StudentName} onChange={handleChange} className="form-control" required />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <select name="Gender" value={form.Gender} onChange={handleChange} className="form-control">
              <option value="">-- Select --</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input type="date" name="DOB" value={form.DOB} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select name="Category" value={form.Category} onChange={handleChange} className="form-control">
              <option value="">-- Select --</option>
              <option value="OC">OC</option>
              <option value="BC">BC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="Others">Others</option>
            </select>
          </div>
          <div className="form-group">
            <label>Father Name</label>
            <input name="FatherName" value={form.FatherName} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>Mother Name</label>
            <input name="MotherName" value={form.MotherName} onChange={handleChange} className="form-control" />
          </div>
        </div>
      </div>

      {/* --- Contact Details --- */}
      <div className="form-section">
        <div className="form-section-title">Contact Details</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Student Mobile *</label>
            <input name="MobileNumber" value={form.MobileNumber} onChange={handleChange} className="form-control" required />
          </div>
          <div className="form-group">
            <label>Father Mobile</label>
            <input name="FatherMobileNumber" value={form.FatherMobileNumber} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>Email ID</label>
            <input name="Email" value={form.Email} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>House No</label>
            <input name="HouseNo" value={form.HouseNo} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>Street / Village</label>
            <input name="StreetVillage" value={form.StreetVillage} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>Mandal</label>
            <input name="Mandal" value={form.Mandal} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>District</label>
            <input name="District" value={form.District} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>State</label>
            <input name="State" value={form.State} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>Pin Code</label>
            <input name="PinCode" value={form.PinCode} onChange={handleChange} className="form-control" />
          </div>
        </div>
      </div>

      {/* --- Education Details --- */}
      <div className="form-section">
        <div className="form-section-title">Education Qualification</div>

        <h4 style={{ marginTop: '0', color: '#666' }}>10th / SSC Details</h4>
        <div className="form-grid" style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label>Board Name</label>
            <input name="SSCBoard" value={form.SSCBoard} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>Year of Passing</label>
            <input name="SSCYear" value={form.SSCYear} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>Hall Ticket No</label>
            <input name="SSCHallTicket" value={form.SSCHallTicket} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>GPA / Marks</label>
            <input name="SSCMarks" value={form.SSCMarks} onChange={handleChange} className="form-control" />
          </div>
        </div>

        <h4 style={{ marginTop: '0', color: '#666' }}>Intermediate / Diploma</h4>
        <div className="form-grid">
          <div className="form-group">
            <label>Group / Branch</label>
            <input name="InterGroup" placeholder="e.g. MPC / Civil" value={form.InterGroup} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>College Name</label>
            <input name="InterCollege" value={form.InterCollege} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>Year of Passing</label>
            <input name="InterYear" value={form.InterYear} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>Hall Ticket No</label>
            <input name="InterHallTicket" value={form.InterHallTicket} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>Marks / Percentage</label>
            <input name="InterMarks" value={form.InterMarks} onChange={handleChange} className="form-control" />
          </div>
        </div>
      </div>

      {/*---Certificate Submitte---*/}

      <div className="form-section">
        <div className="form-section-title">Certificates Submitted</div>
        <h4 style={{ marginTop: '0', color: '#666' }}>Certificates Submitte</h4>
        <div className="form-grid" style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label>10th Submitted</label>
            <input
              type="file"
              name="Tenth"
              value={form.Tenth}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>12th Submitted</label>
            <input
              type="file"
              name="InterMediate"
              value={form.InterMediate}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Tc Submitted</label>
            <input
              type="file"
              name="Tc"
              value={form.Tc}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Migration Submitted</label>
            <input
              type="file"
              name="Migration"
              value={form.Migration}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Income Submitted</label>
            <input
              type="file"
              name="Income"
              value={form.Income}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Cast submitted</label>
            <input
              type="file"
              name="Cast"
              value={form.Cast}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Photos Submitted</label>
            <input
              type="file"
              name="Photo"
              value={form.photos}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>
      </div>

      {/*--- Hostel Allotment---*/}
      <div className="form-section">
        <div className="form-section-title">Hostel Allotment</div>
        <h4 style={{ marginTop: '0', color: '#666' }}>Hostel Allotment Details</h4>
        <div className="form-grid">
          <div className="form-group">
            <label>Building Name</label>
            <input name="BuildingName" value={form.BuildingName} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>Room Number</label>
            <input name="RoomNo" value={form.RoomNo} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>Floor No</label>
            <input name="FloorNo" value={form.FloorNo} onChange={handleChange} className="form-control" />
          </div>
        </div>
      </div>

      {/* --- Admission Details --- */}
      <div className="form-section">
        <div className="form-section-title">Admission Details</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Course Interested</label>
            <select name="CourseInterested" value={form.CourseInterested} onChange={handleChange} className="form-control">
              <option value="">-- Select Course --</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="Civil">Civil</option>
              <option value="Mech">Mech</option>
              <option value="MBA">MBA</option>
            </select>
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Remarks / Comments</label>
            <textarea name="Remarks" value={form.Remarks} onChange={handleChange} className="form-control" />
          </div>
        </div>
      </div>

      <div className="btn-row">
        <button onClick={onCancel} className="btn btn-outline">Dashboard</button>
        <button onClick={submitForm} className="btn btn-primary" disabled={loading}>
          {loading ? "Saving..." : "Save & Continue"}
        </button>
      </div>

      {/* Admin sign-in box shown when not authenticated */}
      {!auth.currentUser ? (
        <div style={{ marginTop: 12, padding: 12, border: '1px solid #e2e8f0', borderRadius: 6, background: '#f9f9f9' }}>
          <div style={{ marginBottom: 8, fontWeight: 600, color: '#c41e3a' }}>⚠️ Admin Sign-in Required</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <input 
              placeholder="Admin email" 
              value={loginEmail} 
              onChange={(e) => setLoginEmail(e.target.value)} 
              style={{ padding: '8px', flex: 1, minWidth: 200 }} 
            />
            <input 
              placeholder="Password" 
              type="password" 
              value={loginPassword} 
              onChange={(e) => setLoginPassword(e.target.value)} 
              style={{ padding: '8px', minWidth: 150 }} 
            />
            <button onClick={handleSignIn} className="btn btn-primary" disabled={loginLoading} style={{ height: 40 }}>
              {loginLoading ? 'Signing...' : 'Sign in'}
            </button>
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>You must sign in as an admin (enabled in Firebase Authentication) to save student records.</div>
        </div>
      ) : (
        <div style={{ marginTop: 12, padding: 12, border: '1px solid #0da035', borderRadius: 6, background: '#d4edda' }}>
          <div style={{ fontSize: 12, color: '#0da035' }}>✓ Signed in as admin. Ready to save student data.</div>
        </div>
      )}

      {message && (
        <p style={{
          marginTop: "15px",
          padding: "10px 15px",
          borderRadius: "4px",
          color: message.startsWith("✓") ? "#0da035" : "#c41e3a",
          backgroundColor: message.startsWith("✓") ? "#d4edda" : "#f8d7da",
          border: message.startsWith("✓") ? "1px solid #0da035" : "1px solid #c41e3a"
        }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default Registration;
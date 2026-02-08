import React, { useState, useEffect } from "react";

function UniversityVisit({ setStep, student, updateStudent }) {
  const [visit, setVisit] = useState({
    visitStatus: "Visited", // Visited, Not Visited, Rescheduled
    journeyDate: "",
    transportMode: "", // Flight, Train, Bus, Car
    receivePerson: "",
    returnDate: "",
    dropPerson: "",
    remarks: ""
  });

  // Pre-fill data if viewing existing record
  useEffect(() => {
    if (student && student.visitDetails) {
      setVisit(student.visitDetails);
    }
  }, [student]);

  const handleSubmit = () => {
    // Pass data back to App.js
    updateStudent({ visitDetails: visit });
  };

  return (
    <div className="card">
      <h3>University Visit Details</h3>

      <div className="form-section">
        <div className="form-grid">
          <div className="form-group">
            <label>Visit Status</label>
            <select
              className="form-control"
              value={visit.visitStatus}
              onChange={(e) => setVisit({ ...visit, visitStatus: e.target.value })}
            >
              <option value="Visited">Visited</option>
              <option value="Not Visited">Not Visited</option>
              <option value="Rescheduled">Rescheduled</option>
            </select>
          </div>

          <div className="form-group">
            <label>Date of Journey</label>
            <input
              type="date"
              className="form-control"
              value={visit.journeyDate}
              onChange={(e) => setVisit({ ...visit, journeyDate: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Transport Mode</label>
            <select
              className="form-control"
              value={visit.transportMode}
              onChange={(e) => setVisit({ ...visit, transportMode: e.target.value })}
            >
              <option value="">Select Mode</option>
              <option value="Flight">Flight</option>
              <option value="Train">Train</option>
              <option value="Bus">Bus</option>
              <option value="Car">Car</option>
            </select>
          </div>

          <div className="form-group">
            <label>Receive Person Name</label>
            <input
              placeholder="Enter Name"
              className="form-control"
              value={visit.receivePerson}
              onChange={(e) => setVisit({ ...visit, receivePerson: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Date of Return</label>
            <input
              type="date"
              className="form-control"
              value={visit.returnDate}
              onChange={(e) => setVisit({ ...visit, returnDate: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Drop Person Name</label>
            <input
              placeholder="Enter Name"
              className="form-control"
              value={visit.dropPerson}
              onChange={(e) => setVisit({ ...visit, dropPerson: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Remarks / Feedback</label>
            <textarea
              className="form-control"
              placeholder="Enter any feedback regarding the visit..."
              rows="3"
              value={visit.remarks}
              onChange={(e) => setVisit({ ...visit, remarks: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="btn-row">
        <button onClick={() => setStep('dashboard')} className="btn btn-outline">Dashboard</button>
        <button onClick={handleSubmit} className="btn btn-primary">Confirm Visit & Continue</button>
      </div>
    </div>
  );
}

export default UniversityVisit;
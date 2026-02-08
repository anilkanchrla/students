import React, { useState } from "react";

function RegistrationFee({ student, updateStudent, setStep }) {
  const [date, setDate] = useState("");
  const [regNo, setRegNo] = useState("");

  const payRegistrationFee = () => {
    if (!date || !regNo) {
      alert("Please enter all details");
      return;
    }
    updateStudent({
      registrationFee: 10000,
      registrationDate: date,
      registrationNo: regNo,
    });
  };

  return (
    <div className="card">
      <h3>Registration Fee Payment</h3>

      <div className="form-section">
        <div className="form-grid">
          <div className="form-group">
            <label>Application No</label>
            <input value={student.applicationNo} readOnly className="form-control" style={{ backgroundColor: '#f3f4f6' }} />
          </div>
          <div className="form-group">
            <label>Amount to Pay</label>
            <input value="₹ 10,000" readOnly className="form-control" style={{ backgroundColor: '#e0f2f1', color: '#00695c', fontWeight: 'bold' }} />
          </div>
          <div className="form-group">
            <label>Date of Payment</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-control" />
          </div>
          <div className="form-group">
            <label>Registration Number (Reference)</label>
            <input
              placeholder="Enter Registration No"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
              className="form-control"
            />
          </div>
        </div>
      </div>

      <div className="btn-row">
        <button onClick={() => setStep('dashboard')} className="btn btn-outline">Dashboard</button>
        <button onClick={payRegistrationFee} className="btn btn-primary">Pay & Next</button>
      </div>
    </div>
  );
}

export default RegistrationFee;
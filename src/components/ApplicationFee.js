import React, { useState } from "react";

const ApplicationFee = ({ updateStudent, setStep }) => {
  const [date, setDate] = useState("");
  const [appNo, setAppNo] = useState("");

  const payApplicationFee = () => {
    if (!date || !appNo) {
      alert("Please enter all details");
      return;
    }
    updateStudent({
      applicationFee: 250,
      applicationDate: date,
      applicationNo: appNo,
    });
  };

  return (
    <div className="card">
      <h3>Application Fee Payment</h3>
      <div className="form-section">
        <div className="form-grid">
          <div className="form-group">
            <label>Amount to Pay</label>
            <input value="₹ 250" readOnly className="form-control" style={{ backgroundColor: '#eee' }} />
          </div>
          <div className="form-group">
            <label>Date of Payment</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-control" />
          </div>
          <div className="form-group">
            <label>Application Number (Reference)</label>
            <input
              placeholder="Enter Application No"
              value={appNo}
              onChange={(e) => setAppNo(e.target.value)}
              className="form-control"
            />
          </div>
        </div>
      </div>

      <div className="btn-row">
        <button onClick={() => setStep('dashboard')} className="btn btn-outline">Dashboard</button>
        <button onClick={payApplicationFee} className="btn btn-primary">Pay & Next</button>
      </div>
    </div>
  );
}

export default ApplicationFee;
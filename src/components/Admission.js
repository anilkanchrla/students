import React, { useState, useEffect } from "react";

function Admission({ onHome, student, updateStudent }) {
  // Seat Confirmation & Tuition Fee State
  const [admissionData, setAdmissionData] = useState({
    // Seat Booking
    seatBookingDate: "",
    seatBookingAmount: "",
    bookingPaymentMode: "",
    isSeatConfirmed: false,

    // Tuition Fee
    totalFirstYearFee: "",
    feePaidAmount: "",
    feePaymentDate: "",
    feePaymentMode: "",
    feeReceiptNumber: "",

    remarks: ""
  });

  // Pre-fill
  useEffect(() => {
    if (student && student.admissionDetails) {
      setAdmissionData(student.admissionDetails);
    }
  }, [student]);

  const handleSubmit = () => {
    // Save data and Mark as Completed
    updateStudent({
      admissionDetails: admissionData,
      status: "Completed",
      currentStage: "Admission Completed"
    });
    // The parent updateStudent will likely handle navigation, but if we need to manually trigger home:
    // Actually typically updateStudent handles distinct step updates.
    // We'll let the parent handle the "Completion" status update via the props or we pass it here.
    // In this specific component, we want to Save -> Then Show Success.
    // But since this IS the last step, maybe we just call onHome after saving? 
    // Or simpler: The App.js `updateStudent` logic usually moves to next step. 
    // Since this is step 5 (final), we might want to just show a "Success" modal or state here.
    // For simplicity, let's assume `updateStudent` saves it and we redirect to dashboard.

    onHome();
  };

  // Calculate Balance
  const balance = (Number(admissionData.totalFirstYearFee) || 0) - (Number(admissionData.feePaidAmount) || 0);

  return (
    <div className="card">
      <h3>Final Admission Process</h3>

      {/* --- Seat Confirmation --- */}
      <div className="form-section">
        <div className="form-section-title">Step 1: Seat Confirmation</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Seat Booking Amount</label>
            <input
              type="number"
              className="form-control"
              value={admissionData.seatBookingAmount}
              onChange={(e) => setAdmissionData({ ...admissionData, seatBookingAmount: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Payment Date</label>
            <input
              type="date"
              className="form-control"
              value={admissionData.seatBookingDate}
              onChange={(e) => setAdmissionData({ ...admissionData, seatBookingDate: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Payment Mode</label>
            <select
              className="form-control"
              value={admissionData.bookingPaymentMode}
              onChange={(e) => setAdmissionData({ ...admissionData, bookingPaymentMode: e.target.value })}
            >
              <option value="">Select Mode</option>
              <option value="Online">Online</option>
              <option value="Cash">Cash</option>
              <option value="DD">DD</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ marginBottom: 0, marginRight: '10px' }}>Seat Confirmed?</label>
            <input
              type="checkbox"
              style={{ width: '20px', height: '20px' }}
              checked={admissionData.isSeatConfirmed}
              onChange={(e) => setAdmissionData({ ...admissionData, isSeatConfirmed: e.target.checked })}
            />
          </div>
        </div>
      </div>

      {/* --- Tuition Fees --- */}
      <div className="form-section">
        <div className="form-section-title">Step 2: 1st Year Tuition Fees</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Total 1st Year Fee</label>
            <input
              type="number"
              className="form-control"
              value={admissionData.totalFirstYearFee}
              onChange={(e) => setAdmissionData({ ...admissionData, totalFirstYearFee: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Amount Paid Now</label>
            <input
              type="number"
              className="form-control"
              value={admissionData.feePaidAmount}
              onChange={(e) => setAdmissionData({ ...admissionData, feePaidAmount: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Balance Amount</label>
            <input
              type="text"
              className="form-control"
              value={balance}
              disabled
              style={{ background: '#eee' }}
            />
          </div>
          <div className="form-group">
            <label>Payment Date</label>
            <input
              type="date"
              className="form-control"
              value={admissionData.feePaymentDate}
              onChange={(e) => setAdmissionData({ ...admissionData, feePaymentDate: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Payment Mode</label>
            <select
              className="form-control"
              value={admissionData.feePaymentMode}
              onChange={(e) => setAdmissionData({ ...admissionData, feePaymentMode: e.target.value })}
            >
              <option value="">Select Mode</option>
              <option value="Online">Online</option>
              <option value="Cash">Cash</option>
              <option value="DD">DD</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
          <div className="form-group">
            <label>Receipt Number</label>
            <input
              type="text"
              className="form-control"
              value={admissionData.feeReceiptNumber}
              onChange={(e) => setAdmissionData({ ...admissionData, feeReceiptNumber: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="btn-row">
        <button onClick={onHome} className="btn btn-outline">Cancel / Dashboard</button>
        <button onClick={handleSubmit} className="btn btn-primary" style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}>
          Complete Admission Process 🎉
        </button>
      </div>
    </div>
  );
}

export default Admission;
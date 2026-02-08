import React from "react";

function Payment({ setStep }) {
  const payNow = () => {
    alert("Registration Fee Paid Successfully");
    setStep(3);
  };

  return (
    <>
      <h3>Registration Fee Payment</h3>
      <p>Amount: ₹5,000</p>
      <button onClick={payNow}>Pay & Continue</button>
    </>
  );
}

export default Payment;
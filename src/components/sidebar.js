const Sidebar = ({ currentStep, setCurrentStep, completedSteps }) => {
  const steps = [
    { id: "registration", label: "Registration Fee" },
    { id: "university", label: "University Visit" },
    { id: "admission", label: "Admission Confirmation" },
    { id: "payment", label: "Payment Mode" },
    { id: "joining", label: "Date of Joining / Travel" },
    { id: "hostel", label: "Hostel Allotment" },
    { id: "hostelfee", label: "Hostel Fee" },
    { id: "certificates", label: "Certificates Submitted" },
  ];

  return (
    <div className="sidebar">
      <h3>Admission Process</h3>
      {steps.map((step, index) => {
        const isEnabled =
          step.id === "registration" ||
          completedSteps.includes(steps[index - 1]?.id);

        return (
          <button
            key={step.id}
            disabled={!isEnabled}
            className={currentStep === step.id ? "active" : ""}
            onClick={() => setCurrentStep(step.id)}
          >
            {step.label}
          </button>
        );
      })}
    </div>
  );
};

export default Sidebar;
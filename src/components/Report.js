import React from "react";

const Report = ({ status, resetExam }) => {
  return (
    <div className="report">
      <h2>Exam {status === "completed" ? "Completed" : "Terminated"}</h2>
      <button className="reset-btn" onClick={resetExam}>
        Reset and Restart Exam
      </button>
    </div>
  );
};

export default Report;

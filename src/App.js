import React, { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";
import Timer from "./components/Timer";
import Report from "./components/Report";
import questions from "./components/Questions"; 

function App() {
  const [examStarted, setExamStarted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [violations, setViolations] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300);
  const [examTerminated, setExamTerminated] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});

  const examRef = useRef(null);

  const handleFullscreenExit = useCallback(() => {
    if (!document.fullscreenElement) {
      setIsFullscreen(false);
      setViolations((prev) => prev + 1);
      if (violations === 1) {
        alert("Violation Warning: Please stay in full-screen mode!");
      } else if (violations === 2) {
        setExamTerminated(true);
        alert("Exam Terminated due to multiple violations.");
      }
    }
  }, [violations]);

  const enterFullScreen = () => {
    if (examRef.current.requestFullscreen) {
      examRef.current.requestFullscreen();
      setIsFullscreen(true);
    }
  };

  const startExam = () => {
    const confirmStart = window.confirm("Are you sure you want to start the exam?");
    if (confirmStart) {
      const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5).slice(0, 3); // Select 3 random questions
      setSelectedQuestions(shuffledQuestions);
      enterFullScreen();
      setExamStarted(true);
    }
  };

  useEffect(() => {
    if (examStarted && isFullscreen) {
      document.addEventListener("fullscreenchange", handleFullscreenExit);
    }
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenExit);
    };
  }, [examStarted, isFullscreen, handleFullscreenExit]);

  const submitExam = () => {
    if (examStarted && !examTerminated) {
      const correctAnswers = selectedQuestions.filter(
        (q, idx) => userAnswers[idx] === q.answer
      ).length;
      alert(`Exam submitted! You answered ${correctAnswers} out of ${selectedQuestions.length} questions correctly.`);
      setExamCompleted(true);
      document.exitFullscreen(); 
    }
  };

  const resetExam = () => {
    setExamStarted(false);
    setIsFullscreen(false);
    setViolations(0);
    setTimeLeft(300);
    setSelectedQuestions([]);
    setUserAnswers({});
    setExamCompleted(false);
    setExamTerminated(false);
  };

  const handleAnswerChange = (index, answer) => {
    setUserAnswers({ ...userAnswers, [index]: answer });
  };

  return (
    <div className="App" ref={examRef}>
      {!examStarted && (
        <div className="start-page">
          <button className="start-btn" onClick={startExam}>
            Start Exam
          </button>
        </div>
      )}

      {examStarted && !examTerminated && !examCompleted && (
        <div className="exam-container">
          <h2>Exam in Progress</h2>
          <Timer timeLeft={timeLeft} setTimeLeft={setTimeLeft} onTimeUp={submitExam} />
          
          {selectedQuestions.map((q, idx) => (
            <div key={idx} className="question">
              <p>{idx + 1}. {q.question}</p> {}
              {q.options.map((option, optionIdx) => (
                <label key={optionIdx}>
                  <input
                    type="radio"
                    name={`question-${idx}`}
                    value={option}
                    checked={userAnswers[idx] === option}
                    onChange={() => handleAnswerChange(idx, option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          ))}

          <button className="submit-btn" onClick={submitExam}>
            Submit Exam
          </button>
        </div>
      )}

      {examCompleted && <Report status="completed" resetExam={resetExam} />}
      {examTerminated && <Report status="terminated" resetExam={resetExam} />}
    </div>
  );
}

export default App;

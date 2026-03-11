import React, { useState, useEffect, useRef } from "react";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("home");
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("System Ready");
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const intervalRef = useRef(null);

  const stages = [
    { name: "Initializing Listeners...", progress: 15 },
    { name: "Capturing Packets...", progress: 30 },
    { name: "Preprocessing the captured Packets...", progress: 40 },
    { name: "Primary Layer Analysis...", progress: 56 },
    { name: "Secondary Layer Analysis...", progress: 72 },
    { name: "Checking for fallback...", progress: 80 },
    { name: "Logging...", progress: 90 },
    { name: "Loading Results...", progress: 100 },
  ];

  // Cleanup interval on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startSimulation = () => {
    if (isAnalyzing) return; // Prevent double clicks
    
    // FUTURE BACKEND INTEGRATION
    // Call backend endpoint here
    // Example:
    // fetch('/start-job', { method: 'POST'})
    //   .then(res => res.json())
    //   .then(data => store job_id)

    setIsAnalyzing(true);
    setProgress(0);
    setStage("Starting Analysis...");

    let i = 0;

    intervalRef.current = setInterval(() => {
      const currentStage = stages[i];
      setStage(currentStage.name);
      setProgress(currentStage.progress);

      i++;

      if (i === stages.length) {
        clearInterval(intervalRef.current);

        // FUTURE BACKEND INTEGRATION
        // Fetch result from backend using job_id
        // fetch(`/result/${job_id}`)
        //   .then(res => res.json())
        //   .then(data => setResult(data))

        setResult({
          prediction: "Benign Traffic",
          confidence: "98.7%",
          packetsAnalyzed: "24,842",
          threatLevel: "Low"
        });

        // Add a slight delay at 100% so the user sees the bar fill up
        setTimeout(() => {
          setPage("result");
          setIsAnalyzing(false);
        }, 1200);
      }
    }, 1200);
  };

  return (
    <div className="app-wrapper">
      {page === "home" && (
        <div className="container fade-in">
          <h1 className="title">Intrusion Detection System</h1>

          <div className="panel">
            <p className="subtitle">Real-time network traffic analysis and threat prevention.</p>

            <button 
              className={`action-btn primary-btn ${isAnalyzing ? "processing" : "pulse-anim"}`} 
              onClick={startSimulation}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? "Analysis in Progress..." : "Start Packet Capture"}
            </button>

            <div className={`progressSection ${isAnalyzing ? "active" : ""}`}>
              <div className="stage-header">
                <span className="stageText">{stage}</span>
                <span className="percent">{progress}%</span>
              </div>

              <div className="progressBar">
                <div
                  className={`progressFill ${isAnalyzing ? "striped-animated" : ""}`}
                  style={{ width: progress + "%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {page === "result" && (
        <div className="container slide-up">
          <h1 className="title">Analysis Report</h1>

          <div className="panel">
            <div className="result-grid">
              
              {/* FUTURE BACKEND DATA DISPLAY */}
              {/* Replace these fields with actual JSON response */}
              
              <div className="resultRow">
                <span className="label">Status Prediction</span>
                <span className="value status-safe">{result.prediction}</span>
              </div>

              <div className="resultRow">
                <span className="label">Threat Level</span>
                <span className="value">{result.threatLevel}</span>
              </div>

              <div className="resultRow">
                <span className="label">AI Confidence</span>
                <span className="value">{result.confidence}</span>
              </div>

              <div className="resultRow">
                <span className="label">Packets Analyzed</span>
                <span className="value">{result.packetsAnalyzed}</span>
              </div>
            </div>

            <button 
              className="action-btn secondary-btn" 
              onClick={() => {
                setProgress(0);
                setStage("System Ready");
                setPage("home");
              }}
            >
              Run New Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
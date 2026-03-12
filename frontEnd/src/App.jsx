import React, { useState, useEffect, useRef } from "react";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("home");
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("System Ready");
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [logs, setLogs] = useState([]);
  const [jobId, setJobId] = useState(null);

  const intervalRef = useRef(null);
  const logConsoleRef = useRef(null);
  const fileInputRef = useRef(null); // Reference for the hidden file input

  const BACKEND_URL = "http://localhost:8000";

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (logConsoleRef.current) {
      logConsoleRef.current.scrollTop = logConsoleRef.current.scrollHeight;
    }
  }, [logs]);

  // Updated to accept mode and file
  const startAnalysis = async (mode = "live", file = null) => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    setProgress(0);
    setStage("Connecting to server...");
    setLogs(["[System] Initiating connection to backend..."]);

    try {
      // Create FormData to handle the text string AND the binary file
      const formData = new FormData();
      formData.append("job_type", mode);
      if (mode === "file" && file) {
        formData.append("file", file);
        setLogs((prev) => [...prev, `[System] Uploading ${file.name}...`]);
      }

      const startResponse = await fetch(`${BACKEND_URL}/start-job`, {
        method: "POST",
        body: formData, // fetch automatically handles the multipart boundaries
      });

      if (!startResponse.ok) throw new Error("Failed to start job");

      const startData = await startResponse.json();
      const currentJobId = startData.job_id;
      setJobId(currentJobId);

      intervalRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(`${BACKEND_URL}/job-status/${currentJobId}`);
          const statusData = await statusRes.json();

          const logsRes = await fetch(`${BACKEND_URL}/job-logs/${currentJobId}`);
          const logsData = await logsRes.json();

          setStage(statusData.stage);
          setProgress(statusData.progress);
          setLogs(logsData.logs);

          if (statusData.status === "completed") {
            clearInterval(intervalRef.current);

            const resultRes = await fetch(`${BACKEND_URL}/result/${currentJobId}`);
            const resultData = await resultRes.json();

            setResult(resultData);

            setTimeout(() => {
              setPage("result");
              setIsAnalyzing(false);
            }, 1200);
          } else if (statusData.status === "failed") {
            clearInterval(intervalRef.current);
            setStage("Analysis Failed");
            setIsAnalyzing(false);
          }
        } catch (pollError) {
          console.error("Error fetching job status:", pollError);
        }
      }, 1000);
    } catch (error) {
      console.error("Error starting analysis:", error);
      setLogs((prev) => [...prev, "[Error] Failed to connect to the backend server."]);
      setStage("Connection Failed");
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="app-wrapper">
      {page === "home" && (
        <div className="container fade-in">
          <h1 className="title">Intrusion Detection System</h1>

          <div className="panel">
            <p className="subtitle">
              Real-time network traffic analysis and threat prevention.
            </p>

            {/* NEW DUAL BUTTON LAYOUT */}
            <div className="button-group">
              <button
                className={`action-btn primary-btn ${isAnalyzing ? "processing" : "pulse-anim"}`}
                onClick={() => startAnalysis("live")}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? "Analysis in Progress..." : "Start Packet Capture"}
              </button>

              <button
                className={`action-btn secondary-btn ${isAnalyzing ? "processing" : ""}`}
                onClick={() => fileInputRef.current.click()}
                disabled={isAnalyzing}
                style={{ marginTop: 0 }} // Override to align with primary button
              >
                Upload CSV File
              </button>

              {/* Hidden file input triggered by the Secondary Button */}
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files.length > 0) {
                    startAnalysis("file", e.target.files[0]);
                  }
                }}
              />
            </div>

            {/* ... KEEP REST OF YOUR UI (progress bar, log panel, result page) EXACTLY THE SAME ... */}
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

            <div className="logPanel">
              <div className="logHeader">System Logs</div>
              <div className="logConsole" ref={logConsoleRef}>
                {logs.map((log, index) => (
                  <div key={index} className="logLine">{log}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESULT PAGE REMAINS IDENTICAL */}
      {page === "result" && (
        <div className="container slide-up">
          <h1 className="title">Analysis Report</h1>
          <div className="panel">
            <div className="result-grid">
              <div className="resultRow">
                <span className="label">Status Prediction</span>
                <span className={`value ${result.prediction === "Benign Traffic" ? "status-safe" : "status-danger"}`}>
                  {result.prediction}
                </span>
              </div>
              <div className="resultRow">
                <span className="label">Threat Level</span>
                <span className="value">{result.threatLevel}</span>
              </div>
              <div className="resultRow">
                <span className="label">System Action</span>
                <span className={`value ${result.actionTaken === "Block" ? "status-danger" : result.actionTaken === "Rate Limit" ? "status-warning" : "status-safe"}`}>
                  {result.actionTaken}
                </span>
              </div>
              <div className="resultRow">
                <span className="label">AI Confidence</span>
                <span className="value">{result.confidence}</span>
              </div>
              <div className="resultRow">
                <span className="label">Rows Analyzed</span>
                <span className="value">{result.packetsAnalyzed}</span>
              </div>
            </div>
            <button
              className="action-btn secondary-btn"
              onClick={() => {
                setProgress(0);
                setStage("System Ready");
                setPage("home");
                setLogs([]);
                setJobId(null);
                if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
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
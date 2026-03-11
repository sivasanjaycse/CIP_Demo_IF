import React, { useState, useEffect, useRef } from "react";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("home");
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("System Ready");
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // LOGGER STATE
  const [logs, setLogs] = useState([]);

  // FUTURE BACKEND INTEGRATION
  // This will store the job_id returned from backend
  // const [jobId, setJobId] = useState(null);

  const intervalRef = useRef(null);
  const logConsoleRef = useRef(null);

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

  // Cleanup interval
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // AUTO SCROLL LOGGER
  useEffect(() => {
    if (logConsoleRef.current) {
      logConsoleRef.current.scrollTop =
        logConsoleRef.current.scrollHeight;
    }
  }, [logs]);

  // LOGGER FUNCTION
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const startSimulation = () => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    setProgress(0);
    setStage("Starting Analysis...");
    setLogs([]);

    /*
    ==========================================
    FUTURE BACKEND INTEGRATION
    ==========================================

    When integrating with the Python backend:

    1️⃣ Send request to backend to start the job

        POST /start-job

        Example:

        fetch("/start-job", {
          method: "POST"
        })
        .then(res => res.json())
        .then(data => {
            setJobId(data.job_id)
        })

    2️⃣ Backend will start packet capture + ML pipeline

        capture packets (10s)
        preprocessing
        primary model layer
        secondary layer
        fallback layer
        logging

    3️⃣ Frontend should periodically check job progress

        GET /job-status/{job_id}

    4️⃣ Response format example

        {
          stage: "Primary Layer Analysis...",
          progress: 56
        }

    5️⃣ Replace the simulation interval below with
       polling or websocket updates.

    ==========================================
    */

    // STARTUP LOGS WITH DELAY
    setTimeout(() => {
      addLog("System boot sequence completed");
    }, 200);

    setTimeout(() => {
      addLog("Network interface initialized");
    }, 600);

    setTimeout(() => {
      addLog("Awaiting packet capture...");
    }, 1000);

    let i = 0;

    intervalRef.current = setInterval(() => {
      const currentStage = stages[i];

      setStage(currentStage.name);
      setProgress(currentStage.progress);

      addLog(currentStage.name);

      if (currentStage.name === "Capturing Packets...") {
        addLog("Listening on network interface eth0");
      }

      if (currentStage.name === "Preprocessing the captured Packets...") {
        addLog("Extracting packet features");
      }

      if (currentStage.name === "Primary Layer Analysis...") {
        addLog("Running neural classification layer");
      }

      if (currentStage.name === "Secondary Layer Analysis...") {
        addLog("Secondary verification triggered");
      }

      if (currentStage.name === "Checking for fallback...") {
        addLog("Evaluating fallback decision rules");
      }

      if (currentStage.name === "Logging...") {
        addLog("Saving analysis to system logs");
      }

      i++;

      if (i === stages.length) {
        clearInterval(intervalRef.current);

        /*
        ==========================================
        FUTURE BACKEND INTEGRATION
        ==========================================

        After pipeline finishes, fetch result:

        GET /result/{job_id}

        Example response:

        {
          prediction: "Benign Traffic",
          confidence: "98.7%",
          packetsAnalyzed: "24842",
          threatLevel: "Low"
        }

        Replace the simulated result below with
        actual backend response.
        */

        setResult({
          prediction: "Benign Traffic",
          confidence: "98.7%",
          packetsAnalyzed: "24,842",
          threatLevel: "Low",
        });

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
            <p className="subtitle">
              Real-time network traffic analysis and threat prevention.
            </p>

            <button
              className={`action-btn primary-btn ${
                isAnalyzing ? "processing" : "pulse-anim"
              }`}
              onClick={startSimulation}
              disabled={isAnalyzing}
            >
              {isAnalyzing
                ? "Analysis in Progress..."
                : "Start Packet Capture"}
            </button>

            <div className={`progressSection ${isAnalyzing ? "active" : ""}`}>
              <div className="stage-header">
                <span className="stageText">{stage}</span>
                <span className="percent">{progress}%</span>
              </div>

              <div className="progressBar">
                <div
                  className={`progressFill ${
                    isAnalyzing ? "striped-animated" : ""
                  }`}
                  style={{ width: progress + "%" }}
                ></div>
              </div>
            </div>

            {/* LOGGER PANEL */}
            {/* FUTURE BACKEND INTEGRATION
                Backend may also stream logs using WebSockets
                Example endpoint: ws://server/log-stream
            */}
            <div className="logPanel">
              <div className="logHeader">System Logs</div>

              <div className="logConsole" ref={logConsoleRef}>
                {logs.map((log, index) => (
                  <div key={index} className="logLine">
                    {log}
                  </div>
                ))}
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

              {/* FUTURE BACKEND DATA DISPLAY
                  Replace with actual JSON fields returned by ML model
              */}

              <div className="resultRow">
                <span className="label">Status Prediction</span>
                <span className="value status-safe">
                  {result.prediction}
                </span>
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
                setLogs([]);
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
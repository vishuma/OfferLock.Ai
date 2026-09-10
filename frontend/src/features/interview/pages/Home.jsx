import React from "react";
import { useEffect, useRef, useState } from "react";
import "../styles/home.css";
import { useInterview } from "../hooks/useInterview.js";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useNavigate } from "react-router";

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 16V4m0 0 4 4m-4-4L8 8" />
      <path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4L12 3Z" />
      <path d="m19 16 .6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6L19 16Z" />
    </svg>
  );
}

function BrandIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.5 10V7.5a5.5 5.5 0 0 1 11 0V10" />
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M12 14v3" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8" />
      <path d="m17 8 4 4-4 4M21 12H9" />
    </svg>
  );
}

function Home() {
  const { loading, generateReport, reports, getAllReports } = useInterview();
  const { user, handleLogout } = useAuth();
  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const resumeInputRef = useRef();
  const navigate = useNavigate();

  const onLogout = async () => {
    await handleLogout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    getAllReports();
  }, [getAllReports]);

  const handleGenerateReport = async () => {
    try {
      const resumeFile = resumeInputRef.current?.files[0];
      const data = await generateReport({ jobDescription, selfDescription, resumeFile });

      const reportId = data?.interviewReport?._id || data?._id;

      if (reportId) {
        navigate(`/interview/${reportId}`);
      } else {
        console.error("Failed to extract report ID from response:", data);
      }
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  if (loading) {
    return (
      <main className="loading-screen">
        <h1>Loading your interview plan...</h1>
      </main>
    );
  }

  return (
    <main className="home">
      <header className="site-header">
        <a className="brand" href="/" aria-label="OfferLock.Ai home">
          <span className="brand-icon"><BrandIcon /></span>
          <span>OfferLock<span className="brand-accent">.Ai</span></span>
        </a>
        {user && (
          <button className="logout-button" onClick={onLogout} type="button">
            <LogoutIcon />
            Logout
          </button>
        )}
      </header>

      <header className="hero">
        <h1>
          Create Your Custom <span>Interview Plan</span>
        </h1>
        <p>
          Let our AI analyze the job requirements and your unique profile to
          build a winning strategy.
        </p>
      </header>

      <section className="interview-card" aria-label="Interview plan form">
        <div className="form-panel job-panel">
          <div className="panel-heading">
            <span className="heading-icon">▰</span>
            <h2>Target Job Description</h2>
          </div>

          <textarea
            onChange={(e) => setJobDescription(e.target.value)}
            id="jobDescription"
            name="jobDescription"
            placeholder="Paste the full job description here...
e.g. “Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design.”"
          />

          <span className="character-count">{jobDescription.length} / 5000 chars</span>
        </div>

        <div className="form-panel profile-panel">
          <div className="panel-heading">
            <span className="heading-icon">♟</span>
            <h2>Your Profile</h2>
          </div>

          <div className="field-group">
            <label htmlFor="resume">
              Upload Resume <span>Recommended</span>
            </label>

            <label className="upload-box" htmlFor="resume">
              <UploadIcon />
              <strong>Click to upload or drag &amp; drop</strong>
              <small>PDF or DOCX (Max 5MB)</small>
            </label>

            <input
              ref={resumeInputRef}
              id="resume"
              name="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              hidden
            />
          </div>

          <div className="divider">
            <span>or</span>
          </div>

          <div className="field-group">
            <label htmlFor="selfDescription">Quick Self-Description</label>
            <textarea
              onChange={(e) => setSelfDescription(e.target.value)}
              id="selfDescription"
              name="selfDescription"
              placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume..."
            />
          </div>

          <div className="info-message">
            <span>●</span>
            Either a Resume or a Self Description is required to generate a
            personalized plan.
          </div>
        </div>

        {reports.length > 0 && (
                <section className='recent-reports'>
                    <h2>My Recent Interview Plans</h2>
                    <ul className='reports-list'>
                        {reports.map(report => (
                            <li key={report._id} className='report-item' onClick={() => navigate(`/interview/${report._id}`)}>
                                <h3>{report.title || 'Untitled Position'}</h3>
                                <p className='report-meta'>Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                                <p className={`match-score ${report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'}`}>Match Score: {report.matchScore}%</p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

        <footer className="card-footer">
          <small>✦ Powered by Strategy Generation · Approx. 3m</small>
          <button onClick={handleGenerateReport} className="button primary-button" type="button">
            <SparkleIcon />
            Generate My Interview Strategy
          </button>
        </footer>
      </section>

      <nav className="page-links" aria-label="Footer navigation">
        <a href="/">Privacy Policy</a>
        <a href="/">Terms of Service</a>
        <a href="/">Help Center</a>
      </nav>
    </main>
  );
}

export default Home;
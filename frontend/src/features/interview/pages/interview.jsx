import React, { useEffect } from "react";
import "../styles/interview.css";
import {useInterview} from  "../hooks/useInterview.js";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router";

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

function Interview() {
  const { report, loading, getReportById,getResumePdf} = useInterview();
  const { user, handleLogout } = useAuth();
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const onLogout = async () => {
    await handleLogout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    if (interviewId && !report) {
      getReportById(interviewId);
    }
  }, [interviewId, report, getReportById]);

  if (loading || !report) {
    return <main className="loading-screen"><h1>Loading your interview plan...</h1></main>;
  }

  return (
    <main className="interview-page">
      <header className="interview-topbar">
        <a className="interview-brand" href="/" aria-label="OfferLock.Ai home">
          <span className="interview-brand-icon"><BrandIcon /></span>
          <span>OfferLock<span className="interview-brand-accent">.Ai</span></span>
        </a>
        {user && (
          <button className="interview-logout" onClick={onLogout} type="button">
            <LogoutIcon />
            Logout
          </button>
        )}
      </header>

      <header className="interview-header">
        <div>
          <span className="eyebrow">INTERVIEW PREPARATION</span>
          <h1>{report.title || "Your Interview Strategy"}</h1>
          <p>Personalized preparation plan based on your profile and target role.</p>
        </div>

        <div className="match-score">
          <strong>{report.matchScore}%</strong>
          <span>Profile Match</span>
        </div>
      </header>

      <div className="interview-layout">
        <aside className="interview-sidebar">
          <nav>
            <a className="active" href="#technical">
              Technical questions
              <span>{report.technicalQuestions.length}</span>
            </a>
            <a href="#behavioral">
              Behavioral questions
              <span>{report.behavioralQuestions.length}</span>
            </a>
            <a href="#roadmap">
              Road Map
              <span>{report.preparationPlan.length} days</span>
            </a>
          </nav>
          <button className="button primary-button download-resume-button" type="button" onClick={() => getResumePdf(report._id)}>
            <svg height={"0.8rem"} style={{ marginRight: "0.8rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.6144 17.7956 11.492 15.7854C12.2731 13.9966 13.6789 12.5726 15.4325 11.7942L17.8482 10.7219C18.6162 10.381 18.6162 9.26368 17.8482 8.92277L15.5079 7.88394C13.7092 7.08552 12.2782 5.60881 11.5105 3.75894L10.6215 1.61673C10.2916.821765 9.19319.821767 8.8633 1.61673L7.97427 3.75892C7.20657 5.60881 5.77553 7.08552 3.97685 7.88394L1.63658 8.92277C.868537 9.26368.868536 10.381 1.63658 10.7219L4.0523 11.7942C5.80589 12.5726 7.21171 13.9966 7.99275 15.7854L8.8704 17.7956C9.20776 18.5682 10.277 18.5682 10.6144 17.7956ZM19.4014 22.6899 19.6482 22.1242C20.0882 21.1156 20.8807 20.3125 21.8695 19.8732L22.6299 19.5353C23.0412 19.3526 23.0412 18.7549 22.6299 18.5722L21.9121 18.2532C20.8978 17.8026 20.0911 16.9698 19.6586 15.9269L19.4052 15.3156C19.2285 14.8896 18.6395 14.8896 18.4628 15.3156L18.2094 15.9269C17.777 16.9698 16.9703 17.8026 15.956 18.2532L15.2381 18.5722C14.8269 18.7549 14.8269 19.3526 15.2381 19.5353L15.9985 19.8732C16.9874 20.3125 17.7798 21.1156 18.2198 22.1242L18.4667 22.6899C18.6473 23.104 19.2207 23.104 19.4014 22.6899Z"></path></svg>
            Download Resume
            </button>
        </aside>

        <section className="interview-content">
          <section className="content-section" id="technical">
            <div className="section-heading">
              <div>
                <span className="section-kicker">01 / TECHNICAL</span>
                <h2>Technical Questions</h2>
              </div>
              <span className="section-count">
                {report.technicalQuestions.length} questions
              </span>
            </div>

            {report.technicalQuestions.map((item, index) => (
              <article className="question-card" key={item.question}>
                <span className="question-number">0{index + 1}</span>
                <div>
                  <h3>{item.question}</h3>
                  <p className="intention">
                    <b>What they assess:</b> {item.intention}
                  </p>
                  <div className="answer-box">
                    <span>Suggested answer</span>
                    <p>{item.answer}</p>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <section className="content-section" id="behavioral">
            <div className="section-heading">
              <div>
                <span className="section-kicker">02 / BEHAVIORAL</span>
                <h2>Behavioral Questions</h2>
              </div>
              <span className="section-count">
                {report.behavioralQuestions.length} questions
              </span>
            </div>

            {report.behavioralQuestions.map((item, index) => (
              <article className="question-card" key={item.question}>
                <span className="question-number">0{index + 1}</span>
                <div>
                  <h3>{item.question}</h3>
                  <p className="intention">
                    <b>What they assess:</b> {item.intention}
                  </p>
                  <div className="answer-box">
                    <span>Suggested answer</span>
                    <p>{item.answer}</p>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <section className="content-section roadmap-section" id="roadmap">
            <div className="section-heading">
              <div>
                <span className="section-kicker">03 / PREPARATION</span>
                <h2>Your Road Map</h2>
              </div>
            </div>

            <div className="roadmap">
              {report.preparationPlan.map((plan) => (
                <article className="roadmap-card" key={plan.day}>
                  <span className="day-badge">DAY {plan.day}</span>
                  <h3>{plan.focus}</h3>
                  <ul>
                    {plan.tasks.map((task) => (
                      <li key={task}>{task}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        </section>

        <aside className="skills-panel">
          <div className="skills-heading">
            <span className="section-kicker">ANALYSIS</span>
            <h2>Skill Gaps</h2>
          </div>

          <p className="skills-description">
            Focus on these areas to improve your interview readiness.
          </p>

          <div className="skill-list">
            {report.skillGaps.map((item) => (
              <div className="skill-item" key={item.skill}>
                <span>{item.skill}</span>
                <small className={`severity ${item.severity}`}>
                  {item.severity}
                </small>
              </div>
            ))}
          </div>

          <div className="score-card">
            <span>Overall readiness</span>
            <strong>{report.matchScore}%</strong>
            <div className="score-track">
              <i style={{ width: `${report.matchScore}%` }} />
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default Interview;

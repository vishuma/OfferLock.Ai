import React from "react";
import Register from "./features/auth/pages/Register.jsx";
import Login from "./features/auth/pages/Login.jsx";
import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./features/auth/auth.context.jsx";
import Protected from "./features/auth/components/Protected.jsx";
import Home from "./features/interview/pages/Home.jsx";
import Interview from "./features/interview/pages/interview.jsx";
import { InterviewProvider } from "./features/interview/interview.context.jsx";

function App() {
  return (
    <AuthProvider>
      <InterviewProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <Protected>
              <Home />
            </Protected>
          }
        />
        <Route
          path="/interview/:interviewId"
          element={
            <Protected>
              <Interview />
            </Protected>
          }
        />
      </Routes>
      </InterviewProvider>
    </AuthProvider>
  );
}

export default App;

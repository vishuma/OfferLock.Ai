import {
  genrerateInterviewReport,
  getInterviewById,
  getAllInterviews,
  generateResumePdf,
} from '../services/interview.api';
import { useCallback, useContext } from 'react';
import { InterviewContext } from '../interview.context.jsx';

export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error('useInterview must be used within an InterviewProvider');
  }

  const { loading, setLoading, report, setReport, reports, setReports } = context;

  const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
    setLoading(true);
    try {
      const response = await genrerateInterviewReport({ jobDescription, selfDescription, resumeFile });
      setReport(response.interviewReport);
      return response.interviewReport;
    } catch (error) {
      console.error('Error generating interview report:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getReportById = useCallback(async (interviewId) => {
    setLoading(true);
    try {
      const response = await getInterviewById(interviewId);
      setReport(response.interviewReport);
      return response.interviewReport;
    } catch (error) {
      console.error('Error fetching interview report:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setReport]);

  const getAllReports = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllInterviews();
      setReports(response.interviewReports);
      return response.interviewReports;
    } catch (error) {
      console.error('Error fetching interview reports:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setReports]);

  const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        let response = null
        try {
            response = await generateResumePdf(interviewReportId)
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        }
        catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

  return { loading, report, reports, generateReport, getReportById, getAllReports, getResumePdf };
};
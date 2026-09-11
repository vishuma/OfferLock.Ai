import * as pdfParseModule from 'pdf-parse';
import { generateInterviewReport, generateResumePdf } from '../services/ai.service.js';
import { interviewReportModel } from "../models/interviewReport.model.js";

const pdfParse = pdfParseModule.default || pdfParseModule;

export const interviewReportGentrator = async (req, res) => {
    try {
        const { selfDescription, jobDescription } = req.body;

        if (!jobDescription) {
            return res.status(400).json({ message: "Job description is required." });
        }

        if (!req.file?.buffer && !selfDescription?.trim()) {
            return res.status(400).json({
                message: "Upload a PDF resume or provide a self-description."
            });
        }

        let extractedResumeText = "";

        if (req.file?.buffer) {
            const parser = new pdfParse.PDFParse({ data: req.file.buffer });
            const resumeContent = await parser.getText();
            await parser.destroy();
            extractedResumeText = resumeContent?.text || "";
        }

        const interviewReportAi = await generateInterviewReport({
            resume: extractedResumeText,
            selfDescription,
            jobDescription
        });

        const title = interviewReportAi.title || interviewReportAi.appliedPosition || req.body.title || "Interview Report";
        const matchScore = typeof interviewReportAi.matchScore === 'number' 
            ? interviewReportAi.matchScore 
            : (interviewReportAi.overallMatchScore || 0);

        const technicalQuestions = interviewReportAi.technicalQuestions || (interviewReportAi.interviewQuestions || []).map(q => ({
            question: q,
            intention: "Assess technical depth",
            answer: "Key concept evaluation"
        }));

        const skillGaps = interviewReportAi.skillGaps || (interviewReportAi.areasToProbeInInterview || []).map(gap => ({
            skill: gap.split(":")[0] || "General Topic",
            severity: "medium"
        }));

        const interviewReport = await interviewReportModel.create({
            user: req.user?.id || req.user?._id,
            resume: extractedResumeText,
            selfDescription,
            jobDescription,
            title,
            matchScore,
            technicalQuestions,
            behavioralQuestions: interviewReportAi.behavioralQuestions || [],
            skillGaps,
            preparationPlan: interviewReportAi.preparationPlan || []
        });

        return res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        });

    } catch (error) {
        console.error("Error in interviewReportGentrator:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Validation Error",
                errors: error.errors
            });
        }

        if (error.name === "ZodError") {
            return res.status(502).json({
                message: "The AI returned an invalid interview report. Please try again.",
                error: error.message
            });
        }

        if (error?.status === 429 || /429|quota|exceeded your current/i.test(error?.message || "")) {
            return res.status(429).json({
                message: "The AI service quota has been reached. Please try again later or update the Gemini API plan."
            });
        }

        if (error.name === "InvalidPDFException" || error.message?.includes("PDF")) {
            return res.status(400).json({
                message: "The uploaded file could not be read. Please upload a valid PDF resume."
            });
        }

        const isGeminiError = error?.message?.includes("GEMINI") ||
            error?.cause?.code === "UND_ERR_CONNECT_TIMEOUT" ||
            error?.name?.includes("Google") ||
            error?.name?.includes("GenAI");

        return res.status(isGeminiError ? 502 : 500).json({
            message: isGeminiError
                ? "The interview AI service is unavailable. Please try again."
                : "An internal server error occurred.",
            error: error.message
        });
    }
};

export const getInterviewReportById=async(req,res)=>{
    const{interviewId}=req.params;
    const interviewReport=await interviewReportModel.findById(interviewId);
    if(!interviewReport){
        return res.status(404).json({message:"Interview report not found."});
    }
    return res.status(200).json({message:"Interview report fetched successfully.",interviewReport});
}

export const getAllInterviewReports=async(req,res)=>{
    const interviewReports=await interviewReportModel.find({user:req.user?.id||req.user?._id}).sort({createdAt:-1}).select("-resume -selfDescription -jobDescription -v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan");
    return res.status(200).json({message:"All interview reports fetched successfully.",interviewReports});
}

export const generateResumePdfController = async (req, res) => {
    try {
        const { interviewReportId } = req.params;
        const interviewReport = await interviewReportModel.findById(interviewReportId);

        if (!interviewReport) {
            return res.status(404).json({ message: "Interview report not found." });
        }

        const { resume, jobDescription, selfDescription } = interviewReport;
        const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription });

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        });

        return res.send(pdfBuffer);
    } catch (error) {
        console.error("Error generating resume PDF:", error);

        if (error?.status === 429 || /429|quota|exceeded your current/i.test(error?.message || "")) {
            return res.status(429).json({
                message: "The AI service quota has been reached. Please try again later or update the Gemini API plan."
            });
        }

        return res.status(503).json({
            message: "Resume generation is temporarily unavailable. Please try again.",
            error: process.env.NODE_ENV === "production"
                ? "PDF generation failed on the server. Check the backend logs."
                : error.message
        });
    }
};
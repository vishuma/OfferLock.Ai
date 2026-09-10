import { GoogleGenAI } from "@google/genai";
import puppeteer from "puppeteer";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import 'dotenv/config';

if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured. Add it to backend/.env.');
}

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
        timeout: 60000,
    },
});

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const retryDelays = [0, 1500, 3000];

const isTemporaryError = (error) => {
    const message = String(error?.message || error);
    return /429|500|502|503|504|UNAVAILABLE|overloaded|high demand/i.test(message);
};

const generateContentWithRetry = async (request) => {
    for (const delay of retryDelays) {
        if (delay > 0) {
            await sleep(delay);
        }

        try {
            return await ai.models.generateContent(request);
        } catch (error) {
            if (!isTemporaryError(error) || delay === retryDelays.at(-1)) {
                throw error;
            }
        }
    }
};

const questionSchema = z.object({
    question: z.string(),
    intention: z.string(),
    answer: z.string()
});

const interviewReportSchema = z.object({
    title: z.string().describe("Job title for the interview report"),
    matchScore: z.number().int().min(0).max(100),
    technicalQuestions: z.array(questionSchema),
    behavioralQuestions: z.array(questionSchema),
    skillGaps: z.array(z.object({
        skill: z.string(),
        severity: z.enum(["low", "medium", "high"])
    })),
    preparationPlan: z.array(z.object({
        day: z.number().int(),
        focus: z.string(),
        tasks: z.array(z.string())
    }))
});

export const generateInterviewReport = async ({ resume, selfDescription, jobDescription }) => {
    const prompt = `Generate an interview report for a candidate with the following details:
Resume: ${resume || "Not provided"}
Self Description: ${selfDescription || "Not provided"}
Job Description: ${jobDescription || "Not provided"}`;

    const response = await generateContentWithRetry({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema)
        }
    });

    return interviewReportSchema.parse(JSON.parse(response.text));
};

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({ headless: true });

    try {
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: "networkidle0" });

        const pdfData = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "20mm",
                bottom: "20mm",
                left: "15mm",
                right: "15mm"
            }
        });

        return Buffer.from(pdfData);
    } finally {
        await browser.close();
    }
}

export const generateResumePdf = async ({ resume, selfDescription, jobDescription }) => {
    const resumePdfSchema = z.object({
        html: z.string().describe("HTML content of the resume that can be converted to PDF")
    });

    const prompt = `Generate a professional, ATS-friendly resume for a candidate with the following details:
Resume: ${resume || "Not provided"}
Self Description: ${selfDescription || "Not provided"}
Job Description: ${jobDescription}

Return a JSON object with exactly one field, "html", containing a complete HTML resume.
The resume should be tailored to the job description, highlight relevant strengths and experience, sound human-written, and be simple and professional.
Keep it concise enough for 1-2 A4 pages. Use semantic headings, normal text, and simple CSS that renders reliably in a PDF.
Do not include markdown fences or explanatory text outside the HTML value.`;

    const response = await generateContentWithRetry({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema)
        }
    });

    const parsedResponse = resumePdfSchema.parse(JSON.parse(response.text));
    return generatePdfFromHtml(parsedResponse.html);

};



import { GoogleGenAI } from "@google/genai";
import puppeteer from "puppeteer";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import "dotenv/config";

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY
});

const questionSchema = z.object({
    question: z.string(),
    intention: z.string(),
    answer: z.string()
});

const interviewReportSchema = z.object({
    matchScore: z.number(),
    technicalQuestions: z.array(questionSchema),
    behavioralQuestions: z.array(questionSchema),
    skillGaps: z.array(z.object({
        skill: z.string(),
        severity: z.enum(["low", "medium", "high"])
    })),
    preparationPlan: z.array(z.object({
        day: z.number(),
        focus: z.string(),
        tasks: z.array(z.string())
    })),
    title: z.string(),
    resumeHtml: z.string()
});

export async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        Also include a field "resumeHtml" containing a simple, professional, ATS-friendly HTML resume tailored to the job description.
`;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema)
        }
    });

    return interviewReportSchema.parse(JSON.parse(response.text));
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    try {
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });

        return await page.pdf({
            format: "A4",
            margin: {
                top: "20mm",
                bottom: "20mm",
                left: "15mm",
                right: "15mm"
            }
        });
    } finally {
        await browser.close();
    }
}

export async function generateResumePdf({ html }) {
    return generatePdfFromHtml(html);
}

import { GoogleGenAI } from "@google/genai";
import puppeteer from "puppeteer";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import 'dotenv/config';

const googleGenAiApiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;

if (!googleGenAiApiKey) {
    throw new Error('GOOGLE_GENAI_API_KEY or GEMINI_API_KEY is not configured. Add one to backend/.env.');
}

const ai = new GoogleGenAI({
    apiKey: googleGenAiApiKey,
    httpOptions: {
        timeout: 30000
    }
});

const retryDelays = [0, 1500, 3000];

const isRetryableError = (error) => {
    const message = String(error?.message || error);
    return error?.status === 429 || error?.code === 429 || /429|500|502|503|504|UNAVAILABLE|overloaded|high demand/i.test(message);
};

const generateContentWithRetry = async (request) => {
    for (let attempt = 0; attempt < retryDelays.length; attempt += 1) {
        if (retryDelays[attempt] > 0) {
            await new Promise((resolve) => setTimeout(resolve, retryDelays[attempt]));
        }

        try {
            return await ai.models.generateContent(request);
        } catch (error) {
            const isLastAttempt = attempt === retryDelays.length - 1;
            if (isLastAttempt || !isRetryableError(error)) {
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
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}
`;

    const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema)
        }
    });

    return interviewReportSchema.parse(JSON.parse(response.text));
};

async function generatePdfFromHtml(htmlContent) {
    const launchOptions = {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
    };

    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
        launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }

    const browser = await puppeteer.launch(launchOptions);

    try {
        const page = await browser.newPage();
        await page.setContent(htmlContent, {
            waitUntil: "domcontentloaded",
            timeout: 30000
        });

        const pdfBuffer = await page.pdf({
            format: "A4", margin: {
                top: "20mm",
                bottom: "20mm",
                left: "15mm",
                right: "15mm"
            }
        });

        return Buffer.from(pdfBuffer);
    } finally {
        await browser.close();
    }
}

const createFallbackResumeHtml = ({ resume, selfDescription, jobDescription }) => `
<!doctype html>
<html>
<head><meta charset="utf-8"><style>
body { font-family: Arial, sans-serif; color: #222; line-height: 1.45; }
h1 { font-size: 24px; margin-bottom: 4px; }
h2 { border-bottom: 1px solid #999; font-size: 14px; margin-top: 20px; padding-bottom: 4px; }
p { white-space: pre-wrap; }
</style></head>
<body>
<h1>Professional Resume</h1>
<p>${selfDescription || "Candidate profile"}</p>
<h2>Resume</h2>
<p>${resume || "Resume details not provided."}</p>
<h2>Target Job</h2>
<p>${jobDescription || "Target job not provided."}</p>
</body>
</html>`;

export const generateResumePdf = async ({ resume, selfDescription, jobDescription }) => {
    const resumePdfSchema = z.object({
        html: z.string().describe("HTML content of the resume that can be converted to PDF")
    });

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `;

    let response;

    try {
        response = await generateContentWithRetry({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: zodToJsonSchema(resumePdfSchema),
            }
        });
    } catch (error) {
        console.error("Resume AI generation failed; creating a profile PDF instead:", error.message);
        return generatePdfFromHtml(createFallbackResumeHtml({ resume, selfDescription, jobDescription }));
    }

    try {
        const parsedResponse = resumePdfSchema.parse(JSON.parse(response.text));
        return await generatePdfFromHtml(parsedResponse.html);
    } catch (error) {
        console.error("Generated resume HTML could not be converted; creating a profile PDF instead:", error.message);
        return generatePdfFromHtml(createFallbackResumeHtml({ resume, selfDescription, jobDescription }));
    }

};



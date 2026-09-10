import express from 'express'
import { authUser } from '../middlewares/auth.middleware.js';
import { interviewReportGentrator,getInterviewReportById,getAllInterviewReports, generateResumePdfController } from '../controllers/interview.controller.js';
import { upload } from '../middlewares/file.middleware.js';
const router=express.Router();

router.post("/",authUser,upload.single('resume'),interviewReportGentrator)
router.get("/report/:interviewId",authUser,getInterviewReportById);
router.get("/",authUser,getAllInterviewReports);
router.post("/resume/pdf/:interviewReportId",authUser,generateResumePdfController);
export default router;
import express from "express";
import InterviewController from "./interview.controller.js";
import {validateAddInterview,validateAddStudent,interviewDateCheck,alreadyExistingInterview,validateModifyInterviewDate, checkCurrentInterviewDate, validateAddInterviewDate} from "../../middlewares/interview.validate.js"

const interviewRouter=express.Router();
const interviewController=new InterviewController();

interviewRouter.get("/",(req,res,next)=>{
    interviewController.getAllInterviews(req,res,next)});

interviewRouter.get("/add",(req,res,next)=>{
    interviewController.getAddInterview(req,res,next)});

interviewRouter.post("/add",validateAddInterview,validateAddInterviewDate,(req,res,next)=>{
    interviewController.addInterview(req,res,next)});

interviewRouter.get("/addStudent/:interviewID",interviewDateCheck,(req,res,next)=>{
    interviewController.getAddStudent(req,res,next)});

interviewRouter.post("/addStudent/:interviewID",validateAddStudent,alreadyExistingInterview,(req,res,next)=>{
    interviewController.addStudent(req,res,next)});

interviewRouter.get("/viewStudent/:interviewID",(req,res,next)=>{
    interviewController.viewStudent(req,res,next)});

interviewRouter.get("/viewStudent/:interviewID/modifyStudent/:studentID",(req,res,next)=>{
    interviewController.getModifyStudent(req,res,next)});

interviewRouter.post("/viewStudent/:interviewID/modifyStudent/:studentID",validateAddStudent,(req,res,next)=>{
    interviewController.modifyStudent(req,res,next)});

interviewRouter.get("/viewStudent/:interviewID/deleteStudent/:studentID",(req,res,next)=>{
    interviewController.getDeleteInterviewStudent(req,res,next)});

interviewRouter.post("/viewStudent/:interviewID/deleteStudent/:studentID",(req,res,next)=>{
    interviewController.deleteInterviewStudent(req,res,next)});

interviewRouter.get("/modify/:interviewID",checkCurrentInterviewDate,(req,res,next)=>{
    interviewController.getModifyInterview(req,res,next)});

interviewRouter.post("/modify/:interviewID",validateModifyInterviewDate,(req,res,next)=>{
    interviewController.modifyInterview(req,res,next)});

interviewRouter.get("/delete/:interviewID",(req,res,next)=>{
    interviewController.getDeleteInterview(req,res,next)});

interviewRouter.post("/delete/:interviewID",(req,res,next)=>{
    interviewController.deleteInterview(req,res,next)});


export default interviewRouter;
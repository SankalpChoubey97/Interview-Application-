import express from "express";
import StudentController from "./student.controller.js";
import { loggedIn } from "../../middlewares/loggedIn.validate.js";
import { studentFieldsValidate,studentModifyFieldsValidate } from "../../middlewares/student.validate.js";

const studentRouter=express.Router();
const studentController=new StudentController();

studentRouter.get("/",(req,res,next)=>{
    studentController.getStudents(req,res,next)});

studentRouter.get("/addStudent",(req,res,next)=>{
    studentController.getAddStudent(req,res,next)});

studentRouter.post("/addStudent",studentFieldsValidate,(req,res,next)=>{
    studentController.addStudent(req,res,next)});

studentRouter.get("/view_interview/:studentID",(req,res,next)=>{
    studentController.viewInterview(req,res,next)
})

studentRouter.get("/modify/:studentID",(req,res,next)=>{
    studentController.getModifyStudent(req,res,next)
});
    
studentRouter.post("/modify/:studentID",studentModifyFieldsValidate,(req,res,next)=>{
    studentController.modifyStudent(req,res,next)
});

studentRouter.get("/delete/:studentID",(req,res,next)=>{
    studentController.getDelete(req,res,next)
});

studentRouter.post("/delete/:studentID",(req,res,next)=>{
    studentController.deleteStudent(req,res,next)
});

export default studentRouter;
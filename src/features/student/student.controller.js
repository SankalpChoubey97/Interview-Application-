import { StudentModel } from "./student.model.js";
import StudentRepository from "./student.repository.js";

export default class StudentController{
    constructor(){
        this.studentRepository=new StudentRepository();
    }

    async getStudents(req,res,next){
        try{
            const students=await this.studentRepository.getStudent();
            return res.status(200).render("students_details",{students});
        }catch(err){
            console.log("Inside get student controller Error");
            next(err);
        }
    }

    getAddStudent(req,res,next){
        try{
            const student=null;
            return res.render("add_student",{student});
        }catch(err){
            console.log("Inside get add student controller error");
            next(err);
        }
    }

    async addStudent(req,res,next){
        try{
            // console.log(req.body);
            const newStudent=StudentModel(req);
            console.log(newStudent);
            await this.studentRepository.addStudent(newStudent,req);
            
            return res.status(200).json({message:'success'});
        }catch(err){
            console.log("Inside add student controller Error");
            next(err);
        }
    }

    async viewInterview(req,res,next){
        try{
            const studentID=req.params.studentID;
            const interviews=await this.studentRepository.viewInterview(studentID);
            return res.render("view_interviews",{interviews,studentID});
        }catch(err){

        }
    }

    async getModifyStudent(req,res,next){
        try{
            const id=req.params.studentID;
            const student=await this.studentRepository.getStudentById(id);

            return res.render("modify_student",{student});
        }catch(err){
            console.log("Inside get student by id controller error");
            next(err);
        }
    }

    async modifyStudent(req,res,next){
        try{
            let student=StudentModel(req);
            const studentID=req.params.studentID;

            const modify=await this.studentRepository.modifyStudent(student,studentID);

            if(modify){
                return res.json({message:"success"});
            }

            student._id = studentID; // Append student ID
            const errors=[];
            errors.push({ msg: "No modifications made" });
            return res.json({message:"failure",error:errors[0]});  
        }catch(err){
            console.log("Inside modify student controller error");
            next(err);
        }
    }

    getDelete(req,res,next){
        const id=req.params.studentID;
        return res.render("delete_confirmation",{id});
    }

    async deleteStudent(req,res,next){
        try{
            const deleteID=req.params.studentID;
            console.log(deleteID);
            await this.studentRepository.deleteStudent(deleteID);

            return res.json({message:"success"});
        }catch(err){
            console.log("Inside delete student controller error");
            next(err);
        }
    }
}

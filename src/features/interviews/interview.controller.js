import InterviewRepository from "./interview.repository.js";
import StudentRepository from "../student/student.repository.js";

export default class InterviewController{
    constructor(){
        this.interviewRepository=new InterviewRepository();
        this.studentRepository=new StudentRepository();
    }

    async getAllInterviews(req,res,next){
        try{
            const interviews=await this.interviewRepository.getAllInterviews();
            const error = req.query.error || null;
            return res.render("interviews",{interviews,error});
        }catch(err){
            console.log("inside get all interview controller error");
            next(err);
        }
    }
    

    getAddInterview(req,res,next){
        return res.render("add_interview");
    }

    async addInterview(req,res,next){
        try{
            const {company,location,date}=req.body;
            const interview={
                company,
                location,
                date
            };

            await this.interviewRepository.addInterview(interview);
            console.log("sending response");
            return res.json({
                message:"success"
            });

        }catch(err){
            console.log("Inside add interview controller");
            next(err);
        }
    }

    async getAddStudent(req,res,next){
        try{
            const interviewID=req.params.interviewID;
            const error = req.query.error || null;
            const students=await this.studentRepository.getStudent();
            return res.render("add_student_to_interview",{interviewID,students,error});
        }catch(err){
            console.log("Inside get add student interview controller");
            next(err);
        }
    }

    async addStudent(req,res,next){
        try{
            const interviewID=req.params.interviewID;
            const {studentID,status}=req.body;
            // Call the repository function to add the student
            await this.interviewRepository.addStudent(interviewID, studentID, status);

            // Send a success response
            return res.json({ message: "success" });
        }catch(err){
            console.log("Inside add student controller error");
            next(err);
        }
    }

    async viewStudent(req,res,next){
        try{
            const interviewID=req.params.interviewID;
            let error=null;
            let interview=await this.interviewRepository.getStudent(interviewID);
            if(interview==false){
                error="No interviews exist for this job";
                interview={
                    _id: interviewID.toString()
                }
            }
            return res.render("view_students_interview",{interview,error});
            
        }catch(err){
            console.log("Inside view student controller error");
            next(err);
        }
    }

    async getModifyStudent(req,res,next){
        try{
            const interviewID=req.params.interviewID;
            const studentID=req.params.studentID;
            const interview=await this.interviewRepository.getModifyInterview(interviewID,studentID);
            return res.render("modify_student_interview.ejs",{interview});
        }catch(err){
            console.log("Inside get modify student controller error");
            next(err);
        }
    }

    async modifyStudent(req, res, next) {
        try {
            const { status } = req.body;
            const { interviewID, studentID } = req.params;
            await this.interviewRepository.modifyStudent(interviewID, studentID, status);
            
            // Ensure interviewID is correctly included in the URL
            return res.status(200).json({
                message:"success"
            })
        } catch (err) {
            console.log("Inside modify student controller error");
            next(err);
        }
    }

    getDeleteInterviewStudent(req,res,next){
        const {interviewID,studentID}=req.params;
        return res.render("delete_student_interview",{interviewID,studentID});
    }

    async deleteInterviewStudent(req,res,next){
        try{
            const {interviewID,studentID}=req.params;
            await this.interviewRepository.deleteInterviewStudent(interviewID,studentID);
            return res.json({message:"success"});
        }catch(err){
            console.log("Inside delete Interview student controller error");
            next(err);
        }
    }

    async getModifyInterview(req,res,next){
        try{
            const {interviewID}=req.params;
            const interview=await this.interviewRepository.getInterviews(interviewID);
            return res.render("modify_interview",{interview});
        }catch(err){
            console.log("Inside get modify Interview student controller error");
            next(err);
        }
    }

    async modifyInterview(req,res,next){
        try{
            const interviewID=req.params.interviewID;
            const {location,date}=req.body;
            await this.interviewRepository.modifyInterview(interviewID,location,date);
            return res.status(200).json({message:"success"});
        }catch(err){
            console.log("Inside modify Interview student controller error");
            next(err);
        }
    }

    getDeleteInterview(req,res,next){
        const interviewID=req.params.interviewID;
        return res.render("delete_interview",{interviewID});
    }

    async deleteInterview(req,res,next){
        try{
            const interviewID=req.params.interviewID;
            await this.interviewRepository.deleteInterview(interviewID);
            return res.json({message:"success"});
        }catch(err){
            console.log("inside delete interview controller error");
            next();
        }
    }
     
}
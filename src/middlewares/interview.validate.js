import { ObjectId } from "mongodb";
import { getDB } from "../config/mongodb.js";
import { ApplicationError } from "../error-handler/applicationError.js";

async function DateFunction(interviewID) {
    try {
        const db = getDB();
        const interviewCollection = db.collection("interviews");

        // Retrieve the interview by its ID
        const interview = await interviewCollection.findOne({ _id: new ObjectId(interviewID) });

        if (!interview) {
            throw new ApplicationError("Interview not found", 404);
        }

        // Use the interview date directly from the collection
        const interviewDate = interview.date; // Assuming format 'YYYY-MM-DD'

        // Split the date string into year, month, and day, and convert to integers
        const [interviewYear, interviewMonth, interviewDay] = interviewDate.split('-').map(Number);

        // Get today's date in the form of day, month, and year
        const today = new Date();
        const todayDay = today.getDate();
        const todayMonth = today.getMonth() + 1; // Months are zero-indexed, so add 1
        const todayYear = today.getFullYear();

        // Check if the interview date is in the past
        if (
            interviewYear < todayYear ||
            (interviewYear === todayYear && interviewMonth < todayMonth) ||
            (interviewYear === todayYear && interviewMonth === todayMonth && interviewDay < todayDay)
        ){
            return true;
        }

        return false;
    } catch (err) {
        throw new ApplicationError("Database issue", 404);
    }
}

async function dateCheck(date){
    // Split the date string into year, month, and day, and convert to integers
    const [interviewYear, interviewMonth, interviewDay] = date.split('-').map(Number);

    // Get today's date in the form of day, month, and year
    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = today.getMonth() + 1; // Months are zero-indexed, so add 1
    const todayYear = today.getFullYear();

    // Check if the interview date is in the past
    if (
        interviewYear < todayYear ||
        (interviewYear === todayYear && interviewMonth < todayMonth) ||
        (interviewYear === todayYear && interviewMonth === todayMonth && interviewDay <= todayDay)
    ){
       return true; 
    }

    return false;
}

export const validateAddInterview = async (req, res, next) => {
    try {
        const { company, location, date } = req.body;

        const db = getDB();
        const interviewCollection = db.collection("interviews");

        // Check if an interview with the same company, location, and date already exists
        const existingInterview = await interviewCollection.findOne({
            company: company,
            location: location,
            date: date
        });

        if (existingInterview) {
            console.log("sending response");
            // If a matching interview is found, send a failed response
            return res.json({
                message: "failure",
                error: "An interview with the same company, location, and date already exists."
            });
        }

        // If no matching interview is found, proceed to the next middleware or handler
        next();
    } catch (err) {
        throw new ApplicationError("Database issue", 404);
    }
}

export const validateAddInterviewDate = async(req,res,next)=>{
    try{
        const {date}=req.body;

        const result=await dateCheck(date);
        if(result){
            console.log("sending response");
            return res.json({message: "failure",error: "Date can't be set to past day or today"});
        }

        console.log("validateAddInterviewDate complete");
        next();
    }catch(err){
        throw new ApplicationError("Database issue", 404);
    }
    
}


export const interviewDateCheck = async (req, res, next) => {
    try {
        const interviewID = req.params.interviewID;

        const result=await DateFunction(interviewID);

        if(result){
            console.log("redirection");
            // Redirect to /api/interview with an error message
            return res.redirect(303, '/api/interview?error=can\'t set interview for old date');
        }

        // Pass control to the next middleware function
        next();
    } catch (err) {
        next(new ApplicationError("Database issue", 500));
    }
};

export const alreadyExistingInterview = async (req, res, next) => {
    try {
        const { studentID } = req.body;
        const interviewID = req.params.interviewID;

        const db = getDB();
        const studentCollection = db.collection("students");

        // Find the student by ID
        const student = await studentCollection.findOne({ _id: new ObjectId(studentID) });

        if (!student) {
            throw new ApplicationError("Student not found", 404);
        }

        console.log(typeof student.interviews);


        // Convert the interviewID to ObjectId
        const interviewObjectId = new ObjectId(interviewID);

        // Check if the student's interviews array contains the interviewID
        let interviewExists = false;
        if (typeof student.interviews === 'undefined'){
            console.log("Interview undefined");
            next();
            return;
        }

        for (let interview of student.interviews) {
            if (interview.equals(interviewObjectId)) {
                interviewExists = true;
                break;
            }
        }


        if (interviewExists) {
            return res.json({ 
                message: "failure", 
                error: "Interview for this student has already been set, please select some other student"
            });
        }

        // Proceed to the next middleware if no duplicate interview is found
        next();

    } catch (err) {
        console.error("Error in alreadyExistingInterview middleware:", err);
        next(new ApplicationError("Database issue", 500));
    }
};

export const validateAddStudent=async(req,res,next)=>{
    try{
        const{status}=req.body;
        const interviewID=req.params.interviewID;

        console.log(req.body);

        if(status!='pending'){

            const db = getDB();
            const interviewCollection = db.collection("interviews");

            // Retrieve the interview by its ID
            const interview = await interviewCollection.findOne({ _id: new ObjectId(interviewID) });

            if (!interview) {
                throw new ApplicationError("Interview not found", 404);
            }

            // Use the interview date directly from the collection
            const interviewDate = interview.date; // Assuming format 'YYYY-MM-DD'

            // Split the date string into year, month, and day, and convert to integers
            const [interviewYear, interviewMonth, interviewDay] = interviewDate.split('-').map(Number);

            // Get today's date in the form of day, month, and year
            const today = new Date();
            const todayDay = today.getDate();
            const todayMonth = today.getMonth() + 1; // Months are zero-indexed, so add 1
            const todayYear = today.getFullYear();

            // Check if the interview date is in the past
            if (
                interviewYear > todayYear ||
                (interviewYear === todayYear && interviewMonth > todayMonth) ||
                (interviewYear === todayYear && interviewMonth === todayMonth && interviewDay > todayDay)
            ) {
                console.log("redirection");
                // Redirect to /api/interview with an error message
                return res.json({ 
                    message: "failure", 
                    error: "For future interviews, status needs to be pending",
                });
            }
        }

        next();
        
    }catch(err){
        throw new ApplicationError("Database issue", 404);
    }
}

export const validateModifyInterviewDate = async (req, res, next) => {
    try {
        const {date}=req.body;
        const result=await dateCheck(date);

        if(result)
        {
            console.log("redirection");
            // Redirect to /api/interview with an error message
            return res.status(400).json({ 
                message: "failure", 
                error: "Interview can't be modified to today's date, or any past dates",
            });
        }

        next();
    } catch (err) {
        throw new ApplicationError("Database issue", 404);
    }
};

export const checkCurrentInterviewDate= async (req, res, next) => {
    try{
        const interviewID=req.params.interviewID;

        const result=await DateFunction(interviewID);
        if(result){
            res.redirect("http://localhost:3200/api/interview?error=can't modify this interview as it is already completed");
        }
        next();
    }catch(err){
        throw new ApplicationError("Database issue", 404);
    }
}





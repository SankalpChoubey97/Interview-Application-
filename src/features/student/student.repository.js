import { getDB } from "../../config/mongodb.js";
import { ApplicationError } from "../../error-handler/applicationError.js";
import { ObjectId } from "mongodb";

export default class StudentRepository {
    // Helper function to convert ObjectId fields to strings
    convertObjectIdToString(doc) {
        if (doc._id instanceof ObjectId) {
            doc._id = doc._id.toString();
        }
        if (doc.interviews && Array.isArray(doc.interviews)) {
            doc.interviews = doc.interviews.map(id => id.toString());
        }
        return doc;
    }
    
    async getStudent(){
        try{
            const db = getDB();
            const studentCollection = db.collection("students");

            const students = await studentCollection.find({}).toArray();

            // Convert ObjectId fields to string
            const formattedStudents = students.map(this.convertObjectIdToString);

            return formattedStudents;
        }catch(err){
            throw new ApplicationError("Database issue", 404);
        }
    }
    async addStudent(newStudent, req) {
        try {
            const db = getDB();
            const studentCollection = db.collection("students");

            // Add newStudent to the students collection
            await studentCollection.insertOne(newStudent);
        } catch (err) {
            throw new ApplicationError("Database issue", 404);
        }
    }

    async getStudentById(id){
        try{
            const db = getDB();
            const studentCollection = db.collection("students");

            // Ensure the ID is a valid ObjectId
            if (!ObjectId.isValid(id)) {
                console.log("invalid object ID");
                throw new ApplicationError("Invalid student ID", 400);
            }

            // Find the student by ID
            const student = await studentCollection.findOne({ _id: new ObjectId(id) });
            const formatted_student = this.convertObjectIdToString(student);

            return formatted_student;

        }catch(err){
            throw new ApplicationError("Database issue", 404);
        }
    }

    async viewInterview(studentID) {
        try {
            const db = getDB();
            const studentCollection = db.collection("students");
            const interviewCollection = db.collection("interviews");
    
            // Get the student by studentID
            const student = await studentCollection.findOne({ _id: new ObjectId(studentID) });
    
            // If student or student.interviews doesn't exist, return null
            if (!student || !student.interviews || student.interviews.length === 0) {
                return null;
            }
    
            const interviewDetails = [];
    
            // Iterate through each interview ID in the student's interviews array
            for (let interviewID of student.interviews) {
                // Retrieve the interview document by interviewID
                const interview = await interviewCollection.findOne({ _id: interviewID });
    
                if (interview) {
                    // Find the student's status in the interview's students array
                    const studentInInterview = interview.students.find(s => s.studentID.equals(student._id));
                    const status = studentInInterview ? studentInInterview.status : null;
    
                    // Convert the date to dd-mm-yyyy format
                    const date = new Date(interview.date).toLocaleDateString('en-GB');
    
                    // Append the interview details along with the status and interviewID (converted to string)
                    interviewDetails.push({
                        interviewID: interviewID.toString(), // Convert interviewID to string
                        company: interview.company,
                        location: interview.location,
                        date: date, // Use the formatted date
                        status: status
                    });
                }
            }
    
            // Return the collected interview details
            return interviewDetails;
        } catch (err) {
            throw new ApplicationError("Database issue", 404);
        }
    }
    
    

    async modifyStudent(newStudent, studentID) {
        try {
            const db = getDB();
            const studentCollection = db.collection("students");
    
            // Create an update object with only non-null fields from newStudent
            const updateFields = {};
    
            if (newStudent.name !== null && newStudent.name !== undefined) {
                updateFields.name = newStudent.name;
            }
    
            if (newStudent.batch !== null && newStudent.batch !== undefined) {
                updateFields.batch = newStudent.batch;
            }
    
            if (newStudent.Student_details) {
                for (const key in newStudent.Student_details) {
                    if (newStudent.Student_details[key] !== null && newStudent.Student_details[key] !== undefined) {
                        updateFields[`Student_details.${key}`] = newStudent.Student_details[key];
                    }
                }
            }
    
            if (newStudent.Course_Scores) {
                for (const key in newStudent.Course_Scores) {
                    if (newStudent.Course_Scores[key] !== null && newStudent.Course_Scores[key] !== undefined) {
                        updateFields[`Course_Scores.${key}`] = newStudent.Course_Scores[key];
                    }
                }
            }
    
            // If there are no fields to update, return false
            if (Object.keys(updateFields).length === 0) {
                return false;
            }
    
            //Find the student and update the fields
            const result = await studentCollection.updateOne(
                { _id: new ObjectId(studentID) },
                { $set: updateFields }
            );
    
            // Return true if the document was modified
            return result.modifiedCount > 0;
        } catch (err) {
            throw new ApplicationError("Database issue", 404);
        }
    } 

    async deleteStudent(deleteID) {
        try {
            const db = getDB();
            const studentCollection = db.collection("students");
            const interviewCollection = db.collection("interviews");
    
            // Ensure deleteID is a valid ObjectId
            if (!ObjectId.isValid(deleteID)) {
                throw new ApplicationError("Invalid student ID", 400);
            }
            
            const studentID = new ObjectId(deleteID);
    
            // Get the student by ID
            const student = await studentCollection.findOne({ _id: studentID });

            await studentCollection.deleteOne({ _id: studentID });
    
            // If the student or their interviews array doesn't exist, return early
            if (!student || !student.interviews || student.interviews.length === 0) {
                return;
            }           
    
            // Iterate over each interview ID in the student's interviews array
            for (let interviewID of student.interviews) {
                // Retrieve the interview by interviewID
                const interview = await interviewCollection.findOne({ _id: interviewID });
    
                if (interview) {
                    // Remove the student from the interview's students array
                    await interviewCollection.updateOne(
                        { _id: interviewID },
                        { $pull: { students: { studentID: studentID } } }
                    );
                }
            }
    
        } catch (err) {
            console.error("Error deleting student:", err);
            throw new ApplicationError("Database issue", 404);
        }
    }
    
}

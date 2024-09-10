import { getDB } from "../../config/mongodb.js";
import { ApplicationError } from "../../error-handler/applicationError.js";
import { ObjectId } from "mongodb";

export default class InterviewRepository {

    async getAllInterviews() {
        try {
            const db = getDB();
            const interviewCollection = db.collection("interviews");
    
            // Get all documents from the interview collection
            const interviews = await interviewCollection.find().toArray();
    
            // Convert _id from ObjectId to string and format the date for all interviews
            const interviewsWithFormattedDates = interviews.map(interview => {
                // Convert date from yyyy-mm-dd to dd-mm-yyyy
                const [year, month, day] = interview.date.split('-');
                const formattedDate = `${day}-${month}-${year}`;
                
                return {
                    ...interview,
                    _id: interview._id.toString(), // Convert ObjectId to string
                    date: formattedDate // Set the formatted date
                };
            });
    
            return interviewsWithFormattedDates;
        } catch (err) {
            throw new ApplicationError("Database issue", 404);
        }
    }

    async addInterview(interview){
        try{
            const db = getDB();
            const interviewCollection = db.collection("interviews");

            // Add interview document to the collection
            await interviewCollection.insertOne(interview);
            
            return true;
        }
        catch (err) {
            throw new ApplicationError("Database issue", 404);
        }
    }

    async addStudent(interviewID, studentID, status) {
        try {
            const db = getDB();
            const interviewCollection = db.collection("interviews");
            const studentCollection = db.collection("students");
    
            // Update the interview document
            const interview = await interviewCollection.findOne({ _id: new ObjectId(interviewID) });
    
            if (!interview) {
                throw new ApplicationError("Interview not found", 404);
            }
    
            // If the 'students' array exists, append the new student object; otherwise, create the array
            if (interview.students && Array.isArray(interview.students)) {
                await interviewCollection.updateOne(
                    { _id: new ObjectId(interviewID) },
                    { $push: { students: { studentID: new ObjectId(studentID), status } } }
                );
            } else {
                await interviewCollection.updateOne(
                    { _id: new ObjectId(interviewID) },
                    { $set: { students: [{ studentID: new ObjectId(studentID), status }] } }
                );
            }
    
            // Update the student document
            const student = await studentCollection.findOne({ _id: new ObjectId(studentID) });
    
            if (!student) {
                throw new ApplicationError("Student not found", 404);
            }
    
            // If the 'interviews' array exists, append the new interviewID; otherwise, create the array
            if (student.interviews && Array.isArray(student.interviews)) {
                await studentCollection.updateOne(
                    { _id: new ObjectId(studentID) },
                    { $push: { interviews: new ObjectId(interviewID) } }
                );
            } else {
                await studentCollection.updateOne(
                    { _id: new ObjectId(studentID) },
                    { $set: { interviews: [new ObjectId(interviewID)] } }
                );
            }
    
        } catch (err) {
            throw new ApplicationError("Database issue", 500);
        }
    }
    
    async getStudent(interviewID) {
        try {
            const db = getDB();
            const interviewCollection = db.collection("interviews");
            const studentCollection = db.collection("students");
    
            // Get the interview from the interviewCollection using the interviewID
            const interview = await interviewCollection.findOne({ _id: new ObjectId(interviewID) });
    
            if (!interview) {
                throw new ApplicationError("Interview not found", 404);
            }
            
            // Check if interview.students exists and is not empty
            if (!interview.students || interview.students.length === 0) {
                return false;
            }

            // Extract the student IDs from the interview's students array
            const studentIDs = interview.students.map(student => student.studentID);
    
            // Find the students in the studentCollection using their IDs
            const students = await studentCollection.find({ _id: { $in: studentIDs } }).toArray();
    
            // Function to format the date in dd-mm-yyyy format
            const formatDate = (dateStr) => {
                const date = new Date(dateStr);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
                const year = date.getFullYear();
                return `${day}-${month}-${year}`;
            };
    
            // Convert the _id to string and create the union by adding student details
            const updatedInterview = {
                _id: interview._id.toString(),  // Convert ObjectId to string
                company: interview.company,
                location: interview.location,
                date: formatDate(interview.date),  // Format date to dd-mm-yyyy
                students: interview.students.map(studentEntry => {
                    const studentDetails = students.find(student => student._id.equals(studentEntry.studentID));
                    return {
                        studentID: studentEntry.studentID.toString(),  // Convert ObjectId to string
                        status: studentEntry.status,
                        name: studentDetails.name,
                        batch: studentDetails.batch
                    };
                })
            };
    
            // Return the updated output
            return updatedInterview;
        } catch (err) {
            throw new ApplicationError("Database issue", 500);
        }
    }

    async getModifyInterview(interviewID, studentID) {
        try {
            const db = getDB();
            const interviewCollection = db.collection("interviews");
            const studentCollection = db.collection("students");
    
            // Retrieve the interview by interviewID
            const interview = await interviewCollection.findOne({ _id: new ObjectId(interviewID) });
    
            if (!interview) {
                throw new ApplicationError("Interview not found", 404);
            }
    
            // Filter the interview's students array to find the specific student by studentID
            const targetStudent = interview.students.find(student => student.studentID.equals(new ObjectId(studentID)));
    
            if (!targetStudent) {
                throw new ApplicationError("Student not found in this interview", 404);
            }
    
            // Retrieve the student's details from the studentCollection
            const studentDetails = await studentCollection.findOne({ _id: targetStudent.studentID });
    
            if (!studentDetails) {
                throw new ApplicationError("Student details not found", 404);
            }

            // Function to format the date in dd-mm-yyyy format
            const formatDate = (dateStr) => {
                const date = new Date(dateStr);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
                const year = date.getFullYear();
                return `${day}-${month}-${year}`;
            };
    
            // Create the modified interview variable with only the target student
            const modifiedInterview = {
                _id: interview._id.toString(), // Convert ObjectId to string
                company: interview.company,
                location: interview.location,
                date: formatDate(interview.date),
                students: [
                    {
                        studentID: targetStudent.studentID.toString(), // Convert ObjectId to string
                        status: targetStudent.status,
                        name: studentDetails.name,
                        batch: studentDetails.batch
                    }
                ]
            };
    
            // Return the modified interview object
            return modifiedInterview;
        } catch (err) {
            throw new ApplicationError("Database issue", 500);
        }
    }

    async modifyStudent(interviewID, studentID, status) {
        try {
            const db = getDB();
            const interviewCollection = db.collection("interviews");
            const studentCollection = db.collection("students");
    
            // Find the interview by its ID
            const interview = await interviewCollection.findOne({ _id: new ObjectId(interviewID) });
    
            if (!interview) {
                throw new ApplicationError("Interview not found", 404);
            }
    
            // Find the student in the interview's students array and update the status
            const studentIndex = interview.students.findIndex(student => new ObjectId(studentID).equals(student.studentID));

            console.log(studentIndex);
    
            if (studentIndex !== -1) {
                interview.students[studentIndex].status = status;
    
                // Update the interview document in the database
                await interviewCollection.updateOne(
                    { _id: new ObjectId(interviewID) },
                    { $set: { "students": interview.students } }
                );
    
                // If status is 'Pass', update the student's status in the student collection
                if (status === 'Pass') {
                    const student = await studentCollection.findOne({ _id: new ObjectId(studentID) });
    
                    if (!student) {
                        throw new ApplicationError("Student not found", 404);
                    }
    
                    student.Student_details.status = 'Placed';
    
                    // Update the student's status in the database
                    await studentCollection.updateOne(
                        { _id: new ObjectId(studentID) },
                        { $set: { "Student_details.status": 'Placed' } }
                    );
                }
            } else {
                throw new ApplicationError("Student not found in interview", 404);
            }
    
            return;
        } catch (err) {
            throw new ApplicationError("Database issue", 500);
        }
    }

    async deleteInterviewStudent(interviewID, studentID) {
        try {
            const db = getDB();
            const interviewCollection = db.collection("interviews");
            const studentCollection = db.collection("students");
    
            // Find the interview by its ID
            const interview = await interviewCollection.findOne({ _id: new ObjectId(interviewID) });
            if (!interview) {
                throw new ApplicationError("Interview not found", 404);
            }
    
            // Remove the student from the interview's students array
            interview.students = interview.students.filter(student => 
                !new ObjectId(studentID).equals(student.studentID)
            );
    
            // Update the interview in the database
            await interviewCollection.updateOne(
                { _id: new ObjectId(interviewID) },
                { $set: { students: interview.students } }
            );
    
            // Find the student by their ID
            const student = await studentCollection.findOne({ _id: new ObjectId(studentID) });
            if (!student) {
                throw new ApplicationError("Student not found", 404);
            }
    
            // Remove the interview from the student's interviews array
            student.interviews = student.interviews.filter(interview => 
                !new ObjectId(interviewID).equals(interview)
            );
    
            // Update the student in the database
            await studentCollection.updateOne(
                { _id: new ObjectId(studentID) },
                { $set: { interviews: student.interviews } }
            );
        } catch (err) {
            throw new ApplicationError("Database issue", 500);
        }
    }

    async getInterviews(interviewID) {
        try {
            const db = getDB();
            const interviewCollection = db.collection("interviews");
    
            // Find the interview by its ID
            const interview = await interviewCollection.findOne({ _id: new ObjectId(interviewID) });
            if (!interview) {
                throw new ApplicationError("Interview not found", 404);
            }
    
            // Convert interview._id to a string
            interview._id = interview._id.toString();
            return interview;
        } catch (err) {
            throw new ApplicationError("Database issue", 500);
        }
    }

    async modifyInterview(interviewID, location, date) {
        try {
            const db = getDB();
            const interviewCollection = db.collection("interviews");
    
            // Update the interview's date and location
            const result = await interviewCollection.updateOne(
                { _id: new ObjectId(interviewID) },
                { $set: { date: date, location: location } }
            );
    
        } catch (err) {
            throw new ApplicationError("Database issue", 500);
        }
    }

    async deleteInterview(interviewID) {
        try {
            const db = getDB();
            const interviewCollection = db.collection("interviews");
            const studentCollection = db.collection("students");
    
            // Delete the interview from the interviewCollection
            const deleteResult = await interviewCollection.deleteOne({ _id: new ObjectId(interviewID) });
            
            if (deleteResult.deletedCount === 0) {
                throw new ApplicationError("Interview not found", 404);
            }
    
            // Iterate through the studentCollection to remove the interviewID from each student's interviews array
            await studentCollection.updateMany(
                { interviews: new ObjectId(interviewID) }, // Match students with the interviewID directly in the interviews array
                { $pull: { interviews: new ObjectId(interviewID) } } // Remove the interviewID from the interviews array
            );
            
            console.log(deleteResult) // You can return the result if needed
        } catch (err) {
            throw new ApplicationError("Database issue", 500);
        }
    }
    
    
}

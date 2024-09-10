import { getDB } from "../../config/mongodb.js";
import { ApplicationError } from "../../error-handler/applicationError.js";

export default class StudentRepository {
    async getData() {
        try {
            const db = getDB();
            const studentCollection = db.collection("students");
            const interviewCollection = db.collection("interviews");

            // Get all students from the student collection
            const students = await studentCollection.find().toArray();

            const flattenedData = [];

            // Iterate over each student
            for (const student of students) {
                // If student has interviews
                if (student.interviews && student.interviews.length > 0) {
                    for (const interviewId of student.interviews) {
                        // Find the corresponding interview
                        const interview = await interviewCollection.findOne({ _id: interviewId });

                        if (interview) {
                            // Flatten data for each student and interview
                            flattenedData.push({
                                name: student.name,
                                batch: student.batch,
                                college: student.Student_details?.college || '',
                                status: student.Student_details?.status || '',
                                DSA: student.Course_Scores?.DSA || '',
                                Node: student.Course_Scores?.Node || '',
                                React: student.Course_Scores?.React || '',
                                interview_company: interview.company || '',
                                interview_location: interview.location || '',
                                interview_date: interview.date || '',
                                interview_status: interview.students.find(s => s.studentID.equals(student._id))?.status || ''
                            });
                        }
                    }
                } else {
                    // Include students with no interviews
                    flattenedData.push({
                        name: student.name,
                        batch: student.batch,
                        college: student.Student_details?.college || '',
                        status: student.Student_details?.status || '',
                        DSA: student.Course_Scores?.DSA || '',
                        Node: student.Course_Scores?.Node || '',
                        React: student.Course_Scores?.React || '',
                        interview_company: '',
                        interview_location: '',
                        interview_date: '',
                        interview_status: ''
                    });
                }
            }

            // Return the flattened data
            return flattenedData;

        } catch (err) {
            console.error("Error:", err);
            throw new ApplicationError("Database issue", 404);
        }
    }
}

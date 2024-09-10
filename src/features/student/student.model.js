export const StudentModel = (req) => {
    const { 
        name, 
        batch, 
        college, 
        status, 
        DSA, 
        Node, 
        React 
    } = req.body;

    const newStudent = {
        name,
        batch,
        Student_details: {
            college,
            status
        },
        Course_Scores: {
            DSA, // Directly use DSA
            Node, // Directly use Node
            React // Directly use React
        }
    };

    return newStudent;
};

import { StudentModel } from "../features/student/student.model.js";


export const studentFieldsValidate = (req, res, next) => {
    try {
        console.log(req.body);
        const { name, status } = req.body;
        let errors = [];

        // Validate that req.body.name should not be empty and must be a string
        if (!name || typeof name !== 'string') {
            errors.push({ msg: "Name is required and must be a string" });
        }

        // Validate that status can be either 'placed' or 'not_placed'
        const validStatuses = ['placed', 'not_placed'];
        if (status && !validStatuses.includes(status)) {
            errors.push({ msg: "Invalid status. Status can be either 'placed' or 'not_placed'" });
        }

        // If there are errors, return them in the response
        if (errors.length !== 0) {
            console.log(errors);
            return res.json({ message: 'failure', error: errors[0] });
        }

        // If all validations pass, proceed to the next middleware or route handler
        next();
    } catch (err) {
        console.error("Error in studentFieldsValidate:", err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const studentModifyFieldsValidate = async (req, res, next) => {
    try {
        const { status } = req.body;

        let errors = [];
        const validStatuses = [undefined, null, 'placed', 'not_placed'];
        if (!validStatuses.includes(status)) {

            errors.push({ msg: "Invalid status. Status can be either 'placed' or 'not_placed'" });
            // Pass both student and errors in below render
            return res.json({message:"failure",error:errors[0]});
        }

        // If all validations pass, proceed to the next middleware or route handler
        next();
    } catch (err) {
        return res.status(500).send("Internal Server Error");
    }
};


import { getDB } from "../config/mongodb.js";


export const signUpValidate=async(req,res,next)=>{
    const {name,password,emp_id,type}=req.body;

    // Test the password
    let error=[];
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&!@#^(){}[\]:;<>,.?/~_+-=|\\]{8,}$/;
    if (!passwordRegex.test(password)) {
        error.push("Enter valid password");
    }

    if(type!="employee"){
        error.push("Enter type as employee");
    }

    try{
       const db=getDB(); 
       const collection=db.collection("employees");

       // Check if emp_id already exists
       const existingEmployee = await collection.findOne({ emp_id: emp_id });
       if (existingEmployee) {
            error.push("Employee id is already present");
        }

        if(error.length>0){
            return res.render("signup", { errors: error, formData: req.body });
        }

        // If emp_id is not found, proceed to the next middleware
        next();
    }catch(err){
        console.error("Error while checking emp_id uniqueness", err);
        return res.status(500).send("Internal Server Error");
    }
}
import { ObjectId } from "mongodb";
import { getDB } from "../../config/mongodb.js";
import { ApplicationError } from "../../error-handler/applicationError.js";
import bcrypt from 'bcrypt';

export default class UserRepository{
    async signUp(newUser){
        try{
            const db=getDB();
            const employeeCollection=db.collection("employees");

            //add newUser to employees collection
            await employeeCollection.insertOne(newUser);

            return newUser;
            
        }catch(err){
            throw new ApplicationError("Database issue",404);
        }
    }

    async findByEmp_Id(emp_id){
        try{
            const db=getDB();
            const employeeCollection=db.collection("employees");
            return await employeeCollection.findOne({emp_id});
        }catch(err){
            throw new ApplicationError("Database issue",404);
        }
    }
           
}
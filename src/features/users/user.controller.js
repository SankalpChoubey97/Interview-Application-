import UserModel from "./user.model.js";
import UserRepository from "./user.repository.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken"

export default class UserController{
    constructor(){
        this.userRepository=new UserRepository();
    }

    getSignUp(req,res,next){
        try{
            return res.render("signup");
        }catch(err){
            console.log("Inside get signup controller error");
            next(err);
        }
    }

    getSignIn(req, res, next) {
        try {
            const message = req.query.message || null;
            return res.render("signin", { message });
        } catch (err) {
            console.log("Inside get signin controller error");
            next(err);
        }
    }
    

    async signUp(req,res,next){
        try{
            const{name,emp_id,password,type}=req.body;
            //hashed password
            const hashedPassword=await bcrypt.hash(password,12);
            const user=new UserModel(name,emp_id,hashedPassword,type);
            await this.userRepository.signUp(user);
            
            return res.redirect("http://localhost:3200/api/users/signIn?message=Account created successfully");
        }catch(err){
            console.log("Inside signup controller Error");
            next(err);
        }
    }

    async signIn(req, res, next) {
        try {
            const { emp_id, password } = req.body;
            const user = await this.userRepository.findByEmp_Id(emp_id);
            if (!user) {
                return res.json({message:"Invalid user"});
            } else {
                const result = await bcrypt.compare(password, user.password);
                if (result) {
                    const token = jwt.sign(
                        { userID: user._id, name: user.name },
                        process.env.JWT_SECRET,
                        { expiresIn: '1h' }
                      );
                    
                    console.log(token);
                    return res.json({message:"success",token});
                } else {
                    return res.json({message:"Incorrect credentials"});
                }
            }
        } catch (err) {
            console.log("Inside signin controller error", err);
            next(err);
        }
    }
    
}
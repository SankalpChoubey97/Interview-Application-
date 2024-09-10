import express from "express";
import UserController from "./user.controller.js";
import { signUpValidate } from "../../middlewares/user.validate.js";

const userRouter=express.Router();
const userController=new UserController();

userRouter.get("/signup",(req,res,next)=>{
    userController.getSignUp(req,res,next)});

userRouter.get("/signIn",(req,res,next)=>{
    userController.getSignIn(req,res,next)});

userRouter.post("/signup",signUpValidate,(req,res,next)=>{
    userController.signUp(req,res,next)});

userRouter.post("/signIn",(req,res,next)=>{
    userController.signIn(req,res,next)})

export default userRouter;
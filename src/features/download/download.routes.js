import express from "express";
import DownloadController from "./download.controller.js";

const downloadRouter=express.Router();
const donwloadController=new DownloadController();

downloadRouter.get("/",(req,res,next)=>{
    donwloadController.getData(req,res,next)});

export default downloadRouter;
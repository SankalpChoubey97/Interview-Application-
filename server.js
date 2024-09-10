import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { connectToMongoDB } from './src/config/mongodb.js';
import userRouter from './src/features/users/user.routes.js';
import studentRouter from './src/features/student/student.routes.js';
import interviewRouter from './src/features/interviews/interview.routes.js';
import HomePageController from './src/features/home/homepage.js';
import path from 'path';
import ejsLayouts from 'express-ejs-layouts';
import { ApplicationError } from './src/error-handler/applicationError.js';
import jwtAuth from './src/middlewares/jwt.middleware.js';
import downloadRouter from './src/features/download/download.routes.js';

dotenv.config();

const server = express();

server.use(ejsLayouts);
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.set('view engine', 'ejs');

const resolvedPath = path.resolve();
const filePath = path.join(resolvedPath, 'src', 'views');
server.set('views', filePath);  // Set the path for EJS files

// all routes
const homePage = new HomePageController();

server.get("/api", (req, res, next) => {
    homePage.homePage(req, res, next);
});
server.use("/api/users", userRouter);
server.use("/api/student",jwtAuth,studentRouter);
server.use("/api/interview",jwtAuth,interviewRouter);
server.use("/api/download",jwtAuth,downloadRouter);

// New route for fetching jobs
server.get("/api/jobs", async (req, res) => {
    const { location, role } = req.query;
    
    if (!location || !role) {
        const message = "Location and role are mandatory";
        return res.render("job_link", { message });
    }

    try {
        const jobs = await fetchJobs(location, role);
        // Check if jobs are empty
        const message = jobs.length === 0 ? "No jobs available for this location or this role" : null;
        if(message!=null){
            return res.render("job_link", { message });
        }
        return res.render("job_link", {jobs});
    } catch (error) {
        throw new ApplicationError("Issue in fetching jobs", 404);
    }
});

const fetchJobs = async (location, role) => {
    console.log("Application id", process.env.ADZUNA_APP_ID);
    console.log("Application Key", process.env.ADZUNA_APP_KEY);
    
    const apiUrl = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${process.env.ADZUNA_APP_ID}&app_key=${process.env.ADZUNA_APP_KEY}&where=${location}&what=${role}`;

    const response = await axios.get(apiUrl);
    return response.data.results;
};

server.get("/", (req, res) => {
    res.send("Welcome to interview page");
});

// Error handling middleware
server.use((err, req, res, next) => {
    if (err instanceof ApplicationError) {
        const message = err.message;
        return res.render("home", { message });
    }

    console.log("Inside error handler");
    console.log(err);
    const message = "Something went wrong, please try later";
    return res.render("home", { message });
});

server.use((req, res) => {
    res.status(404).send("API not found");
});

server.listen(3200, () => {
    console.log("server is running at 3200");
    connectToMongoDB();
});

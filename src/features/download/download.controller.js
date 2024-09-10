import { parse } from 'json2csv'; // Ensure you have json2csv package installed
import DownloadRepository from "./download.repository.js";

export default class DownloadController {
    constructor() {
        this.downloadRepository = new DownloadRepository();
    }

    async getData(req, res, next) {
        try {
            const students = await this.downloadRepository.getData();
            console.log(students);

            // Define fields to be used in CSV
            const fields = [
                'name',
                'batch',
                'college',
                'status',
                'DSA',
                'Node',
                'React',
                'interview_company',
                'interview_location',
                'interview_date',
                'interview_status'
            ];

            // Convert the JSON data to CSV format
            const csv = parse(students, { fields });

            // Set response headers and send CSV
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
            res.status(200).send(csv);


        } catch (err) {
            console.log("Inside get student controller Error", err);
            next(err);
        }
    }
}

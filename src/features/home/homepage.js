import path from 'path';

export default class HomePageController {

    async homePage(req, res, next) {
        try {
            const error = req.query.error || null; 
            res.render('home',{error}); 
        } catch (err) {
            console.log("inside home page controller error");
            next(err);
        }
    }
}

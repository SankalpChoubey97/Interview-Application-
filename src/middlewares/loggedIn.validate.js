export const loggedIn = (req, res, next) => {
    console.log(req.emp_id);
    // Check if req.emp_id is not empty
    if (!req.emp_id) {
        // If empty, return 404 response with message "Please login to view this page"
        return res.status(404).json({ message: "Please login to view this page" });
    }

    // If not empty, proceed to the next middleware or route handler
    next();
};

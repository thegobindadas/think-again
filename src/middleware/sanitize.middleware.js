import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";



// Middleware to sanitize user input
export const safeSanitize = (req, _, next) => {
    // Apply mongo-sanitize to req.body, req.params, req.query manually
    mongoSanitize.sanitize(req.body);
    mongoSanitize.sanitize(req.params);
    mongoSanitize.sanitize(req.query);


    next();
};


export const xssSanitize = (req, _, next) => {
    // Sanitize individual request parts
    if (req.body) {
        for (let key in req.body) {
            if (typeof req.body[key] === "string") {
                req.body[key] = xss(req.body[key]);
            }
        }
    }

    if (req.query) {
        const sanitizedQuery = {};
        for (let key in req.query) {
            sanitizedQuery[key] = xss(req.query[key]);
        }
        // Store in a custom property to avoid modifying req.query
        req.cleanedQuery = sanitizedQuery;
    }


    next();
};
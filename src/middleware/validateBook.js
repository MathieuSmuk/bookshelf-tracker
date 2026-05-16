import { body, validationResult } from "express-validator";

export const validateBook = [
  // Title (required)
  body("title").trim().notEmpty().withMessage("Title is required"),

  // Rating (optional, but must be 1–5 if provided)
  body("rating")
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be an integer between 1 and 5"),

  // ISBN (optional)
  body("isbn")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("ISBN must be a string"),

  // Finished Date (optional, must be valid date if provided)
  body("finished_date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Finished date must be a valid date"),

  // Notes (optional)
  body("notes")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Notes must be text"),

  // Final middleware to handle errors
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log("❌ Validation errors:", errors.array()); // helpful debug

      return res.status(400).json({
        errors: errors.array(),
      });
    }

    next();
  },
];

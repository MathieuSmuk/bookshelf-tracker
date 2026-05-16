export function validatePatchBook(req, res, next) {
  const allowedFields = ["title", "isbn", "rating", "notes", "finished_date"];

  const updates = Object.keys(req.body);

  // 1️⃣ Empty body check
  if (updates.length === 0) {
    return res.status(400).json({
      error: "No fields provided for update",
    });
  }

  // 2️⃣ Reject unknown fields
  const invalidFields = updates.filter(
    (field) => !allowedFields.includes(field),
  );

  if (invalidFields.length > 0) {
    return res.status(400).json({
      error: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  }

  // 3️⃣ Validate rating (if present)
  if (req.body.rating !== undefined) {
    const rating = Number(req.body.rating);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: "Rating must be an integer between 1 and 5",
      });
    }
  }

  // 4️⃣ Validate finished_date (if present)
  if (req.body.finished_date !== undefined) {
    const date = new Date(req.body.finished_date);

    if (isNaN(date.getTime())) {
      return res.status(400).json({
        error: "finished_date must be a valid date (YYYY-MM-DD)",
      });
    }
  }

  // 5️⃣ All good
  next();
}

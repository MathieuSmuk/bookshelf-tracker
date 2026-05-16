import express from "express";

import {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  patchBookController,
  getEditForm,
} from "../controllers/books.controller.js";

import { validateBook } from "../middleware/validateBook.js";
import { validateId } from "../middleware/validateId.js";
import { validatePatchBook } from "../middleware/validatePatchBook.js";

const router = express.Router();

// =========================
// READ ALL + CREATE FORM
// =========================
router.get("/", getBooks);

router.get("/new", (req, res) => {
  res.render("books/new", { title: "Add Book" });
});

// =========================
// CREATE
// =========================
router.post("/", validateBook, createBook);

// =========================
// EDIT FORM
// =========================
router.get("/:id/edit", validateId, getEditForm);

// =========================
// DELETE (DEDICATED ROUTE ✅)
// =========================
router.post("/:id/delete", validateId, deleteBook);

// =========================
// UPDATE
// =========================
router.put("/:id", validateId, validateBook, updateBook);
router.patch("/:id", validateId, validatePatchBook, patchBookController);

// =========================
// READ ONE (KEEP LAST)
// =========================
router.get("/:id", validateId, getBook);

// (Optional: keep DELETE for API usage)
router.delete("/:id", validateId, deleteBook);

export default router;

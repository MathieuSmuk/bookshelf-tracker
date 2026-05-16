import {
  getAllBooks,
  getBookById,
  patchBook,
  createBook as createBookModel,
  updateBook as updateBookModel,
  deleteBook as deleteBookModel,
} from "../models/books.model.js";

import { getCoverUrl } from "../utils/openLibrary.js";

export async function getBooks(req, res) {
  try {
    const { sort, order, page, limit, title, rating, isbn, finished_after } =
      req.query;

    // Fetch books from the model
    const result = await getAllBooks({
      sort,
      order,
      page,
      limit,
      title,
      rating,
      isbn,
      finished_after,
    });

    // Add Open Library cover URLs
    const booksWithCovers = result.books.map((book) => ({
      ...book,
      coverUrl: getCoverUrl(book.isbn),
    }));

    // ✅ Render the EJS view instead of returning JSON
    res.render("books/index", {
      ...result, // page, total, totalPages, limit, etc
      books: booksWithCovers, // override books with enriched ones
      sort,
      order,
      title,
      limit,
      rating,
      isbn,
      finished_after,
      query: req.query, // for pagination links
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load books page");
  }
}

export async function getBook(req, res) {
  try {
    const { id } = req.params;

    const book = await getBookById(id);

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json({
      ...book,
      coverUrl: getCoverUrl(book.isbn),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch book" });
  }
}

export async function createBook(req, res) {
  try {
    await createBookModel(req.body);

    // Redirect to list after creating
    res.redirect("/books");
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).send("A book with this ISBN already exists");
    }

    if (err.code === "23514") {
      return res.status(400).send("Invalid data");
    }

    if (err.code === "23502") {
      return res.status(400).send("Missing required fields");
    }

    console.error(err);
    res.status(500).send("Failed to create book");
  }
}

export async function getEditForm(req, res) {
  try {
    const { id } = req.params;
    const book = await getBookById(id);

    if (!book) {
      return res.status(404).send("Book not found");
    }

    res.render("books/edit", {
      title: "Edit Book",
      book,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load edit page");
  }
}

export async function updateBook(req, res) {
  try {
    const { id } = req.params;
    const updatedBook = await updateBookModel(id, req.body);

    if (!updatedBook) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.redirect("/books");
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        error: "A book with this ISBN already exists",
      });
    }

    if (err.code === "23514") {
      return res.status(400).json({
        error: "Invalid data (rating or date constraint failed)",
      });
    }

    if (err.code === "23502") {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    console.error(err);
    res.status(500).json({ error: "Failed to update book" });
  }
}

export async function patchBookController(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: "No fields provided for update",
      });
    }

    const updatedBook = await patchBook(id, updates);

    if (!updatedBook) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json(updatedBook);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        error: "A book with this ISBN already exists",
      });
    }

    if (err.code === "23514") {
      return res.status(400).json({
        error: "Invalid data (rating or date constraint failed)",
      });
    }

    console.error(err);
    res.status(500).json({ error: "Failed to update book" });
  }
}

export async function deleteBook(req, res) {
  try {
    const { id } = req.params;
    const deletedBook = await deleteBookModel(id);

    if (!deletedBook) {
      return res.status(404).send("Book not found");
    }

    res.redirect("/books");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to delete book");
  }
}

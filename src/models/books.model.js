import pool from "../db/index.js";

const ALLOWED_SORT_FIELDS = [
  "title",
  "rating",
  "finished_date",
  "created_at",
  "notes",
];

export async function getAllBooks({
  sort,
  order,
  page = 1,
  limit = 10,
  title,
  rating,
  isbn,
  finished_after,
}) {
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
  const offset = (safePage - 1) * safeLimit;

  let query = "SELECT * FROM books";
  let countQuery = "SELECT COUNT(*) FROM books";

  const conditions = [];
  const values = [];

  // 🔹 FILTER: title (case-insensitive)
  if (title) {
    values.push(`%${title}%`);
    conditions.push(`title ILIKE $${values.length}`);
  }

  // 🔹 FILTER: rating
  if (rating) {
    values.push(Number(rating));
    conditions.push(`rating = $${values.length}`);
  }

  // 🔹 FILTER: isbn
  if (isbn) {
    values.push(`%${isbn}%`);
    conditions.push(`isbn ILIKE $${values.length}`);
  }

  // 🔹 FILTER: finished_after
  if (finished_after) {
    values.push(finished_after);
    conditions.push(`finished_date >= $${values.length}`);
  }

  // 🔹 Apply WHERE clause if needed
  if (conditions.length > 0) {
    const whereClause = " WHERE " + conditions.join(" AND ");
    query += whereClause;
    countQuery += whereClause;
  }

  // Sorting
  if (ALLOWED_SORT_FIELDS.includes(sort)) {
    const direction = order === "desc" ? "DESC" : "ASC";
    query += ` ORDER BY ${sort} ${direction}, id ASC`;
  } else {
    query += ` ORDER BY id ASC`;
  }

  // 🔹 Pagination
  query += " LIMIT $" + (values.length + 1);
  values.push(safeLimit);

  query += " OFFSET $" + (values.length + 1);
  values.push(offset);

  // 🔹 Execute queries
  const result = await pool.query(query, values);
  const countResult = await pool.query(
    countQuery,
    values.slice(0, values.length - 2),
  );

  const total = parseInt(countResult.rows[0].count, 10);

  return {
    books: result.rows,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit),
  };
}

// CREATE
export async function createBook(book) {
  const { title, isbn, rating, finished_date, notes } = book;

  const result = await pool.query(
    `
    INSERT INTO books (title, isbn, rating, finished_date, notes)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
    `,
    [title, isbn, rating, finished_date, notes],
  );

  return result.rows[0];
}

// UPDATE
export async function updateBook(id, book) {
  const { title, isbn, rating, finished_date, notes } = book;

  const result = await pool.query(
    `
    UPDATE books
    SET
      title = $1,
      isbn = $2,
      rating = $3,
      finished_date = $4,
      notes = $5
    WHERE id = $6
    RETURNING *;
    `,
    [title, isbn, rating, finished_date, notes, id],
  );

  return result.rows[0];
}

// DELETE
export async function deleteBook(id) {
  const result = await pool.query(
    `
    DELETE FROM books
    WHERE id = $1
    RETURNING *;
    `,
    [id],
  );

  return result.rows[0];
}

// READ ONE
export async function getBookById(id) {
  const result = await pool.query(
    `
    SELECT *
    FROM books
    WHERE id = $1;
    `,
    [id],
  );

  // If no book found, return null
  return result.rows[0] || null;
}

// PATCH (partial update)
export async function patchBook(id, updates) {
  const fields = [];
  const values = [];

  let index = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (!ALLOWED_FIELDS.includes(key)) continue;

    fields.push(`${key} = $${index}`);
    values.push(value);
    index++;
  }

  if (fields.length === 0) {
    return null;
  }

  const query = `
    UPDATE books
    SET ${fields.join(", ")}
    WHERE id = $${index}
    RETURNING *;
  `;

  values.push(id);

  const result = await pool.query(query, values);

  return result.rows[0] || null;
}

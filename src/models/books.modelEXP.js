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
    values.push(rating);
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

  // 🔹 Sorting (unchanged)
  if (ALLOWED_SORT_FIELDS.includes(sort)) {
    const direction = order === "desc" ? "DESC" : "ASC";
    query += ` ORDER BY ${sort} ${direction}`;
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
    values.slice(0, values.length - 2)
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

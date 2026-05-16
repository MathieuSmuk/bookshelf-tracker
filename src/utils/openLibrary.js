const BASE_COVER_URL = "https://covers.openlibrary.org/b/isbn";
const BASE_BOOK_URL = "https://openlibrary.org/api/books";

/**
 * Generate a cover image URL from ISBN
 * @param {string} isbn
 * @param {"S" | "M" | "L"} size
 * @returns {string}
 */
export function getCoverUrl(isbn, size = "M") {
  if (!isbn) {
    return "/images/no-cover.png";
  }

  return `${BASE_COVER_URL}/${isbn}-${size}.jpg`;
}

/**
 * Fetch book metadata from Open Library API
 * (Optional enhancement feature)
 */
export async function fetchBookByISBN(isbn) {
  if (!isbn) return null;

  const url = `${BASE_BOOK_URL}?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const book = data[`ISBN:${isbn}`];
    if (!book) return null;

    return {
      title: book.title,
      authors: book.authors?.map((a) => a.name).join(", "),
      publishDate: book.publish_date,
      pages: book.number_of_pages,
      cover: book.cover?.medium || getCoverUrl(isbn),
    };
  } catch (err) {
    console.error("OpenLibrary fetch error:", err);
    return null;
  }
}

/// <cts-enable />
import { Cell, Default, NAME, pattern, UI, generateText, handler, derive, str } from "commontools";

/**
 * TBR (To Be Read) List Pattern
 *
 * Features:
 * - Add books with title and author
 * - Automatically fetch genre and summary from AI
 * - Mark books as read (with checkbox)
 * - Remove books from list
 */

interface Book {
  title: string;
  author: string;
  genre: Default<string, "">;
  summary: Default<string, "">;
  read: Default<boolean, false>;
  fetchInfo: Default<boolean, false>;  // Trigger to fetch info
}

interface TBRInput {
  books: Cell<Book[]>;
}

interface TBROutput {
  books: Cell<Book[]>;
}

// Handler to add a new book
const addBook = handler<
  { detail: { message: string } },
  { books: Cell<Book[]>; titleInput: Cell<string>; authorInput: Cell<string> }
>(({ detail }, { books, titleInput, authorInput }) => {
  const title = titleInput.get().trim();
  const author = authorInput.get().trim();

  if (title && author) {
    books.push({
      title,
      author,
      genre: "",
      summary: "",
      read: false,
      fetchInfo: true,  // Trigger AI fetch
    });

    // Clear inputs
    titleInput.set("");
    authorInput.set("");
  }
});

export default pattern<TBRInput, TBROutput>(({ books }) => {
  // Create local cells for form inputs
  const titleInput = Cell.of("");
  const authorInput = Cell.of("");

  return {
    [NAME]: "My TBR List",
    [UI]: (
      <div style={{ padding: "1.5rem", maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ marginBottom: "1.5rem", color: "#333" }}>📚 To Be Read</h1>

        {/* Add new book form */}
        <div
          style={{
            marginBottom: "2rem",
            padding: "1rem",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ marginBottom: "0.75rem" }}>Add a Book</h3>
          <div style={{ display: "flex", gap: "0.5rem", flexDirection: "column" }}>
            <ct-input
              $value={titleInput}
              placeholder="Book title (e.g., 'The Lord of the Rings')"
              style={{ width: "100%" }}
            />
            <ct-input
              $value={authorInput}
              placeholder="Author (e.g., 'J.R.R. Tolkien')"
              style={{ width: "100%" }}
            />
            <ct-button
              onClick={addBook({ books, titleInput, authorInput })}
              style={{ alignSelf: "flex-start" }}
            >
              Add to TBR List
            </ct-button>
          </div>
        </div>

        {/* Books list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {books.map((book, index) => {
            // Generate AI content when fetchInfo is true
            // Use str template for safe string interpolation
            const genrePrompt = str`What is the primary genre of the book "${book.title}" by ${book.author}? Respond with ONLY the genre name in 1-2 words (e.g., "Science Fiction", "Mystery", "Romance", "Fantasy", "Historical Fiction", "Non-fiction", "Biography", etc.). No other text.`;

            const summaryPrompt = str`Provide a 2-3 sentence summary of the book "${book.title}" by ${book.author}. Focus on the main premise and what makes it noteworthy. Be concise.`;

            const genreResponse = book.fetchInfo
              ? generateText({
                  prompt: genrePrompt,
                  model: "anthropic:claude-haiku-4-5",
                })
              : { result: book.genre || undefined, pending: false, error: undefined };

            const summaryResponse = book.fetchInfo
              ? generateText({
                  prompt: summaryPrompt,
                  model: "anthropic:claude-haiku-4-5",
                })
              : { result: book.summary || undefined, pending: false, error: undefined };

            return (
              <div
                style={{
                  padding: "1rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  backgroundColor: book.read ? "#f9f9f9" : "white",
                }}
              >
                {/* Book header with checkbox */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <ct-checkbox $checked={book.read}>
                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          margin: 0,
                          color: book.read ? "#999" : "#333",
                          textDecoration: book.read ? "line-through" : "none",
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        {book.title}
                      </h3>
                      <p
                        style={{
                          margin: "0.25rem 0 0 0",
                          color: "#666",
                          fontSize: "0.9rem",
                        }}
                      >
                        by {book.author}
                      </p>
                    </div>
                  </ct-checkbox>

                  {/* Remove button */}
                  <ct-button
                    onClick={() => {
                      const current = books.get();
                      books.set(current.toSpliced(index, 1));
                    }}
                    style={{ fontSize: "0.8rem" }}
                  >
                    Remove
                  </ct-button>
                </div>

                {/* AI-generated content */}
                {genreResponse.pending || summaryResponse.pending ? (
                  <p style={{ fontSize: "0.85rem", color: "#666", fontStyle: "italic" }}>
                    Loading book information...
                  </p>
                ) : (
                  <>
                    {/* Genre badge */}
                    {genreResponse.result && (
                      <span
                        style={{
                          display: "inline-block",
                          padding: "0.25rem 0.5rem",
                          backgroundColor: "#e3f2fd",
                          color: "#1976d2",
                          borderRadius: "4px",
                          fontSize: "0.8rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        {genreResponse.result}
                      </span>
                    )}

                    {/* Summary */}
                    {summaryResponse.result && (
                      <p
                        style={{
                          margin: "0.5rem 0 0 0",
                          fontSize: "0.9rem",
                          color: "#555",
                          lineHeight: "1.5",
                        }}
                      >
                        {summaryResponse.result}
                      </p>
                    )}

                    {/* Error handling */}
                    {(genreResponse.error || summaryResponse.error) && (
                      <p style={{ fontSize: "0.85rem", color: "#999", fontStyle: "italic" }}>
                        Unable to fetch book information
                      </p>
                    )}
                  </>
                )}
              </div>
            );
          })}

          {books.get().length === 0 && (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "#999",
                fontStyle: "italic",
              }}
            >
              No books in your TBR list yet. Add one above!
            </div>
          )}
        </div>
      </div>
    ),
    books,
  };
});

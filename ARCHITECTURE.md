# Architecture Notes

## Prioritization Decisions

Given the 4-6 hour timebox, I focused on **depth over breadth** in these areas:

### What I Prioritized

1. **Editor quality** — Tiptap gives a production-grade editing experience (ProseMirror under the hood). Rich text formatting, keyboard shortcuts, auto-save with debounce, and proper JSON serialization. This is the core user experience.

2. **Working sharing model** — Full CRUD for shares with permission enforcement (owner/edit/view). The UI distinguishes owned vs. shared documents clearly with visual cues. Share management includes user autocomplete and removal.

3. **File import** — Upload `.txt` and `.md` files with parsing to Tiptap's JSON format. Markdown parsing handles headings, lists, and paragraphs. Drag-and-drop UX.

4. **Persistence** — Prisma ORM with SQLite gives proper relational modeling (foreign keys, unique constraints, cascade deletes) with zero infrastructure setup. Tiptap content is stored as JSON, preserving all formatting.

5. **Auth** — NextAuth with seeded accounts. Good enough for a demo without the overhead of a registration flow.

### What I Intentionally Deprioritized

- **Real-time collaboration** — Would require WebSocket infrastructure (e.g., Yjs + Hocuspocus). Not feasible in the timebox.
- **Registration flow** — Seeded accounts are sufficient for evaluation. Adding registration would add complexity without demonstrating anything new.
- **.docx import** — Requires mammoth.js and more complex parsing. Kept scope to `.txt` and `.md`.
- **Export** — PDF/Markdown export would be a good next step.
- **Version history** — Would need a document_versions table and diff UI.

### With 2-4 More Hours

1. Add real-time presence indicators (who's viewing a doc)
2. Export to Markdown and PDF
3. Document version history with diff view
4. `.docx` file import via mammoth.js
5. Production deployment with PostgreSQL

## Database Design

Three tables with clear relationships:

- **User** — id, name, email, hashed password
- **Document** — id, title, content (JSON), ownerId → User
- **DocumentShare** — documentId + userId (unique pair), permission level

Cascade delete ensures removing a document cleans up all shares.

## API Design

RESTful endpoints under `/api/`:

- `GET /api/documents` — Lists owned + shared documents
- `POST /api/documents` — Creates a new document
- `GET /api/documents/:id` — Fetches document with access check
- `PUT /api/documents/:id` — Updates title/content with permission check
- `DELETE /api/documents/:id` — Owner-only deletion
- `POST /api/documents/:id/share` — Share with a user
- `DELETE /api/documents/:id/share` — Remove share
- `POST /api/upload` — File upload → new document
- `GET /api/users` — List users for share autocomplete

Every endpoint checks authentication via `getServerSession` and enforces authorization.

## Frontend Architecture

- **Server Components** for layout and page wrappers (handle `dynamic = "force-dynamic"`)
- **Client Components** for interactive content (editor, dashboard, auth forms)
- **Suspense boundaries** around client components for loading states
- **Auto-save** with 1-second debounce on editor changes, plus manual save button
- **Inline title editing** — Click the document title to rename

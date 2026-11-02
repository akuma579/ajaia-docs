# Submission

## What's Included

- **Source code** — Full Next.js application in this repository
- **README.md** — Local setup and run instructions
- **ARCHITECTURE.md** — Architecture notes, prioritization decisions, what I'd build next
- **AI_WORKFLOW.md** — AI tools used, what was changed/rejected, verification approach
- **SUBMISSION.md** — This file
- **Automated tests** — 5 passing tests in `__tests__/api/documents.test.ts`
- **Live deployment** — https://ajaia-docs-seven-theta.vercel.app

## Working Features

1. **Login** — Credential-based auth with 3 seeded demo accounts
2. **Dashboard** — Document listing with owned/shared separation
3. **Document creation** — New blank documents from the dashboard
4. **Rich text editing** — Bold, italic, underline, H1/H2/H3, bullet lists, ordered lists
5. **Auto-save** — 1-second debounce after editing, plus manual save button
6. **Document renaming** — Click the title in the editor header to rename
7. **Document deletion** — Owner-only, with confirmation dialog
8. **File import** — Drag-and-drop or browse for `.txt` and `.md` files
9. **Sharing** — Share via email with edit/view permissions, remove access
10. **Persistence** — PostgreSQL database (Neon), documents survive refresh

## What's Incomplete

- **Walkthrough video** — Not recorded yet.

## What I'd Build Next (2-4 hours)

1. Real-time presence indicators (who's viewing)
3. Export documents to Markdown and PDF
4. Document version history
5. `.docx` file import

## Test Accounts

| Email | Password |
|---|---|
| alice@example.com | password123 |
| bob@example.com | password123 |
| charlie@example.com | password123 |

Alice owns a pre-seeded document ("Welcome to Ajaia Docs") that is shared with Bob.

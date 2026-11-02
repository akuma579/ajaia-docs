# Ajaia Docs

A lightweight collaborative document editor built with Next.js, Tiptap, and Prisma.

## Features

- **Rich Text Editing** — Bold, italic, underline, headings (H1-H3), bullet lists, ordered lists, undo/redo
- **Document Management** — Create, rename, edit, delete, auto-save with manual save option
- **File Import** — Upload `.txt` and `.md` files to create new editable documents
- **Sharing** — Share documents with other users (edit or view-only permissions)
- **Persistence** — SQLite database via Prisma ORM, survives refresh with formatting preserved
- **Auth** — Credential-based login with seeded demo accounts

## Quick Start

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
git clone https://github.com/akuma579/ajaia-docs.git
cd ajaia-docs
npm install
npx prisma generate
npx prisma migrate dev
npm run db:seed
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Accounts

| Email | Password |
|---|---|
| alice@example.com | password123 |
| bob@example.com | password123 |
| charlie@example.com | password123 |

Alice has a pre-seeded document shared with Bob to demonstrate the sharing flow.

### Run Tests

```bash
npm test
```

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4
- **Editor**: Tiptap (ProseMirror-based rich text editor)
- **Backend**: Next.js API Routes
- **Database**: SQLite via Prisma ORM
- **Auth**: NextAuth.js v4 with Credentials provider
- **Icons**: Lucide React
- **Testing**: Jest + ts-jest

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth handler
│   │   ├── documents/            # CRUD + sharing endpoints
│   │   ├── upload/               # File import endpoint
│   │   └── users/                # User listing for share dialog
│   ├── dashboard/                # Document list view
│   ├── documents/[id]/           # Document editor view
│   ├── layout.tsx                # Root layout with SessionProvider
│   └── page.tsx                  # Login page
├── components/
│   ├── Editor.tsx                # Tiptap rich text editor + toolbar
│   ├── FileUpload.tsx            # Drag-and-drop file import
│   └── ShareDialog.tsx           # Share management modal
├── lib/
│   ├── auth.ts                   # NextAuth configuration
│   └── prisma.ts                 # Prisma client singleton
└── types/
    └── next-auth.d.ts            # Session type extensions
```

## File Upload

Supported file types:
- `.txt` — Plain text files converted to document paragraphs
- `.md` / `.markdown` — Markdown files with heading, list, and paragraph parsing

Files are drag-and-drop or click-to-browse. Uploaded content is converted to Tiptap JSON and stored as an editable document.

## Sharing Model

- Each document has one **owner** (the creator)
- Owners can share with other users via email
- Permissions: **edit** (full access) or **view** (read-only)
- Dashboard distinguishes owned documents from shared documents (green left border + "by [owner]" label)
- Only owners can share, delete, or manage access

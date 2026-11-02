# AI Workflow Note

## Tools Used

- **Claude Code (Opus)** — Primary AI assistant for code generation, architecture decisions, and debugging

## Where AI Materially Sped Up Work

1. **Boilerplate generation** — API routes, Prisma schema, NextAuth configuration. These follow well-known patterns and AI generated correct implementations on the first pass.

2. **Component scaffolding** — The Editor toolbar, ShareDialog, FileUpload, and dashboard layouts were generated with proper TypeScript types and Tailwind styling.

3. **Tiptap JSON format** — AI knew the exact ProseMirror JSON schema for the seed document, including marks (bold/italic/underline) and nested structures (bulletList → listItem → paragraph). This would have required documentation reference otherwise.

4. **Markdown-to-Tiptap parsing** — The upload route's `mdToTiptap()` function converts markdown syntax to Tiptap's JSON document format. AI generated the parser with correct node types and nesting.

5. **Next.js 16 compatibility** — Resolved issues with `dynamic` exports in Client Components, `cacheComponents` config conflicts, and FormData typing. AI identified the Suspense boundary pattern for handling `useSession` during static builds.

## What I Changed or Rejected

- **Adjusted Prisma client output** — AI initially used a custom output directory (`src/generated/prisma`) per Prisma v6 defaults. Changed to the standard `@prisma/client` import path for simpler imports across the codebase.

- **Simplified auth approach** — Considered NextAuth v5 (Auth.js) but kept v4 for stability. The credentials provider is simpler and sufficient for this demo.

- **Refined seed data** — Edited the seed script to create a well-formatted demo document that showcases all supported formatting features, not just placeholder text.

## How I Verified Correctness

1. **Build verification** — Ran `npx next build` after every significant change to catch TypeScript errors early.

2. **Browser testing** — Started the dev server and manually tested: login flow, document creation, rich text editing, file upload, sharing workflow, and persistence across refresh.

3. **Automated tests** — Wrote 5 integration tests covering document CRUD, sharing, cascade deletes, and unique constraints. All pass against the real SQLite database.

4. **Visual inspection** — Checked the editor rendering of formatted content (bold, italic, underline, headings, lists) in the browser to ensure Tiptap CSS was applied correctly.

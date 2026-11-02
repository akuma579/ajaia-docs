import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: { name: "Alice Johnson", email: "alice@example.com", password },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: { name: "Bob Smith", email: "bob@example.com", password },
  });

  const charlie = await prisma.user.upsert({
    where: { email: "charlie@example.com" },
    update: {},
    create: { name: "Charlie Lee", email: "charlie@example.com", password },
  });

  const doc = await prisma.document.upsert({
    where: { id: "seed-doc-1" },
    update: {},
    create: {
      id: "seed-doc-1",
      title: "Welcome to Ajaia Docs",
      content: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Welcome to Ajaia Docs" }],
          },
          {
            type: "paragraph",
            content: [
              { type: "text", text: "This is a collaborative document editor. Try editing this document, creating new ones, or sharing with other users." },
            ],
          },
          {
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [{ type: "paragraph", content: [{ type: "text", marks: [{ type: "bold" }], text: "Bold" }, { type: "text", text: ", " }, { type: "text", marks: [{ type: "italic" }], text: "italic" }, { type: "text", text: ", and " }, { type: "text", marks: [{ type: "underline" }], text: "underline" }, { type: "text", text: " formatting" }] }],
              },
              {
                type: "listItem",
                content: [{ type: "paragraph", content: [{ type: "text", text: "Headings and lists" }] }],
              },
              {
                type: "listItem",
                content: [{ type: "paragraph", content: [{ type: "text", text: "File upload and import" }] }],
              },
            ],
          },
        ],
      }),
      ownerId: alice.id,
    },
  });

  await prisma.documentShare.upsert({
    where: { documentId_userId: { documentId: doc.id, userId: bob.id } },
    update: {},
    create: { documentId: doc.id, userId: bob.id, permission: "edit" },
  });

  console.log("Seeded users:", { alice: alice.email, bob: bob.email, charlie: charlie.email });
  console.log("Seeded document:", doc.title);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

describe("Document API", () => {
  let testUser: { id: string; email: string };

  beforeAll(async () => {
    const password = await bcrypt.hash("test123", 10);
    testUser = await prisma.user.create({
      data: {
        name: "Test User",
        email: `test-${Date.now()}@example.com`,
        password,
      },
    });
  });

  afterAll(async () => {
    await prisma.documentShare.deleteMany({
      where: {
        document: { ownerId: testUser.id },
      },
    });
    await prisma.document.deleteMany({ where: { ownerId: testUser.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    await prisma.$disconnect();
  });

  test("can create a document", async () => {
    const doc = await prisma.document.create({
      data: {
        title: "Test Document",
        content: JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] }),
        ownerId: testUser.id,
      },
    });

    expect(doc.id).toBeDefined();
    expect(doc.title).toBe("Test Document");
    expect(doc.ownerId).toBe(testUser.id);
  });

  test("can update a document", async () => {
    const doc = await prisma.document.create({
      data: {
        title: "Original Title",
        content: "{}",
        ownerId: testUser.id,
      },
    });

    const updated = await prisma.document.update({
      where: { id: doc.id },
      data: { title: "Updated Title" },
    });

    expect(updated.title).toBe("Updated Title");
  });

  test("can share a document", async () => {
    const password = await bcrypt.hash("test123", 10);
    const otherUser = await prisma.user.create({
      data: {
        name: "Other User",
        email: `other-${Date.now()}@example.com`,
        password,
      },
    });

    const doc = await prisma.document.create({
      data: {
        title: "Shared Doc",
        content: "{}",
        ownerId: testUser.id,
      },
    });

    const share = await prisma.documentShare.create({
      data: {
        documentId: doc.id,
        userId: otherUser.id,
        permission: "edit",
      },
    });

    expect(share.documentId).toBe(doc.id);
    expect(share.userId).toBe(otherUser.id);
    expect(share.permission).toBe("edit");

    const sharedDocs = await prisma.document.findMany({
      where: { shares: { some: { userId: otherUser.id } } },
    });
    expect(sharedDocs).toHaveLength(1);
    expect(sharedDocs[0].title).toBe("Shared Doc");

    await prisma.documentShare.delete({ where: { id: share.id } });
    await prisma.document.delete({ where: { id: doc.id } });
    await prisma.user.delete({ where: { id: otherUser.id } });
  });

  test("can delete a document and cascade shares", async () => {
    const password = await bcrypt.hash("test123", 10);
    const shareUser = await prisma.user.create({
      data: {
        name: "Share User",
        email: `share-${Date.now()}@example.com`,
        password,
      },
    });

    const doc = await prisma.document.create({
      data: {
        title: "To Delete",
        content: "{}",
        ownerId: testUser.id,
      },
    });

    await prisma.documentShare.create({
      data: { documentId: doc.id, userId: shareUser.id, permission: "view" },
    });

    await prisma.document.delete({ where: { id: doc.id } });

    const shares = await prisma.documentShare.findMany({
      where: { documentId: doc.id },
    });
    expect(shares).toHaveLength(0);

    await prisma.user.delete({ where: { id: shareUser.id } });
  });

  test("enforces unique sharing constraint", async () => {
    const password = await bcrypt.hash("test123", 10);
    const dupUser = await prisma.user.create({
      data: {
        name: "Dup User",
        email: `dup-${Date.now()}@example.com`,
        password,
      },
    });

    const doc = await prisma.document.create({
      data: { title: "Dup Test", content: "{}", ownerId: testUser.id },
    });

    await prisma.documentShare.create({
      data: { documentId: doc.id, userId: dupUser.id, permission: "edit" },
    });

    await expect(
      prisma.documentShare.create({
        data: { documentId: doc.id, userId: dupUser.id, permission: "view" },
      })
    ).rejects.toThrow();

    await prisma.document.delete({ where: { id: doc.id } });
    await prisma.user.delete({ where: { id: dupUser.id } });
  });
});

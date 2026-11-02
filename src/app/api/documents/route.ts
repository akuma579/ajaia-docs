import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const owned = await prisma.document.findMany({
    where: { ownerId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { owner: { select: { name: true, email: true } } },
  });

  const shared = await prisma.document.findMany({
    where: {
      shares: { some: { userId: session.user.id } },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      owner: { select: { name: true, email: true } },
      shares: { where: { userId: session.user.id }, select: { permission: true } },
    },
  });

  return NextResponse.json({ owned, shared });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const title = body.title || "Untitled Document";
  const content = body.content || JSON.stringify({
    type: "doc",
    content: [{ type: "paragraph" }],
  });

  const document = await prisma.document.create({
    data: { title, content, ownerId: session.user.id },
  });

  return NextResponse.json(document, { status: 201 });
}

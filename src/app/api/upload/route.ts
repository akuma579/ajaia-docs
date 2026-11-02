import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function txtToTiptap(text: string) {
  const lines = text.split("\n");
  const content = lines.map((line) => ({
    type: "paragraph" as const,
    ...(line.trim()
      ? { content: [{ type: "text" as const, text: line }] }
      : {}),
  }));
  return { type: "doc", content };
}

function mdToTiptap(text: string) {
  const lines = text.split("\n");
  const content: Record<string, unknown>[] = [];

  for (const line of lines) {
    const h1 = line.match(/^# (.+)/);
    const h2 = line.match(/^## (.+)/);
    const h3 = line.match(/^### (.+)/);
    const bullet = line.match(/^[-*] (.+)/);

    if (h1) {
      content.push({
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: h1[1] }],
      });
    } else if (h2) {
      content.push({
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: h2[1] }],
      });
    } else if (h3) {
      content.push({
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: h3[1] }],
      });
    } else if (bullet) {
      const lastNode = content[content.length - 1];
      const item = {
        type: "listItem",
        content: [{ type: "paragraph", content: [{ type: "text", text: bullet[1] }] }],
      };
      if (lastNode && lastNode.type === "bulletList") {
        (lastNode.content as Record<string, unknown>[]).push(item);
      } else {
        content.push({ type: "bulletList", content: [item] });
      }
    } else if (line.trim()) {
      let inlineContent: Record<string, unknown>[] = [{ type: "text", text: line }];
      const boldMatch = line.match(/\*\*(.+?)\*\*/g);
      if (boldMatch) {
        inlineContent = [{ type: "text", text: line }];
      }
      content.push({ type: "paragraph", content: inlineContent });
    } else {
      content.push({ type: "paragraph" });
    }
  }

  return { type: "doc", content: content.length ? content : [{ type: "paragraph" }] };
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const file = (formData as any).get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const name = file.name.toLowerCase();
  const supportedTypes = [".txt", ".md", ".markdown"];
  const ext = supportedTypes.find((e) => name.endsWith(e));

  if (!ext) {
    return NextResponse.json(
      { error: "Unsupported file type. Supported: .txt, .md" },
      { status: 400 }
    );
  }

  const text = await file.text();
  const title = file.name.replace(/\.(txt|md|markdown)$/i, "");

  let tiptapContent;
  if (ext === ".txt") {
    tiptapContent = txtToTiptap(text);
  } else {
    tiptapContent = mdToTiptap(text);
  }

  const document = await prisma.document.create({
    data: {
      title,
      content: JSON.stringify(tiptapContent),
      ownerId: session.user.id,
    },
  });

  return NextResponse.json(document, { status: 201 });
}

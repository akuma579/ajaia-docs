"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Share2, Check, FileText } from "lucide-react";
import Editor from "@/components/Editor";
import ShareDialog from "@/components/ShareDialog";

interface DocumentData {
  id: string;
  title: string;
  content: string;
  permission: string;
  owner: { id: string; name: string; email: string };
  shares: {
    id: string;
    permission: string;
    user: { id: string; name: string; email: string };
  }[];
}

export default function DocumentContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [doc, setDoc] = useState<DocumentData | null>(null);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);

  const fetchDoc = useCallback(async () => {
    const res = await fetch(`/api/documents/${id}`);
    if (!res.ok) {
      router.push("/dashboard");
      return;
    }
    const data = await res.json();
    setDoc(data);
    setTitle(data.title);
  }, [id, router]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
    if (status === "authenticated") fetchDoc();
  }, [status, router, fetchDoc]);

  async function handleSave(content: string) {
    setSaving(true);
    await fetch(`/api/documents/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleTitleSave() {
    setEditingTitle(false);
    if (title === doc?.title) return;
    await fetch(`/api/documents/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setDoc((prev) => (prev ? { ...prev, title } : null));
  }

  if (!doc) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isOwner = doc.permission === "owner";
  const canEdit = doc.permission !== "view";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0"
            >
              <ArrowLeft size={20} />
            </button>
            <FileText size={20} className="text-blue-600 flex-shrink-0" />
            {editingTitle ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => e.key === "Enter" && handleTitleSave()}
                className="text-lg font-semibold bg-transparent border-b-2 border-blue-500 focus:outline-none min-w-0"
                autoFocus
              />
            ) : (
              <h1
                onClick={() => canEdit && setEditingTitle(true)}
                className={`text-lg font-semibold truncate ${
                  canEdit ? "cursor-pointer hover:text-blue-600" : ""
                }`}
              >
                {doc.title}
              </h1>
            )}
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {saving && (
              <span className="text-sm text-gray-400">Saving...</span>
            )}
            {saved && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <Check size={14} />
                Saved
              </span>
            )}

            {!isOwner && (
              <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full capitalize">
                {doc.permission}
              </span>
            )}

            <span className="text-xs text-gray-400">
              by {doc.owner.name}
            </span>

            {isOwner && (
              <button
                onClick={() => setShowShare(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Share2 size={14} />
                Share
                {doc.shares.length > 0 && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-1.5 rounded-full ml-1">
                    {doc.shares.length}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <Editor
          content={doc.content}
          onSave={handleSave}
          readOnly={!canEdit}
        />
      </main>

      {showShare && (
        <ShareDialog
          documentId={doc.id}
          shares={doc.shares}
          isOwner={isOwner}
          onClose={() => setShowShare(false)}
          onShareUpdate={fetchDoc}
        />
      )}
    </div>
  );
}

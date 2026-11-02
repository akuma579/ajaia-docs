"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Share2, Check, FileText, Shield, Pencil } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isOwner = doc.permission === "owner";
  const canEdit = doc.permission !== "view";

  return (
    <div className="min-h-screen bg-gray-100/50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200/80 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0"
              title="Back to dashboard"
            >
              <ArrowLeft size={18} className="text-gray-600" />
            </button>

            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText size={16} className="text-blue-500" />
            </div>

            <div className="min-w-0 flex items-center gap-2">
              {editingTitle ? (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => e.key === "Enter" && handleTitleSave()}
                  className="text-base font-semibold bg-transparent border-b-2 border-blue-500 focus:outline-none min-w-0 py-0.5"
                  autoFocus
                />
              ) : (
                <h1
                  onClick={() => canEdit && setEditingTitle(true)}
                  className={`text-base font-semibold truncate ${
                    canEdit
                      ? "cursor-pointer hover:text-blue-600 transition-colors group flex items-center gap-1.5"
                      : ""
                  }`}
                >
                  {doc.title}
                  {canEdit && <Pencil size={12} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
                </h1>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Save status */}
            <div className="min-w-[80px] text-right">
              {saving && (
                <span className="text-xs text-gray-400 flex items-center gap-1.5 justify-end">
                  <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                  Saving
                </span>
              )}
              {saved && (
                <span className="text-xs text-emerald-600 flex items-center gap-1 justify-end font-medium">
                  <Check size={14} />
                  Saved
                </span>
              )}
            </div>

            {/* Permission badge */}
            {!isOwner && (
              <span className={`text-xs px-3 py-1 rounded-lg font-medium capitalize flex items-center gap-1 ${
                canEdit
                  ? "bg-blue-50 text-blue-700"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {canEdit ? <Pencil size={10} /> : <Shield size={10} />}
                {doc.permission}
              </span>
            )}

            {/* Owner info */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 px-2">
              <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-[10px] font-bold text-gray-600">
                  {doc.owner.name.charAt(0)}
                </span>
              </div>
              {doc.owner.name}
            </div>

            {/* Share button */}
            {isOwner && (
              <button
                onClick={() => setShowShare(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-gray-700"
              >
                <Share2 size={14} />
                Share
                {doc.shares.length > 0 && (
                  <span className="bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ml-0.5">
                    {doc.shares.length}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Editor area */}
      <main className="max-w-4xl mx-auto px-4 py-8">
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

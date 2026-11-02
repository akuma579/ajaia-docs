import { Suspense } from "react";
import DocumentContent from "./DocumentContent";

export const dynamic = "force-dynamic";

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function DocumentPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DocumentContent />
    </Suspense>
  );
}

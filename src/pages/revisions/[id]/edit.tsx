import { useRouter } from "next/router";

import RevisionEditorPage from "@/components/revisions/RevisionEditorPage";

export default function EditRevisionPage() {
  const router = useRouter();
  const { id } = router.query;

  if (!id || typeof id !== "string") {
    return null;
  }

  return <RevisionEditorPage articleId={id} />;
}

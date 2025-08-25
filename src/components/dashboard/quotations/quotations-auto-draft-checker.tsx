"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { NewQuotation } from "@/types/quotations.types";
import { getLatestAutoDraftHandler, deleteAutoDraftHandler } from "./auto-draft-api";
import AutoDraftRecoveryDialog from "./auto-draft-recovery-dialog";
import { useRouter } from "next/navigation";
import { paths } from "@/utils/paths.utils";
import { toast } from "react-toastify";

const QuotationsAutoDraftChecker = () => {
  const { data: sessionData } = useSession();
  const router = useRouter();
  const [autoDraftData, setAutoDraftData] = useState<{ draft: NewQuotation; timestamp: Date } | null>(null);
  const [showAutoDraftDialog, setShowAutoDraftDialog] = useState<boolean>(false);

  useEffect(() => {
    checkForAutoDraft();
  }, [sessionData]);

  const checkForAutoDraft = async () => {
    if (!sessionData) return;
    
    const { user } = sessionData;
    const autoDraft = await getLatestAutoDraftHandler(user.userId);
    
    if (autoDraft) {
      setAutoDraftData(autoDraft);
      setShowAutoDraftDialog(true);
    }
  };

  const handleRestoreAutoDraft = () => {
    if (!autoDraftData) return;
    
    // Navigate to create quotation page with auto-draft flag
    router.push(`${paths.dashboard.quotations.create}?autoRestore=true`);
    
    setShowAutoDraftDialog(false);
    setAutoDraftData(null);
  };

  const handleDiscardAutoDraft = async () => {
    if (!sessionData) return;
    
    const { user } = sessionData;
    await deleteAutoDraftHandler(user.userId);
    
    setShowAutoDraftDialog(false);
    setAutoDraftData(null);
    
    // Auto-draft discarded silently
  };

  return (
    <AutoDraftRecoveryDialog
      open={showAutoDraftDialog}
      onClose={() => setShowAutoDraftDialog(false)}
      onRestore={handleRestoreAutoDraft}
      onDiscard={handleDiscardAutoDraft}
      autoDraft={autoDraftData}
    />
  );
};

export default QuotationsAutoDraftChecker;
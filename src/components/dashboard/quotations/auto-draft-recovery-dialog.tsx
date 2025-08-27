"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  useTheme,
} from "@mui/material";
import { RestoreFromTrash, Delete } from "@mui/icons-material";
import { NewQuotation } from "@/types/quotations.types";
import { fDateDdMmmYyyy } from "@/utils/time.utils";
import { toast } from "react-toastify";

type Props = {
  open: boolean;
  onClose: () => void;
  onRestore: () => void;
  onDiscard: () => void;
  autoDraft: { draft: NewQuotation; timestamp: Date } | null;
};

const AutoDraftRecoveryDialog = ({
  open,
  onClose,
  onRestore,
  onDiscard,
  autoDraft,
}: Props) => {
  const theme = useTheme();
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  
  if (!autoDraft) return null;

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${day} ${month}, ${year} at ${displayHours}:${minutes} ${ampm}`;
  };

  const handleDiscard = () => {
    setShowDiscardConfirm(true);
  };

  const confirmDiscard = () => {
    onDiscard();
    setShowDiscardConfirm(false);
    toast("Auto-draft discarded successfully", {
      type: "success",
    });
  };

  return (
    <>
    <Dialog
      open={open}
      onClose={() => {}} // Prevent closing on outside click
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      PaperProps={{
        sx: { 
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary
        }
      }}
    >
      <DialogTitle sx={{ pb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box display="flex" alignItems="center" gap={1}>
          <RestoreFromTrash color="primary" />
          <Typography variant="h6" color="text.primary">Auto-Draft Recovery</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ py: 3 }}>
        <Typography variant="body1" gutterBottom color="text.primary">
          Saved your last quotation as auto-draft on{" "}
          <strong>{formatTimestamp(autoDraft.timestamp)}</strong>.
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Do you want to continue editing it?
        </Typography>
        
        {autoDraft.draft.clientData.name && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`
          }}>
            <Typography variant="caption" color="text.secondary">
              Draft Details:
            </Typography>
            <Typography variant="body2" color="text.primary">
              Client: {autoDraft.draft.clientData.name}
            </Typography>
            <Typography variant="body2" color="text.primary">
              Items: {autoDraft.draft.lineItems.length}
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3, borderTop: `1px solid ${theme.palette.divider}`, pt: 2 }}>
        <Button
          onClick={handleDiscard}
          color="error"
          variant="outlined"
          startIcon={<Delete />}
        >
          Discard Draft
        </Button>
        <Button
          onClick={() => {
            onRestore();
            toast("Auto-draft restored successfully", {
              type: "success",
            });
          }}
          color="primary"
          variant="contained"
          startIcon={<RestoreFromTrash />}
        >
          Continue Editing
        </Button>
      </DialogActions>
    </Dialog>
    
    {/* Discard Confirmation Dialog */}
    <Dialog
      open={showDiscardConfirm}
      onClose={() => setShowDiscardConfirm(false)}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Confirm Discard</DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to discard this auto-draft? This action cannot be undone.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowDiscardConfirm(false)} color="primary">
          Cancel
        </Button>
        <Button onClick={confirmDiscard} color="error" variant="contained">
          Discard
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default AutoDraftRecoveryDialog;
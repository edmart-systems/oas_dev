import React, {
  Dispatch,
  forwardRef,
  Fragment,
  Ref,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import {
  IconButton,
  Paper,
  PaperProps,
  Slide,
  Stack,
  Typography,
  CircularProgress,
  Box,
  DialogActions,
  Button,
} from "@mui/material";
import Draggable from "react-draggable";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { TransitionProps } from "@mui/material/transitions";
import { PDFViewer } from "@react-pdf/renderer";
import { Close } from "@mui/icons-material";
import TransferPdfDoc from "./TransferPdfDoc";
import { CompanyDto } from "@/types/company.types";
import { getCompany } from "@/server-actions/user-actions/inventory.actions";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: Ref<unknown>
) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const PaperComponent = (props: PaperProps) => {
  const nodeRef = React.useRef<HTMLDivElement>(null);
  return (
    <Draggable
      nodeRef={nodeRef as React.RefObject<HTMLDivElement>}
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} ref={nodeRef} />
    </Draggable>
  );
};

interface TransferViewProps {
  transfer_id: number;
  created_at: string;
  status: string;
  note?: string | null;
  from_location: { location_id: number; location_name: string };
  to_location: { location_id: number; location_name: string };
  assigned_user: { userId: number; firstName: string; lastName: string } | null;
  creator?: { co_user_id: string; firstName: string; lastName: string } | null;
  signature_data?: string | null;
  items: Array<{
    product: { product_id: number; product_name: string } | null;
    quantity: number;
  }>;
}

type Props = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  transfer: TransferViewProps;
  isSigningMode?: boolean;
  userSignature?: any;
  onSign?: () => void;
  signingLoading?: boolean;
};

const TransferViewDialog = ({ open, setOpen, transfer, isSigningMode, userSignature, onSign, signingLoading }: Props) => {
  const [company, setCompany] = useState<CompanyDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const companyData = await getCompany();
        setCompany(companyData);
      } catch (error) {
        console.error("Failed to fetch company data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchCompany();
    }
  }, [open]);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Fragment>
      <Dialog
        maxWidth="xl"
        fullWidth={true}
        open={open}
        TransitionComponent={Transition}
        PaperComponent={PaperComponent}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography>{isSigningMode ? 'Sign Transfer Note' : 'Transfer'} #{transfer.transfer_id}</Typography>
            <IconButton onClick={handleClose}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ height: isSigningMode ? "auto" : "85vh" }}>
          {loading || !company ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress />
            </Box>
          ) : isSigningMode ? (
            <Box sx={{ p: 2 }}>
              <PDFViewer showToolbar={false} width="100%" height="600px">
                <TransferPdfDoc transfer={transfer} company={company} />
              </PDFViewer>
              {userSignature && (
                <Box sx={{ mt: 3, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
                    Your Digital Signature
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      component="img"
                      src={userSignature.dataUrl}
                      alt="Your signature"
                      sx={{
                        maxWidth: 200,
                        maxHeight: 100,
                        border: '2px solid',
                        borderColor: 'primary.main',
                        borderRadius: 1,
                        bgcolor: 'white',
                        p: 1
                      }}
                    />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Ready to sign and complete transfer
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          ) : (
            <PDFViewer showToolbar width="100%" height="99%">
              <TransferPdfDoc transfer={transfer} company={company} />
            </PDFViewer>
          )}
        </DialogContent>
        {isSigningMode && (
          <DialogActions sx={{ p: 3, bgcolor: 'grey.50' }}>
            <Button onClick={handleClose} size="large">
              Cancel
            </Button>
            <Button 
              onClick={onSign} 
              variant="contained" 
              disabled={signingLoading || !userSignature}
              size="large"
              sx={{ minWidth: 120 }}
            >
              {signingLoading ? "Signing..." : "Sign & Complete Transfer"}
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </Fragment>
  );
};

export default TransferViewDialog;
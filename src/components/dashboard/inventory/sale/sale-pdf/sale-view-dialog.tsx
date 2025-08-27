"use client";

import React from "react";
import { Dialog, DialogTitle, DialogContent, IconButton, Box } from "@mui/material";
import { X } from "@phosphor-icons/react";
import { PDFViewer } from "@react-pdf/renderer";
import SalePDFDoc, { SaleReceipt } from "./sale-pdf-doc";
import { CompanyDto } from "@/types/company.types";

interface Props {
  open: boolean;
  onClose: () => void;
  receipt: SaleReceipt;
  company: CompanyDto;
  formatCurrency?: (amount: number) => string;
}

const SaleViewDialog: React.FC<Props> = ({ open, onClose, receipt, company, formatCurrency }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { height: "90vh", maxHeight: "90vh" } }}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Sale Receipt Preview
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0, height: "100%" }}>
        <Box sx={{ width: "100%", height: "100%" }}>
          <PDFViewer width="100%" height="100%">
            <SalePDFDoc receipt={receipt} company={company} formatCurrency={formatCurrency} />
          </PDFViewer>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SaleViewDialog;

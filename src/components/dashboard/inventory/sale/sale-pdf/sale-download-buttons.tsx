"use client";

import React, { useState, useMemo } from "react";
import { Button, Stack, CircularProgress } from "@mui/material";
import { Eye, Download } from "@phosphor-icons/react";
import { usePDF } from "@react-pdf/renderer";
import SalePDFDoc, { SaleReceipt } from "./sale-pdf-doc";
import SaleViewDialog from "./sale-view-dialog";
import { CompanyDto } from "@/types/company.types";
import { useCurrency } from "@/components/currency/currency-context";

interface Props {
  receipt: SaleReceipt;
  company: CompanyDto;
}

const SaleDownloadButtons: React.FC<Props> = ({ receipt, company }) => {
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const { formatCurrency } = useCurrency();

  const documentNode = useMemo(() => (
    <SalePDFDoc receipt={receipt} company={company} formatCurrency={formatCurrency} />
  ), [receipt, company, formatCurrency]);
  const [instance] = usePDF({ document: documentNode });

  const handleDownload = () => {
    if (instance.url) {
      const link = document.createElement("a");
      link.href = instance.url;
      link.download = `sale-receipt-${receipt.sale_no}.pdf`;
      link.click();
    }
  };

  return (
    <Stack direction="row" spacing={1}>
      <Button variant="outlined" size="small" startIcon={<Eye size={16} />} onClick={() => setViewDialogOpen(true)}>
        View
      </Button>
      <Button
        variant="contained"
        size="small"
        startIcon={instance.loading ? <CircularProgress size={16} /> : <Download size={16} />}
        onClick={handleDownload}
        disabled={instance.loading || !instance.url}
      >
        {instance.loading ? "Generating..." : "Download"}
      </Button>
      <SaleViewDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        receipt={receipt}
        company={company}
        formatCurrency={formatCurrency}
      />
    </Stack>
  );
};

export default SaleDownloadButtons;

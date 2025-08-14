import React, { useState, useEffect } from "react";
import { Button, Stack, Skeleton } from "@mui/material";
import { usePDF } from "@react-pdf/renderer";
import { Eye, Download } from "@phosphor-icons/react";
import PurchasePdfDoc from "./purchase-pdf-doc";
import PurchaseViewDialog from "./purchase-view-dialog";
import { useCurrency } from "@/components/currency/currency-context";
import Link from "next/link";
import { PurchaseDownloadButtonsProps } from "@/modules/inventory/types/purchase.types";
import QRCode from "qrcode";



const PurchaseDownloadButtons = ({ purchase, company,supplierName,inventoryPointName,productNames }: PurchaseDownloadButtonsProps) => {
  const [viewOpen, setViewOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const { formatCurrency } = useCurrency();

  // Generate QR code
  useEffect(() => {
    const generateQR = async () => {
      try {
        const date = new Date(purchase.purchase_created_at || new Date());
        const qrKey = `PO-${purchase.purchase_id}#${(company.legal_name ?? company.business_name).replace(/ /g, "-")}#${supplierName.replace(/ /g, "-")}#${date.toLocaleDateString().replace(/\//g, "-")}`.toUpperCase();
        const dataUrl = await QRCode.toDataURL(qrKey, { errorCorrectionLevel: "Q" });
        setQrDataUrl(dataUrl);
      } catch (error) {
        console.error('QR generation failed:', error);
      }
    };
    generateQR();
  }, [purchase.purchase_id, company, supplierName]);
  
  const [instance] = usePDF({
    document: <PurchasePdfDoc 
      purchase={purchase} 
      company={company} 
      formatCurrency={formatCurrency}
      supplierName={supplierName}
      inventoryPointName={inventoryPointName}
      productNames={productNames}
      qrDataUrl={qrDataUrl}
    />,
  });

  const fileName = `Purchase-Order-PO-${purchase.purchase_id}.pdf`;

  return (
    <>
      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Eye size={16} />}
          onClick={() => setViewOpen(true)}
        >
          View
        </Button>
        {instance.loading ? (
          <Skeleton variant="rounded" width={100} height={32} />
        ) : (
          <Button
            variant="contained"
            size="small"
            startIcon={<Download size={16} />}
            LinkComponent={Link}
            href={instance.url ?? ""}
            target="_blank"
            rel="no-referrer"
            download={fileName}
            disabled={!!instance.error}
          >
            Download
          </Button>
        )}
      </Stack>

      <PurchaseViewDialog
        open={viewOpen}
        setOpen={setViewOpen}
        purchase={purchase}
        company={company}
        formatCurrency={formatCurrency}
        supplierName={supplierName}
        inventoryPointName={inventoryPointName}
        productNames={productNames}
        qrDataUrl={qrDataUrl}
      />
    </>
  );
};

export default PurchaseDownloadButtons;
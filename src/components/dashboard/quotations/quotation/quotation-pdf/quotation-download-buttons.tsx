import { usePDF } from "@react-pdf/renderer";
import React, { Fragment } from "react";
import QuotationPdfDoc from "./doc-components/quotation-pdf-doc";
import Link from "next/link";
import { Button, Skeleton, Stack, Tooltip, Typography } from "@mui/material";
import { Download } from "@phosphor-icons/react";
import { FullQuotation } from "@/types/quotations.types";
import { CompanyDto } from "@/types/company.types";
import { Preview } from "@mui/icons-material";

type Props = {
  openPdfHandler: () => void;
  quotation: FullQuotation;
  company: CompanyDto;
};

const QuotationDownloadButtons = ({
  openPdfHandler,
  company,
  quotation,
}: Props) => {
  const [instance, updateInstance] = usePDF({
    document: <QuotationPdfDoc quotation={quotation} company={company} />,
  });

  return (
    <Fragment>
      <Stack direction="row" alignItems="center" spacing={2}>
        {instance.error && <Typography>{instance.error}</Typography>}
        {instance.loading ? (
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Tooltip title="Loading Document" arrow>
              <Skeleton
                variant="rounded"
                width={120}
                height={40}
                sx={{ cursor: "pointer" }}
              />
            </Tooltip>
            <Tooltip title="Loading Document" arrow>
              <Skeleton
                variant="rounded"
                width={120}
                height={40}
                sx={{ cursor: "pointer" }}
              />
            </Tooltip>
          </Stack>
        ) : (
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Button
              variant="contained"
              color="primary"
              endIcon={<Download />}
              LinkComponent={Link}
              href={instance.url ?? ""}
              target="_blank"
              rel="no-referrer"
              download={`Quotation-${(
                quotation.clientData.name ??
                quotation.clientData.contactPerson ??
                ""
              ).replace(/ /g, "_")}-${
                quotation.isVariant
                  ? `${quotation.quotationId}-${quotation.id}`
                  : quotation.quotationId
              }`}
              disabled={instance.error ? true : false}
            >
              Download
            </Button>
            <Button
              variant="contained"
              color="primary"
              endIcon={<Preview />}
              onClick={openPdfHandler}
            >
              Preview
            </Button>
          </Stack>
        )}
      </Stack>
    </Fragment>
  );
};

export default QuotationDownloadButtons;

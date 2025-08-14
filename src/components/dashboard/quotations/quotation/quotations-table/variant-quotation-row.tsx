import { Stack, TableCell, TableRow, Tooltip, Typography } from "@mui/material";
import React from "react";
import QuotationTableUser from "../../quotations-table-user";
import nProgress from "nprogress";
import { paths } from "@/utils/paths.utils";
import { useRouter } from "next/navigation";
import { fDateDdMmmYyyy, fDateTime12, fToNow } from "@/utils/time.utils";
import { capitalizeFirstLetter } from "@/utils/formatters.util";
import QuotationStatusChip from "../quotation-status-chip";
import {
  EditedSummarizedQuotation,
  QuotationStatusKey,
} from "@/types/quotations.types";

type Props = {
  variant: EditedSummarizedQuotation;
};

const VariantQuotationRow = ({ variant }: Props) => {
  const router = useRouter();

  const openEditedQuotation = () => {
    nProgress.start();
    router.push(
      paths.dashboard.quotations.edited({
        quotationNumber: variant.quotationId,
        quotationId: variant.id,
      })
    );
  };

  return (
    <TableRow
      hover
      tabIndex={-1}
      sx={{ cursor: "pointer" }}
      onClick={() => openEditedQuotation()}
    >
      <TableCell>
        <QuotationTableUser
          userName={variant.userName}
          quotationId={variant.quotationId}
          profilePic={variant.profilePic}
          openQuotation={() => openEditedQuotation()}
        />
      </TableCell>
      <TableCell>
        <Stack>
          <Typography fontWeight={600} variant="body2" alignItems="center">
            Client
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {variant.clientName
              ? `${variant.clientName}${
                  variant.contactPerson ? ` (${variant.contactPerson})` : ""
                }`
              : variant.contactPerson || "Unknown"}
          </Typography>
        </Stack>
      </TableCell>
      <TableCell>
        <Stack>
          <Typography fontWeight={600} variant="body2" alignItems="center">
            Category
          </Typography>
          <Typography variant="body2" alignItems="center">
            {variant.category}
          </Typography>
        </Stack>
      </TableCell>
      <TableCell>
        <Typography fontWeight={600} variant="body2" alignItems="center">
          {variant.currency} {variant.grandTotal.toLocaleString()}
        </Typography>
      </TableCell>
      <TableCell>
        <Tooltip
          title={`${fDateTime12(variant.createdTime)} (${capitalizeFirstLetter(
            fToNow(variant.createdTime)
          )})`}
        >
          <Stack>
            <Typography fontWeight={600} variant="body2" alignItems="center">
              Created
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {fDateDdMmmYyyy(variant.createdTime)}
            </Typography>
          </Stack>
        </Tooltip>
      </TableCell>
      <TableCell>
        <Tooltip
          title={`${fDateTime12(variant.time)} (${capitalizeFirstLetter(
            fToNow(variant.time)
          )})`}
        >
          <Stack>
            <Typography fontWeight={600} variant="body2" alignItems="center">
              Assigned Date
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {fDateDdMmmYyyy(variant.time)}
            </Typography>
          </Stack>
        </Tooltip>
      </TableCell>
      <TableCell>
        <Tooltip
          title={`${fDateTime12(variant.expiryTime)} (${capitalizeFirstLetter(
            fToNow(variant.expiryTime)
          )})`}
        >
          <Stack>
            <Typography fontWeight={600} variant="body2" alignItems="center">
              Due
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {fDateDdMmmYyyy(variant.expiryTime)}
            </Typography>
          </Stack>
        </Tooltip>
      </TableCell>
      <TableCell>
        <QuotationStatusChip
          status={
            variant.isExpired
              ? "expired"
              : (variant.status as QuotationStatusKey)
          }
        />
      </TableCell>
    </TableRow>
  );
};

export default VariantQuotationRow;

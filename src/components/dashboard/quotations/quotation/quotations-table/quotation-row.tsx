import {
  Box,
  Collapse,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { Dispatch, Fragment, SetStateAction, useMemo } from "react";
import QuotationTableUser from "../../quotations-table-user";
import nProgress from "nprogress";
import { paths } from "@/utils/paths.utils";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Remove,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { fDateDdMmmYyyy, fDateTime12, fToNow } from "@/utils/time.utils";
import { capitalizeFirstLetter } from "@/utils/formatters.util";
import QuotationStatusChip from "../quotation-status-chip";
import {
  EditedSummarizedQuotation,
  QuotationStatusKey,
  SummarizedQuotation,
} from "@/types/quotations.types";
import VariantQuotationRow from "./variant-quotation-row";
import { hoverBackground } from "@/utils/styles.utils";

type Props = {
  quotation: SummarizedQuotation;
  index: number;
  openIndex: number;
  setOpenIndex: Dispatch<SetStateAction<number>>;
};

const QuotationRaw = ({ quotation, index, openIndex, setOpenIndex }: Props) => {
  const router = useRouter();

  const openQuotation = () => {
    nProgress.start();
    router.push(paths.dashboard.quotations.single(quotation.quotationId));
  };

  const variants: EditedSummarizedQuotation[] = quotation.variants ?? [];
  const edited = quotation.edited;

  const isOpen: boolean = useMemo(
    () => index === openIndex,
    [index, openIndex]
  );

  return (
    <Fragment>
      <TableRow
        // hover
        tabIndex={-1}
        sx={(theme) => ({
          cursor: "pointer",
          background: index % 2 != 0 ? hoverBackground(theme) : "",
        })}
        // onClick={openQuotation}
      >
        <TableCell>
          <QuotationTableUser
            userName={quotation.userName}
            quotationId={quotation.quotationId}
            profilePic={quotation.profilePic}
            openQuotation={openQuotation}
            edited={edited && variants.length > 0}
          />
        </TableCell>
        <TableCell onClick={openQuotation}>
          <Stack>
            <Typography fontWeight={600} variant="body2" alignItems="center">
              Client
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {quotation.clientName
                ? `${quotation.clientName}${
                    quotation.contactPerson
                      ? ` (${quotation.contactPerson})`
                      : ""
                  }`
                : quotation.contactPerson || "Unknown"}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell onClick={openQuotation}>
          <Stack>
            <Typography fontWeight={600} variant="body2" alignItems="center">
              Category
            </Typography>
            <Typography variant="body2" alignItems="center">
              {quotation.category}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell onClick={openQuotation}>
          <Typography fontWeight={600} variant="body2" alignItems="center">
            {quotation.currency} {quotation.grandTotal.toLocaleString()}
          </Typography>
        </TableCell>
        <TableCell onClick={openQuotation}>
          <Tooltip
            title={`${fDateTime12(quotation.time)} (${capitalizeFirstLetter(
              fToNow(quotation.time)
            )})`}
          >
            <Stack>
              <Typography fontWeight={600} variant="body2" alignItems="center">
                Issued
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {fDateDdMmmYyyy(quotation.time)}
              </Typography>
            </Stack>
          </Tooltip>
        </TableCell>
        <TableCell onClick={openQuotation}>
          <Tooltip
            title={`${fDateTime12(
              quotation.expiryTime
            )} (${capitalizeFirstLetter(fToNow(quotation.expiryTime))})`}
          >
            <Stack>
              <Typography fontWeight={600} variant="body2" alignItems="center">
                Due
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {fDateDdMmmYyyy(quotation.expiryTime)}
              </Typography>
            </Stack>
          </Tooltip>
        </TableCell>
        <TableCell onClick={openQuotation}>
          <QuotationStatusChip
            status={
              quotation.isExpired
                ? "expired"
                : (quotation.status as QuotationStatusKey)
            }
          />
        </TableCell>
        <TableCell>
          {edited && variants.length > 0 ? (
            <Tooltip title={isOpen ? "Minimize" : "Expand"}>
              <IconButton
                color="primary"
                onClick={() => setOpenIndex(isOpen ? 0 : index)}
              >
                {isOpen ? (
                  <KeyboardArrowUp sx={{ width: "20px", height: "20px" }} />
                ) : (
                  <KeyboardArrowDown sx={{ width: "20px", height: "20px" }} />
                )}
              </IconButton>
            </Tooltip>
          ) : (
            <IconButton color="primary">
              <Remove sx={{ width: "20px", height: "20px" }} />
            </IconButton>
          )}
        </TableCell>
        {/* <TableCell>
					<Tooltip title="Open">
						<IconButton color="primary" onClick={openQuotation}>
							<East sx={{ width: "20px", height: "20px" }} />
						</IconButton>
					</Tooltip>
				</TableCell> */}
      </TableRow>
      {variants.length > 0 && (
        <TableRow
          sx={(theme) => ({
            background: hoverBackground(theme),
          })}
        >
          <TableCell
            style={{
              paddingBottom: 0,
              paddingTop: 0,
            }}
            colSpan={12}
          >
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Typography variant="h6" gutterBottom component="div">
                  Variants
                </Typography>
                <Table size="small" aria-label="variants">
                  <TableBody>
                    {variants.map((variant, index) => (
                      <VariantQuotationRow
                        variant={variant}
                        key={variant.id + "0" + index}
                      />
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  );
};

export default QuotationRaw;

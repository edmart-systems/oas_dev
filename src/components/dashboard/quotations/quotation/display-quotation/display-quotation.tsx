import { Logo } from "@/components/core/logo";
import {
  Card,
  CardContent,
  Grid2 as Grid,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import ListItemsTable from "../list-items-table";
import QuotationDetails from "./quotation-details";
import FromAddress from "./from-address";
import ToAddress from "./to-address";
import AmountSummary from "./amount-summary";
import QuotationTcs from "./quotation-tcs";
import CostDueDateHighlight from "./cost-due-date-highlight";
import { FullQuotation } from "@/types/quotations.types";
import { CompanyDto } from "@/types/company.types";
import { fDateDdMmmYyyy } from "@/utils/time.utils";
import QuotationTags from "./quotation-tags";
import { userNameFormatter } from "@/utils/formatters.util";

type Props = {
  quotation: Omit<FullQuotation, "variants">;
  company: CompanyDto;
  isVariant?: boolean;
};

export const generateQrKeyTemp = ({
  quotation,
  company,
}: Omit<Props, "isVariant">): string => {
  return `${quotation.quotationId}#${(
    company.legal_name ?? company.business_name
  ).replace(/ /g, "-")}#To#${(
    quotation.clientData.name ?? quotation.clientData.contactPerson
  )?.replace(/ /g, "-")}#${fDateDdMmmYyyy(quotation.time)
    .replace(/ /g, "-")
    .replace(/,/g, "")}`.toUpperCase();
};

const DisplayQuotation = ({ quotation, company, isVariant }: Props) => {
  return (
    <Card sx={{ p: 5 }}>
      <CardContent>
        <Stack spacing={4}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h4">
              Quotation{isVariant && " Variant"}
            </Typography>
            <Logo color="dark" height={70} width={220} />
          </Stack>
          <QuotationDetails
            issuingTime={quotation.time}
            createdTime={quotation.createdTime}
            currency={quotation.currency}
            expiringAt={quotation.expiryTime}
            quotationId={quotation.quotationId}
            quotationType={quotation.type.name}
            quotationCategory={quotation.category.cat}
            tin={company.tin}
            validityDays={quotation.tcs.validity_days}
            _ref={quotation.clientData.ref}
            edited={quotation.edited}
            isVariant={isVariant ?? false}
          />
          <Grid container spacing={2}>
            <Grid size={{ sm: 6, xs: 12 }}>
              <FromAddress company={company} />
            </Grid>
            <Grid size={{ sm: 6, xs: 12 }}>
              <ToAddress client={quotation.clientData} />
            </Grid>
          </Grid>
          <Stack>
            <CostDueDateHighlight
              total={quotation.grandTotal}
              currency={quotation.currency}
              dueDate={quotation.expiryTime}
            />
          </Stack>
          <Stack spacing={2}>
            <ListItemsTable
              currency={quotation.currency}
              listItems={quotation.lineItems}
            />
            <AmountSummary
              currency={quotation.currency}
              vatExcluded={quotation.vatExcluded}
              vatPercentage={quotation.tcs.vat_percentage}
              priceSummary={{
                subtotal: quotation.subTotal,
                vat: quotation.vat,
                finalTotal: quotation.grandTotal,
              }}
            />
          </Stack>
          <QuotationTcs
            quotationId={quotation.id}
            quotationNumber={quotation.quotationId}
            tcsEdited={quotation.tcsEdited}
            quotationType={quotation.type}
            selectedTcs={quotation.tcs}
            qrKey={generateQrKeyTemp({ quotation, company })}
            isVariant={quotation.isVariant}
          />
          <QuotationTags
            taggedUsers={quotation.taggedUsers}
            creator={{
              co_user_id: quotation.user.co_user_id,
              firstName: quotation.user.firstName,
              lastName: quotation.user.lastName,
              otherName: quotation.user.otherName,
            }}
            isVariant={isVariant ?? false}
            quotationId={{
              quotationId: quotation.id,
              quotationNumber: quotation.quotationId,
            }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default DisplayQuotation;

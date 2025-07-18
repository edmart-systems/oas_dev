"use client";
import { Currency2 } from "@/types/currency.types";
import { PRIMARY_COLOR } from "@/utils/constants.utils";
import { capitalizeFirstLetter } from "@/utils/formatters.util";
import { fDateTime12, fToNow } from "@/utils/time.utils";
import { Box, Stack, Typography } from "@mui/material";

type IntroItemProps = {
  title: string;
  content: string;
};

const IntroItem = ({ title, content }: IntroItemProps) => {
  return (
    <Stack direction="row" spacing={2} sx={{ cursor: "pointer" }}>
      <Typography flex={1} variant="body1">
        {title}:
      </Typography>
      <Typography
        flex={2}
        variant="body1"
        sx={{
          "&:hover": {
            color: PRIMARY_COLOR,
          },
        }}
      >
        {content}
      </Typography>
      <Box flex={{ xl: 3, lg: 3, md: 3, sm: 2, xs: 0 }}></Box>
    </Stack>
  );
};

type Props = {
  quotationId: string;
  tin: string | null;
  quotationType: string;
  quotationCategory: string;
  currency: Currency2;
  issuingTime: number;
  createdTime: number;
  expiringAt: number;
  validityDays: number;
  edited: boolean;
  isVariant: boolean;
  _ref: string | null;
};

const QuotationDetails = ({
  quotationId,
  quotationType,
  quotationCategory,
  tin,
  issuingTime,
  createdTime,
  currency,
  expiringAt,
  validityDays,
  edited,
  _ref,
  isVariant,
}: Props) => {
  return (
    <Stack spacing={1} justifyContent="flex-start">
      <IntroItem
        title="Number"
        content={
          edited
            ? quotationId + " (Edited)"
            : isVariant
            ? quotationId + " Variant"
            : quotationId
        }
      />
      <IntroItem
        title="Type"
        content={`${quotationType} (${quotationCategory})`}
      />
      <IntroItem
        title="Currency"
        content={`${currency.currency_name}, ${currency.currency_code}`}
      />
      {isVariant && (
        <IntroItem
          title="Created"
          content={`${fDateTime12(createdTime)} (${capitalizeFirstLetter(
            fToNow(createdTime)
          )})`}
        />
      )}
      <IntroItem
        title={isVariant ? "Assigned Issue Date" : "Issue Date"}
        content={`${fDateTime12(issuingTime)} (${capitalizeFirstLetter(
          fToNow(issuingTime)
        )})`}
      />
      <IntroItem
        title="Due Date"
        content={`${fDateTime12(expiringAt)} (${capitalizeFirstLetter(
          fToNow(expiringAt)
        )})`}
      />
      {_ref && <IntroItem title="External Ref" content={_ref} />}
      <IntroItem title="Validity" content={`${validityDays} days`} />
      <IntroItem title="TIN" content={tin ?? "N/A"} />
    </Stack>
  );
};

export default QuotationDetails;

"use client";
import { Currency2 } from "@/types/currency.types";
import { QuotationPriceSummary } from "@/types/quotations.types";
import { Box, Checkbox, Stack, Typography } from "@mui/material";

type Props = {
  priceSummary: QuotationPriceSummary;
  vatPercentage: number;
  currency: Currency2;
  vatExcluded: boolean;
};

const AmountSummary = ({
  priceSummary,
  vatPercentage,
  currency,
  vatExcluded,
}: Props) => {
  return (
    <Stack direction={{ xl: "row", sm: "column" }}>
      {vatExcluded && (
        <Stack spacing={1} flex={1}>
          <Stack spacing={0} sx={{ pl: 1 }} direction="row" alignItems="center">
            <Checkbox
              checked={vatExcluded}
              onClick={() => false}
              onChange={() => false}
              inputProps={{ "aria-label": "controlled" }}
              color="error"
              size="small"
            />
            <Typography
              color="error"
              sx={{ cursor: "pointer" }}
              variant="body2"
            >
              VAT Excluded
            </Typography>
          </Stack>
        </Stack>
      )}

      <Stack spacing={1} justifyContent="flex-end" flex={5}>
        <Stack direction="row" spacing={2}>
          <Box flex={{ xl: 6, lg: 5, md: 3, sm: 2, xs: 0 }}></Box>
          <Typography flex={1} variant="body1">
            Subtotal
          </Typography>
          <Typography flex={1} variant="body1" align="right">
            {currency.currency_code}&ensp;&ensp;
            {priceSummary.subtotal.toLocaleString()}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Box flex={{ xl: 6, lg: 5, md: 3, sm: 2, xs: 0 }}></Box>
          <Typography flex={1} variant="body1">
            VAT {!vatExcluded && `(${vatPercentage}%)`}
          </Typography>
          {vatExcluded ? (
            <Typography flex={1} variant="body1" align="right">
              N/A
            </Typography>
          ) : (
            <Typography flex={1} variant="body1" align="right">
              {currency.currency_code}&ensp;&ensp;
              {priceSummary.vat.toLocaleString()}
            </Typography>
          )}
        </Stack>
        <Stack direction="row" spacing={2}>
          <Box flex={{ xl: 6, lg: 5, md: 3, sm: 2, xs: 0 }}></Box>
          <Typography flex={1} variant="body1" fontWeight={600}>
            Total
          </Typography>
          <Typography flex={1} variant="body1" align="right" fontWeight={600}>
            {currency.currency_code}&ensp;&ensp;
            {priceSummary.finalTotal.toLocaleString()}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default AmountSummary;

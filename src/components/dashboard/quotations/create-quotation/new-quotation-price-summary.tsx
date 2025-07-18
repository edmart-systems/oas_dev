"use client";

import { Currency2 } from "@/types/currency.types";
import { QuotationPriceSummary } from "@/types/quotations.types";
import { Box, Checkbox, Stack, Typography } from "@mui/material";
import React, { Dispatch, SetStateAction, useState } from "react";
import RemoveVatDialog from "./remove-vat-dialog";

type Props = {
  priceSummary: QuotationPriceSummary;
  isCalculating: boolean;
  vatPercentage: number;
  selectedCurrency: Currency2;
  excludeVat: boolean;
  setExcludeVat: Dispatch<SetStateAction<boolean>>;
};

const NewQuotationPriceSummary = ({
  priceSummary,
  isCalculating,
  vatPercentage,
  selectedCurrency,
  excludeVat,
  setExcludeVat,
}: Props) => {
  const [openRemoveVat, setOpenRemoveVat] = useState<boolean>(false);

  const handlerExcludeVatClick = () => {
    if (excludeVat) {
      setExcludeVat(false);
      return;
    }

    setOpenRemoveVat(true);
  };

  return (
    <Stack direction={{ xl: "row", sm: "column" }}>
      <Stack spacing={1} flex={1}>
        <Stack spacing={0} sx={{ pl: 1 }} direction="row" alignItems="center">
          <Checkbox
            checked={excludeVat}
            onClick={handlerExcludeVatClick}
            inputProps={{ "aria-label": "controlled" }}
            color="error"
            size="small"
          />
          <Typography
            color="error"
            onClick={handlerExcludeVatClick}
            sx={{ cursor: "pointer" }}
            variant="body2"
          >
            Exclude VAT
          </Typography>
        </Stack>
      </Stack>
      <Stack spacing={1} justifyContent="flex-end" flex={5}>
        <Stack direction="row" spacing={2}>
          <Box flex={{ xl: 6, lg: 5, md: 3, sm: 2, xs: 0 }}></Box>
          <Typography flex={1} variant="body1">
            Subtotal
          </Typography>
          <Typography flex={1} variant="body1" align="right">
            {selectedCurrency.currency_code}&ensp;&ensp;
            {priceSummary.subtotal.toLocaleString()}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Box flex={{ xl: 6, lg: 5, md: 3, sm: 2, xs: 0 }}></Box>
          <Typography flex={1} variant="body1">
            VAT {!excludeVat && `(${vatPercentage}%)`}
          </Typography>
          {excludeVat ? (
            <Typography flex={1} variant="body1" align="right">
              N/A
            </Typography>
          ) : (
            <Typography flex={1} variant="body1" align="right">
              {selectedCurrency.currency_code}&ensp;&ensp;
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
            {selectedCurrency.currency_code}&ensp;&ensp;
            {priceSummary.finalTotal.toLocaleString()}
          </Typography>
        </Stack>
        {openRemoveVat && (
          <RemoveVatDialog
            open={openRemoveVat}
            setOpen={setOpenRemoveVat}
            setExcludeVat={setExcludeVat}
            vatPercentage={vatPercentage}
          />
        )}
      </Stack>
    </Stack>
  );
};

export default NewQuotationPriceSummary;

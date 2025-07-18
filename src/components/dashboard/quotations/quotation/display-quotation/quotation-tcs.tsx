"use client";
import { TcsDto } from "@/types/quotations.types";
import { Stack, Typography } from "@mui/material";
import { Quotation_type } from "@prisma/client";
import {
  generatePaymentStr,
  generateValidityStr,
} from "../../create-quotation/new-quotation-tsc-info";
import BankDetails from "../bank-details";
import QuotationQr from "./quotation-qr";

type Props = {
  quotationId: number;
  quotationNumber: string;
  selectedTcs: TcsDto;
  quotationType: Quotation_type;
  tcsEdited: boolean;
  qrKey: string;
  isVariant: boolean;
};

const QuotationTcs = ({
  quotationId,
  quotationNumber,
  selectedTcs,
  quotationType,
  tcsEdited,
  qrKey,
  isVariant,
}: Props) => {
  const displayTxt = {
    paymentStr: generatePaymentStr({
      selectedTcs: selectedTcs,
      selectedQuoteType: quotationType,
      editTcs: tcsEdited,
    }),
    validityStr: generateValidityStr({
      selectedTcs: selectedTcs,
      editTcs: tcsEdited,
    }),
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1}>
        <Typography variant="body1" fontWeight={600}>
          Terms And Conditions
        </Typography>
        {tcsEdited && <Typography color="error">(Customized)</Typography>}
      </Stack>
      <Stack
        spacing={1}
        // justifyContent="space-between"
        alignContent="center"
        justifyContent={{
          xl: "space-between",
          lg: "space-between",
          md: "center",
        }}
        direction={{ xl: "row", lg: "row", md: "column" }}
        width={{ xl: "100%" }}
      >
        <Stack spacing={1} justifyContent="flex-end">
          <Stack direction="row" spacing={2}>
            <Typography flex={1} variant="body1">
              Validity:
            </Typography>
            <Stack flex={6} direction="row" alignItems="center" spacing={5}>
              <Typography variant="body1">{displayTxt.validityStr}</Typography>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Typography flex={1} variant="body1">
              Payment:
            </Typography>
            <Stack flex={6}>
              <Typography variant="body1">{displayTxt.paymentStr}</Typography>
              <Typography variant="body1">
                {selectedTcs.payment_method_words}
              </Typography>
              <br />
              <BankDetails bank={selectedTcs.bank} />
            </Stack>
          </Stack>
        </Stack>
        <QuotationQr
          width={200}
          length={200}
          quotationId={quotationId}
          quotationNumber={quotationNumber}
          qrKey={qrKey}
          isVariant={isVariant}
        />
      </Stack>
    </Stack>
  );
};

export default QuotationTcs;

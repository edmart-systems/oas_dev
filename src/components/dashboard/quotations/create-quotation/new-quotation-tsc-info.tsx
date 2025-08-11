"use client";
import { TcsDto } from "@/types/quotations.types";
import { Edit, RestartAlt } from "@mui/icons-material";
import { Button, Grid2 as Grid, Stack, Typography } from "@mui/material";
import { Quotation_type } from "@prisma/client";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import EditTcsDialog from "./edit-tcs-dialog";
import BankDetails from "../quotation/bank-details";

type Props = {
  selectedTcs: TcsDto;
  selectedQuoteType: Quotation_type;
  setSelectedTcs: Dispatch<SetStateAction<TcsDto>>;
  tcs: TcsDto[];
  editTcs: boolean;
  setEditTcs: Dispatch<SetStateAction<boolean>>;
};

// Converts payment grace days into a human-readable string
function humanizeGraceDays(days?: number | null): string {
  if (days == null || Number.isNaN(days)) return "N/A";
  if (days <= -365) return "Advance payment";
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} before delivery`;
  if (days === 0) return "On delivery day";
  return `${days} day${days === 1 ? "" : "s"} after delivery`;
}

// Generates the payment phrase using TCS template data
export const generatePaymentStr = ({
  selectedQuoteType,
  selectedTcs,
  editTcs,
}: Omit<Props, "setEditTcs" | "tcs" | "setSelectedTcs">): string => {
  const paymentWords = selectedTcs.payment_words ?? "";

  if (selectedQuoteType.type_id === 1) {
    const days = editTcs
      ? selectedTcs.edited_payment_grace_days
      : selectedTcs.payment_grace_days;

    // If template contains {payment_grace_days_phrase}, replace with humanized phrase
    if (paymentWords.includes("{payment_grace_days_phrase}")) {
      return paymentWords.replace("{payment_grace_days_phrase}", humanizeGraceDays(days));
    }

    // Fallback: old template using {payment_grace_days}
    return paymentWords.replace(
      "{payment_grace_days}",
      String(days ?? "N/A")
    );
  }

  // For other quotation types (with percentages)
  const init = editTcs
    ? selectedTcs.edited_initial_payment_percentage
    : selectedTcs.initial_payment_percentage;

  const last = editTcs
    ? selectedTcs.edited_last_payment_percentage
    : selectedTcs.last_payment_percentage;

  return paymentWords
    .replace("{initial_payment_percentage}", init != null ? String(init) : "N/A")
    .replace("{last_payment_percentage}", last != null ? String(last) : "N/A");
};

export const generateValidityStr = ({
  selectedTcs,
  editTcs,
}: Omit<
  Props,
  "setEditTcs" | "selectedQuoteType" | "tcs" | "setSelectedTcs"
>): string => {
  const validityStr =
    editTcs && selectedTcs.edited_delivery_days
      ? selectedTcs.validity_words?.replace(
          "{validity_days}",
          String(selectedTcs.edited_validity_days ?? "N/A")
        )
      : selectedTcs.validity_words?.replace(
          "{validity_days}",
          String(selectedTcs.validity_days ?? "N/A")
        );

  return validityStr ?? "";
};

const NewQuotationTscInfo = ({
  selectedTcs,
  selectedQuoteType,
  setSelectedTcs,
  tcs,
  editTcs,
  setEditTcs,
}: Props) => {
  const [openConfirmEditTcs, setOpenConfirmEditTcs] = useState<boolean>(false);
  const [displayTxt, setDisplayTxt] = useState<{
    paymentStr: string;
    validityStr: string;
  }>({
    paymentStr: generatePaymentStr({ selectedTcs, selectedQuoteType, editTcs }),
    validityStr: generateValidityStr({
      selectedTcs,
      editTcs,
    }),
  });

  const editTcsHandler = () => {
    setOpenConfirmEditTcs(true);
  };

  useEffect(() => {
    setDisplayTxt({
      paymentStr: generatePaymentStr({
        selectedTcs,
        selectedQuoteType,
        editTcs,
      }),
      validityStr: generateValidityStr({
        selectedTcs,
        editTcs,
      }),
    });
  }, [
    selectedTcs.edited_validity_days,
    selectedTcs.edited_payment_grace_days,
    selectedTcs.edited_initial_payment_percentage,
    selectedTcs.edited_last_payment_percentage,
    editTcs,
  ]);

  const resetTcs = () => {
    const newSelectedTc = tcs.filter(
      (item) => item.quotation_type_id === selectedQuoteType.type_id
    )[0];
    setSelectedTcs(newSelectedTc);
    setEditTcs(false);
  };

  return (
    <Stack spacing={2}>
      <Typography variant="body1" fontWeight={600}>
        Terms And Conditions
      </Typography>
      <Stack spacing={1} justifyContent="flex-end" width={{ xl: "100%" }}>
        <Stack direction="row" spacing={2}>
          <Typography flex={1} variant="body1">
            Validity:
          </Typography>
          <Stack flex={6} direction="row" alignItems="center" spacing={5}>
            <Typography variant="body1">{displayTxt.validityStr}</Typography>

            {editTcs ? (
              <Button
                size="small"
                variant="text"
                color="success"
                endIcon={<RestartAlt />}
                onClick={resetTcs}
              >
                Reset TCs
              </Button>
            ) : (
              <Button
                size="small"
                variant="text"
                color="error"
                endIcon={<Edit />}
                onClick={editTcsHandler}
              >
                Adjust TCs
              </Button>
            )}
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
      {openConfirmEditTcs && (
        <EditTcsDialog
          open={openConfirmEditTcs}
          setOpen={setOpenConfirmEditTcs}
          setEditTcs={setEditTcs}
        />
      )}
    </Stack>
  );
};

export default NewQuotationTscInfo;

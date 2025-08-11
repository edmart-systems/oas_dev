import React, { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  FormControl,
  Grid2 as Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import { TcsDto } from "@/types/quotations.types";
import { checkDigitsOnly } from "@/utils/verification-validation.utils";

type PaymentType = "advance" | "onDelivery" | "beforeDelivery" | "afterDelivery";

type Props = {
  selectedTcs: TcsDto;
  setSelectedTcs: Dispatch<SetStateAction<TcsDto>>;
  editTcs: boolean;
};

const PaymentTermsInput = ({ selectedTcs, setSelectedTcs, editTcs }: Props) => {
  const [paymentType, setPaymentType] = useState<PaymentType>("onDelivery");
  const [days, setDays] = useState<number>(0);

  // Convert grace days to payment type and days on component mount and when selectedTcs changes
  useEffect(() => {
    const graceDays = editTcs 
      ? selectedTcs.edited_payment_grace_days 
      : selectedTcs.payment_grace_days;

    if (graceDays === null || graceDays === undefined) {
      setPaymentType("onDelivery");
      setDays(0);
    } else if (graceDays <= -365) {
      setPaymentType("advance");
      setDays(0);
    } else if (graceDays < 0) {
      setPaymentType("beforeDelivery");
      setDays(Math.abs(graceDays));
    } else if (graceDays === 0) {
      setPaymentType("onDelivery");
      setDays(0);
    } else {
      setPaymentType("afterDelivery");
      setDays(graceDays);
    }
  }, [selectedTcs.payment_grace_days, selectedTcs.edited_payment_grace_days, editTcs]);

  const handlePaymentTypeChange = (evt: SelectChangeEvent) => {
    if (!editTcs) return;
    
    const newType = evt.target.value as PaymentType;
    setPaymentType(newType);

    let newGraceDays: number;
    if (newType === "advance") {
      newGraceDays = -365; // Use -365 to represent advance payment
      setDays(0);
    } else if (newType === "onDelivery") {
      newGraceDays = 0;
      setDays(0);
    } else if (newType === "beforeDelivery") {
      newGraceDays = days > 0 ? -days : -1;
    } else { // afterDelivery
      newGraceDays = days > 0 ? days : 1;
    }

    setSelectedTcs((prev) => ({
      ...prev,
      edited_payment_grace_days: newGraceDays,
    }));
  };

  const handleDaysChange = (evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editTcs) return;
    
    const str = evt.target.value;
    if (!checkDigitsOnly(str)) return;

    const num = parseInt(str, 10);
    if (isNaN(num) || num <= 0) return;

    setDays(num);

    let newGraceDays: number;
    if (paymentType === "beforeDelivery") {
      newGraceDays = -num;
    } else if (paymentType === "afterDelivery") {
      newGraceDays = num;
    } else {
      return; // No days input for advance or onDelivery
    }

    setSelectedTcs((prev) => ({
      ...prev,
      edited_payment_grace_days: newGraceDays,
    }));
  };

  const showDaysInput = paymentType === "beforeDelivery" || paymentType === "afterDelivery";

  return (
    <Grid container spacing={1}>
      <Grid size={{ lg: showDaysInput ? 6 : 12, md: showDaysInput ? 6 : 12, sm: 12, xs: 12 }}>
        <FormControl fullWidth>
          <InputLabel id="payment-type-select-label">Payment Type</InputLabel>
          <Select
            labelId="payment-type-select-label"
            id="payment-type-select"
            value={paymentType}
            label="Payment Type"
            onChange={handlePaymentTypeChange}
            size="small"
            disabled={!editTcs}
          >
            <MenuItem value="advance">Advance Payment</MenuItem>
            <MenuItem value="onDelivery">On Delivery</MenuItem>
            <MenuItem value="beforeDelivery">Before Delivery</MenuItem>
            <MenuItem value="afterDelivery">After Delivery</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      {showDaysInput && (
        <Grid size={{ lg: 6, md: 6, sm: 12, xs: 12 }}>
          <TextField
            label="Number of Days"
            value={days}
            size="small"
            type="number"
            fullWidth
            onChange={handleDaysChange}
            disabled={!editTcs}
            placeholder="Enter days"
            inputProps={{ min: 1, max: 365, step: 1 }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">Days</InputAdornment>
                ),
              },
            }}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default PaymentTermsInput;
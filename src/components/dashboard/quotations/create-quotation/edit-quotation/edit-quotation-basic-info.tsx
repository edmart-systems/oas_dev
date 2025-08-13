import { useAppSelector } from "@/redux/store";
import { Currency2 } from "@/types/currency.types";
import { TcsDto } from "@/types/quotations.types";
import { fDateDdMmmYyyy } from "@/utils/time.utils";
import { checkDigitsOnly } from "@/utils/verification-validation.utils";
import { CalendarMonth } from "@mui/icons-material";
import {
  FormControl,
  Grid2 as Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Quotation_category, Quotation_type } from "@prisma/client";
import React, { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import SelectDateDialog from "./select-date-dialog";
import PaymentTermsInput from "../payment-terms-input";

type Props = {
  tin: string;
  quotationId: string;
  time: number;
  selectedTcs: TcsDto;
  selectedQuoteType: Quotation_type;
  selectedCategory: Quotation_category;
  setSelectedQuoteType: Dispatch<SetStateAction<Quotation_type>>;
  setSelectedCategory: Dispatch<SetStateAction<Quotation_category>>;
  setSelectedTcs: Dispatch<SetStateAction<TcsDto>>;
  quotationTypes: Quotation_type[];
  quotationCategories: Quotation_category[];
  tcs: TcsDto[];
  editTcs: boolean;
  setEditTcs: Dispatch<SetStateAction<boolean>>;
  selectedCurrency: Currency2;
  setSelectedCurrency: Dispatch<SetStateAction<Currency2>>;
  selectedDate: string;
  setSelectedDate: Dispatch<SetStateAction<string>>;
};

const EditQuotationBasicInfo = ({
  tin,
  time,
  quotationId,
  selectedTcs,
  selectedQuoteType,
  setSelectedQuoteType,
  setSelectedTcs,
  quotationTypes,
  tcs,
  editTcs,
  setEditTcs,
  selectedCurrency,
  setSelectedCurrency,
  selectedCategory,
  setSelectedCategory,
  quotationCategories,
  selectedDate,
  setSelectedDate,
}: Props) => {
  const { currencies } = useAppSelector((state) => state.currencies);
  const [openSelectDate, setOpenSelectDate] = useState<boolean>(false);

  const handleQuoteTypeChange = (evt: SelectChangeEvent) => {
    const selectedType = quotationTypes.filter(
      (item) => item.name == evt.target.value
    )[0];
    const newSelectedTc = tcs.filter(
      (item) => item.quotation_type_id === selectedType.type_id
    )[0];
    setSelectedQuoteType(selectedType);
    setSelectedTcs(newSelectedTc);
    setEditTcs(false);
  };

  const handleCategoryChange = (evt: SelectChangeEvent) => {
    const selectedCat = quotationCategories.filter(
      (item) => item.cat == evt.target.value
    )[0];
    setSelectedCategory(selectedCat);
  };

  const handleCurrencyChange = (evt: SelectChangeEvent) => {
    if (!currencies) return;

    const _selectedCurrency = currencies.filter(
      (item) => item.currency_code === evt.target.value
    )[0];

    setSelectedCurrency(_selectedCurrency);
  };

  const validityChangeHandler = (
    evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    try {
      if (!editTcs) return;
      const str = evt.target.value;

      if (!checkDigitsOnly(str)) return;

      const num = parseInt(str, 10);

      setSelectedTcs((prev) => ({
        ...prev,
        edited_validity_days: isNaN(num) ? 0 : num,
      }));
    } catch (err) {
      // console.log(err);
    }
  };



  const initialPaymentPercentageChangeHandler = (
    evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    try {
      if (!editTcs) return;
      const str = evt.target.value;

      if (!checkDigitsOnly(str)) return;

      const _num = parseInt(str, 10);
      let num = isNaN(_num) ? 0 : _num;

      if (num > 100) num = 100;

      setSelectedTcs((prev) => ({
        ...prev,
        edited_initial_payment_percentage: num,
        edited_last_payment_percentage: 100 - num,
      }));
    } catch (err) {
      // console.log(err);
    }
  };

  const lastPaymentPercentageChangeHandler = (
    evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    try {
      if (!editTcs) return;
      const str = evt.target.value;

      if (!checkDigitsOnly(str)) return;

      const _num = parseInt(str, 10);
      let num = isNaN(_num) ? 0 : _num;

      if (num > 100) num = 100;

      setSelectedTcs((prev) => ({
        ...prev,
        edited_last_payment_percentage: num,
        edited_initial_payment_percentage: 100 - num,
      }));
    } catch (err) {
      // console.log(err);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="body1" fontWeight={600}>
        Basic Information
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ lg: 6, md: 6, sm: 12, xs: 12 }}>
          <TextField
            label="Quotation Number"
            value={quotationId}
            size="small"
            fullWidth
          />
        </Grid>
        <Grid size={{ lg: 6, md: 6, sm: 12, xs: 12 }}>
          <TextField
            label="Issue Date"
            value={fDateDdMmmYyyy(selectedDate)}
            onClick={() => setOpenSelectDate(true)}
            size="small"
            fullWidth
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <CalendarMonth />
                  </InputAdornment>
                ),
                sx: { cursor: "pointer" },
              },
            }}
          />
        </Grid>
        <Grid size={{ lg: 6, md: 6, sm: 12, xs: 12 }}>
          <TextField label="TIN" value={tin} size="small" fullWidth />
        </Grid>
        <Grid size={{ lg: 6, md: 6, sm: 12, xs: 12 }}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Currency</InputLabel>
            <Select
              labelId="currency-select-label"
              id="currency-select"
              value={selectedCurrency.currency_code}
              label="Currency"
              onChange={handleCurrencyChange}
              size="small"
            >
              {currencies &&
                currencies.map((item, index) => {
                  return (
                    <MenuItem
                      key={item.currency_code}
                      value={item.currency_code}
                    >
                      {item.currency_name} ({item.currency_code})
                    </MenuItem>
                  );
                })}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ lg: 6, md: 6, sm: 12, xs: 12 }}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">
              Quotation Type
            </InputLabel>
            <Select
              labelId="quote-type-select-label"
              id="quote-type-select"
              value={selectedQuoteType.name}
              label="Quotation Type"
              onChange={handleQuoteTypeChange}
              size="small"
            >
              {quotationTypes.map((item, index) => {
                return (
                  <MenuItem key={item.type_id + "-" + index} value={item.name}>
                    {item.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ lg: 6, md: 6, sm: 12, xs: 12 }}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">
              Quotation Category
            </InputLabel>
            <Select
              labelId="quote-cat-select-label"
              id="quote-type-select"
              value={selectedCategory.cat}
              label="Quotation Category"
              onChange={handleCategoryChange}
              size="small"
            >
              {quotationCategories.map((item, index) => {
                return (
                  <MenuItem key={item.cat_id + "-" + index} value={item.cat}>
                    {item.cat}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ lg: 6, md: 6, sm: 12, xs: 12 }}>
          <TextField
            label="Validity"
            value={selectedTcs.edited_validity_days}
            size="small"
            fullWidth
            onChange={validityChangeHandler}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">Days</InputAdornment>
                ),
              },
            }}
          />
        </Grid>
        {selectedQuoteType.type_id === 1 ? (
          <Grid size={{ lg: 6, md: 6, sm: 12, xs: 12 }}>
            <PaymentTermsInput
              selectedTcs={selectedTcs}
              setSelectedTcs={setSelectedTcs}
              editTcs={editTcs}
            />
          </Grid>
        ) : (
          <Grid size={{ lg: 6, md: 6, sm: 12, xs: 12 }} container spacing={1}>
            <Grid size={{ lg: 6, md: 6, sm: 6, xs: 12 }}>
              <TextField
                label="Payment % On Commissioning"
                value={selectedTcs.edited_initial_payment_percentage}
                size="small"
                fullWidth
                onChange={initialPaymentPercentageChangeHandler}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            <Grid size={{ lg: 6, md: 6, sm: 6, xs: 12 }}>
              <TextField
                label="Payment % On Completion"
                value={selectedTcs.edited_last_payment_percentage}
                size="small"
                fullWidth
                onChange={lastPaymentPercentageChangeHandler}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
          </Grid>
        )}
      </Grid>
      {openSelectDate && (
        <SelectDateDialog
          isOpen={openSelectDate}
          setIsOpen={setOpenSelectDate}
          setSelectedDate={setSelectedDate}
          selectedDate={selectedDate}
        />
      )}
    </Stack>
  );
};

export default EditQuotationBasicInfo;

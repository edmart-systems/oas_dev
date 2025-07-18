import { useAppSelector } from "@/redux/store";
import { Currency2 } from "@/types/currency.types";
import { QuotationInputLineItem } from "@/types/quotations.types";
import {
  checkDigitsOnly,
  checkFloatDigits,
} from "@/utils/verification-validation.utils";
import { ArrowDropDown, ArrowDropUp, DeleteForever } from "@mui/icons-material";
import {
  Autocomplete,
  Avatar,
  Divider,
  Grid2 as Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useMemo, useRef, useState } from "react";
import LineItemDialog from "./line-item-dialog";
import {
  MAX_LINE_ITEM_DESCRIPTION_LENGTH,
  PRIMARY_COLOR,
} from "@/utils/constants.utils";
import { hoverBackground } from "@/utils/styles.utils";

type Props = {
  num: number;
  lineItem: QuotationInputLineItem;
  deleteFn: () => void;
  updateFn: (
    id: number,
    field: keyof QuotationInputLineItem,
    value: any
  ) => void;
  selectedCurrency: Currency2;
  itemsLength: number;
  updateFullItem: (updatedItem: QuotationInputLineItem) => void;
  moveItem: (id: number, direction: 1 | 0) => void;
};

const QuotationListItem = ({
  num,
  lineItem,
  deleteFn,
  updateFn,
  selectedCurrency,
  itemsLength,
  updateFullItem,
  moveItem,
}: Props) => {
  const [openAddNewItem, setOpenNewItem] = useState<boolean>(false);
  const { units } = useAppSelector((state) => state.units);

  const isFirst = num === 1;
  const isLast = num === itemsLength;

  const totalPrice =
    lineItem.unitPrice && lineItem.quantity
      ? lineItem.unitPrice * lineItem.quantity
      : null;

  const openItemEditorHandler = () => {
    if (itemsLength < 4) {
      return;
    }
    setOpenNewItem(true);
  };

  const handleFieldChange = (
    field: keyof QuotationInputLineItem,
    value: any
  ) => {
    try {
      if (field === "quantity" || field === "unitPrice") {
        const str = String(value);
        if (!checkFloatDigits(str)) return;
        if (str.length === 0) {
          updateFn(lineItem.id, field, null);
          return;
        }

        const num = parseFloat(str);
        updateFn(lineItem.id, field, isNaN(num) || num < 0 ? 0 : num);
        return;
      }

      updateFn(lineItem.id, field, String(value));
    } catch (err) {
      console.log(err);
    }
  };

  const mappedUnits: string[] = useMemo(
    () => units.map((item) => item.name),
    [units]
  );
  return (
    <Stack
      pt={2}
      pb={2}
      // spacing={2}
      sx={(theme) => ({
        cursor: "pointer",
        marginTop: "0px !important",
        background: num % 2 != 0 ? hoverBackground(theme) : "",
        "&:hover": { ".arrange-btns": { display: "flex" } },
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        borderRadius: "5px",
      })}
    >
      <Grid container spacing={{ xl: 1, lg: 1, md: 2, sm: 2, xs: 2 }}>
        <Grid
          size={{ xl: 0.4, lg: 0.4, md: 0.4, sm: 0.4, xs: 1 }}
          display="flex"
          justifyContent="center"
          // alignItems="center"
          mt={0.5}
          onClick={openItemEditorHandler}
        >
          <Avatar sx={{ height: "30px", width: "30px" }}>
            <Typography variant="body1" id="item">
              {num}
            </Typography>
          </Avatar>
        </Grid>
        <Grid size={{ xl: 2, lg: 2, md: 5, sm: 5, xs: 11 }}>
          <TextField
            label="Product/Service Name"
            value={lineItem.name || ""}
            size="small"
            multiline
            minRows={1}
            fullWidth
            onChange={(evt) => handleFieldChange("name", evt.target.value)}
            onClick={openItemEditorHandler}
          />
        </Grid>
        <Grid size={{ xl: 3, lg: 3, md: 6.6, sm: 6.6, xs: 12 }}>
          <TextField
            label="Description"
            value={lineItem.description || ""}
            error={
              lineItem.description
                ? lineItem.description.length > MAX_LINE_ITEM_DESCRIPTION_LENGTH
                : false
            }
            size="small"
            multiline
            minRows={1}
            maxRows={5}
            fullWidth
            onChange={(evt) =>
              handleFieldChange("description", evt.target.value)
            }
            onClick={openItemEditorHandler}
          />
        </Grid>
        <Grid size={{ xl: 1, lg: 1, md: 6, sm: 6, xs: 6 }}>
          <TextField
            label="Quantity"
            value={lineItem.quantity}
            size="small"
            fullWidth
            type="number"
            onChange={(evt) => handleFieldChange("quantity", evt.target.value)}
            onClick={openItemEditorHandler}
          />
        </Grid>
        <Grid size={{ xl: 1, lg: 1, md: 6, sm: 6, xs: 6 }}>
          <Autocomplete
            options={mappedUnits}
            disableListWrap
            disableClearable
            freeSolo
            renderInput={(params) => (
              <TextField {...params} label="Units" size="small" />
            )}
            inputValue={lineItem.units ?? ""}
            onInputChange={(evt, newValue) =>
              handleFieldChange("units", newValue)
            }
            onChange={(evt, newValue) => handleFieldChange("units", newValue)}
            renderOption={(props, option, { inputValue }) => {
              const parts = option.split(new RegExp(`(${inputValue})`, "gi"));

              return (
                <li {...props}>
                  {parts.map((part, index) =>
                    part.toLowerCase() === inputValue.toLowerCase() ? (
                      <span
                        key={index}
                        style={{ color: PRIMARY_COLOR, fontWeight: "bold" }}
                      >
                        {part}
                      </span>
                    ) : (
                      <span key={index}>{part}</span>
                    )
                  )}
                </li>
              );
            }}
          />
          {/* <TextField
            label="Units"
            value={lineItem.units || ""}
            select
            size="small"
            fullWidth
            onChange={(evt) => handleFieldChange("units", evt.target.value)}
            onClick={openItemEditorHandler}
          >
            {units &&
              units.map((item, index) => {
                return (
                  <MenuItem key={item.short_name} value={item.name}>
                    {item.name}
                  </MenuItem>
                );
              })}
          </TextField> */}

          {/* <AutoComplete
            selectedOption={selectedUnit}
            setSelectedOption={setUnitMethod}
            staticData={mappedUnits}
            fieldProps={{
              label: "Units",
              variant: "outlined",
              size: "small",
              fullWidth: true,
            }}
            allowOther
            initValue={lineItem.units ?? ""}
          /> */}
        </Grid>
        <Grid size={{ xl: 2, lg: 2, md: 6.4, sm: 5.4, xs: 12 }}>
          <TextField
            label="Unit Price"
            size="small"
            fullWidth
            value={lineItem.unitPrice}
            type="number"
            onChange={(evt) => handleFieldChange("unitPrice", evt.target.value)}
            onClick={openItemEditorHandler}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    {selectedCurrency.currency_code}
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>
        <Grid size={{ xl: 2, lg: 1.8, md: 4.8, sm: 5, xs: 9 }}>
          <TextField
            label="Total Price"
            size="small"
            fullWidth
            value={totalPrice?.toLocaleString() || ""}
            onClick={openItemEditorHandler}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    {selectedCurrency.currency_code}
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>
        <Grid
          size={{ xl: 0.6, lg: 0.8, md: 0.8, sm: 1.6, xs: 3 }}
          display="flex"
          direction="row"
          justifyContent="space-between"
          // alignItems="center"
        >
          <Stack>
            <IconButton onClick={deleteFn}>
              <DeleteForever />
            </IconButton>
          </Stack>
          <Stack
            direction="column"
            alignItems="center"
            // justifyContent="center"
            className="arrange-btns"
            display="none"
          >
            {!isFirst && (
              <Tooltip title="Move Up" arrow placement="top-start">
                <IconButton
                  size="small"
                  sx={{ width: "20px", height: "20px" }}
                  onClick={() => moveItem(lineItem.id, 1)}
                >
                  <ArrowDropUp />
                </IconButton>
              </Tooltip>
            )}

            {!isLast && (
              <Tooltip title="Move Down" arrow placement="bottom-start">
                <IconButton
                  size="small"
                  sx={{ width: "20px", height: "20px" }}
                  onClick={() => moveItem(lineItem.id, 0)}
                >
                  <ArrowDropDown />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Grid>
      </Grid>
      {/* <Divider /> */}
      {openAddNewItem && (
        <LineItemDialog
          mode="update"
          itemNumber={num}
          open={openAddNewItem}
          setOpen={setOpenNewItem}
          selectedCurrency={selectedCurrency}
          updateFn={updateFullItem}
          originalItem={lineItem}
        />
      )}
    </Stack>
  );
};

export default QuotationListItem;

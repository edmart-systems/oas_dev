import React, {
  Dispatch,
  forwardRef,
  Fragment,
  Ref,
  SetStateAction,
  useMemo,
  useState,
} from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { useAppSelector } from "@/redux/store";
import { Currency2 } from "@/types/currency.types";
import {
  checkDigitsOnly,
  checkFloatDigits,
} from "@/utils/verification-validation.utils";
import {
  Autocomplete,
  Avatar,
  Divider,
  Grid2 as Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  PaperProps,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { QuotationInputLineItem } from "@/types/quotations.types";
import { getTimeNum } from "@/utils/time.utils";
import Draggable from "react-draggable";
import { Close } from "@mui/icons-material";
import {
  MAX_LINE_ITEM_DESCRIPTION_LENGTH,
  PRIMARY_COLOR,
} from "@/utils/constants.utils";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: Ref<unknown>
) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const PaperComponent = (props: PaperProps) => {
  const nodeRef = React.useRef<HTMLDivElement>(null);
  return (
    <Draggable
      nodeRef={nodeRef as React.RefObject<HTMLDivElement>}
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} ref={nodeRef} />
    </Draggable>
  );
};

type Props = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  mode: "new" | "update";
  addFn?: (item: QuotationInputLineItem) => void;
  updateFn?: (updatedItem: QuotationInputLineItem) => void;
  itemNumber: number;
  originalItem?: QuotationInputLineItem;
  selectedCurrency: Currency2;
};

const LineItemDialog = ({
  open,
  setOpen,
  itemNumber,
  mode,
  addFn,
  originalItem,
  updateFn,
  selectedCurrency,
}: Props) => {
  const { units } = useAppSelector((state) => state.units);
  const [lineItem, setLineItem] = useState<QuotationInputLineItem>(
    originalItem || { id: getTimeNum() }
  );
  const [selectedUnit, setSelectedUnit] = useState<string>(
    lineItem.units ?? ""
  );

  const totalPrice =
    lineItem.unitPrice && lineItem.quantity
      ? lineItem.unitPrice * lineItem.quantity
      : null;

  const handleClose = () => {
    setSelectedUnit("");
    setOpen(false);
  };

  const confirmBtnHandler = () => {
    if (mode === "new") {
      addFn && addFn(lineItem);
    } else {
      updateFn && updateFn(lineItem);
    }
    handleClose();
  };

  const addAnotherItemHandler = () => {
    if (mode !== "new") {
      return;
    }
    addFn && addFn(lineItem);
    setLineItem({
      id: getTimeNum(),
      name: null,
      units: null,
      quantity: null,
      unitPrice: null,
      description: null,
    });
  };

  const updateLineItem = (field: keyof QuotationInputLineItem, value: any) => {
    setLineItem((prev) => ({ ...prev, [field]: value }));
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
          updateLineItem(field, null);
          return;
        }

        const num = parseFloat(str);
        updateLineItem(field, isNaN(num) || num < 0 ? 0 : num);
        return;
      }

      updateLineItem(field, String(value));
    } catch (err) {
      console.log(err);
    }
  };

  const setUnitMethod = (unit: string) => {
    setSelectedUnit(unit);
    handleFieldChange("units", unit);
  };

  const mappedUnits: string[] = useMemo(
    () => units.map((item) => item.name),
    [units]
  );

  return (
    <Fragment>
      <Dialog
        maxWidth="xl"
        fullWidth={true}
        open={open}
        TransitionComponent={Transition}
        PaperComponent={PaperComponent}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography>
              {mode === "new" ? "Add New Line Item" : "Update Line Item"}
            </Typography>
            <IconButton onClick={handleClose}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ overflow: "scroll" }}>
          <Stack spacing={2} sx={{ p: 1 }}>
            <Grid container spacing={{ xl: 1, lg: 1, md: 2, sm: 2, xs: 2 }}>
              <Grid
                size={{ xl: 0.5, lg: 0.5, md: 0.5, sm: 0.5, xs: 0.5 }}
                display="flex"
                justifyContent="center"
                // alignItems="center"
                mt={0.5}
              >
                <Avatar sx={{ height: "30px", width: "30px" }}>
                  <Typography variant="body1">{itemNumber}</Typography>
                </Avatar>
              </Grid>
              <Grid size={{ xl: 2.5, lg: 2.5, md: 5.5, sm: 5.5, xs: 11.4 }}>
                <TextField
                  label="Product/Service Name"
                  value={lineItem.name || ""}
                  size="small"
                  multiline
                  minRows={1}
                  fullWidth
                  onChange={(evt) =>
                    handleFieldChange("name", evt.target.value)
                  }
                />
              </Grid>
              <Grid size={{ xl: 3, lg: 3, md: 6, sm: 6, xs: 12 }}>
                <TextField
                  label="Description"
                  value={lineItem.description || ""}
                  error={
                    lineItem.description
                      ? lineItem.description.length >
                        MAX_LINE_ITEM_DESCRIPTION_LENGTH
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
                />
              </Grid>
              <Grid size={{ xl: 1, lg: 1, md: 3, sm: 6, xs: 6 }}>
                <TextField
                  label="Quantity"
                  value={lineItem.quantity || ""}
                  size="small"
                  fullWidth
                  type="number"
                  onChange={(evt) =>
                    handleFieldChange("quantity", evt.target.value)
                  }
                />
              </Grid>
              <Grid size={{ xl: 1, lg: 1, md: 3, sm: 6, xs: 6 }}>
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
                  onChange={(evt, newValue) =>
                    handleFieldChange("units", newValue)
                  }
                  renderOption={(props, option, { inputValue }) => {
                    const parts = option.split(
                      new RegExp(`(${inputValue})`, "gi")
                    );

                    return (
                      <li {...props}>
                        {parts.map((part, index) =>
                          part.toLowerCase() === inputValue.toLowerCase() ? (
                            <span
                              key={index}
                              style={{
                                color: PRIMARY_COLOR,
                                fontWeight: "bold",
                              }}
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
              </Grid>
              <Grid size={{ xl: 2, lg: 2, md: 3, sm: 6, xs: 12 }}>
                <TextField
                  label="Unit Price"
                  size="small"
                  fullWidth
                  value={lineItem.unitPrice || ""}
                  type="number"
                  onChange={(evt) =>
                    handleFieldChange("unitPrice", evt.target.value)
                  }
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
              <Grid size={{ xl: 2, lg: 2, md: 3, sm: 6, xs: 12 }}>
                <TextField
                  label="Total Price"
                  size="small"
                  fullWidth
                  value={totalPrice?.toLocaleString() || ""}
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
            </Grid>
            <Divider />
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Button onClick={handleClose} variant="outlined" color="error">
            Close
          </Button>
          <Stack direction="row" spacing={2}>
            {mode === "new" && (
              <Button
                onClick={() => addAnotherItemHandler()}
                variant="contained"
                color="primary"
              >
                Add Another Item
              </Button>
            )}
            <Button
              onClick={confirmBtnHandler}
              variant="contained"
              color="primary"
            >
              {mode === "new" ? "Save Item" : "Update Item"}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};

export default LineItemDialog;

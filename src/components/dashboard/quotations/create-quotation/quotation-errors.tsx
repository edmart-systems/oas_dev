import {
  QuotationError,
  QuotationInputClientData,
} from "@/types/quotations.types";
import { checkDigitsOnly } from "@/utils/verification-validation.utils";
import { Close, Warning } from "@mui/icons-material";
import {
  Alert,
  Grid2 as Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { ChangeEvent } from "react";

type Props = {
  quotationErrors: QuotationError[];
  closeFn: () => void;
};

const QuotationErrors = ({ quotationErrors, closeFn }: Props) => {
  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body1" color="error">
          Quotation Errors ({quotationErrors.length})
        </Typography>
        <IconButton size="small" onClick={closeFn}>
          <Close />
        </IconButton>
      </Stack>
      <Grid container spacing={1}>
        {quotationErrors.map((item, index) => {
          return (
            <Grid
              size={{ lg: 12, md: 12, sm: 12 }}
              key={item.origin + "-" + index}
            >
              <Alert color="error" variant="standard" icon={<Warning />}>
                {item.origin}:&ensp;{item.message}
              </Alert>
            </Grid>
          );
        })}
      </Grid>
    </Stack>
  );
};

export default QuotationErrors;

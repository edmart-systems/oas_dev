import { TcsDto } from "@/types/quotations.types";
import {
  Grid2 as Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";

type Props = {
  selectedTcs: TcsDto;
  excludeVat: boolean;
};

const TaxDiscountInfo = ({ selectedTcs, excludeVat }: Props) => {
  return (
    <Stack spacing={2}>
      <Typography variant="body1" fontWeight={600}>
        Discount
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ lg: 6, md: 6, sm: 12, xs: 12 }}>
          <TextField
            label="Discount"
            value="0"
            size="small"
            fullWidth
            onChange={() => {}}
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              },
            }}
          />
        </Grid>
        {/* <Grid size={4}>
          <TextField label="Shipping Rate" value={0} size="small" fullWidth />
        </Grid> */}
        <Grid size={{ lg: 6, md: 6, sm: 12, xs: 12 }}>
          <TextField
            label="Tax Rate"
            value={excludeVat ? "" : selectedTcs.vat_percentage}
            size="small"
            fullWidth
            onChange={() => {}}
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              },
            }}
          />
        </Grid>
      </Grid>
    </Stack>
  );
};

export default TaxDiscountInfo;

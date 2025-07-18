import { QuotationInputClientData } from "@/types/quotations.types";
import { checkDigitsOnly } from "@/utils/verification-validation.utils";
import {
  Grid2 as Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { ChangeEvent, Dispatch, SetStateAction } from "react";

type Props = {
  setClientData: Dispatch<SetStateAction<QuotationInputClientData>>;
  clientData: QuotationInputClientData;
};

const ClientInfo = ({ clientData, setClientData }: Props) => {
  const boxNumberChangeHandler = (
    evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    try {
      const str = evt.target.value;

      if (!checkDigitsOnly(str)) return;

      const num = parseInt(str, 10);

      setClientData((prev) => ({
        ...prev,
        boxNumber: isNaN(num) ? 0 : num,
      }));
    } catch (err) {
      // console.log(err);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="body1" fontWeight={600}>
        Client Information
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ lg: 6, md: 6, sm: 12, xs: 12 }}>
          <TextField
            label="Name"
            value={clientData.name}
            size="small"
            fullWidth
            onChange={(evt) =>
              setClientData((prev) => ({
                ...prev,
                name: evt.target.value,
              }))
            }
          />
        </Grid>
        <Grid size={{ lg: 6, md: 6, sm: 12, xs: 12 }}>
          <TextField
            label="External Ref"
            value={clientData.ref}
            size="small"
            fullWidth
            onChange={(evt) =>
              setClientData((prev) => ({
                ...prev,
                ref: evt.target.value,
              }))
            }
          />
        </Grid>
        <Grid size={{ lg: 6, md: 6, sm: 12, xs: 12 }}>
          <TextField
            label="Contact Person"
            value={clientData.contactPerson}
            size="small"
            fullWidth
            onChange={(evt) =>
              setClientData((prev) => ({
                ...prev,
                contactPerson: evt.target.value,
              }))
            }
          />
        </Grid>
        <Grid size={{ lg: 6, md: 6, sm: 12, xs: 12 }}>
          <TextField
            label="Email"
            value={clientData.email}
            size="small"
            fullWidth
            onChange={(evt) =>
              setClientData((prev) => ({
                ...prev,
                email: evt.target.value,
              }))
            }
          />
        </Grid>
        <Grid size={{ lg: 6, md: 6, sm: 12, xs: 12 }}>
          <TextField
            label="Phone"
            value={clientData.phone}
            size="small"
            fullWidth
            onChange={(evt) =>
              setClientData((prev) => ({
                ...prev,
                phone: evt.target.value,
              }))
            }
          />
        </Grid>
        <Grid size={{ lg: 6, md: 6, sm: 12, xs: 12 }}>
          <TextField
            label="Box Number"
            value={clientData.boxNumber}
            size="small"
            fullWidth
            onChange={boxNumberChangeHandler}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">P. O. Box</InputAdornment>
                ),
              },
            }}
          />
        </Grid>
        <Grid size={{ lg: 6, md: 6, sm: 12, xs: 12 }}>
          <TextField
            label="Country"
            value={clientData.country}
            size="small"
            fullWidth
            onChange={(evt) =>
              setClientData((prev) => ({
                ...prev,
                country: evt.target.value,
              }))
            }
          />
        </Grid>
        <Grid size={{ lg: 6, md: 6, sm: 12, xs: 12 }}>
          <TextField
            label="City"
            value={clientData.city}
            size="small"
            fullWidth
            onChange={(evt) =>
              setClientData((prev) => ({
                ...prev,
                city: evt.target.value,
              }))
            }
          />
        </Grid>
        <Grid size={{ lg: 6, md: 6, sm: 12, xs: 12 }}>
          <TextField
            label="Street Address"
            value={clientData.addressLine1}
            size="small"
            fullWidth
            onChange={(evt) =>
              setClientData((prev) => ({
                ...prev,
                addressLine1: evt.target.value,
              }))
            }
          />
        </Grid>
      </Grid>
    </Stack>
  );
};

export default ClientInfo;

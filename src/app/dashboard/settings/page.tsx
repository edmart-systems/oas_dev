"use client";

import PageTitle from "@/components/dashboard/common/page-title";
import { useCurrency } from "@/components/currency/currency-context";
import { 
  Box, 
  Stack, 
  Typography, 
  Card, 
  CardContent, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem 
} from "@mui/material";

const SettingsPage = () => {
  const { currency, setCurrency, currencies } = useCurrency();
  
  return (
    <Stack spacing={3}>
      <PageTitle title="Settings" />
      
      <Card sx={{ maxWidth: 400 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Currency Settings
          </Typography>
          {currencies.length === 0 ? (
            <Typography>Loading currencies...</Typography>
          ) : (
            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select
                value={currency?.code || ''}
                onChange={(e) => {
                  const selected = currencies.find(c => c.code === e.target.value);
                  if (selected) setCurrency(selected);
                }}
                label="Currency"
              >
                {currencies.map((curr) => (
                  <MenuItem key={curr.code} value={curr.code}>
                    {curr.symbol} - {curr.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </CardContent>
      </Card>
      <Stack width="100%" justifyContent="center" alignItems="center">
        <Box
          component="img"
          alt="Dash"
          src="/assets/Settings.gif"
          borderRadius={2}
          sx={{
            display: "inline-block",
            height: "auto",
            maxWidth: "100%",
            width: "600px",
            opacity: 0.4,
          }}
        />
      </Stack>
    </Stack>
  );
};

export default SettingsPage;

import { Card, CardContent, Stack, Typography } from "@mui/material";
import React from "react";
import { EditedSummarizedQuotation } from "@/types/quotations.types";
import VariantQuotationsTable from "../quotations-table/variant-quotations-table";

type Props = {
  variants: EditedSummarizedQuotation[];
};

const DisplayQuotationVariants = ({ variants }: Props) => {
  return (
    <Card sx={{ p: 5 }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h5">Variants ({variants.length})</Typography>
          </Stack>
          <VariantQuotationsTable isFetching={false} visibleRows={variants} />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default DisplayQuotationVariants;

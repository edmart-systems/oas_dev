"use client";

import { Grid2 as Grid, useTheme } from "@mui/material";
import React from "react";
import AnalyticV1, { analyticIconStyle } from "../common/analytic-v1";
import { QuotationStatusCounts } from "@/types/quotations.types";
import {
  AutoAwesome,
  Done,
  HighlightOff,
  QueryBuilder,
  RemoveCircle,
} from "@mui/icons-material";
import { fShortenNumber } from "@/utils/number.utils";

type Props = {
  quotationsSummary: QuotationStatusCounts;
};

const QuotationsPageAnalytics = ({ quotationsSummary }: Props) => {
  const { created, sent, accepted, expired, rejected, all } = quotationsSummary;
  const theme = useTheme();

  return (
    <Grid container spacing={3}>
      <Grid size={{ xl: 2.4, lg: 6, md: 6, sm: 12, xs: 12 }}>
        <AnalyticV1
          title="Created"
          icon={<AutoAwesome {...analyticIconStyle(theme, true)} />}
          content={String(created.count)}
          // secondaryContent="Quotations"
        />
      </Grid>
      <Grid size={{ xl: 2.4, lg: 6, md: 6, sm: 12, xs: 12 }}>
        <AnalyticV1
          title="Sent"
          icon={<QueryBuilder {...analyticIconStyle(theme, true)} />}
          content={String(sent.count)}
          // secondaryContent="Quotations"
        />
      </Grid>
      <Grid size={{ xl: 2.4, lg: 6, md: 6, sm: 12, xs: 12 }}>
        <AnalyticV1
          title="Accepted"
          icon={<Done {...analyticIconStyle(theme, true)} />}
          content={String(accepted.count)}
          // secondaryContent="Quotations"
        />
      </Grid>
      <Grid size={{ xl: 2.4, lg: 6, md: 6, sm: 12, xs: 12 }}>
        <AnalyticV1
          title="Rejected"
          icon={<HighlightOff {...analyticIconStyle(theme, true)} />}
          content={String(rejected.count)}
          // secondaryContent="Quotations"
        />
      </Grid>
      <Grid size={{ xl: 2.4, lg: 12, md: 12, sm: 12, xs: 12 }}>
        <AnalyticV1
          title="Expired"
          icon={<RemoveCircle {...analyticIconStyle(theme, false)} />}
          content={String(expired.count)}
          // secondaryContent="Quotations"
        />
      </Grid>
    </Grid>
  );
};

export default QuotationsPageAnalytics;

"use client";

import { Grid2 as Grid, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
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
import { getQuotationsSums } from "@/server-actions/quotations-actions/quotations.actions";

type Props = {
  quotationsSummary: QuotationStatusCounts;
};

const QuotationsPageAnalytics = ({ quotationsSummary }: Props) => {
  const [counts, setCounts] = useState(quotationsSummary);
  const theme = useTheme();
  
  useEffect(() => {
    const refreshCounts = async () => {
      const res = await getQuotationsSums();
      if (res.status && res.data) {
        setCounts(res.data);
      }
    };
    
    refreshCounts();
    const interval = setInterval(refreshCounts, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const { created, sent, accepted, expired, rejected, all } = counts;

  return (
    <Grid container spacing={3}>
      <Grid size={{ xl: 2.4, lg: 6, md: 6, sm: 12, xs: 12 }}>
        <AnalyticV1
          title="Created"
          icon={<AutoAwesome {...analyticIconStyle(theme, true)} />}
          content={String(created?.count || 0)}
          // secondaryContent="Quotations"
        />
      </Grid>
      <Grid size={{ xl: 2.4, lg: 6, md: 6, sm: 12, xs: 12 }}>
        <AnalyticV1
          title="Sent"
          icon={<QueryBuilder {...analyticIconStyle(theme, true)} />}
          content={String(sent?.count || 0)}
          // secondaryContent="Quotations"
        />
      </Grid>
      <Grid size={{ xl: 2.4, lg: 6, md: 6, sm: 12, xs: 12 }}>
        <AnalyticV1
          title="Accepted"
          icon={<Done {...analyticIconStyle(theme, true)} />}
          content={String(accepted?.count || 0)}
          // secondaryContent="Quotations"
        />
      </Grid>
      <Grid size={{ xl: 2.4, lg: 6, md: 6, sm: 12, xs: 12 }}>
        <AnalyticV1
          title="Rejected"
          icon={<HighlightOff {...analyticIconStyle(theme, true)} />}
          content={String(rejected?.count || 0)}
          // secondaryContent="Quotations"
        />
      </Grid>
      <Grid size={{ xl: 2.4, lg: 12, md: 12, sm: 12, xs: 12 }}>
        <AnalyticV1
          title="Expired"
          icon={<RemoveCircle {...analyticIconStyle(theme, false)} />}
          content={String(expired?.count || 0)}
          // secondaryContent="Quotations"
        />
      </Grid>
    </Grid>
  );
};

export default QuotationsPageAnalytics;

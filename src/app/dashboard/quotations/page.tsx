import { getQuotationsSums } from "@/server-actions/quotations-actions/quotations.actions";
import MyCircularProgress from "@/components/common/my-circular-progress";
import PageTitle from "@/components/dashboard/common/page-title";
import FilterQuotationsDialog from "@/components/dashboard/quotations/filter-quotations-dialog";
import QuotationsDisplayMode from "@/components/dashboard/quotations/quotations-display-mode";
import QuotationsFetchingProgress from "@/components/dashboard/quotations/quotations-fetching-progress";
import QuotationsFilterCard from "@/components/dashboard/quotations/quotations-filter-card";
import QuotationsPageAnalytics from "@/components/dashboard/quotations/quotations-page-analytics";
import QuotationsSortByTime from "@/components/dashboard/quotations/quotations-sort-by-time";
import QuotationsTableContainer from "@/components/dashboard/quotations/quotations-table-container";
import { ActionResponse } from "@/types/actions-response.types";
import { QuotationStatusCounts } from "@/types/quotations.types";
import { paths } from "@/utils/paths.utils";
import { AddCircle } from "@mui/icons-material";
import { Box, Button, Grid2 as Grid, Stack, Typography } from "@mui/material";
import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import QuotationDraftsMenu from "@/components/dashboard/quotations/create-quotation/quotation-drafts-menu";

export const metadata: Metadata = {
  title: "Quotations | Office X",
  description: "Office Automation System",
};

const getSummaryData = async (): Promise<QuotationStatusCounts | null> => {
  const res: ActionResponse<QuotationStatusCounts> = await getQuotationsSums();

  if (!res.status || !res.data) {
    console.log(res.message);
    return Promise.resolve(null);
  }

  const summaryData = res.data;
  return Promise.resolve(summaryData);
};

const blankCount = {
  count: 0,
  sum: 0,
};

const QuotationsPage = async () => {
  const quotationsSummary = (await getSummaryData()) ?? {
    created: blankCount,
    sent: blankCount,
    accepted: blankCount,
    rejected: blankCount,
    expired: blankCount,
    all: blankCount,
  };

  return (
    <Stack spacing={3}>
      <Stack
        spacing={1}
        sx={{ flex: "1 1 auto" }}
        justifyContent="space-between"
        direction="row"
      >
        <Stack direction="row">
          <PageTitle title="Quotations" />
        </Stack>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Button
            variant="contained"
            size="medium"
            endIcon={<AddCircle />}
            LinkComponent={Link}
            href={paths.dashboard.quotations.create}
          >
            New
          </Button>
          <QuotationDraftsMenu isCreatePage={false} />
        </Box>
      </Stack>
      <QuotationsPageAnalytics quotationsSummary={quotationsSummary} />
      <Stack direction="row" justifyContent="space-between">
        <Stack
          sx={{ display: { xl: "none", lg: "flex", md: "flex", sm: "flex" } }}
        >
          <FilterQuotationsDialog />
        </Stack>
        <Stack>&ensp;</Stack>
        <Stack
          spacing={3}
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
        >
          <QuotationsFetchingProgress />
          {/* <Suspense fallback={<MyCircularProgress />}>
					<QuotationsSortByTime />
				</Suspense> */}
          <Suspense fallback={<MyCircularProgress />}>
            <QuotationsDisplayMode />
          </Suspense>
        </Stack>
      </Stack>
      <Grid container spacing={3}>
        <Grid
          size={{ xl: 3, lg: 12, md: 12, sm: 12 }}
          sx={{
            display: {
              xl: "grid",
              lg: "none",
              md: "none",
              sm: "none",
              xs: "none",
            },
          }}
        >
          <QuotationsFilterCard />
        </Grid>
        <Grid size={{ xl: 9, lg: 12, md: 12, sm: 12 }}>
          <Suspense fallback={<MyCircularProgress />}>
            <QuotationsTableContainer quotationsSummary={quotationsSummary} />
          </Suspense>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default QuotationsPage;

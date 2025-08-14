// src/app/dashboard/quotations/create/page.tsx

"use server";

import React, { Suspense } from "react";
import { Button, Stack, Typography } from "@mui/material";
import PageGoBack from "@/components/dashboard/common/page-go-back";
import CreateQuotation from "@/components/dashboard/quotations/create-quotation/create-quotation";
import { CreateQuotationPageData } from "@/types/quotations.types";
import { getCreateNewQuotationsPageData } from "@/server-actions/quotations-actions/quotations.actions";
import { paths } from "@/utils/paths.utils";
import { redirect } from "next/navigation";
// import { toast } from "react-toastify";
import QuotationDraftsMenu from "@/components/dashboard/quotations/create-quotation/quotation-drafts-menu";
import MyCircularProgress from "@/components/common/my-circular-progress";
import UserSignatureButton from "@/components/dashboard/users/user/signature/user-signature-button";
import PageTitle from "@/components/dashboard/common/page-title";

const getData = async (): Promise<CreateQuotationPageData | null> => {
  const res = await getCreateNewQuotationsPageData();
  const { message, status, data } = res;

  if (!status) {
    console.log(message);
    return Promise.resolve(null);
  }

  return Promise.resolve(data);
};

const CreateQuotationPage = async () => {
  const data: CreateQuotationPageData | null = await getData();

  if (!data) {
    // toast("Failed to fetch required data", { type: "error" });
    return redirect(paths.dashboard.quotations.main);
  }

  return (
    <Stack spacing={3}>
      <Stack>
        <PageGoBack
          backName="Quotation(s)"
          // link={paths.dashboard.quotations.main}
        />
      </Stack>
      <Stack
        direction={{ xl: "row", lg: "row", md: "row", sm: "row", xs: "column" }}
        justifyContent="space-between"
        gap={3}
      >
        <Stack direction="row">
          <PageTitle title="Create Quotation" />
        </Stack>
        <Stack
          direction="row"
          flexWrap="wrap"
          alignItems="center"
          // spacing={2}
          gap={2}
        >
          <UserSignatureButton />
          <Suspense fallback={<MyCircularProgress />}>
            <QuotationDraftsMenu />
          </Suspense>
        </Stack>
      </Stack>
      <Stack>
        <Suspense fallback={<MyCircularProgress />}>
          <CreateQuotation baseData={data} />
        </Suspense>
      </Stack>
    </Stack>
  );
};

export default CreateQuotationPage;

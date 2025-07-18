"use server";

import React, { Suspense } from "react";
import { Stack, Typography } from "@mui/material";
import PageGoBack from "@/components/dashboard/common/page-go-back";
import { EditQuotationPageData } from "@/types/quotations.types";
import { getEditQuotationsPageData } from "@/server-actions/quotations-actions/quotations.actions";
import { paths } from "@/utils/paths.utils";
import { redirect } from "next/navigation";
import MyCircularProgress from "@/components/common/my-circular-progress";
import UserSignatureButton from "@/components/dashboard/users/user/signature/user-signature-button";
import EditQuotation from "@/components/dashboard/quotations/create-quotation/edit-quotation/edit-quotation";
import PageTitle from "@/components/dashboard/common/page-title";

const getData = async (
  quotationId: string
): Promise<EditQuotationPageData | null> => {
  const res = await getEditQuotationsPageData(quotationId);

  // console.log(res.status);
  // console.log(res.message);
  if (!res.status || !res.data) {
    return Promise.resolve(null);
  }

  return Promise.resolve(res.data);
};

type Props = {
  params: Promise<{ id: string }>;
};

const EditQuotationPage = async ({ params }: Props) => {
  const { id } = await params;
  const data: EditQuotationPageData | null = await getData(id);

  if (!data) {
    // toast("Failed to fetch required data", { type: "error" });
    return redirect(paths.dashboard.quotations.main);
  }

  return (
    <Stack spacing={3}>
      <Stack>
        <PageGoBack
          backName="Quotation"
          link={paths.dashboard.quotations.single(id)}
        />
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <PageTitle title={`Edit Quotation ${id}`} />
        <Stack direction="row" alignItems="center" spacing={2}>
          <UserSignatureButton />
        </Stack>
      </Stack>
      <Stack>
        <Suspense fallback={<MyCircularProgress />}>
          <EditQuotation baseData={data} />
        </Suspense>
      </Stack>
    </Stack>
  );
};

export default EditQuotationPage;

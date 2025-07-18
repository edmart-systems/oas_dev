import { fetchSingleQuotationPageData } from "@/server-actions/quotations-actions/quotations.actions";
import PageGoBack from "@/components/dashboard/common/page-go-back";
import DisplayQuotation from "@/components/dashboard/quotations/quotation/display-quotation/display-quotation";
import DisplayQuotationVariants from "@/components/dashboard/quotations/quotation/display-quotation/display-quotation-variants";
import QuotationActions from "@/components/dashboard/quotations/quotation/quotation-actions";
import QuotationPageHead from "@/components/dashboard/quotations/quotation/quotation-page-header";
import {
  FullQuotation,
  SingleQuotationPageData,
} from "@/types/quotations.types";
import { paths } from "@/utils/paths.utils";
import { Stack } from "@mui/material";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Quotation | Office X",
  description: "Office Automation System",
};

type Props = {
  params: Promise<{ id: string }>;
};

const getData = async (
  quotationId: string
): Promise<SingleQuotationPageData | null> => {
  try {
    const res = await fetchSingleQuotationPageData(quotationId);

    if (res.status && res.data) {
      return Promise.resolve(res.data as SingleQuotationPageData);
    }

    return Promise.resolve(null);
  } catch (err) {
    return Promise.resolve(null);
  }
};

const SingleQuotationPage = async ({ params }: Props) => {
  const { id } = await params;
  const pageData = await getData(id);

  if (!pageData) {
    return redirect(paths.errors.notFound);
  }

  const company = pageData.company;
  const { variants, ...quotation } = pageData.quotation;

  return (
    <Stack spacing={3}>
      <Stack>
        <PageGoBack
          backName="Quotations"
          link={paths.dashboard.quotations.main}
        />
      </Stack>
      <Stack direction="row" justifyContent="space-between" flexWrap="wrap">
        <QuotationPageHead
          quotationId={quotation.quotationId}
          userId={quotation.user.co_user_id}
          firstName={quotation.user.firstName}
          lastName={quotation.user.lastName}
          status={quotation.status}
          isExpired={quotation.isExpired}
        />
        <QuotationActions
          quotation={quotation}
          company={company}
          editCounts={variants.length}
        />
      </Stack>
      <DisplayQuotation quotation={quotation} company={company} />
      {variants.length > 0 && <DisplayQuotationVariants variants={variants} />}
    </Stack>
  );
};

export default SingleQuotationPage;

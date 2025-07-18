import { fetchSingleEditedQuotationPageData } from "@/server-actions/quotations-actions/quotations.actions";
import PageGoBack from "@/components/dashboard/common/page-go-back";
import DisplayQuotation from "@/components/dashboard/quotations/quotation/display-quotation/display-quotation";
import QuotationActions from "@/components/dashboard/quotations/quotation/quotation-actions";
import QuotationPageHead from "@/components/dashboard/quotations/quotation/quotation-page-header";
import {
  QuotationId,
  SingleEditedQuotationPageData,
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
  _quotationId: QuotationId
): Promise<SingleEditedQuotationPageData | null> => {
  try {
    const res = await fetchSingleEditedQuotationPageData(_quotationId);

    if (res.status && res.data) {
      return Promise.resolve(res.data);
    }

    return Promise.resolve(null);
  } catch (err) {
    return Promise.resolve(null);
  }
};

const SingleQuotationPage = async ({ params }: Props) => {
  const { id } = await params;
  const idArr = id.split(".");

  const quotationNumber = idArr[0];
  const quotationId = parseInt(idArr[1], 10);

  if (idArr.length !== 2 || isNaN(quotationId)) {
    return redirect(paths.errors.notFound);
  }

  const pageData = await getData({
    quotationNumber: quotationNumber,
    quotationId: quotationId,
  });

  if (!pageData) {
    return redirect(paths.errors.notFound);
  }

  const quotation = pageData.quotation;
  const company = pageData.company;

  return (
    <Stack spacing={3}>
      <Stack>
        <PageGoBack backName="Quotation(s)" />
      </Stack>
      <Stack direction="row" justifyContent="space-between" flexWrap="wrap">
        <QuotationPageHead
          quotationId={quotation.quotationId}
          userId={quotation.user.co_user_id}
          firstName={quotation.user.firstName}
          lastName={quotation.user.lastName}
          status={quotation.status}
          isExpired={quotation.isExpired}
          isVariant
        />
        <QuotationActions
          quotation={quotation}
          company={company}
          editCounts={50}
          isVariant
        />
      </Stack>
      <DisplayQuotation quotation={quotation} company={company} isVariant />
    </Stack>
  );
};

export default SingleQuotationPage;

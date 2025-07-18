import React from "react";
import { Page, View, Document, StyleSheet, Font } from "@react-pdf/renderer";
import DraftDocHeader from "./draft-doc-header";
import DraftDocTitle from "./draft-doc-title";
import DraftDocFooter from "./draft-doc-footer";
import DraftDocAboutUs from "./draft-doc-about-us";
import DraftDocDetails from "./draft-doc-details";
import DraftDocCurrency from "./draft-doc-currency";
import DraftDocTable from "./draft-doc-table";
import DraftDocTcs from "./draft-doc-tcs";
import DraftDocLastTxt from "./draft-doc-last-txt";
import {
  FullQuotation,
  QuotationDraftPreviewData,
} from "@/types/quotations.types";
import { CompanyDto } from "@/types/company.types";
import { userNameFormatter } from "@/utils/formatters.util";
import DraftDocQr from "./draft-doc-qr";
import { generateQrKeyTemp } from "../../../quotation/display-quotation/display-quotation";
import { fDateDdMmmYyyy } from "@/utils/time.utils";
import DocCreator from "./draft-doc-creator";
import DraftDocWatermark from "./draft-doc-watermark";

Font.register({
  family: "Comic Sans MS",
  fonts: [
    { src: "/assets/fonts/ComicSansMS.ttf" },
    { src: "/assets/fonts/ComicSansMS_B.ttf", fontWeight: 700 },
  ],
});

type Props = {
  quotation: QuotationDraftPreviewData;
  company: CompanyDto;
};

const QuotationDraftPdfDoc = ({ company, quotation }: Props) => {
  const date = new Date(quotation.time);
  const draftId = String(quotation.quotationId);
  const qrKey = `Draft${quotation.quotationId}#${(
    company.legal_name ?? company.business_name
  ).replace(/ /g, "-")}#To#${(
    quotation.clientData.name ?? quotation.clientData.contactPerson
  )?.replace(/ /g, "-")}#${fDateDdMmmYyyy(quotation.time)
    .replace(/ /g, "-")
    .replace(/,/g, "")}`.toUpperCase();

  return (
    <Document
      title={`Quotation-Draft-${(
        quotation.clientData.name ??
        quotation.clientData.contactPerson ??
        ""
      ).replace(/ /g, "_")}-${quotation.quotationId}`}
      creator={company.legal_name ?? company.business_name}
      author={userNameFormatter(
        quotation.user.firstName,
        quotation.user.lastName
      )}
      subject={`Draft ${quotation.type.name} (${quotation.category.cat})`}
      language="En"
      creationDate={date}
    >
      <Page size="A4" style={styles.page}>
        <DraftDocWatermark />
        <DraftDocHeader />
        <DraftDocQr quotationNumber={draftId} qrKey={qrKey} />
        <View style={styles.mainContainer}>
          <DraftDocTitle
            companyName={company.legal_name ?? company.business_name}
          />
          <DraftDocDetails
            quotationId={draftId}
            tin={company.tin}
            time={quotation.time}
            client={quotation.clientData}
          />
          <DraftDocAboutUs category={quotation.category} />
          <DraftDocCurrency currency={quotation.currency} />
          <DraftDocTable
            lineItems={quotation.lineItems}
            grandTotal={quotation.grandTotal}
            subtotal={quotation.subtotal}
            vat={quotation.vat}
            vatPercentage={quotation.tcs.vat_percentage}
            vatExcluded={quotation.vatExcluded}
          />
          <DraftDocTcs
            tcsEdited={quotation.tcsEdited}
            quotationType={quotation.type}
            selectedTcs={quotation.tcs}
          />
          <DocCreator
            firstName={quotation.user.firstName}
            lastName={quotation.user.lastName}
            companyName={company.legal_name ?? company.business_name}
            signature={quotation.signature}
          />
          <DraftDocLastTxt />
        </View>
        <DraftDocFooter company={company} />
      </Page>
    </Document>
  );
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Comic Sans MS",
    fontSize: "11px",
    flexDirection: "column",
    backgroundColor: "#fff",
    alignItems: "center",
    paddingTop: "24px",
    paddingBottom: "94px",
    // justifyContent: "center",
  },
  mainContainer: {
    width: "100%",
    paddingHorizontal: "50px",
    display: "flex",
    gap: "5px",
  },
});

export default QuotationDraftPdfDoc;

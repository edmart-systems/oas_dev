import React from "react";
import { Page, View, Document, StyleSheet, Font } from "@react-pdf/renderer";
import DocHeader from "./doc-header";
import DocTitle from "./doc-title";
import DocFooter from "./doc-footer";
import DocAboutUs from "./doc-about-us";
import DocDetails from "./doc-details";
import DocCurrency from "./doc-currency";
import DocTable from "./doc-table";
import DocTcs from "./doc-tcs";
import DocLastTxt from "./doc-last-txt";
import DocCreator from "./doc-creator";
import { FullQuotation } from "@/types/quotations.types";
import { CompanyDto } from "@/types/company.types";
import { userNameFormatter } from "@/utils/formatters.util";
import DocQr from "./doc-qr";
import { generateQrKeyTemp } from "../../display-quotation/display-quotation";
import DocItPartnersLogos from "./doc-it-partners-logos";

Font.register({
  family: "Comic Sans MS",
  fonts: [
    { src: "/assets/fonts/ComicSansMS.ttf" },
    { src: "/assets/fonts/ComicSansMS_B.ttf", fontWeight: 700 },
  ],
});

type Props = {
  quotation: FullQuotation;
  company: CompanyDto;
};

const QuotationPdfDoc = ({ company, quotation }: Props) => {
  const date = new Date(quotation.time);
  const qrKey = generateQrKeyTemp({ quotation, company });

  return (
    <Document
      title={`Quotation-${(
        quotation.clientData.name ??
        quotation.clientData.contactPerson ??
        ""
      ).replace(/ /g, "_")}-${quotation.quotationId}`}
      creator={company.legal_name ?? company.business_name}
      author={userNameFormatter(
        quotation.user.firstName,
        quotation.user.lastName
      )}
      subject={`${quotation.type.name} (${quotation.category.cat})`}
      language="En"
      creationDate={date}
    >
      <Page size="A4" style={styles.page}>
        <DocHeader />
        <DocQr
          quotationNumber={quotation.quotationId}
          qrKey={qrKey}
          quotationId={quotation.id}
          isVariant={quotation.isVariant}
        />
        <View style={styles.mainContainer}>
          <DocTitle companyName={company.legal_name ?? company.business_name} />
          <DocDetails
            quotationId={quotation.quotationId}
            tin={company.tin}
            time={quotation.time}
            client={quotation.clientData}
          />
          <DocAboutUs category={quotation.category} />
          <DocCurrency currency={quotation.currency} />
          <DocTable
            lineItems={quotation.lineItems}
            grandTotal={quotation.grandTotal}
            subtotal={quotation.subTotal}
            vat={quotation.vat}
            vatPercentage={quotation.tcs.vat_percentage}
            vatExcluded={quotation.vatExcluded}
          />
          <DocTcs
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
          <DocLastTxt />
          {/* {quotation.category.cat === "IT" && <DocItPartnersLogos />} */}
        </View>
        <DocFooter company={company} />
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

export default QuotationPdfDoc;

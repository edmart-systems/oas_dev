import React from "react";
import { Page, View, Document, StyleSheet, Font } from "@react-pdf/renderer";
import TransferDocHeader from "./transfer-doc-components/transfer-doc-header";
import TransferDocTitle from "./transfer-doc-components/transfer-doc-title";
import DocFooter from "../../quotations/quotation/quotation-pdf/doc-components/doc-footer";
import TransferDocDetails from "./transfer-doc-components/transfer-doc-details";
import TransferDocTable from "./transfer-doc-components/transfer-doc-table";
import TransferDocCreator from "./transfer-doc-components/transfer-doc-creator";
import { CompanyDto } from "@/types/company.types";

Font.register({
  family: "Comic Sans MS",
  fonts: [
    { src: "/assets/fonts/ComicSansMS.ttf" },
    { src: "/assets/fonts/ComicSansMS_B.ttf", fontWeight: 700 },
    { src: "/assets/fonts/ComicSansMS.ttf", fontStyle: "italic" },
    { src: "/assets/fonts/ComicSansMS_B.ttf", fontWeight: 700, fontStyle: "italic" },
  ],
});

interface TransferPdfProps {
  transfer: {
    transfer_id: number;
    created_at: string;
    status: string;
    note?: string | null;
    from_location: { location_id: number; location_name: string };
    to_location: { location_id: number; location_name: string };
    assigned_user: { userId: number; firstName: string; lastName: string } | null;
    creator?: { co_user_id: string; firstName: string; lastName: string } | null;
    signature_data?: string | null;
    items: Array<{
      product: { product_id: number; product_name: string } | null;
      quantity: number;
    }>;
  };
  company: CompanyDto;
}

const TransferPdfDoc: React.FC<TransferPdfProps> = ({ transfer, company }) => {
  const date = new Date(transfer.created_at);

  return (
    <Document
      title={`Transfer-Note-${transfer.transfer_id}`}
      creator="Office Automation System"
      author={transfer.assigned_user ? `${transfer.assigned_user.firstName} ${transfer.assigned_user.lastName}` : "System"}
      subject="Transfer Note"
      language="En"
      creationDate={date}
    >
      <Page size="A4" style={styles.page}>
        <TransferDocHeader />
        <View style={styles.mainContainer}>
          <TransferDocTitle />
          <TransferDocDetails transfer={transfer} />
          <TransferDocTable items={transfer.items} />
          <TransferDocCreator
            assignedUser={transfer.assigned_user}
            signature={transfer.signature_data}
          />
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
  },
  mainContainer: {
    width: "100%",
    paddingHorizontal: "50px",
    display: "flex",
    gap: "5px",
  },
});

export default TransferPdfDoc;
import React from "react";
import { Page, View, Document, StyleSheet, Font } from "@react-pdf/renderer";
import { UserSignatureDto } from "@/types/user.types";
import PreviewSignatureCreator from "./preview-signature-doc-creator";
import PreviewSignatureDocHeader from "./preview-signature-doc-header";
import PreviewSignatureDocTitle from "./preview-signature-doc-title";

Font.register({
  family: "Comic Sans MS",
  fonts: [
    { src: "/assets/fonts/ComicSansMS.ttf" },
    { src: "/assets/fonts/ComicSansMS_B.ttf", fontWeight: 700 },
  ],
});

type Props = {
  signature: UserSignatureDto;
  userName: string;
};

const PreviewSignaturePdfDoc = ({ signature, userName }: Props) => {
  return (
    <Document
      title="Signature Preview"
      creator="Edmart Systems (U) Limited"
      author={userName}
      subject="Signature Preview"
      language="En"
      creationDate={new Date()}
    >
      <Page size="A4" style={styles.page}>
        <PreviewSignatureDocHeader />
        <View style={styles.mainContainer}>
          <PreviewSignatureDocTitle />
          <View style={styles.spaceContainer}></View>
          <PreviewSignatureCreator signature={signature} userName={userName} />
        </View>
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
    paddingBottom: "100px",
    // justifyContent: "center",
  },
  mainContainer: {
    width: "100%",
    paddingHorizontal: "50px",
    display: "flex",
    gap: "5px",
  },
  spaceContainer: {
    width: "100%",
    height: "120px",
  },
});

export default PreviewSignaturePdfDoc;

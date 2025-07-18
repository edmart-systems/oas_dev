import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";
import React, { Fragment } from "react";
import { generateQrBase64 } from "../../display-quotation/quotation-qr";
import { quotationVerificationUrl } from "@/utils/constants.utils";
import { isDevUrl } from "@/utils/url.utils";

type Props = {
  quotationId: number;
  quotationNumber: string;
  qrKey: string;
  isVariant: boolean;
};

const DocQr = ({ quotationId, quotationNumber, qrKey, isVariant }: Props) => {
  const key = process.env.NEXT_PUBLIC_QUOTATION_QR_URL_KEY;
  const isDev = isDevUrl();

  if (!key) {
    return <Fragment></Fragment>;
  }

  const qrUrl = quotationVerificationUrl(
    { quotationNumber: quotationNumber, quotationId: quotationId },
    key,
    isVariant
  );

  return (
    <Fragment>
      <View fixed style={styles.qrContainer}>
        {isDev ? (
          <Image src={generateQrBase64(qrKey)} />
        ) : (
          <Image src={generateQrBase64(qrUrl)} />
        )}
      </View>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  qrContainer: {
    position: "absolute",
    right: "10px",
    top: "10px",
    width: "80px",
    height: "80px",
  },
  qrImg: {
    width: "100%",
    height: "100%",
  },
});
export default DocQr;

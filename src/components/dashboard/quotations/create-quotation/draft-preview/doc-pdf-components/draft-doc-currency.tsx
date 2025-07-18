import { Currency2 } from "@/types/currency.types";
import { StyleSheet, Text, View } from "@react-pdf/renderer";
import React, { Fragment } from "react";

type Props = {
  currency: Currency2;
};

const DraftDocCurrency = ({ currency }: Props) => {
  return (
    <Fragment>
      <View style={styles.currencyContainer}>
        <Text style={styles.currencyTxt}>
          Currency: {currency.currency_code}
        </Text>
      </View>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  currencyContainer: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  currencyTxt: {
    width: "100%",
    // fontSize: "12px",
    textAlign: "right",
    // marginRight: "10px",
  },
  bold: {
    fontWeight: 700,
  },
});

export default DraftDocCurrency;

import { StyleSheet, Text, View } from "@react-pdf/renderer";
import React, { Fragment } from "react";

const DocLastTxt = () => {
  return (
    <Fragment>
      <View style={styles.txtContainer}>
        <Text style={styles.txt1}>
          Thank you for the Inquiry, Please get back to us in case of anything.
        </Text>
        <Text style={styles.txt2}>For verification, scan the QR code.</Text>
      </View>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  txtContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "0px",
  },
  txt1: {
    // fontSize: "12px",
  },
  txt2: {
    fontSize: "10px",
  },
});
export default DocLastTxt;

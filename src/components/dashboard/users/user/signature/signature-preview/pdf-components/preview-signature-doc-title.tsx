import { StyleSheet, Text, View } from "@react-pdf/renderer";
import React, { Fragment } from "react";

type Props = {};

const PreviewSignatureDocTitle = ({}: Props) => {
  return (
    <Fragment>
      <View style={styles.container}>
        <View style={styles.topNameContainer}>
          <Text style={styles.topName}>EDMART SYSTEM (U) LIMITED</Text>
        </View>
        <View style={styles.docNameContainer}>
          <Text style={styles.docName}>SIGNATURE PREVIEW</Text>
        </View>
      </View>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "8px",
    gap: "5px",
  },
  topNameContainer: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  topName: {
    fontSize: "14px",
    fontWeight: 700,
    textAlign: "center",
  },
  docNameContainer: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D98219",
    paddingVertical: "3px",
    borderRadius: "5px",
  },
  docName: {
    fontSize: "15px",
    fontWeight: 700,
    textAlign: "center",
    color: "#fff",
    textShadow: "0.9px 0px #fff",
  },
});

export default PreviewSignatureDocTitle;

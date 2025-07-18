import { Image, StyleSheet, View } from "@react-pdf/renderer";
import React, { Fragment } from "react";

const DocHeader = () => {
  return (
    <Fragment>
      <View fixed style={styles.container}>
        <Image style={styles.logo} src="/assets/edmrt-at10.png" />
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
  },
  logo: {
    height: "55px",
    width: "220px",
    marginTop: "14px",
    // padding: "20px",
  },
});

export default DocHeader;

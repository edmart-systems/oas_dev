import { StyleSheet, Text, View } from "@react-pdf/renderer";
import React, { Fragment } from "react";

const DraftDocWatermark = () => {
  return (
    <Fragment>
      <View style={styles.watermarkContainer} fixed>
        <Text style={styles.draftTxt}>DRAFT</Text>
      </View>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  watermarkContainer: {
    width: "100%",
    height: "100%",
    position: "absolute",
    left: 0,
    top: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  draftTxt: {
    fontWeight: 700,
    fontSize: "84px",
    letterSpacing: "18px",
    transform: "rotate(-45deg)",
    color: "#00000021",
  },
});
export default DraftDocWatermark;

import { StyleSheet, Text, View } from "@react-pdf/renderer";
import React, { Fragment } from "react";

const DraftDocDetails = () => {
  return (
    <Fragment>
      <View style={styles.detailsContainer}>
        <View style={styles.col1}>
          <DetailsItem title="TIN" content={"1001260908"} />
          <DetailsItem title="Date" content={"21/05/2024"} />
          <DetailsItem title="To" content={"AINE RONALD"} />
          <DetailsItem title="Email" content={"testc@qwss.com"} link />
        </View>
        <View style={styles.col2}>
          <DetailsItem title="Quote No" content={"ED/NE/093"} />
          <DetailsItem title="Ref" content={"Phone"} />
          <DetailsItem title="Contact" content={"Hope AINE"} />
          <DetailsItem title="Tel" content={"+256 7059 209 98"} link />
        </View>
      </View>
    </Fragment>
  );
};

const DetailsItem = ({
  title,
  content,
  link,
}: {
  title: string;
  content?: string | null;
  link?: boolean;
}) => {
  return (
    <Fragment>
      <View style={styles.detailContainer}>
        <View style={styles.detailTitleContainer}>
          <Text style={styles.detailTitle}>{title}:</Text>
        </View>
        <View style={styles.detailContentContainer}>
          <Text style={link ? styles.linkDetailContent : styles.detailContent}>
            {content ? content : ""}
          </Text>
        </View>
      </View>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  detailsContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
  },
  col1: {
    width: "100%",
    flex: 1,
    display: "flex",
    gap: "2px",
  },
  col2: {
    width: "100%",
    flex: 1,
    display: "flex",
    gap: "2px",
  },
  detailContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
  },
  detailTitleContainer: {
    width: "100%",
    flex: 2,
    display: "flex",
  },
  detailTitle: {
    width: "100%",
    // fontSize: "12px",
    textAlign: "left",
  },
  detailContentContainer: {
    width: "100%",
    flex: 3,
    display: "flex",
  },
  detailContent: {
    width: "100%",
    // fontSize: "12px",
    textAlign: "left",
  },
  linkDetailContent: {
    width: "100%",
    // fontSize: "12px",
    textAlign: "left",
    color: "#D98219",
  },
});

export default DraftDocDetails;

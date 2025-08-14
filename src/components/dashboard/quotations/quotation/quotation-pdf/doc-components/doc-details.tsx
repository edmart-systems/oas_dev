import { QuotationInputClientData } from "@/types/quotations.types";
import { formatDisplayedPhoneNumber } from "@/utils/formatters.util";
import { fDateDdMmmYyyy, fDateTime12 } from "@/utils/time.utils";
import { StyleSheet, Text, View } from "@react-pdf/renderer";
import React, { Fragment } from "react";

type Props = {
  quotationId: string;
  tin: string | null;
  time: number;
  client: QuotationInputClientData;
};

const DocDetails = ({ quotationId, tin, time, client }: Props) => {
  return (
    <Fragment>
      <View style={styles.detailsContainer}>
        <View style={styles.col1}>
          <LeftDetailsItem title="TIN" content={tin} />
          <LeftDetailsItem title="Date" content={fDateDdMmmYyyy(time)} />
          <LeftDetailsItem title="To" content={client.name} />
          <LeftDetailsItem title="Email" content={client.email} link />
        </View>
        <View style={styles.col2}>
          <RightDetailsItem title="Quote No" content={quotationId} />
          <RightDetailsItem title="Ref" content={client.ref} />
          <RightDetailsItem title="Contact" content={client.contactPerson} />
          <RightDetailsItem
            title="Tel"
            content={
              client.phone ? formatDisplayedPhoneNumber(client.phone) : ""
            }
            link
          />
        </View>
      </View>
    </Fragment>
  );
};

const LeftDetailsItem = ({
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
        <View style={styles.detailTitleContainerL}>
          <Text style={styles.detailTitle}>{title}:</Text>
        </View>
        <View style={styles.detailContentContainerL}>
          <Text style={link ? styles.linkDetailContent : styles.detailContent}>
            {content ? content : ""}
          </Text>
        </View>
      </View>
    </Fragment>
  );
};

const RightDetailsItem = ({
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
        <View style={styles.detailTitleContainerR}>
          <Text style={styles.detailTitle}>{title}:</Text>
        </View>
        <View style={styles.detailContentContainerR}>
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
    gap: "6px",
  },
  col1: {
    width: "100%",
    flex: 1.1,
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
  detailTitleContainerR: {
    width: "100%",
    flex: 1,
    display: "flex",
  },
  detailTitleContainerL: {
    width: "100%",
    flex: 1,
    display: "flex",
  },
  detailTitle: {
    width: "100%",
    // fontSize: "12px",
    textAlign: "left",
  },
  detailContentContainerR: {
    width: "100%",
    flex: 3,
    display: "flex",
  },
  detailContentContainerL: {
    width: "100%",
    flex: 6,
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

export default DocDetails;

import { StyleSheet, Text, View } from "@react-pdf/renderer";
import React, { Fragment } from "react";
import DraftDocBankDetails from "./draft-doc-bank-details";
import {
  generatePaymentStr,
  generateValidityStr,
} from "../../new-quotation-tsc-info";
import { TcsDto } from "@/types/quotations.types";
import { Quotation_type } from "@prisma/client";

type Props = {
  selectedTcs: TcsDto;
  quotationType: Quotation_type;
  tcsEdited: boolean;
};

const DraftDocTcs = ({ selectedTcs, quotationType, tcsEdited }: Props) => {
  const displayTxt = {
    paymentStr: generatePaymentStr({
      selectedTcs: selectedTcs,
      selectedQuoteType: quotationType,
      editTcs: tcsEdited,
    }),
    validityStr: generateValidityStr({
      selectedTcs: selectedTcs,
      editTcs: tcsEdited,
    }),
  };

  return (
    <Fragment>
      <View style={styles.tcsContainer}>
        <View style={styles.tcsHeader}>
          <Text style={styles.tcsTitle}>Terms And Conditions</Text>
        </View>

        <View style={styles.tcsDetailsContainer}>
          <View style={styles.tcsDetailsRow}>
            <Text style={styles.label}>Validity:</Text>
            <Text style={styles.value}>{displayTxt.validityStr}</Text>
          </View>
          <View style={styles.tcsDetailsRow}>
            <Text style={styles.label}>Payment:</Text>
            <View style={styles.valueColumn}>
              <Text>{displayTxt.paymentStr}</Text>
              <Text style={{ marginTop: "5px" }}>
                {selectedTcs.payment_method_words}
              </Text>
              <DraftDocBankDetails bank={selectedTcs.bank} />
            </View>
          </View>
        </View>
      </View>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  tcsContainer: {
    // padding: 10,
  },
  tcsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: "2px",
  },
  tcsTitle: {
    fontSize: "12px",
    fontWeight: 700,
    textShadow: "0.9px 0px #000",
    textDecoration: "underline",
  },
  tcsDetailsContainer: {
    marginTop: 0,
  },
  tcsDetailsRow: {
    flexDirection: "row",
    marginBottom: "1px",
  },
  label: {
    fontWeight: 700,
    width: "20%",
    // fontSize: "12px",
  },
  value: {
    width: "80%",
    // fontSize: "12px",
  },
  valueColumn: {
    width: "80%",
    // fontSize: "12px",
    flexDirection: "column",
  },
});

export default DraftDocTcs;

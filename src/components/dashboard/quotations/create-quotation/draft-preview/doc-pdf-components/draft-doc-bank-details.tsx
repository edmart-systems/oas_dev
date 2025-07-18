import { BankDto } from "@/types/company.types";
import { StyleSheet, Text, View } from "@react-pdf/renderer";
import React, { Fragment } from "react";

type Props = {
  bank: BankDto;
};

const DraftDocBankDetails = ({ bank }: Props) => {
  return (
    <Fragment>
      <View style={styles.bankDetailsContainer}>
        <View style={styles.bankDetailsRow}>
          <Text style={styles.label}>Title:</Text>
          <Text style={styles.value}>{bank.ac_title}</Text>
        </View>
        <View style={styles.bankDetailsRow}>
          <Text style={styles.label}>A/C No:</Text>
          <Text style={styles.value}>{bank.ac_number}</Text>
        </View>
        <View style={styles.bankDetailsRow}>
          <Text style={styles.label}>Bank:</Text>
          <Text style={styles.value}>{bank.name}</Text>
        </View>
        <View style={styles.bankDetailsRow}>
          <Text style={styles.label}>Branch:</Text>
          <Text style={styles.value}>{bank.branch_name}</Text>
        </View>
      </View>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  bankDetailsContainer: {
    marginTop: "3px",
  },
  bankDetailsRow: {
    flexDirection: "row",
    // marginBottom: "px",
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
});

export default DraftDocBankDetails;

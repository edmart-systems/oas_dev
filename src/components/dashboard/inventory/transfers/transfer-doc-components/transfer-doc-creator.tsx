import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";
import React, { Fragment } from "react";

interface TransferDocCreatorProps {
  assignedUser: { userId: number; firstName: string; lastName: string } | null;
  signature?: string | null;
}

const TransferDocCreator: React.FC<TransferDocCreatorProps> = ({ assignedUser, signature }) => {
  return (
    <Fragment>
      <View style={styles.approvalStatement}>
        {assignedUser && (
          <Text style={styles.statementText}>
            I, {assignedUser.firstName} {assignedUser.lastName}, approve that I have received the above items.
          </Text>
        )}
      </View>
      <View style={styles.container}>
        <View style={styles.signatureSection}>
          <Text style={styles.sectionTitle}>Received by:</Text>
          {signature ? (
            <View style={styles.signatureContainer}>
              <Image style={styles.signatureImage} src={signature} />
              {assignedUser && (
                <Text style={styles.userName}>
                  {assignedUser.firstName} {assignedUser.lastName}
                </Text>
              )}
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Signature</Text>
            </View>
          ) : (
            <View style={styles.emptySignatureContainer}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Signature</Text>
              {assignedUser && (
                <Text style={styles.userName}>
                  {assignedUser.firstName} {assignedUser.lastName}
                </Text>
              )}
            </View>
          )}
        </View>
        <View style={styles.dateSection}>
          <Text style={styles.sectionTitle}>Date:</Text>
          <View style={styles.dateLine} />
        </View>
      </View>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  approvalStatement: {
    width: "100%",
    marginTop: "20px",
    padding: "10px",
    backgroundColor: "#f9f9f9",
    borderRadius: "5px",
    alignItems: "center",
  },
  statementText: {
    fontSize: "11px",
    textAlign: "center",
    fontStyle: "italic",
  },
  container: {
    width: "100%",
    marginTop: "20px",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureSection: {
    width: "45%",
    alignItems: "center",
  },
  dateSection: {
    width: "45%",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: "12px",
    fontWeight: 700,
    marginBottom: "10px",
  },
  signatureContainer: {
    alignItems: "center",
    width: "100%",
  },
  emptySignatureContainer: {
    alignItems: "center",
    width: "100%",
  },
  signatureImage: {
    width: "150px",
    height: "60px",
    marginBottom: "5px",
  },
  userName: {
    fontSize: "10px",
    marginBottom: "5px",
    textAlign: "center",
  },
  signatureLine: {
    width: "150px",
    height: "1px",
    backgroundColor: "#000",
    marginBottom: "3px",
  },
  dateLine: {
    width: "120px",
    height: "1px",
    backgroundColor: "#000",
    marginTop: "40px",
  },
  signatureLabel: {
    fontSize: "9px",
    color: "#666",
  },
});

export default TransferDocCreator;
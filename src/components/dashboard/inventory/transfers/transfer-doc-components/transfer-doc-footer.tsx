import { StyleSheet, Text, View } from "@react-pdf/renderer";
import React, { Fragment } from "react";

interface TransferDocFooterProps {
  creator?: { co_user_id: string; firstName: string; lastName: string } | null;
}

const TransferDocFooter: React.FC<TransferDocFooterProps> = ({ creator }) => {
  return (
    <Fragment>
      <View fixed style={styles.container}>
        <View style={styles.footerContent}>
          <View style={styles.leftFooter}>
            <Text style={styles.footerText}>
              Office Automation System - Transfer Note
            </Text>
            {creator && (
              <Text style={styles.footerText}>
                Issued by: {creator.firstName} {creator.lastName}
              </Text>
            )}
          </View>
          <Text style={styles.footerText}>
            Generated on {new Date().toLocaleDateString()}
          </Text>
        </View>
      </View>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    paddingHorizontal: 50,
  },
  footerContent: {
    width: "100%",
    borderTop: "1px solid #ccc",
    paddingTop: "10px",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  leftFooter: {
    flexDirection: "column",
    gap: "3px",
  },
  footerText: {
    fontSize: "8px",
    color: "#666",
  },
});

export default TransferDocFooter;
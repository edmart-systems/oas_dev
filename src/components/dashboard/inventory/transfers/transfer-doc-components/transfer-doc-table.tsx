import { StyleSheet, Text, View } from "@react-pdf/renderer";
import React, { Fragment } from "react";

interface TransferDocTableProps {
  items: Array<{
    product: { product_id: number; product_name: string } | null;
    quantity: number;
  }>;
}

const TransferDocTable: React.FC<TransferDocTableProps> = ({ items }) => {
  return (
    <Fragment>
      <View style={styles.container}>
        <View style={styles.tableHeader}>
          <View style={styles.headerCell}>
            <Text style={styles.headerText}>S/N</Text>
          </View>
          <View style={[styles.headerCell, styles.productCell]}>
            <Text style={styles.headerText}>Product Name</Text>
          </View>
          <View style={styles.headerCell}>
            <Text style={styles.headerText}>Quantity</Text>
          </View>
        </View>
        {items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={styles.cell}>
              <Text style={styles.cellText}>{index + 1}</Text>
            </View>
            <View style={[styles.cell, styles.productCell]}>
              <Text style={styles.cellText}>
                {item.product?.product_name || "Unknown Product"}
              </Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.cellText}>{item.quantity}</Text>
            </View>
          </View>
        ))}
      </View>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: "15px",
    border: "1px solid #000",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#D98219",
  },
  tableRow: {
    flexDirection: "row",
    borderTop: "1px solid #000",
  },
  headerCell: {
    padding: "8px",
    borderRight: "1px solid #000",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cell: {
    padding: "6px",
    borderRight: "1px solid #000",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  productCell: {
    flex: 3,
  },
  headerText: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#fff",
    textAlign: "center",
  },
  cellText: {
    fontSize: "10px",
    textAlign: "center",
  },
});

export default TransferDocTable;
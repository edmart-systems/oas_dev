import React from "react";
import { Page, View, Document, StyleSheet, Font, Text } from "@react-pdf/renderer";
import DocHeader from "../../../quotations/quotation/quotation-pdf/doc-components/doc-header";
import DocFooter from "../../../quotations/quotation/quotation-pdf/doc-components/doc-footer";
import { PurchasePdfDocProps } from "@/modules/inventory/types";



Font.register({
  family: "Comic Sans MS",
  fonts: [
    { src: "/assets/fonts/ComicSansMS.ttf" },
    { src: "/assets/fonts/ComicSansMS_B.ttf", fontWeight: 700 },
  ],
});


const PurchasePdfDoc = ({ company, purchase, formatCurrency, supplierName, inventoryPointName, productNames }: PurchasePdfDocProps & { 
  formatCurrency: (amount: number) => string;
  supplierName: string;
  inventoryPointName: string;
  productNames: Record<number, string>;
}) => {
  const date = new Date(purchase.purchase_created_at || new Date());
  
  const safeCurrency = (amount: number) => {
    try {
      return formatCurrency(amount);
    } catch {
      return `$${amount.toFixed(2)}`;
    }
  };

                        

  return (
    <Document
      title={`Purchase-Order-${purchase.purchase_id}`}
      creator={company.legal_name ?? company.business_name}
      subject={`Purchase Order PO-${purchase.purchase_id}`}
      language="En"
      creationDate={date}
    >
      <Page size="A4" style={styles.page}>
        <DocHeader />
        <View style={styles.mainContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>PURCHASE</Text>
            <Text style={styles.companyName}>{company.legal_name ?? company.business_name}</Text>
          </View>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailsLeft}>
              <Text style={styles.detailLabel}>Purchase ID:</Text>
              <Text style={styles.detailValue}>PO-{purchase.purchase_id}</Text>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>{date.toLocaleDateString()}</Text>
            </View>
            <View style={styles.detailsRight}>
              <Text style={styles.detailLabel}>Supplier:</Text>
              <Text style={styles.detailValue}>{supplierName}</Text>
              <Text style={styles.detailLabel}>Inventory Point:</Text>
              <Text style={styles.detailValue}>{inventoryPointName}</Text>
            </View>
          </View>

          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.productCell]}>Product</Text>
              <Text style={[styles.tableCell, styles.qtyCell]}>Qty</Text>
              <Text style={[styles.tableCell, styles.costCell]}>Unit Cost</Text>
              <Text style={[styles.tableCell, styles.totalCell]}>Total</Text>
            </View>
            {(purchase.purchase_items || []).map((item) => (
              <View key={item.product_id} style={[styles.tableRow, item.product_id % 2 === 0 ? styles.evenRow : {}]}>
                <Text style={[styles.tableCell, styles.productCell]}>{productNames[item.product_id] || 'Unknown Product'}</Text>
                <Text style={[styles.tableCell, styles.qtyCell]}>{item.quantity || 0}</Text>
                <Text style={[styles.tableCell, styles.costCell]}>{safeCurrency(item.unit_cost || 0)}</Text>
                <Text style={[styles.tableCell, styles.totalCell]}>{safeCurrency(item.total_cost || 0)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>{purchase.purchase_total_cost}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (0):</Text>
              <Text style={styles.summaryValue}>{ 0}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>{safeCurrency( purchase.purchase_total_cost ||0)}</Text>
            </View>
          </View>
        </View>
        <DocFooter company={company} />
      </Page>
    </Document>
  );
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Comic Sans MS",
    fontSize: "11px",
    flexDirection: "column",
    backgroundColor: "#fff",
    alignItems: "center",
    paddingTop: "24px",
    paddingBottom: "94px",
  },
  mainContainer: {
    width: "100%",
    paddingHorizontal: "50px",
    display: "flex",
    gap: "15px",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: "20px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#D98219",
    marginBottom: "5px",
  },
  companyName: {
    fontSize: "14px",
    fontWeight: "bold",
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  detailsLeft: {
    flex: 1,
  },
  detailsRight: {
    flex: 1,
  },
  detailLabel: {
    fontWeight: "bold",
    marginBottom: "2px",
  },
  detailValue: {
    marginBottom: "8px",
  },
  tableContainer: {
    marginBottom: "20px",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    padding: "8px",
    borderBottom: "1px solid #ddd",
  },
  tableRow: {
    flexDirection: "row",
    padding: "8px",
    borderBottom: "1px solid #eee",
  },
  evenRow: {
    backgroundColor: "#f9f9f9",
  },
  tableCell: {
    fontSize: "10px",
  },
  productCell: {
    flex: 3,
  },
  qtyCell: {
    flex: 1,
    textAlign: "center",
  },
  costCell: {
    flex: 1.5,
    textAlign: "right",
  },
  totalCell: {
    flex: 1.5,
    textAlign: "right",
  },
  summaryContainer: {
    alignSelf: "flex-end",
    width: "200px",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: "5px",
  },
  summaryLabel: {
    fontSize: "11px",
  },
  summaryValue: {
    fontSize: "11px",
  },
  totalRow: {
    borderTop: "1px solid #ddd",
    paddingTop: "5px",
    marginTop: "5px",
  },
  totalLabel: {
    fontSize: "12px",
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: "12px",
    fontWeight: "bold",
    color: "#D98219",
  },
});

export default PurchasePdfDoc;
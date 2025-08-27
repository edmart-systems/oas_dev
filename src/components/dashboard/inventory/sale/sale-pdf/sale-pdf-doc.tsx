"use client";

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import DocHeader from "../../../quotations/quotation/quotation-pdf/doc-components/doc-header";
import DocFooter from "../../../quotations/quotation/quotation-pdf/doc-components/doc-footer";
import { CompanyDto } from "@/types/company.types";

export interface SaleReceiptItem {
  name: string;
  quantity: number;
  unit_price: number;
  discount?: number;
  tax?: number;
  total_price: number;
}

export interface SaleReceipt {
  sale_no: string;
  sale_created_at: string | Date;
  seller_name?: string;
  items: SaleReceiptItem[];
  subtotal?: number;
  discount_total?: number;
  tax_total?: number;
  grand_total: number;
}

const styles = StyleSheet.create({
  page: { flexDirection: "column", backgroundColor: "#FFFFFF", padding: 30, fontFamily: "Helvetica" },
  header: { flexDirection: "row", marginBottom: 20, justifyContent: "space-between", alignItems: "flex-start" },
  companyInfo: { flex: 1 },
  companyName: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  companyDetails: { fontSize: 10, marginBottom: 2, color: "#666666" },
  invoiceInfo: { alignItems: "flex-end" },
  invoiceTitle: { fontSize: 24, fontWeight: "bold", color: "#D98219", marginBottom: 5 },
  invoiceNumber: { fontSize: 14, fontWeight: "bold", marginBottom: 5 },
  invoiceDate: { fontSize: 10, color: "#666666" },
  section: { marginBottom: 20, padding: 15, backgroundColor: "#f8f5ef", borderRadius: 5 },
  sectionTitle: { fontSize: 12, fontWeight: "bold", marginBottom: 8, color: "#333333" },
  table: { marginBottom: 20 },
  tableHeader: { flexDirection: "row", backgroundColor: "#f5f5f5", padding: 8, fontWeight: "bold" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eee", padding: 8 },
  tableCell: { fontSize: 10 },
  itemColumn: { flex: 3 },
  qtyColumn: { flex: 1, textAlign: "center" },
  priceColumn: { flex: 1.2, textAlign: "right" },
  totalColumn: { flex: 1.2, textAlign: "right" },
  summary: { alignItems: "flex-end", marginTop: 20 },
  summaryRow: { flexDirection: "row", marginBottom: 5 },
  summaryLabel: { fontSize: 12, fontWeight: "bold", marginRight: 20 },
  summaryValue: { fontSize: 12, fontWeight: "bold", minWidth: 80, textAlign: "right" },
  totalAccent: { color: "#D98219" },
});

interface Props {
  receipt: SaleReceipt;
  company: CompanyDto;
  formatCurrency?: (amount: number) => string;
}

const SalePDFDoc: React.FC<Props> = ({ receipt, company, formatCurrency }) => {
  const fmt = (n: number) => {
    try {
      return formatCurrency ? formatCurrency(n) : `$${(n ?? 0).toFixed(2)}`;
    } catch {
      return `$${(n ?? 0).toFixed(2)}`;
    }
  };
  const dateStr = new Date(receipt.sale_created_at).toLocaleDateString();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <DocHeader />
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{company.business_name || company.legal_name}</Text>
            {company.email ? <Text style={styles.companyDetails}>{company.email}</Text> : null}
            {company.phone_number_1 ? (
              <Text style={styles.companyDetails}>{company.phone_number_1}</Text>
            ) : null}
            {company.address ? (
              <Text style={styles.companyDetails}>
                {company.address.street}, {company.address.district}
              </Text>
            ) : null}
          </View>
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceTitle}>SALE RECEIPT</Text>
            <Text style={styles.invoiceNumber}>#{receipt.sale_no}</Text>
            <Text style={styles.invoiceDate}>Date: {dateStr}</Text>
          </View>
        </View>

        {receipt.seller_name ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seller</Text>
            <Text>{receipt.seller_name}</Text>
          </View>
        ) : null}

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.itemColumn]}>Item</Text>
            <Text style={[styles.tableCell, styles.qtyColumn]}>Qty</Text>
            <Text style={[styles.tableCell, styles.priceColumn]}>Unit Price</Text>
            <Text style={[styles.tableCell, styles.priceColumn]}>Discount</Text>
            <Text style={[styles.tableCell, styles.priceColumn]}>Tax</Text>
            <Text style={[styles.tableCell, styles.totalColumn]}>Total</Text>
          </View>

          {receipt.items.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.itemColumn]}>{item.name}</Text>
              <Text style={[styles.tableCell, styles.qtyColumn]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.priceColumn]}>{fmt(item.unit_price)}</Text>
              <Text style={[styles.tableCell, styles.priceColumn]}>{fmt(item.discount ?? 0)}</Text>
              <Text style={[styles.tableCell, styles.priceColumn]}>{fmt(item.tax ?? 0)}</Text>
              <Text style={[styles.tableCell, styles.totalColumn]}>{fmt(item.total_price)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.summary}>
          {typeof receipt.subtotal === "number" && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>{fmt(receipt.subtotal)}</Text>
            </View>
          )}
          {typeof receipt.discount_total === "number" && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount:</Text>
              <Text style={styles.summaryValue}>{fmt(receipt.discount_total)}</Text>
            </View>
          )}
          {typeof receipt.tax_total === "number" && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax:</Text>
              <Text style={styles.summaryValue}>{fmt(receipt.tax_total)}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Grand Total:</Text>
            <Text style={[styles.summaryValue, styles.totalAccent]}>{fmt(receipt.grand_total)}</Text>
          </View>
        </View>
        <DocFooter company={company} />
      </Page>
    </Document>
  );
};

export default SalePDFDoc;

import { QuotationOutputLineItem } from "@/types/quotations.types";
import {
  MAX_LINE_ITEM_DESCRIPTION_LENGTH,
  QUOTATION_PDF_TABLE_FLEX_WEIGHT,
} from "@/utils/constants.utils";
import { StyleSheet, Text, View } from "@react-pdf/renderer";
import React, { Fragment, ReactElement, ReactNode } from "react";

type Props = {
  vatExcluded: boolean;
  vatPercentage: number;
  vat: number;
  subtotal: number;
  grandTotal: number;
  lineItems: QuotationOutputLineItem[];
};

const DocTable = ({
  lineItems,
  grandTotal,
  subtotal,
  vatPercentage,
  vat,
  vatExcluded,
}: Props) => {
  return (
    <Fragment>
      <View style={styles.tableContainer}>
        <View style={styles.specialRow}>
          <DocTableCell
            bold
            align="center"
            flex={QUOTATION_PDF_TABLE_FLEX_WEIGHT.sn}
          >
            S/N
          </DocTableCell>
          <DocTableCell
            bold
            align="center"
            flex={QUOTATION_PDF_TABLE_FLEX_WEIGHT.desc}
          >
            Item / Description
          </DocTableCell>
          <DocTableCell
            bold
            align="center"
            flex={QUOTATION_PDF_TABLE_FLEX_WEIGHT.qty}
          >
            Qty
          </DocTableCell>
          <DocTableCell
            bold
            align="center"
            flex={QUOTATION_PDF_TABLE_FLEX_WEIGHT.unit}
          >
            Units
          </DocTableCell>
          <DocTableCell
            bold
            align="right"
            flex={QUOTATION_PDF_TABLE_FLEX_WEIGHT.px}
          >
            Unit Price
          </DocTableCell>
          <DocTableCell
            bold
            noBorder
            align="right"
            flex={QUOTATION_PDF_TABLE_FLEX_WEIGHT.tt}
          >
            Total
          </DocTableCell>
        </View>
        {lineItems.map((item, index) => {
          return (
            <View
              key={item.id + "-" + index}
              style={{
                ...styles.tableRow,
                // ...(index === 19 ? { borderBottom: "none" } : {}),
              }}
              wrap={
                item.description
                  ? item.description.length > MAX_LINE_ITEM_DESCRIPTION_LENGTH
                    ? true
                    : false
                  : false
              }
            >
              <DocTableCell
                align="center"
                flex={QUOTATION_PDF_TABLE_FLEX_WEIGHT.sn}
              >
                {index + 1}
              </DocTableCell>
              <DocTableCell
                align="left"
                flex={QUOTATION_PDF_TABLE_FLEX_WEIGHT.desc}
              >
                {item.name}
                {item.description && ", " + item.description}
              </DocTableCell>
              <DocTableCell
                align="center"
                flex={QUOTATION_PDF_TABLE_FLEX_WEIGHT.qty}
              >
                {item.quantity}
              </DocTableCell>
              <DocTableCell
                align="center"
                flex={QUOTATION_PDF_TABLE_FLEX_WEIGHT.unit}
              >
                {item.units}
              </DocTableCell>
              <DocTableCell
                special
                align="right"
                flex={QUOTATION_PDF_TABLE_FLEX_WEIGHT.px}
              >
                {item.unitPrice ? item.unitPrice.toLocaleString() : "N/A"}
              </DocTableCell>
              <DocTableCell
                align="right"
                noBorder
                flex={QUOTATION_PDF_TABLE_FLEX_WEIGHT.tt}
              >
                {item.unitPrice && item.quantity
                  ? (item.unitPrice * item.quantity).toLocaleString()
                  : "N/A"}
              </DocTableCell>
            </View>
          );
        })}
        <View style={styles.specialRow} wrap={false}>
          <DocTableCell
            bold
            align="right"
            flex={QUOTATION_PDF_TABLE_FLEX_WEIGHT.summaryCol1}
          >
            Sub Total
          </DocTableCell>
          <DocTableCell
            bold
            noBorder
            align="right"
            flex={QUOTATION_PDF_TABLE_FLEX_WEIGHT.summaryCol2}
          >
            {subtotal.toLocaleString()}
          </DocTableCell>
        </View>
        {!vatExcluded && (
          <View style={styles.specialRow} wrap={false}>
            <DocTableCell
              bold
              align="right"
              flex={QUOTATION_PDF_TABLE_FLEX_WEIGHT.summaryCol1}
            >
              VAT ({vatPercentage}%)
            </DocTableCell>
            <DocTableCell
              bold
              noBorder
              align="right"
              flex={QUOTATION_PDF_TABLE_FLEX_WEIGHT.summaryCol2}
            >
              {vat.toLocaleString()}
            </DocTableCell>
          </View>
        )}
        <View
          style={{ ...styles.specialRow, ...{ borderBottom: "none" } }}
          wrap={false}
        >
          <DocTableCell
            bold
            align="right"
            flex={QUOTATION_PDF_TABLE_FLEX_WEIGHT.summaryCol1}
          >
            Grand Total ({vatExcluded ? "VAT Exclusive" : "VAT Inclusive"})
          </DocTableCell>
          <DocTableCell
            bold
            noBorder
            align="right"
            flex={QUOTATION_PDF_TABLE_FLEX_WEIGHT.summaryCol2}
          >
            {grandTotal.toLocaleString()}
          </DocTableCell>
        </View>
      </View>
    </Fragment>
  );
};

const DocTableCell = ({
  children,
  flex,
  special,
  bold,
  align,
  noBorder,
}: {
  children?: ReactNode;
  flex?: number;
  special?: boolean;
  bold?: boolean;
  align?: "left" | "right" | "center" | "justify";
  noBorder?: boolean;
}) => {
  return (
    <Fragment>
      <View
        style={{
          ...styles.tableCell,
          ...{ flex: flex },
          ...(special ? styles.special : {}),
          ...(noBorder ? { borderRight: "none" } : {}),
        }}
      >
        <Text
          style={{
            ...styles.tableCellContent,
            ...(bold ? styles.bold : {}),
            ...(align ? { textAlign: align } : {}),
          }}
        >
          {children && children}
        </Text>
      </View>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  tableContainer: {
    width: "100%",
    border: "1px solid black",
    borderRadius: "5px",
    display: "flex",
  },
  tableRow: {
    width: "100%",
    borderBottom: "1px solid black",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  specialRow: {
    width: "100%",
    borderBottom: "1px solid black",
    backgroundColor: "#b3b0b022",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  tableCell: {
    width: "100%",
    height: "100%",
    borderRight: "1px solid black",
    padding: "2px 2px",
  },
  tableCellContent: {
    width: "100%",
    // height: "100%",
    // fontSize: "12px",
    textAlign: "left",
  },
  bold: {
    fontWeight: 700,
  },
  special: {
    backgroundColor: "#b3b0b022",
  },
});

export default DocTable;

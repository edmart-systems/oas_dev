import { QuotationCategoryName } from "@/types/quotations.types";
import { quotationPdfCommentary } from "@/utils/constants.utils";
import { Quotation_category } from "@prisma/client";
import { StyleSheet, Text, View } from "@react-pdf/renderer";
import React, { Fragment } from "react";

type Props = {
  category: Quotation_category;
};

const DocAboutUs = ({ category }: Props) => {
  const cat = category.cat as QuotationCategoryName;

  return (
    <Fragment>
      <View style={styles.aboutContainer}>
        <Text style={styles.aboutTxt}>
          {quotationPdfCommentary[cat].content}
        </Text>
      </View>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  aboutContainer: {
    width: "100%",
  },
  aboutTxt: {
    width: "100%",
    // fontSize: "12px",
    textAlign: "justify",
  },
});
export default DocAboutUs;

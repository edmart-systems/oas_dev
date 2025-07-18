import { CompanyAddressDTO, CompanyDto } from "@/types/company.types";
import { formatDisplayedPhoneNumber } from "@/utils/formatters.util";
import { StyleSheet, Text, View } from "@react-pdf/renderer";
import React, { Fragment } from "react";

type Props = {
  company: CompanyDto;
};

const DraftDocFooter = ({ company }: Props) => {
  const { address } = company;
  const {
    box_number,
    branch_name,
    branch_number,
    building_name,
    country,
    county,
    district,
    co_ad_id,
    street,
    room_number,
    village,
    plot_number,
    floor_number,
    subcounty,
  } = address;

  const poBoxStr =
    box_number && district && `P. O. Box ${box_number}, ${district}.`;
  const streetAndBuildingStr =
    plot_number &&
    street &&
    ` Plot ${plot_number}, ${street}, ${district}${
      building_name && room_number
        ? `, ${building_name} Room ${room_number}.`
        : "."
    }`;
  const tellStr = ` ${formatDisplayedPhoneNumber(
    company.phone_number_1
  ).replace(/ /g, "-")} ${
    company.phone_number_2 &&
    ` / ${formatDisplayedPhoneNumber(company.phone_number_2).replace(
      / /g,
      "-"
    )}`
  } / +256-414-697063`;
  const onlineStr = `, ${company.email}${
    company.web ? `, ${company.web}.` : "."
  }`;
  return (
    <Fragment>
      <View fixed style={styles.footerContainer}>
        <View style={styles.stripesContainer}>
          <View style={styles.stripe1}></View>
          <View style={styles.stripe2}></View>
        </View>
        <View style={styles.contactContainer}>
          <Text style={styles.contactTxt}>
            {poBoxStr}
            {streetAndBuildingStr}
            {tellStr}
            {onlineStr}
          </Text>
        </View>
      </View>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    width: "100%",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 30,
    paddingHorizontal: "5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stripesContainer: {
    width: "96%",
    display: "flex",
    gap: "1px",
  },
  stripe1: {
    backgroundColor: "#D98219",
    width: "100%",
    height: "5px",
  },
  stripe2: {
    backgroundColor: "#000",
    width: "100%",
    height: "5px",
  },
  contactContainer: {
    width: "83%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  contactTxt: {
    fontSize: 11,
    textAlign: "center",
  },
});

export default DraftDocFooter;

import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";
import React, { Fragment } from "react";

const logos: {
  name: string;
  logo: string;
  width?: string;
  height?: string;
}[] = [
  {
    name: "HP",
    logo: "/assets/partner-logos/hp_logo.png",
  },
  {
    name: "Dell",
    logo: "/assets/partner-logos/dell_logo.svg.png",
  },
  {
    name: "Lenovo",
    logo: "/assets/partner-logos/Lenovo-Logo.png",
  },
  {
    name: "Microsoft",
    logo: "/assets/partner-logos/mcrosoft_logo.jpg",
  },
  {
    name: "Canon",
    logo: "/assets/partner-logos/canon_logo.png",
  },
  {
    name: "Epson",
    logo: "/assets/partner-logos/epson_logo.png",
  },
  {
    name: "Kaspersky",
    logo: "/assets/partner-logos/kaspersky_logo.png",
  },
  {
    name: "Cisco",
    logo: "/assets/partner-logos/cisco_logo.png",
  },
];

const DocItPartnersLogos = () => {
  return (
    <Fragment>
      <View style={styles.iconsContainer}>
        <Text style={styles.txt1}>Our Partners:-</Text>
        <View style={styles.icons}>
          {logos.map((item, index) => (
            <Image
              src={item.logo}
              key={item.name}
              style={{ width: "60px", maxHeight: "80px" }}
            />
          ))}
        </View>
      </View>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  iconsContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "0px",
  },
  txt1: {
    // fontSize: "12px",
  },
  icons: {
    width: "100%",
    fontSize: "10px",
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default DocItPartnersLogos;

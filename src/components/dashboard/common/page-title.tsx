import { Typography } from "@mui/material";
import React from "react";

type Props = { title: string };

const PageTitle = ({ title }: Props) => {
  return (
    <Typography
      sx={{
        padding: 0,
        margin: "0px !important",
        textAlign: "left",
        fontSize: {
          xl: "2.125rem",
          sm: "1.75rem",
          xs: "1.5rem",
        },
        letterSpacing: "0.00735em",
        fontWeight: 400,
      }}
    >
      {title}
    </Typography>
  );
};

export default PageTitle;

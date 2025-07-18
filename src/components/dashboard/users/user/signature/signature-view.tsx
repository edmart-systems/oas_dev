import Veil from "@/components/dashboard/common/veil";
import { SignatureFontFamily } from "@/types/signature.types";
import { Card, Stack, Typography } from "@mui/material";
import Image from "next/image";
import React from "react";

type Props = {
  src: string | null;
  isTxt?: boolean;
  height?: number;
  width?: number;
  fontFamily?: SignatureFontFamily;
  isExport?: boolean;
};

// Myfonts
// Style Script
// Lavishly Your
// Yellowtail
// Borel
// Playwrite IN
// Send Flowers
// Princess Sofia
// Vibur

const SignatureView = ({
  src,
  isTxt,
  height,
  width,
  fontFamily,
  isExport,
}: Props) => {
  return (
    <Card
      sx={{
        background: isExport ? "#fff" : "",
        borderRadius: "8px",
        height: height ? `${height}px` : "140px",
        width: width ? `${width}px` : "400px",
        cursor: "pointer",
        zIndex: 0,
      }}
    >
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{ height: "100%", width: "100%", position: "relative" }}
      >
        {src ? (
          isTxt ? (
            <Typography
              fontFamily={fontFamily ?? "Playwrite IN"}
              sx={
                isExport
                  ? {
                      color: "#000",
                      paddingX: "1px",
                      fontSize: "26px",
                      fontWeight: 700,
                    }
                  : {}
              }
              variant="h6"
              id={isExport ? "sign-export-txt" : ""}
            >
              {src}
            </Typography>
          ) : (
            <Image
              src={src}
              height={height ? height : 140}
              width={width ? width : 400}
              alt="signature"
            />
          )
        ) : (
          <Typography fontFamily="Playwrite IN" variant="h6">
            No signature available
          </Typography>
        )}
        <Veil zIndex={1} />
      </Stack>
    </Card>
  );
};

export default SignatureView;

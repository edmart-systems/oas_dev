"use client";

import { UserSignatureDto } from "@/types/user.types";
import { Box, Card, Slider, Stack } from "@mui/material";
import React, { Dispatch, SetStateAction, useState } from "react";
import SignatureView from "./signature-view";
import { Dimensions } from "@/types/other.types";

type Props = {
  signature: UserSignatureDto;
  dimensions: Dimensions;
  setDimensions: Dispatch<SetStateAction<Dimensions>>;
};
const ResizeSignature = ({ signature, dimensions, setDimensions }: Props) => {
  const onChangeHeight = (
    event: Event,
    value: number | number[],
    activeThumb: number
  ) => {
    if (typeof value === "number") {
      setDimensions((prev) => ({ ...prev, height: value }));
    }
  };

  const onChangeWidth = (
    event: Event,
    value: number | number[],
    activeThumb: number
  ) => {
    if (typeof value === "number") {
      setDimensions((prev) => ({ ...prev, width: value }));
    }
  };

  return (
    <Stack
      height="100%"
      width="100%"
      alignItems="center"
      justifyContent="center"
      p={1}
    >
      <Card
        sx={{
          width: "80%",
          height: "80%",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SignatureView
          src={signature.dataUrl}
          height={dimensions.height * 4}
          width={dimensions.width * 4}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "12%",
            left: "7%",
            height: "80%",
          }}
        >
          <Slider
            aria-label="height"
            orientation="vertical"
            defaultValue={signature.height}
            valueLabelDisplay="on"
            shiftStep={4}
            step={2}
            marks
            min={10}
            max={30}
            onChange={onChangeHeight}
          />
        </Box>
        <Box
          sx={{
            position: "absolute",
            bottom: "2%",
            left: "10%",
            width: "80%",
          }}
        >
          <Slider
            aria-label="width"
            defaultValue={signature.width}
            valueLabelDisplay="on"
            shiftStep={4}
            step={2}
            marks
            min={10}
            max={120}
            onChange={onChangeWidth}
          />
        </Box>
      </Card>
    </Stack>
  );
};

export default ResizeSignature;

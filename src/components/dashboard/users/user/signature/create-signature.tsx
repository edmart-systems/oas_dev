"use client";

import {
  Button,
  Chip,
  Divider,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, {
  Dispatch,
  SetStateAction,
  useMemo,
  useRef,
  useState,
} from "react";
import SignatureView from "./signature-view";
import { SignatureFontFamily, SignatureMode } from "@/types/signature.types";
import SignatureFontsMenu from "./signature-fonts-menu";
import { Draw, Redo, Undo, UploadFile } from "@mui/icons-material";
import SignaturePad from "react-signature-canvas";
import { Broom } from "@phosphor-icons/react/dist/ssr";

const placeHolder = "e.g Usaama Nkangi";

type Props = {
  signTxt: string;
  setSignTxt: Dispatch<SetStateAction<string>>;
  mode: SignatureMode;
  setMode: Dispatch<SetStateAction<SignatureMode>>;
  trimmedDataURL: string | null;
  setTrimmedDataURL: Dispatch<SetStateAction<string | null>>;
};

const CreateSignature = ({
  setSignTxt,
  signTxt,
  mode,
  setMode,
  setTrimmedDataURL,
  trimmedDataURL,
}: Props) => {
  // const [signTxt, setSignTxt] = useState<string>("");
  // const [trimmedDataURL, setTrimmedDataURL] = useState<string | null>(null);
  const [selectedFont, setSelectedFont] =
    useState<SignatureFontFamily>("Playwrite IN");
  const sigPadRef = useRef<SignaturePad | null>(null);

  const clearDrawing = () => {
    if (!sigPadRef.current) return;

    sigPadRef.current.clear();
    setTrimmedDataURL(null);
  };

  const captureTrimmed = () => {
    if (!sigPadRef.current) return;

    const canvas = sigPadRef.current.getTrimmedCanvas();
    const trimmedData = canvas.toDataURL("image/png");

    setTrimmedDataURL(trimmedData);
  };

  return mode === "type" ? (
    <Stack sx={{ p: 1, width: "100%", height: "100%" }}>
      <Stack direction="row" spacing={3} alignItems="flex-start" mb={1.5}>
        <Stack spacing={2} flex={1}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography
              fontFamily="Times"
              textAlign="center"
              sx={{
                padding: "2px 8px",
                border: "2px solid #D98219",
                borderRadius: "4px",
                fontWeight: 700,
                fontSize: "26px",
              }}
            >
              T
            </Typography>
            <Stack spacing={0}>
              <Typography variant="body1" fontWeight={600}>
                Type signature
              </Typography>
              <Typography variant="body2">
                Enter your full name or initials
              </Typography>
            </Stack>
          </Stack>
          <TextField
            size="small"
            placeholder={placeHolder}
            onChange={(evt) => setSignTxt(evt.target.value)}
            value={signTxt}
          />
        </Stack>
        <Stack flex={1} spacing={0.5}>
          <SignatureFontsMenu
            signTxt={signTxt}
            setSelectedFont={setSelectedFont}
          />
          <SignatureView
            src={signTxt ? signTxt : placeHolder}
            isTxt
            height={80}
            fontFamily={selectedFont}
            isExport
          />
        </Stack>
      </Stack>
      <Divider>
        <Chip label="OR" size="small" color="primary" />
      </Divider>
      <Stack direction="row" spacing={3} alignItems="flex-start" mt={1.5}>
        <Stack spacing={2} flex={1}>
          <Button
            variant="outlined"
            fullWidth
            size="large"
            startIcon={<Draw />}
            sx={{ paddingY: "15px" }}
            onClick={() => setMode("draw")}
          >
            Draw Signature
          </Button>
        </Stack>
        <Stack spacing={2} flex={1}>
          <Button
            variant="outlined"
            fullWidth
            size="large"
            startIcon={<UploadFile />}
            sx={{ paddingY: "15px" }}
            disabled={true}
          >
            Upload Signature
          </Button>
        </Stack>
      </Stack>
    </Stack>
  ) : (
    <Stack
      sx={{ p: 1, width: "100%", height: "100%" }}
      justifyContent="center"
      spacing={1}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography>Draw your signature</Typography>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="flex-end"
        >
          <Tooltip title="Clear" arrow>
            <IconButton size="small" onClick={clearDrawing}>
              <Broom />
            </IconButton>
          </Tooltip>
          <Tooltip title="Undo" arrow>
            <IconButton size="small" disabled>
              <Undo />
            </IconButton>
          </Tooltip>
          <Tooltip title="Undo" arrow>
            <IconButton size="small" disabled>
              <Redo />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
      <Stack
        border="2px solid #D98219"
        borderRadius="8px"
        sx={{ overflow: "hidden", cursor: "crosshair" }}
      >
        <SignaturePad
          penColor="#000"
          dotSize={3}
          // backgroundColor="#b8b4b4"
          canvasProps={{ height: "300px" }}
          ref={sigPadRef}
          onEnd={(evt) => {
            captureTrimmed();
          }}
        />
      </Stack>
    </Stack>
  );
};

export default CreateSignature;

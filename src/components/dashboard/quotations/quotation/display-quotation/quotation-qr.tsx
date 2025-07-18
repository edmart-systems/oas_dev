"use client";
import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import Image from "next/image";
import { Skeleton, Stack } from "@mui/material";
import Veil from "@/components/dashboard/common/veil";
import { quotationVerificationUrl } from "@/utils/constants.utils";
import { isDevUrl } from "@/utils/url.utils";

type Props = {
  quotationNumber: string;
  quotationId: number;
  width?: number;
  length?: number;
  qrKey: string;
  isVariant: boolean;
};

export const generateQrBase64 = async (key: string): Promise<string> => {
  const qr = await QRCode.toDataURL(key, { errorCorrectionLevel: "Q" });
  return Promise.resolve(qr);
};

const QuotationQr = ({
  quotationId,
  quotationNumber,
  length,
  width,
  qrKey,
  isVariant,
}: Props) => {
  const [qrSrc, setQrSrc] = useState<string>();
  const isDev = isDevUrl();

  const qrHandler = async () => {
    const key = process.env.NEXT_PUBLIC_QUOTATION_QR_URL_KEY;

    if (qrSrc || !key) return;

    const qrUrl = quotationVerificationUrl(
      { quotationNumber: quotationNumber, quotationId: quotationId },
      key,
      isVariant
    );
    const qr = isDev
      ? await generateQrBase64(qrKey)
      : await generateQrBase64(qrUrl);

    setQrSrc(qr);
  };

  useEffect(() => {
    qrHandler();
  }, [quotationNumber]);

  return (
    <Stack position="relative">
      {qrSrc ? (
        <Image
          src={qrSrc}
          width={width ? width : 160}
          height={length ? length : 160}
          alt="qr"
          style={{ zIndex: 0 }}
        />
      ) : (
        <Skeleton
          variant="rounded"
          width={width ? width : 160}
          height={length ? length : 160}
        />
      )}
      <Veil zIndex={1} />
    </Stack>
  );
};

export default QuotationQr;

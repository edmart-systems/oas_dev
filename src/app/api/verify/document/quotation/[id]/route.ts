import { QuotationsService } from "@/services/quotations-service/quotations.service";
import { logger } from "@/logger/default-logger";
import { ActionResponse } from "@/types/actions-response.types";
import { QuotationVerificationStatus } from "@/types/quotations.types";
import { decryptMessage } from "@/utils/crypto.utils";
import { fDateDdMmmYyyy } from "@/utils/time.utils";
import { validateQuotationId } from "@/utils/verification-validation.utils";
import { NextRequest, NextResponse } from "next/server";

const quotationService = new QuotationsService();

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const key = process.env.NEXT_PUBLIC_QUOTATION_QR_URL_KEY;

    let idDecryption: string | null = null;

    try {
      idDecryption = decryptMessage(id, key!);
    } catch (err) {
      logger.error(err);
      const res: ActionResponse = {
        status: false,
        message: "Invalid verification key.",
      };
      return Promise.resolve(
        new NextResponse(JSON.stringify(res), { status: 400 })
      );
    }

    if (!idDecryption) {
      const res: ActionResponse = {
        status: false,
        message: "Quotation does not exist.",
      };
      return Promise.resolve(
        new NextResponse(JSON.stringify(res), { status: 404 })
      );
    }

    const idDecryptionArr = idDecryption.split(".");

    if (idDecryptionArr.length !== 1 && idDecryptionArr.length !== 2) {
      const res: ActionResponse = {
        status: false,
        message: "Quotation does not exist.",
      };
      return Promise.resolve(
        new NextResponse(JSON.stringify(res), { status: 404 })
      );
    }

    const quotationNumber = idDecryptionArr[0];

    if (!validateQuotationId(quotationNumber)) {
      const res: ActionResponse = {
        status: false,
        message: "Invalid quotation Id.",
      };
      return Promise.resolve(
        new NextResponse(JSON.stringify(res), { status: 400 })
      );
    }

    let quotationId: number = 0;

    if (idDecryptionArr.length === 2) {
      quotationId = parseInt(idDecryptionArr[1], 10);
      if (isNaN(quotationId)) {
        const res: ActionResponse = {
          status: false,
          message: "Invalid quotation Id.",
        };
        return Promise.resolve(
          new NextResponse(JSON.stringify(res), { status: 400 })
        );
      }
    }

    const quotation = await quotationService.getSingleQuotation(
      {
        quotationNumber: quotationNumber,
        quotationId: quotationId,
      },
      quotationId > 0
    );

    if (!quotation) {
      const res: ActionResponse = {
        status: false,
        message: "Quotation does not exist.",
      };
      return Promise.resolve(
        new NextResponse(JSON.stringify(res), { status: 404 })
      );
    }

    if (quotation.isExpired) {
      const res: ActionResponse<QuotationVerificationStatus> = {
        status: true,
        message: "Successful",
        data: {
          quotationStatus: "expired",
          quotationNumber: quotation.quotationId,
          issueDate: fDateDdMmmYyyy(quotation.time),
        },
      };
      return Promise.resolve(
        new NextResponse(JSON.stringify(res), { status: 200 })
      );
    }

    const res: ActionResponse<QuotationVerificationStatus> = {
      status: true,
      message: "Successful",
      data: {
        quotationStatus: "active",
        quotationNumber: quotation.quotationId,
        issueDate: fDateDdMmmYyyy(quotation.time),
      },
    };

    return Promise.resolve(
      new NextResponse(JSON.stringify(res), { status: 200 })
    );
  } catch (err) {
    logger.error(err);
    const res: ActionResponse = {
      status: false,
      message: "Something went wrong",
    };
    return Promise.resolve(
      new NextResponse(JSON.stringify(res), {
        status: 500,
      })
    );
  }
};

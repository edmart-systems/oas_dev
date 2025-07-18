"use client";

import {
  Edit,
  OpenInFullOutlined,
  OpenInNew,
  Recycling,
} from "@mui/icons-material";
import { Box, Button, Stack } from "@mui/material";
import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import QuotationStatusActions from "./quotation-status-actions";
import {
  FullQuotation,
  NewQuotation,
  QuotationStatusKey,
} from "@/types/quotations.types";
import { useSession } from "next-auth/react";
import { CompanyDto } from "@/types/company.types";
import { getTimeNum } from "@/utils/time.utils";
import { setReuseQuotations } from "@/redux/slices/quotation.slice";
import { useAppDispatch } from "@/redux/store";
import { useRouter } from "next/navigation";
import { paths } from "@/utils/paths.utils";
import nProgress from "nprogress";
import QuotationViewDialog from "./quotation-pdf/quotation-view-dialog";
import QuotationDownloadButtons from "./quotation-pdf/quotation-download-buttons";
import SimpleConfirmDialog from "../../common/simple-confirm-dialog";
import { MAXIMUM_QUOTATION_EDITS } from "@/utils/constants.utils";

type Props = {
  quotation: FullQuotation;
  company: CompanyDto;
  editCounts: number;
  isVariant?: boolean;
};

const QuotationActions = ({
  quotation,
  company,
  editCounts,
  isVariant,
}: Props) => {
  const { data: sessionData } = useSession();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [openPdf, setOpenPdf] = useState<boolean>(false);
  const [openConfirmEditing, setOpenConfirmEditing] = useState<boolean>(false);

  const reuseQuotationHandler = () => {
    const date = new Date();

    const reuseQuotation: NewQuotation = {
      quotationId: getTimeNum(date),
      time: getTimeNum(date),
      type: quotation.type,
      category: quotation.category,
      tcsEdited: quotation.tcsEdited,
      vatExcluded: false,
      tcs: quotation.tcs,
      currency: quotation.currency,
      clientData: quotation.clientData,
      lineItems: quotation.lineItems,
    };

    dispatch(setReuseQuotations(reuseQuotation));
    nProgress.start();
    router.push(paths.dashboard.quotations.create);
  };

  const editQuotationHandler = () => {
    setOpenConfirmEditing(true);
  };

  const openEditQuotation = () => {
    nProgress.start();
    router.push(paths.dashboard.quotations.edit(quotation.quotationId));
  };

  const openPdfHandler = () => {
    setOpenPdf(true);
  };

  const editDisabled: boolean = useMemo(
    () => editCounts >= MAXIMUM_QUOTATION_EDITS,
    [editCounts]
  );

  const openOriginal = () => {
    nProgress.start();
    router.push(paths.dashboard.quotations.single(quotation.quotationId));
  };

  return (
    <Stack direction="row" spacing={2} flexWrap="wrap">
      <Box>
        <QuotationDownloadButtons
          openPdfHandler={openPdfHandler}
          quotation={quotation}
          company={company}
        />
      </Box>
      <Box>
        <Button
          variant="contained"
          color="primary"
          endIcon={<Recycling />}
          onClick={reuseQuotationHandler}
        >
          Reuse
        </Button>
      </Box>
      {!isVariant && (
        <Box>
          <Button
            variant="contained"
            color="primary"
            endIcon={<Edit />}
            onClick={editQuotationHandler}
            disabled={editDisabled}
          >
            Edit
          </Button>
        </Box>
      )}
      {isVariant && (
        <Box>
          <Button
            variant="contained"
            color="primary"
            endIcon={<OpenInNew />}
            onClick={openOriginal}
          >
            Open Original
          </Button>
        </Box>
      )}
      {sessionData?.user.co_user_id === quotation.user.co_user_id && (
        <Box>
          <QuotationStatusActions
            quotationId={quotation.id}
            quotationNumber={quotation.quotationId}
            status={quotation.status.status as QuotationStatusKey}
            isVariant={isVariant}
          />
        </Box>
      )}
      <QuotationViewDialog
        open={openPdf}
        setOpen={setOpenPdf}
        quotation={quotation}
        company={company}
      />
      {!isVariant && openConfirmEditing && (
        <SimpleConfirmDialog
          isOpen={openConfirmEditing}
          setIsOpen={setOpenConfirmEditing}
          confirmHandler={openEditQuotation}
          title="Confirm Editing Quotation"
          body="Are you sure you want to edit this quotation?"
        />
      )}
    </Stack>
  );
};

export default QuotationActions;

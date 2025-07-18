"use client";
import React, { Fragment, useState } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { CaretDown, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { PopupState as PopupStateHook } from "material-ui-popup-state/hooks";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { ActionResponse } from "@/types/actions-response.types";
import { useRouter } from "next/navigation";
import nProgress from "nprogress";
import {
  QuotationStatusKey,
  QuotationStatusAction,
  QuotationStatusActionType,
  QuotationStatusKeyNullable,
} from "@/types/quotations.types";
import { HighlightOff, QueryBuilder } from "@mui/icons-material";
import ConfirmQuotationStatusDialog from "./confirm-quotation-status-dialog";
import {
  updateEditedQuotationStatus,
  updateQuotationStatus,
} from "@/server-actions/quotations-actions/quotations.actions";

const MyMenuItem = styled("div")({
  padding: "6px 16px",
  // width: "200px",
});

const actions: QuotationStatusAction = {
  created: [
    {
      name: "sent",
      label: "Set to Sent",
      desc: "Quotation has been sent to client",
      color: "secondary",
      icon: <QueryBuilder />,
    },
    {
      name: "accepted",
      label: "Set to Accepted",
      desc: "Client approved the quotation",
      color: "success",
      icon: <CheckCircle />,
    },
    {
      name: "rejected",
      label: "Set to Rejected",
      desc: "Client declined the quotation",
      color: "error",
      icon: <HighlightOff />,
    },
  ],
  sent: [
    {
      name: "accepted",
      label: "Set to Accepted",
      desc: "Client approved the quotation",
      color: "success",
      icon: <CheckCircle />,
    },
    {
      name: "rejected",
      label: "Set to Rejected",
      desc: "Client declined the quotation",
      color: "error",
      icon: <HighlightOff />,
    },
  ],
  accepted: [
    {
      name: "rejected",
      label: "Set to Rejected",
      desc: "Client declined the quotation",
      color: "error",
      icon: <HighlightOff />,
    },
  ],
  rejected: [
    {
      name: "accepted",
      label: "Set to Accepted",
      desc: "Client approved the quotation",
      color: "success",
      icon: <CheckCircle />,
    },
  ],
  expired: [],
};

type Props = {
  status: QuotationStatusKey;
  quotationId: number;
  quotationNumber: string;
  isVariant?: boolean;
};

const QuotationStatusActions = ({
  status,
  quotationId,
  quotationNumber,
  isVariant,
}: Props) => {
  const router = useRouter();

  const [isFetching, setIsFetching] = useState(false);

  const [selectedStatus, setSelectedStatus] =
    useState<QuotationStatusKeyNullable>("");
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);

  const actionsArr = actions[status];

  const handleOpenDialog = async (status: QuotationStatusKey) => {
    if (isFetching) {
      return;
    }
    setSelectedStatus(status);
    setConfirmationDialogOpen(true);
  };

  const closeDialogHandler = () => {
    setConfirmationDialogOpen(false);
    setSelectedStatus("");
  };

  const updateQuotationStatusHandler = async (popupState: PopupStateHook) => {
    if (isFetching || !selectedStatus) {
      return;
    }

    setIsFetching(true);

    let res: ActionResponse | null = null;

    if (isVariant) {
      res = await updateEditedQuotationStatus(
        { quotationNumber: quotationNumber, quotationId: quotationId },
        selectedStatus
      );
    } else {
      res = await updateQuotationStatus(quotationNumber, selectedStatus);
    }

    if (!res || !res.status) {
      toast("Failed to update quotation status, " + res.message, {
        type: "error",
      });
      closeDialogHandler();
      setIsFetching(false);
      return;
    }

    toast("Quotation status updated successfully", {
      type: "success",
    });
    setIsFetching(false);
    closeDialogHandler();
    popupState && popupState.close();

    nProgress.start();
    router.refresh();
    return;
  };

  return (
    <PopupState variant="popover" popupId="actions-popup-menu">
      {(popupState) => {
        return (
          <Fragment>
            <Fragment>
              {selectedStatus && confirmationDialogOpen && (
                <ConfirmQuotationStatusDialog
                  status={selectedStatus}
                  isOpen={confirmationDialogOpen}
                  closeHandler={closeDialogHandler}
                  submitHandler={updateQuotationStatusHandler}
                  isFetching={isFetching}
                  popupState={popupState}
                />
              )}
            </Fragment>
            {status !== "expired" && (
              <Button
                variant="outlined"
                color="primary"
                endIcon={<CaretDown />}
                {...bindTrigger(popupState)}
              >
                Status Actions
              </Button>
            )}
            <Menu {...bindMenu(popupState)}>
              <MyMenuItem>
                {actionsArr.length < 1 ? (
                  <Typography>No Actions</Typography>
                ) : (
                  <Typography>Select an action</Typography>
                )}
              </MyMenuItem>
              {actionsArr.map((item) => {
                return (
                  <MyMenuItem key={item.name}>
                    <Button
                      variant="contained"
                      color={item.color}
                      endIcon={item.icon}
                      onClick={() => handleOpenDialog(item.name)}
                      fullWidth
                    >
                      {item.label}
                    </Button>
                  </MyMenuItem>
                );
              })}
            </Menu>
          </Fragment>
        );
      }}
    </PopupState>
  );
};

export default QuotationStatusActions;

"use client";
import React, { Fragment, ReactNode, useState } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import { MenuItem, Typography } from "@mui/material";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { PopupState as PopupStateHook } from "material-ui-popup-state/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { paths } from "@/utils/paths.utils";
import nProgress from "nprogress";

type Props = {
  children: ReactNode;
};

const QuotationsSortByTime = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderByParams = searchParams.get("sort");

  const setSortParams = (order: number) => {
    if (
      (order === 0 && orderByParams === "asc") ||
      (order === 1 && orderByParams === "desc")
    ) {
      return;
    }

    const currentParams = new URLSearchParams(searchParams as any);
    //1 => Newest (date desc)
    //0 => Oldest (date asc)
    currentParams.delete("sort");
    if (order === 0) {
      currentParams.append("sort", "asc");
    } else if (order === 1) {
      currentParams.append("sort", "desc");
    }

    nProgress.start();
    router.push(
      paths.dashboard.quotations.main + `?${currentParams.toString()}`
    );
  };

  const setOrder = (order: number, popState: PopupStateHook) => {
    //1 => Newest (date desc)
    //0 => Oldest (date asc)
    switch (order) {
      case 1:
        setSortParams(1);
        break;
      case 0:
        setSortParams(0);
        break;
      default:
        break;
    }
    popState.close();
  };

  return (
    <PopupState variant="popover" popupId="actions-popup-menu">
      {(popupState) => {
        return (
          <Fragment>
            <Button
              variant="outlined"
              color="primary"
              endIcon={<CaretDown />}
              {...bindTrigger(popupState)}
            >
              {orderByParams === "asc" ? "Oldest" : "Newest"}
            </Button>
            <Menu {...bindMenu(popupState)}>
              <MenuItem
                onClick={() => setOrder(1, popupState)}
                selected={!orderByParams || orderByParams == "desc"}
              >
                Newest
              </MenuItem>
              <MenuItem
                onClick={() => setOrder(0, popupState)}
                selected={orderByParams == "asc"}
              >
                Oldest
              </MenuItem>
            </Menu>
          </Fragment>
        );
      }}
    </PopupState>
  );
};

export default QuotationsSortByTime;

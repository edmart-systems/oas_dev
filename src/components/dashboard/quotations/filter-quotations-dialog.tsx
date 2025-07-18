"use client";
import React, { forwardRef, Fragment, Ref, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { Funnel } from "@phosphor-icons/react/dist/ssr";
import QuotationsFilterCard from "./quotations-filter-card";
import Draggable from "react-draggable";
import { Paper, PaperProps } from "@mui/material";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: Ref<unknown>
) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const PaperComponent = (props: PaperProps) => {
  const nodeRef = React.useRef<HTMLDivElement>(null);
  return (
    <Draggable
      nodeRef={nodeRef as React.RefObject<HTMLDivElement>}
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} ref={nodeRef} />
    </Draggable>
  );
};

const FilterQuotationsDialog = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const openHandler = () => {
    setIsOpen(true);
  };

  const closeHandler = () => {
    setIsOpen(false);
  };

  return (
    <Fragment>
      <Button
        variant="text"
        color="inherit"
        size="large"
        startIcon={<Funnel />}
        onClick={openHandler}
      >
        Filter
      </Button>
      <Dialog
        maxWidth="sm"
        fullWidth={true}
        open={isOpen}
        TransitionComponent={Transition}
        PaperComponent={PaperComponent}
        keepMounted
        onClose={closeHandler}
        aria-describedby="filter-quotations-dialog-slide"
        aria-labelledby="draggable-dialog-title"
        sx={{ display: { xl: "none", lg: "block", md: "block", sm: "block" } }}
      >
        <QuotationsFilterCard closeHandler={closeHandler} />
      </Dialog>
    </Fragment>
  );
};

export default FilterQuotationsDialog;

// "use client";
import React, { MutableRefObject, useCallback, useRef, useState } from "react";

interface PopoverController<T> {
  anchorRef: MutableRefObject<T | null>;
  handleOpen: () => void;
  handleClose: () => void;
  handleToggle: () => void;
  open: boolean;
}

export const usePopover = <T = HTMLElement>(): PopoverController<T> => {
  const anchorRef = useRef<T>(null);
  const [open, setOpen] = useState<boolean>(false);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleToggle = useCallback(() => {
    setOpen((prevState) => !prevState);
  }, []);

  return { anchorRef, handleClose, handleOpen, handleToggle, open };
};

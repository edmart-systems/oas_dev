"use client";

import { AddCircleOutline, Clear } from "@mui/icons-material";
import { Button, Stack, TextField, Typography } from "@mui/material";
import React, {
  Dispatch,
  SetStateAction,
  useRef,
  useState,
  useTransition,
} from "react";
import QuotationListItem from "./quotation-line-item";
import { QuotationInputLineItem } from "@/types/quotations.types";
import { Currency2 } from "@/types/currency.types";
import LineItemDialog from "./line-item-dialog";
import { getTimeNum } from "@/utils/time.utils";
import ClearListDialog from "./clear-list-dialog";

type Props = {
  lineItems: QuotationInputLineItem[];
  setLineItems: Dispatch<SetStateAction<QuotationInputLineItem[]>>;
  selectedCurrency: Currency2;
};

const blankLineItem = (id: number): QuotationInputLineItem => ({
  id: id,
  description: "",
  name: "",
  quantity: null,
  unitPrice: null,
  units: "",
});

const QuotationListItems = ({
  lineItems,
  setLineItems,
  selectedCurrency,
}: Props) => {
  const [openAddNewItem, setOpenNewItem] = useState<boolean>(false);
  const [openClearListDialog, setOpenClearListDialog] =
    useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  const incrementItems = () => {
    if (lineItems.length >= 3) {
      setOpenNewItem(true);
      return;
    }
    setLineItems((prev) => [...prev, blankLineItem(getTimeNum())]);
  };

  const addFullItem = (item: QuotationInputLineItem) => {
    setLineItems((prev) => [...prev, item]);
  };

  const removeItem = (id: number) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateLineItem = (
    id: number,
    field: keyof QuotationInputLineItem,
    value: any
  ) => {
    setLineItems((prev) =>
      prev.map((item) => {
        return item.id === id ? { ...item, [field]: value } : item;
      })
    );
  };

  const updateFullItem = (updatedItem: QuotationInputLineItem) => {
    setLineItems((prev) =>
      prev.map((item) => {
        return item.id === updatedItem.id ? updatedItem : item;
      })
    );
  };

  const clearList = () => {
    setLineItems([blankLineItem(getTimeNum())]);
  };

  const moveQuotationItem = (id: number, direction: 1 | 0) => {
    if (isPending) return;

    startTransition(() => {
      const index = lineItems.findIndex((item) => item.id === id);

      if (direction === 1) {
        if (index <= 0) return;
      } else {
        if (index === lineItems.length - 1) return;
      }

      const newList = [...lineItems];

      if (direction === 1) {
        [newList[index - 1], newList[index]] = [
          newList[index],
          newList[index - 1],
        ];
      } else {
        [newList[index], newList[index + 1]] = [
          newList[index + 1],
          newList[index],
        ];
      }

      setLineItems(newList);
    });
  };

  return (
    <Stack spacing={2}>
      <Typography variant="body1" fontWeight={600} mb={"5px !important"}>
        Line Items {lineItems.length > 0 && `(${lineItems.length})`}
      </Typography>
      {lineItems.map((item, index) => {
        return (
          <QuotationListItem
            key={item.id + "-" + index}
            itemsLength={lineItems.length}
            num={index + 1}
            lineItem={item}
            deleteFn={() => removeItem(item.id)}
            selectedCurrency={selectedCurrency}
            updateFn={updateLineItem}
            updateFullItem={updateFullItem}
            moveItem={moveQuotationItem}
          />
        );
      })}

      <Stack direction="row" spacing={3}>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<AddCircleOutline />}
          onClick={incrementItems}
        >
          Add Item
        </Button>
        {lineItems.length > 1 && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<Clear />}
            onClick={() => setOpenClearListDialog(true)}
          >
            Clear List
          </Button>
        )}
      </Stack>
      {openAddNewItem && (
        <LineItemDialog
          mode="new"
          itemNumber={lineItems.length + 1}
          open={openAddNewItem}
          setOpen={setOpenNewItem}
          selectedCurrency={selectedCurrency}
          addFn={addFullItem}
        />
      )}
      {openClearListDialog && (
        <ClearListDialog
          open={openClearListDialog}
          setOpen={setOpenClearListDialog}
          clearListFn={clearList}
        />
      )}
    </Stack>
  );
};

export default QuotationListItems;

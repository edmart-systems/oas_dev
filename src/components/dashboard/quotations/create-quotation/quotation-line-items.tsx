"use client";

import { AddCircleOutline, Clear } from "@mui/icons-material";
import { Button, Stack, TextField, Typography } from "@mui/material";
import React, {
  Dispatch,
  SetStateAction,
  useRef,
  useState,
  useTransition,
  useCallback,
} from "react";
import QuotationListItem from "./quotation-line-item";

const MemoizedQuotationLineItem = React.memo(QuotationListItem, (prevProps, nextProps) => {
  return (
    prevProps.lineItem === nextProps.lineItem &&
    prevProps.num === nextProps.num &&
    prevProps.itemsLength === nextProps.itemsLength &&
    prevProps.selectedCurrency.currency_code === nextProps.selectedCurrency.currency_code
  );
});
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

  const addFullItem = useCallback((item: QuotationInputLineItem) => {
    setLineItems((prev) => [...prev, item]);
  }, []);

  const removeItem = useCallback((id: number) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateLineItem = useCallback((
    id: number,
    field: keyof QuotationInputLineItem,
    value: any
  ) => {
    setLineItems((prev) => {
      const index = prev.findIndex(item => item.id === id);
      if (index === -1) return prev;
      
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      return newItems;
    });
  }, []);

  const updateFullItem = useCallback((updatedItem: QuotationInputLineItem) => {
    setLineItems((prev) => {
      const index = prev.findIndex(item => item.id === updatedItem.id);
      if (index === -1) return prev;
      
      const newItems = [...prev];
      newItems[index] = updatedItem;
      return newItems;
    });
  }, []);

  const clearList = useCallback(() => {
    setLineItems([blankLineItem(getTimeNum())]);
  }, []);

  const moveQuotationItem = useCallback((id: number, direction: 1 | 0) => {
    if (isPending) return;

    setLineItems(prev => {
      const index = prev.findIndex(item => item.id === id);
      if (index === -1) return prev;
      
      if (direction === 1 && index <= 0) return prev;
      if (direction === 0 && index >= prev.length - 1) return prev;
      
      const newList = [...prev];
      const targetIndex = direction === 1 ? index - 1 : index + 1;
      [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]];
      return newList;
    });
  }, [isPending]);

  return (
    <Stack spacing={2}>
      <Typography variant="body1" fontWeight={600} mb={"5px !important"}>
        Line Items {lineItems.length > 0 && `(${lineItems.length})`}
      </Typography>
      {lineItems.map((item, index) => {
        return (
          <MemoizedQuotationLineItem
            key={item.id}
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

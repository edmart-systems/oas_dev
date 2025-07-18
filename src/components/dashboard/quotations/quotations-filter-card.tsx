"use client";

import { Close } from "@mui/icons-material";
import {
  Button,
  Card,
  CardContent,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { KeyboardEvent, useEffect, useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import {
  QuotationStatusKeyNullable,
  QuotationFilters,
  QuotationCategoryKeyNullable,
} from "@/types/quotations.types";
import { capitalizeFirstLetter } from "@/utils/formatters.util";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  clearQuotationSearchParams,
  updateQuotationSearchParams,
} from "@/redux/slices/quotation-search.slice";

type Props = {
  closeHandler?: () => void;
};

const statuses: QuotationStatusKeyNullable[] = [
  "created",
  "sent",
  "accepted",
  "rejected",
  "expired",
];

const categories: QuotationCategoryKeyNullable[] = [
  "IT",
  "Stationery",
  "General",
];

const today = (): string => {
  const date = new Date();
  // return `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

const initState: QuotationFilters = {
  id: "",
  status: "",
  category: "",
  user: "",
  client: "",
  dataAltered: false,
  start: "2024-01-01",
  end: today(),
};

const initStateStr = JSON.stringify(initState);

const QuotationsFilterCard = ({ closeHandler }: Props) => {
  const { params: oldParams, isSearching } = useAppSelector(
    (state) => state.quotationSearch
  );
  const dispatch = useAppDispatch();
  const [newParams, setNewParams] = useState<QuotationFilters>(initState);
  const [dateEdited, setDateEdited] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const inputHandler = (target: keyof QuotationFilters, value: string) => {
    isSubmitted && setIsSubmitted(false);
    setNewParams((prev) => ({ ...prev, [target]: value }));
  };

  const onSubmit = () => {
    if (isSearching) return;
    const structured: QuotationFilters = {
      id: newParams.id,
      status: newParams.status,
      category: newParams.category,
      user: newParams.user,
      client: newParams.client,
      dataAltered: dateEdited,
      start: newParams.start,
      end: newParams.end,
    };
    const oldParamsStr = JSON.stringify(oldParams);
    const newParamsStr = JSON.stringify(structured);

    if (oldParamsStr === newParamsStr || newParamsStr === initStateStr) return;

    dispatch(updateQuotationSearchParams(structured));
    setIsSubmitted(true);
    setDateEdited(false);
    if (closeHandler) {
      closeHandler();
    }
  };

  const keyBoardPressedHandler = (evt: KeyboardEvent<HTMLDivElement>) => {
    const key = evt.key;
    if (key === "Enter") {
      onSubmit();
      return;
    }
  };

  const setDate = (dayJsObj: Dayjs | null, target: "start" | "end") => {
    try {
      if (!dayJsObj) return;

      const mm = dayJsObj.month();
      const dd = dayJsObj.date();
      const yy = dayJsObj.year();

      if (isNaN(mm) || isNaN(dd) || isNaN(yy)) {
        throw new Error("Invalid date selection");
      }

      const dateStr = `${yy}-${mm + 1}-${dd}`;
      inputHandler(target, dateStr);

      setDateEdited(true);
    } catch (err) {
      console.log(err);
    }
  };

  const onReset = () => {
    setNewParams(initState);
    setIsSubmitted(false);
    setDateEdited(false);
    dispatch(clearQuotationSearchParams());
    closeHandler && closeHandler();
  };

  useEffect(() => {
    if (!oldParams) return;
    // setNewParams(oldParams);
    dispatch(clearQuotationSearchParams());
  }, []);

  useEffect(() => {
    if (!oldParams) {
      setNewParams(initState);
      setIsSubmitted(false);
    }
  }, [oldParams]);

  // const applyBtnDisabled: boolean = useMemo(() => {
  // 	const structuredStr = JSON.stringify({
  // 		id: newParams.id,
  // 		status: newParams.status,
  // 		user: newParams.user,
  // 		client: newParams.client,
  // 		dataAltered: dateEdited,
  // 		start: newParams.start,
  // 		end: newParams.end,
  // 	});

  // 	return (
  // 		structuredStr === initStateStr &&
  // 		structuredStr === JSON.stringify(oldParams)
  // 	);
  // }, [newParams]);

  return (
    <Card sx={{ height: "fit-content" }}>
      <CardContent>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          style={closeHandler ? { cursor: "move" } : {}}
          id={closeHandler ? "draggable-dialog-title" : ""}
        >
          <Typography variant="h6" fontWeight={600}>
            Filters
          </Typography>
          {closeHandler && (
            <IconButton onClick={closeHandler}>
              <Close />
            </IconButton>
          )}
        </Stack>
      </CardContent>
      <CardContent>
        <Stack spacing={3}>
          <TextField
            label="Quotation Id"
            placeholder="Q250116957"
            value={newParams.id}
            disabled={isSearching}
            // onChange={(evt) =>
            //   setNewParams((prev) => ({ ...prev, id: evt.target.value }))
            // }
            onChange={(evt) => inputHandler("id", evt.target.value)}
            onKeyDown={keyBoardPressedHandler}
          />
          <FormControl fullWidth>
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              label="Status"
              value={newParams.status}
              disabled={isSearching}
              // onChange={(evt) =>
              //   setNewParams((prev) => ({
              //     ...prev,
              //     status: evt.target.value as Quotation_Status,
              //   }))
              // }
              onChange={(evt) =>
                inputHandler(
                  "status",
                  evt.target.value as QuotationStatusKeyNullable
                )
              }
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {statuses.map((item, index) => {
                return (
                  <MenuItem value={item} key={item + index}>
                    {capitalizeFirstLetter(item)}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="category-select-label">Category</InputLabel>
            <Select
              label="Category"
              value={newParams.category}
              disabled={isSearching}
              onChange={(evt) =>
                inputHandler(
                  "category",
                  evt.target.value as QuotationCategoryKeyNullable
                )
              }
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {categories.map((item, index) => {
                return (
                  <MenuItem value={item} key={item + index}>
                    {capitalizeFirstLetter(item)}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <TextField
            label="Client"
            value={newParams.client}
            disabled={isSearching}
            onChange={(evt) => inputHandler("client", evt.target.value)}
            onKeyDown={keyBoardPressedHandler}
          />
          <TextField
            label="User (first name)"
            value={newParams.user}
            disabled={isSearching}
            placeholder="First name"
            onChange={(evt) => inputHandler("user", evt.target.value)}
            onKeyDown={keyBoardPressedHandler}
          />
          <DatePicker
            label="Start"
            disableFuture
            value={dayjs(newParams.start)}
            disabled={isSearching}
            onChange={(date) => setDate(date, "start")}
          />
          <DatePicker
            label="End"
            disableFuture
            value={dayjs(newParams.end)}
            disabled={isSearching}
            onChange={(date) => setDate(date, "end")}
          />
          <Stack spacing={1}>
            <Button
              variant="contained"
              size="large"
              onClick={onSubmit}
              // disabled={isSearching || applyBtnDisabled}
            >
              Apply
            </Button>

            {isSubmitted && (
              <Button
                variant="outlined"
                color="primary"
                size="large"
                disabled={isSearching}
                onClick={onReset}
              >
                Clear
              </Button>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default QuotationsFilterCard;

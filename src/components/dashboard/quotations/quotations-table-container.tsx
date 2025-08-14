"use client";

import {
  Box,
  IconButton,
  Stack,
  TablePagination,
  Tooltip,
  Typography,
} from "@mui/material";
import React, {
  ChangeEvent,
  MouseEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import QuotationsTable from "./quotation/quotations-table/quotations-table";
import { useRouter, useSearchParams } from "next/navigation";
import {
  PaginatedQuotations,
  QuotationFilters,
  QuotationStatusKey,
  QuotationStatusCounts,
  SummarizedQuotation,
} from "@/types/quotations.types";
import { getPaginatedQuotation } from "@/server-actions/quotations-actions/quotations.actions";
import { toast } from "react-toastify";
import { PaginationData } from "@/types/other.types";
import { Close, Refresh } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  clearQuotationSearchParams,
  setSearchingQuotation,
} from "@/redux/slices/quotation-search.slice";

type Props = {
  quotationsSummary: QuotationStatusCounts;
};

const groupQuotations = (
  quotations: SummarizedQuotation[]
): Record<QuotationStatusKey, SummarizedQuotation[]> => {
  return quotations.reduce<Record<QuotationStatusKey, SummarizedQuotation[]>>(
    (groupsAcc, item) => {
      const status = item.status as QuotationStatusKey;

      if (!groupsAcc[status]) {
        groupsAcc[status] = [];
      }

      groupsAcc[status].push(item);
      return groupsAcc;
    },
    {
      created: [],
      sent: [],
      accepted: [],
      rejected: [],
      expired: [],
    }
  );
};

const checkFilterParams = (filterParams: QuotationFilters): boolean => {
  const { start, end, ...rest } = filterParams;
  let someValueExists = false;
  const keys = Object.keys(rest);

  for (const _key of keys) {
    const key = _key as keyof Omit<QuotationFilters, "start" | "end">;
    const value = rest[key];

    if (key === "dataAltered" && value) {
      someValueExists = true;
      break;
    }

    if (typeof value !== "boolean" && value && value.length > 2) {
      someValueExists = true;
      break;
    }
  }

  return someValueExists;
};

const compareFilterParamEqual = (
  _old: QuotationFilters | null,
  _new: QuotationFilters | null
): boolean => {
  const oldParamsStr = JSON.stringify(_old);
  const newParamsStr = JSON.stringify(_new);

  return oldParamsStr === newParamsStr;
};

const QuotationsTableContainer = ({ quotationsSummary }: Props) => {
  const limit = 10;
  const dispatch = useAppDispatch();
  const { params: filterParams } = useAppSelector(
    (state) => state.quotationSearch
  );
  const searchParams = useSearchParams();
  const router = useRouter();
  const viewParam = searchParams.get("view");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [dataRows, setDataRows] = useState<SummarizedQuotation[]>([]);
  const [searchDataRows, setSearchDataRows] = useState<SummarizedQuotation[]>(
    []
  );
  const [offset, setOffset] = useState<number>(0);
  const [paginationDetails, setPaginationDetails] = useState<PaginationData>();
  const [inSearchMode, setInSearchMode] = useState<boolean>(false);
  const [prevOffset, setPrevOffset] = useState<number>(0);
  const [prevPage, setPrevPage] = useState<number>(0);
  const [prevFilterParams, setPrevFilterParams] =
    useState<QuotationFilters | null>(null);

  const fetchQuotations = async (
    offset: number,
    filterParams?: QuotationFilters
  ) => {
    if (isFetching) return;

    if (filterParams) {
      setInSearchMode(true);
    }

    setIsFetching(true);
    dispatch(setSearchingQuotation(true));
    const res = await getPaginatedQuotation({
      offset: offset,
      limit: limit,
      filterParams: filterParams,
    });

    setIsFetching(false);
    dispatch(setSearchingQuotation(false));

    if (!res.status || !res.data) {
      toast("Failed to fetch quotations.", { type: "error" });
      console.log(res.message);
      return;
    }

    const { quotations, pagination } = res.data as PaginatedQuotations;

    if (filterParams) {
      setPaginationDetails(pagination);
      setSearchDataRows(quotations);
      setPrevFilterParams(filterParams);
      return;
    }

    setPaginationDetails(pagination);
    setDataRows(quotations);
  };

  const paginationHandler = async (direction: 0 | 1 | 2 | 3) => {
    //1=Right 0=Left
    if (direction == 0) {
      setOffset((prev) => (prev - limit < 0 ? 0 : prev - limit));
      page > 0 && setPage((prev) => prev - 1);
      return;
    } else if (direction == 1) {
      setOffset((prev) => prev + limit);
      setPage((prev) => prev + 1);
      // const lastOffset = paginationDetails!.total - limit;
      // const lastPage = Math.ceil(paginationDetails!.total / limit) - 1;
      // setOffset((prev) =>
      //   prev + limit > lastOffset ? lastOffset : prev + limit
      // );
      // setPage((prev) => (prev + 1 > lastPage ? lastPage : prev + 1));
      return;
    } else if (direction == 2) {
      const lastOffset = paginationDetails!.total - limit;
      const lastPage = Math.ceil(paginationDetails!.total / limit) - 1;
      setOffset(lastOffset);
      setPage(lastPage);
      return;
    } else if (direction == 3) {
      setOffset(0);
      setPage(0);
      return;
    }
  };

  const handleChangePage = (
    evt: MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const closeSearchHandler = () => {
    setInSearchMode(false);
    setSearchDataRows([]);
    dispatch(clearQuotationSearchParams());
    setOffset(prevOffset);
    setPage(prevPage);
    setPrevOffset(0);
    setPrevPage(0);
    setPrevFilterParams(null);
    fetchQuotations(prevOffset);
  };

  useEffect(() => {
    if (inSearchMode) return;
    fetchQuotations(offset);
  }, [offset]);

  useEffect(() => {
    if (!filterParams && inSearchMode) {
      closeSearchHandler();
      return;
    }

    if (!filterParams) return;

    if (!checkFilterParams(filterParams)) return;

    let isFirstSearch = false;

    if (!inSearchMode) {
      setPrevOffset(offset);
      setPrevPage(page);
      setOffset(0);
      setPage(0);
      setDataRows([]);
      isFirstSearch = true;
    }

    if (!compareFilterParamEqual(prevFilterParams, filterParams)) {
      !isFirstSearch && setOffset(0);
    }

    fetchQuotations(offset, filterParams);
    return;
  }, [filterParams, offset]);

  const visibleRows = useMemo(
    (): SummarizedQuotation[] => dataRows,
    [dataRows]
  );

  const visibleGroupedRows = useMemo(
    () => groupQuotations(dataRows),
    [dataRows]
  );

  const visibleSearchRows = useMemo(
    (): SummarizedQuotation[] => searchDataRows,
    [searchDataRows]
  );

  const refreshHandler = () => {
    fetchQuotations(0);
    setOffset(0);
    router.refresh();
  };

  return (
    <Stack spacing={2} position="relative">
      {inSearchMode ? (
        <Stack spacing={1}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Typography variant="body1" color="textSecondary" fontWeight={600}>
              Search Results ({paginationDetails?.total ?? 0})
            </Typography>
            <Tooltip title="Close Search" arrow>
              <IconButton disabled={isFetching} onClick={closeSearchHandler}>
                <Close />
              </IconButton>
            </Tooltip>
          </Stack>
          <QuotationsTable
            visibleRows={visibleSearchRows}
            isFetching={isFetching}
          />
        </Stack>
      ) : (
        <>
          {viewParam === "group" ? (
            <Stack spacing={2}>
              <Stack spacing={1}>
                <Typography
                  variant="body1"
                  color="textSecondary"
                  fontWeight={600}
                >
                  Created ({visibleGroupedRows.created.length})
                </Typography>
                <QuotationsTable
                  visibleRows={visibleGroupedRows.created}
                  isFetching={isFetching}
                />
              </Stack>
              <Stack spacing={1}>
                <Typography
                  variant="body1"
                  color="textSecondary"
                  fontWeight={600}
                >
                  Sent ({visibleGroupedRows.sent.length})
                </Typography>
                <QuotationsTable
                  visibleRows={visibleGroupedRows.sent}
                  isFetching={isFetching}
                />
              </Stack>
              <Stack spacing={1}>
                <Typography
                  variant="body1"
                  color="textSecondary"
                  fontWeight={600}
                >
                  Accepted ({visibleGroupedRows.accepted.length})
                </Typography>
                <QuotationsTable
                  visibleRows={visibleGroupedRows.accepted}
                  isFetching={isFetching}
                />
              </Stack>
              <Stack spacing={1}>
                <Typography
                  variant="body1"
                  color="textSecondary"
                  fontWeight={600}
                >
                  Rejected ({visibleGroupedRows.rejected.length})
                </Typography>
                <QuotationsTable
                  visibleRows={visibleGroupedRows.rejected}
                  isFetching={isFetching}
                />
              </Stack>
              <Stack spacing={1}>
                <Typography
                  variant="body1"
                  color="textSecondary"
                  fontWeight={600}
                >
                  Expired ({visibleGroupedRows.expired.length})
                </Typography>
                <QuotationsTable
                  visibleRows={visibleGroupedRows.expired}
                  isFetching={isFetching}
                />
              </Stack>
            </Stack>
          ) : (
            <QuotationsTable
              visibleRows={visibleRows}
              isFetching={isFetching}
            />
          )}
        </>
      )}

      <TablePagination
        component="div"
        count={paginationDetails?.total ?? 0}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10]}
        labelRowsPerPage="Rows Displayed"
        disabled={isFetching}
        showFirstButton={true}
        showLastButton={true}
        slotProps={{
          actions: {
            nextButton: {
              disabled: paginationDetails?.EoL ?? true,
              onClick: () => paginationHandler(1),
            },
            lastButton: {
              disabled: paginationDetails?.EoL ?? true,
              onClick: () => paginationHandler(2),
            },
            previousButton: {
              disabled: paginationDetails?.BoL ?? true,
              onClick: () => paginationHandler(0),
            },
            firstButton: {
              disabled: paginationDetails?.BoL ?? true,
              onClick: () => paginationHandler(3),
            },
          },
        }}
      />
      {!isFetching && (
        <Box sx={{ position: "absolute", right: "115px", top: "-86px" }}>
          <Tooltip title="Refresh">
            <IconButton
              size="large"
              onClick={() => refreshHandler()}
              color="primary"
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Stack>
  );
};

export default QuotationsTableContainer;

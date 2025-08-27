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
  useCallback,
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
import {
  setTablePage,
  setTableOffset,
  setTableFilters,
  setScrollPosition,
  setSearchMode,
  setSearchPage,
  setSearchOffset,
  setViewMode,
  setExpandedQuotations,
  toggleQuotationExpanded,
} from "@/redux/slices/quotation-table-state.slice";
import { updateQuotationSearchParams } from "@/redux/slices/quotation-search.slice";
import { restoreScrollPosition, saveScrollPosition } from "@/utils/scroll-restoration.utils";

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
  const tableState = useAppSelector((state) => state.quotationTableState);
  const searchParams = useSearchParams();
  const router = useRouter();
  const viewParam = searchParams.get("view");
  const [page, setPage] = useState<number>(tableState.page);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [dataRows, setDataRows] = useState<SummarizedQuotation[]>([]);
  const [searchDataRows, setSearchDataRows] = useState<SummarizedQuotation[]>(
    []
  );
  const [offset, setOffset] = useState<number>(tableState.offset);
  const [paginationDetails, setPaginationDetails] = useState<PaginationData>();
  const [inSearchMode, setInSearchMode] = useState<boolean>(tableState.inSearchMode);
  const [prevOffset, setPrevOffset] = useState<number>(0);
  const [prevPage, setPrevPage] = useState<number>(0);
  const [prevFilterParams, setPrevFilterParams] =
    useState<QuotationFilters | null>(tableState.filters);
  const [expandedQuotations, setExpandedQuotations] = useState<string[]>(tableState.expandedQuotations);

  const handleToggleExpanded = useCallback((quotationId: string) => {
    const newExpanded = expandedQuotations.includes(quotationId)
      ? expandedQuotations.filter(id => id !== quotationId)
      : [...expandedQuotations, quotationId];
    
    setExpandedQuotations(newExpanded);
    
    // Use the individual toggle action instead
    dispatch(toggleQuotationExpanded(quotationId));
  }, [expandedQuotations, dispatch]);

  const fetchQuotations = async (
    offset: number,
    filterParams?: QuotationFilters
  ) => {
    if (isFetching) return;

    if (filterParams) {
      setInSearchMode(true);
      dispatch(setSearchMode(true));
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
      dispatch(setTableFilters(filterParams));
      return;
    }

    setPaginationDetails(pagination);
    setDataRows(quotations);
  };

  const paginationHandler = async (direction: 0 | 1 | 2 | 3) => {
    //1=Right 0=Left
    if (direction == 0) {
      const newOffset = offset - limit < 0 ? 0 : offset - limit;
      const newPage = page > 0 ? page - 1 : 0;
      setOffset(newOffset);
      setPage(newPage);
      dispatch(setTableOffset(newOffset));
      dispatch(setTablePage(newPage));
      return;
    } else if (direction == 1) {
      const newOffset = offset + limit;
      const newPage = page + 1;
      setOffset(newOffset);
      setPage(newPage);
      dispatch(setTableOffset(newOffset));
      dispatch(setTablePage(newPage));
      return;
    } else if (direction == 2) {
      const lastOffset = paginationDetails!.total - limit;
      const lastPage = Math.ceil(paginationDetails!.total / limit) - 1;
      setOffset(lastOffset);
      setPage(lastPage);
      dispatch(setTableOffset(lastOffset));
      dispatch(setTablePage(lastPage));
      return;
    } else if (direction == 3) {
      setOffset(0);
      setPage(0);
      dispatch(setTableOffset(0));
      dispatch(setTablePage(0));
      return;
    }
  };

  const handleChangePage = (
    evt: MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
    dispatch(setTablePage(newPage));
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
    dispatch(setSearchMode(false));
    setOffset(prevOffset);
    setPage(prevPage);
    setPrevOffset(0);
    setPrevPage(0);
    setPrevFilterParams(null);
    dispatch(setTableFilters(null));
    fetchQuotations(prevOffset);
  };

  // Save scroll position on scroll (throttled)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        dispatch(setScrollPosition(saveScrollPosition()));
      }, 100); // Throttle to avoid excessive updates
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [dispatch]);

  // Restore scroll position on mount
  useEffect(() => {
    restoreScrollPosition(tableState.scrollPosition);
  }, [tableState.scrollPosition]);

  // Update view mode in state
  useEffect(() => {
    dispatch(setViewMode(viewParam));
  }, [viewParam, dispatch]);

  // Restore expanded quotations from state on mount
  useEffect(() => {
    setExpandedQuotations(tableState.expandedQuotations);
  }, []);

  // Initialize component with saved state on mount
  useEffect(() => {
    let mounted = true;
    
    const initializeState = async () => {
      if (!mounted) return;
      
      if (tableState.filters && !filterParams && checkFilterParams(tableState.filters)) {
        dispatch(updateQuotationSearchParams(tableState.filters));
      } else if (!tableState.inSearchMode && offset === tableState.offset && tableState.offset > 0) {
        // Fetch data for the saved page if not in search mode and offset matches
        await fetchQuotations(tableState.offset);
      }
    };
    
    initializeState();
    
    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array for mount only

  // Restore filters on mount if they exist in state
  useEffect(() => {
    if (tableState.filters && !filterParams) {
      // Restore filters from saved state
      const savedFilters = tableState.filters;
      if (checkFilterParams(savedFilters)) {
        // This will trigger the filter effect below
        dispatch(updateQuotationSearchParams(savedFilters));
      }
    }
  }, [tableState.filters, filterParams, dispatch]);

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
      dispatch(setSearchOffset(0));
      dispatch(setSearchPage(0));
      isFirstSearch = true;
    }

    if (!compareFilterParamEqual(prevFilterParams, filterParams)) {
      setOffset(0);
      setPage(0);
      dispatch(setSearchOffset(0));
      dispatch(setSearchPage(0));
      fetchQuotations(0, filterParams);
    } else {
      fetchQuotations(offset, filterParams);
    }
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
    setPage(0);
    dispatch(setTableOffset(0));
    dispatch(setTablePage(0));
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
            expandedQuotations={expandedQuotations}
            onToggleExpanded={handleToggleExpanded}
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
                  expandedQuotations={expandedQuotations}
                  onToggleExpanded={handleToggleExpanded}
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
                  expandedQuotations={expandedQuotations}
                  onToggleExpanded={handleToggleExpanded}
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
                  expandedQuotations={expandedQuotations}
                  onToggleExpanded={handleToggleExpanded}
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
                  expandedQuotations={expandedQuotations}
                  onToggleExpanded={handleToggleExpanded}
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
                  expandedQuotations={expandedQuotations}
                  onToggleExpanded={handleToggleExpanded}
                />
              </Stack>
            </Stack>
          ) : (
            <QuotationsTable
              visibleRows={visibleRows}
              isFetching={isFetching}
              expandedQuotations={expandedQuotations}
              onToggleExpanded={handleToggleExpanded}
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

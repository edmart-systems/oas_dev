import { useAppDispatch, useAppSelector } from "@/redux/store";
import { setScrollPosition, toggleQuotationExpanded } from "@/redux/slices/quotation-table-state.slice";
import { useRouter } from "next/navigation";
import { paths } from "@/utils/paths.utils";
import { saveScrollPosition } from "@/utils/scroll-restoration.utils";

export const useQuotationNavigation = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const tableState = useAppSelector((state) => state.quotationTableState);

  const navigateToQuotation = (quotationId: string) => {
    // Save current scroll position before navigation
    dispatch(setScrollPosition(saveScrollPosition()));
    router.push(paths.dashboard.quotations.single(quotationId));
  };

  const navigateToEditedQuotation = (quotationNumber: string, quotationId: number, parentQuotationId?: string) => {
    // Save current scroll position before navigation
    dispatch(setScrollPosition(saveScrollPosition()));
    
    // Ensure parent quotation is expanded when navigating to variant
    if (parentQuotationId && !tableState.expandedQuotations.includes(parentQuotationId)) {
      dispatch(toggleQuotationExpanded(parentQuotationId));
    }
    
    router.push(
      paths.dashboard.quotations.edited({
        quotationNumber,
        quotationId,
      })
    );
  };

  const navigateBackToQuotations = () => {
    // Build URL with preserved state
    const params = new URLSearchParams();
    
    if (tableState.viewMode) {
      params.set("view", tableState.viewMode);
    }
    
    const url = tableState.viewMode 
      ? `${paths.dashboard.quotations.main}?${params.toString()}`
      : paths.dashboard.quotations.main;
    
    router.push(url);
  };

  return {
    navigateToQuotation,
    navigateToEditedQuotation,
    navigateBackToQuotations,
    tableState,
  };
};
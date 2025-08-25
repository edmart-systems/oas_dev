"use client";

import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  IconButton,
  Stack,
  styled,
  Tooltip,
} from "@mui/material";
import React, { useEffect, useState, useTransition } from "react";
import BasicInfo from "./basic-info";
import ClientInfo from "./client-info";
import QuotationListItems from "./quotation-line-items";
import TaxDiscountInfo from "./tax-discount-info";
import NewQuotationTscInfo from "./new-quotation-tsc-info";
import NewQuotationPriceSummary from "./new-quotation-price-summary";
import { OpenInNew, Preview, Save } from "@mui/icons-material";
import {
  CreateQuotationPageData,
  NewQuotation,
  QuotationDraftPreviewData,
  QuotationError,
  QuotationInputClientData,
  QuotationInputLineItem,
  QuotationPriceSummary,
  TcsDto,
} from "@/types/quotations.types";
import { Quotation_category, Quotation_type } from "@prisma/client";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { setUnits } from "@/redux/slices/units.slice";
import { setCurrencies } from "@/redux/slices/currencies.slice";
import { Currency2 } from "@/types/currency.types";
import { getTimeNum } from "@/utils/time.utils";
import {
  calculateQuotationPricesSummary,
  verifyClientInfo,
  verifyClientInfoOnDraft,
  verifyLineItems,
  verifyTcs,
} from "./create-quotation-methods";
import QuotationErrors from "./quotation-errors";
import { toast } from "react-toastify";
import {
  clearReuseQuotations,
  removeQuotationDraft,
  saveQuotationDraft,
} from "@/redux/slices/quotation.slice";
import { useRouter, useSearchParams } from "next/navigation";
import ClearListDialog from "./clear-list-dialog";
import LoadingBackdrop from "@/components/common/loading-backdrop";
import { createNewQuotationAction } from "@/server-actions/quotations-actions/quotations.actions";
import { ActionResponse } from "@/types/actions-response.types";
import { paths } from "@/utils/paths.utils";
import QuotationDraftDialog from "./draft-preview/quotation-draft-dialog";
import { useSession } from "next-auth/react";
import nProgress from "nprogress";
import { MAXIMUM_QUOTATION_DRAFTS } from "@/utils/constants.utils";
import { saveAutoDraftHandler, getLatestAutoDraftHandler, deleteAutoDraftHandler } from "../auto-draft-api";
import AutoDraftRecoveryDialog from "../auto-draft-recovery-dialog";

const MyDivider = styled(Divider)(({ theme }) => ({
  background: theme.palette.mode === "dark" ? "#b8b8b8" : "#dadada",
}));

type Props = {
  baseData: CreateQuotationPageData;
};

const blankClientData: QuotationInputClientData = {
  name: "",
  ref: "",
  contactPerson: "",
  email: "",
  phone: "",
  boxNumber: 0,
  country: "",
  city: "",
  addressLine1: "",
};

const blankLineItem = (id: number): QuotationInputLineItem => ({
  id: id,
  description: "",
  name: "",
  quantity: null,
  unitPrice: null,
  units: "",
});

const submitNewQuotation = async (
  quotation: NewQuotation
): Promise<ActionResponse> => {
  const res: ActionResponse = await createNewQuotationAction(quotation);

  return Promise.resolve(res);
};

const CreateQuotation = ({ baseData }: Props) => {
  const { data: sessionData } = useSession();
  const { quotations: draftQuotations, reuse: reuseQuotation } = useAppSelector(
    (state) => state.quotations
  );
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const selectedDraftParams = searchParams.get("draft");
  const router = useRouter();
  const [quotationDate, setQuotationDate] = useState<Date>(new Date());
  const {
    company,
    quotationTypes,
    quotationCategories,
    tcs,
    units,
    currencies,
    userSignature,
  } = baseData;

  const [quotationId, setQuotationId] = useState<number>(
    getTimeNum(quotationDate)
  );
  const [editTcs, setEditTcs] = useState<boolean>(false);
  const [selectedQuoteType, setSelectedQuoteType] = useState<Quotation_type>(
    quotationTypes[0]
  );
  const [selectedCategory, setSelectedCategory] = useState<Quotation_category>(
    quotationCategories[0]
  );
  const [selectedTcs, setSelectedTcs] = useState<TcsDto>(tcs[0]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency2>(
    currencies[0]
  );
  const [clientData, setClientData] =
    useState<QuotationInputClientData>(blankClientData);
  const [lineItems, setLineItems] = useState<QuotationInputLineItem[]>([
    blankLineItem(quotationId),
  ]);
  const [priceSummary, setPriceSummary] = useState<QuotationPriceSummary>({
    subtotal: 0,
    vat: 0,
    finalTotal: 0,
  });
  const [isCalculating, startCalculation] = useTransition();
  const [excludeVat, setExcludeVat] = useState<boolean>(false);
  const [quotationErrors, setQuotationErrors] = useState<QuotationError[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isCreated, setIsCreated] = useState<boolean>(false);
  const [openResetFields, setOpenResetField] = useState<boolean>(false);
  const [openDraftPreview, setOpenDraftPreview] = useState<boolean>(false);
  const [autoDraftData, setAutoDraftData] = useState<{ draft: NewQuotation; timestamp: Date } | null>(null);
  const [showAutoDraftDialog, setShowAutoDraftDialog] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  const calculatePrices = () => {
    startCalculation(() => {
      let subtotal = 0;
      for (const item of lineItems) {
        if (!item.quantity || !item.unitPrice) continue;
        subtotal += item.quantity * item.unitPrice;
      }

      const vat = excludeVat
        ? 0
        : (subtotal * selectedTcs.vat_percentage) / 100;
      const finalTotal = subtotal + vat;

      const pricesSummary = calculateQuotationPricesSummary({
        lineItems: lineItems,
        excludeVat: excludeVat,
        selectedTcs: selectedTcs,
      });
      setPriceSummary(pricesSummary);
    });
  };

  const resetQuotation = () => {
    if (isFetching) return;
    const now = new Date();
    setQuotationDate(now);
    setQuotationId(getTimeNum(now));
    setQuotationErrors([]);
    setSelectedQuoteType(quotationTypes[0]);
    setSelectedCategory(quotationCategories[0]);
    setEditTcs(false);
    setSelectedTcs(tcs[0]);
    setSelectedCurrency(currencies[0]);
    setClientData(blankClientData);
    setExcludeVat(false);
    setLineItems([blankLineItem(quotationId)]);
  };

  const setSelectedDraftHandler = () => {
    try {
      if (!selectedDraftParams) return;
      if (!draftQuotations || draftQuotations.length < 1) return;

      const draftQuotationId = parseInt(selectedDraftParams, 10);

      const selectedDraft = draftQuotations.find(
        (item) => item.quotationId === draftQuotationId
      );

      if (!selectedDraft) return;

      setQuotationErrors([]);
      setSelectedQuoteType(selectedDraft.type);
      setSelectedCategory(selectedDraft.category);
      setQuotationId(selectedDraft.quotationId);
      setEditTcs(selectedDraft.tcsEdited);
      setSelectedTcs(selectedDraft.tcs);
      setSelectedCurrency(selectedDraft.currency);
      setClientData(selectedDraft.clientData);
      setExcludeVat(selectedDraft.vatExcluded);
      setLineItems(selectedDraft.lineItems);

      // Draft opened silently to avoid duplicate messages
    } catch (err) {
      // console.log(err);
    }
  };

  const setReuseQuotationHandler = () => {
    try {
      if (!reuseQuotation) return;

      setQuotationErrors([]);
      setSelectedQuoteType(reuseQuotation.type);
      setSelectedCategory(reuseQuotation.category);
      setQuotationId(reuseQuotation.quotationId);
      setEditTcs(reuseQuotation.tcsEdited);
      setSelectedTcs(reuseQuotation.tcs);
      setSelectedCurrency(reuseQuotation.currency);
      setClientData(reuseQuotation.clientData);
      setExcludeVat(reuseQuotation.vatExcluded);
      setLineItems(reuseQuotation.lineItems);

      dispatch(clearReuseQuotations());

      toast("Quotation ready to be reused", {
        type: "success",
      });
    } catch (err) {
      // console.log(err);
    }
  };

  useEffect(() => {
    setSelectedDraftHandler();
    setReuseQuotationHandler();
    checkForAutoDraft();
  }, [selectedDraftParams, reuseQuotation]);

  // Check for auto-draft on component mount
  const checkForAutoDraft = async () => {
    if (!sessionData) return;
    
    const { user } = sessionData;
    const autoRestore = searchParams.get('autoRestore');
    
    if (autoRestore === 'true') {
      // Auto-restore from quotations page
      const autoDraft = await getLatestAutoDraftHandler(user.userId);
      if (autoDraft) {
        const draft = autoDraft.draft;
        setSelectedQuoteType(draft.type);
        setSelectedCategory(draft.category);
        setQuotationId(draft.quotationId);
        setEditTcs(draft.tcsEdited);
        setSelectedTcs(draft.tcs);
        setSelectedCurrency(draft.currency);
        setClientData(draft.clientData);
        setExcludeVat(draft.vatExcluded);
        setLineItems(draft.lineItems);
        
        // Auto-draft restored silently
      }
    } else {
      // Normal check for auto-draft dialog
      const autoDraft = await getLatestAutoDraftHandler(user.userId);
      if (autoDraft) {
        setAutoDraftData(autoDraft);
        setShowAutoDraftDialog(true);
      }
    }
  };

  // Handle auto-draft recovery
  const handleRestoreAutoDraft = () => {
    if (!autoDraftData) return;
    
    const draft = autoDraftData.draft;
    setQuotationErrors([]);
    setSelectedQuoteType(draft.type);
    setSelectedCategory(draft.category);
    setQuotationId(draft.quotationId);
    setEditTcs(draft.tcsEdited);
    setSelectedTcs(draft.tcs);
    setSelectedCurrency(draft.currency);
    setClientData(draft.clientData);
    setExcludeVat(draft.vatExcluded);
    setLineItems(draft.lineItems);
    
    setShowAutoDraftDialog(false);
    setAutoDraftData(null);
    
    toast("Auto-draft restored successfully", {
      type: "success",
    });
  };

  const handleDiscardAutoDraft = async () => {
    if (!sessionData) return;
    
    const { user } = sessionData;
    await deleteAutoDraftHandler(user.userId);
    
    setShowAutoDraftDialog(false);
    setAutoDraftData(null);
    
    toast("Auto-draft discarded", {
      type: "info",
    });
  };

  // Auto-save functionality
  const performAutoSave = async () => {
    console.log('Auto-save triggered', { sessionData: !!sessionData, hasUnsavedChanges });
    
    if (!sessionData || !hasUnsavedChanges) {
      console.log('Auto-save skipped: no session or no changes');
      return;
    }
    
    const { user } = sessionData;
    
    // Only auto-save if there's meaningful content
    const hasContent = clientData.name || 
                      lineItems.some(item => item.name || item.description);
    
    console.log('Auto-save content check:', { hasContent, clientName: clientData.name, lineItemsCount: lineItems.length });
    
    if (!hasContent) {
      console.log('Auto-save skipped: no meaningful content');
      return;
    }
    
    const autoDraft: NewQuotation = {
      quotationId: quotationId,
      time: getTimeNum(quotationDate),
      type: selectedQuoteType,
      category: selectedCategory,
      tcsEdited: editTcs,
      vatExcluded: excludeVat,
      tcs: selectedTcs,
      currency: selectedCurrency,
      clientData: clientData,
      lineItems: lineItems,
    };
    
    console.log('Saving auto-draft for user:', user.userId);
    const result = await saveAutoDraftHandler(autoDraft, user.userId);
    console.log('Auto-save result:', result);
  };

  // Listen for auto-save trigger from activity monitor
  useEffect(() => {
    const handleAutoSave = () => {
      console.log('Auto-save triggered by activity monitor');
      performAutoSave();
    };
    
    window.addEventListener('triggerAutoSave', handleAutoSave);
    
    return () => {
      window.removeEventListener('triggerAutoSave', handleAutoSave);
    };
  }, [hasUnsavedChanges, clientData, lineItems, sessionData]);

  // Periodic auto-save every 2 minutes
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    
    const autoSaveInterval = setInterval(() => {
      performAutoSave();
    }, 2 * 60 * 1000); // 2 minutes
    
    return () => clearInterval(autoSaveInterval);
  }, [hasUnsavedChanges, clientData, lineItems]);

  // Track changes to enable auto-save
  useEffect(() => {
    console.log('Form data changed, marking as unsaved');
    setHasUnsavedChanges(true);
  }, [clientData, lineItems, selectedQuoteType, selectedCategory, editTcs, excludeVat, selectedTcs, selectedCurrency]);

  useEffect(() => {
    calculatePrices();
  }, [lineItems, excludeVat]);

  useEffect(() => {
    dispatch(setUnits(units));
    dispatch(setCurrencies(currencies));
  }, []);

  const resetErrors = () => {
    setQuotationErrors([]);
  };

  const submitQuotation = async () => {
    if (isFetching) return;
    if (!sessionData) return;

    const { user } = sessionData;

    resetErrors();

    if (!userSignature) {
      toast("Your have no digital signature.", {
        type: "warning",
      });
      setQuotationErrors([
        {
          message: "You have no signature, please create one to continue.",
          origin: "Root",
        },
      ]);
      return;
    }

    setIsCreated(false);
    const errArr: QuotationError[] = [];

    const tcsCheckRes = verifyTcs({
      selectedTcs: selectedTcs,
      quotationType: selectedQuoteType,
      editTcs: editTcs,
    });

    const clientInfoCheckRes = verifyClientInfo(clientData);

    const lineItemsCheckRes = verifyLineItems(lineItems);

    typeof tcsCheckRes !== "boolean" && errArr.push(...tcsCheckRes);
    typeof clientInfoCheckRes !== "boolean" &&
      errArr.push(...clientInfoCheckRes);
    typeof lineItemsCheckRes !== "boolean" && errArr.push(...lineItemsCheckRes);

    if (errArr.length > 0) {
      toast("Quotation errors detected. Please resolve them to submit", {
        type: "error",
      });
      setQuotationErrors(errArr);
      return;
    }

    const newQuotation: NewQuotation = {
      quotationId: quotationId,
      time: getTimeNum(quotationDate),
      type: selectedQuoteType,
      category: selectedCategory,
      tcsEdited: editTcs,
      vatExcluded: excludeVat,
      tcs: selectedTcs,
      currency: selectedCurrency,
      clientData: clientData,
      lineItems: lineItems,
    };

    setIsFetching(true);

    const res = await submitNewQuotation(newQuotation);

    setIsFetching(false);

    if (!res.status) {
      toast("Failed to create the quotation.", {
        type: "error",
      });
      setQuotationErrors([
        {
          message: res.message,
          origin: "Root",
        },
      ]);
      return;
    }

    toast("Quotation created successfully.", {
      type: "success",
    });

    resetQuotation();
    dispatch(
      removeQuotationDraft({ draftId: quotationId, userId: user.userId })
    );
    
    // Clear auto-draft after successful submission
    await deleteAutoDraftHandler(user.userId);
    setHasUnsavedChanges(false);
    
    setIsCreated(true);
    const createdQuotationId = res.data as string;
    nProgress.start();
    router.push(paths.dashboard.quotations.single(createdQuotationId));
  };

  const saveQuotationDraftHandler = async () => {
    if (!sessionData) return null;

    const { user } = sessionData;

    if (draftQuotations.length >= MAXIMUM_QUOTATION_DRAFTS) {
      toast(
        `Your draft box is full. You can only keep a max of ${MAXIMUM_QUOTATION_DRAFTS} quotation drafts.`,
        {
          type: "warning",
        }
      );

      return;
    }

    setQuotationErrors([]);
    const errArr: QuotationError[] = [];

    const clientInfoCheckRes = verifyClientInfoOnDraft(clientData);

    typeof clientInfoCheckRes !== "boolean" &&
      errArr.push(...clientInfoCheckRes);

    if (errArr.length > 0) {
      toast(
        "Quotation errors detected. Please resolve them to save as a draft",
        {
          type: "error",
        }
      );
      setQuotationErrors(errArr);
      return;
    }

    const quotationDraft: NewQuotation = {
      quotationId: quotationId,
      time: getTimeNum(quotationDate),
      type: selectedQuoteType,
      category: selectedCategory,
      tcsEdited: editTcs,
      vatExcluded: excludeVat,
      tcs: selectedTcs,
      currency: selectedCurrency,
      clientData: clientData,
      lineItems: lineItems,
    };

    dispatch(
      saveQuotationDraft({
        userId: user.userId,
        quotationDraft: quotationDraft,
      })
    );

    // Delete auto-draft when saving as manual draft
    await deleteAutoDraftHandler(user.userId);

    toast("Quotation Draft Saved Successfully", {
      type: "success",
    });
  };

  const previewQuotationDraftHandler = () => {
    if (!userSignature) {
      toast("Your have no digital signature.", {
        type: "warning",
      });
      setQuotationErrors([
        {
          message: "You have no signature, please create one to continue.",
          origin: "Root",
        },
      ]);
      return;
    }

    setQuotationErrors([]);
    const errArr: QuotationError[] = [];

    const tcsCheckRes = verifyTcs({
      selectedTcs: selectedTcs,
      quotationType: selectedQuoteType,
      editTcs: editTcs,
    });

    const clientInfoCheckRes = verifyClientInfo(clientData);

    const lineItemsCheckRes = verifyLineItems(lineItems);

    typeof tcsCheckRes !== "boolean" && errArr.push(...tcsCheckRes);
    typeof clientInfoCheckRes !== "boolean" &&
      errArr.push(...clientInfoCheckRes);
    typeof lineItemsCheckRes !== "boolean" && errArr.push(...lineItemsCheckRes);

    if (errArr.length > 0) {
      toast("Quotation errors detected. Please resolve them to submit", {
        type: "error",
      });
      setQuotationErrors(errArr);
      return;
    }

    if (!sessionData) return;

    setOpenDraftPreview(true);
  };

  const generatePreviewDraftQuotation =
    (): QuotationDraftPreviewData | null => {
      if (!sessionData) return null;

      const { user } = sessionData;
      const pricesSummary = calculateQuotationPricesSummary({
        lineItems: lineItems,
        excludeVat: excludeVat,
        selectedTcs: selectedTcs,
      });

      return {
        quotationId: quotationId,
        time: getTimeNum(quotationDate),
        type: selectedQuoteType,
        category: selectedCategory,
        tcsEdited: editTcs,
        vatExcluded: excludeVat,
        tcs: selectedTcs,
        currency: selectedCurrency,
        clientData: clientData,
        lineItems: lineItems,
        signature: userSignature,
        subtotal: pricesSummary.subtotal,
        vat: pricesSummary.vat,
        grandTotal: pricesSummary.finalTotal,
        user: {
          co_user_id: user.co_user_id,
          firstName: user.firstName,
          lastName: user.lastName,
          profile_picture: user.profile_picture,
        },
      };
    };

  // useEffect(() => {
  //   const newSelectedTc = tcs.filter(
  //     (item) => item.quotation_type_id === selectedQuoteType.type_id
  //   )[0];
  //   setSelectedTcs(newSelectedTc);
  // }, [selectedQuoteType]);

  return (
    <>
    <Card>
      <CardContent>
        <Stack spacing={2}>
          {/* Auto-draft info message */}
          <Alert severity="info" sx={{ mb: 2 }}>
            Your progress will be saved automatically as a draft if you are logged out before submitting.
          </Alert>
          
          <BasicInfo
            tin={company.tin ?? "N/A"}
            quotationTypes={quotationTypes}
            selectedTcs={selectedTcs}
            selectedQuoteType={selectedQuoteType}
            selectedCategory={selectedCategory}
            setSelectedQuoteType={setSelectedQuoteType}
            setSelectedCategory={setSelectedCategory}
            setSelectedTcs={setSelectedTcs}
            tcs={tcs}
            editTcs={editTcs}
            setEditTcs={setEditTcs}
            date={quotationDate}
            selectedCurrency={selectedCurrency}
            setSelectedCurrency={setSelectedCurrency}
            quotationCategories={quotationCategories}
          />
          <MyDivider />
          <ClientInfo setClientData={setClientData} clientData={clientData} />
          <MyDivider />
          <QuotationListItems
            lineItems={lineItems}
            setLineItems={setLineItems}
            selectedCurrency={selectedCurrency}
          />
          <MyDivider />
          <TaxDiscountInfo selectedTcs={selectedTcs} excludeVat={excludeVat} />
          <MyDivider />
          <NewQuotationTscInfo
            selectedTcs={selectedTcs}
            selectedQuoteType={selectedQuoteType}
            setSelectedTcs={setSelectedTcs}
            tcs={tcs}
            editTcs={editTcs}
            setEditTcs={setEditTcs}
          />
          <MyDivider />
          <NewQuotationPriceSummary
            priceSummary={priceSummary}
            isCalculating={isCalculating}
            vatPercentage={selectedTcs.vat_percentage}
            selectedCurrency={selectedCurrency}
            excludeVat={excludeVat}
            setExcludeVat={setExcludeVat}
          />
          {quotationErrors.length > 0 && (
            <>
              <MyDivider />
              <QuotationErrors
                quotationErrors={quotationErrors}
                closeFn={resetErrors}
              />
            </>
          )}
        </Stack>
      </CardContent>
      <CardActions
        sx={{
          display: "flex",
          flexDirection: {
            xl: "row",
            lg: "row",
            md: "row",
            sm: "row",
            xs: "column",
          },
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Stack direction="row" flexWrap="wrap" gap={2}>
          {/* <Tooltip title="Save As Draft" arrow>
						<IconButton
							color="secondary"
							size="large"
							onClick={saveQuotationDraftHandler}
						>
							<Save />
						</IconButton>
					</Tooltip> */}
          <Button
            color="secondary"
            variant="outlined"
            startIcon={<Save />}
            onClick={saveQuotationDraftHandler}
          >
            Save Draft
          </Button>
          <Button
            color="secondary"
            variant="outlined"
            startIcon={<Preview />}
            onClick={previewQuotationDraftHandler}
          >
            Preview Draft
          </Button>
        </Stack>
        <Stack direction="row" flexWrap="wrap" gap={2}>
          <Button
            color="error"
            variant="outlined"
            disabled={isFetching}
            onClick={() => setOpenResetField(true)}
          >
            Reset Quotation
          </Button>
          <Button
            color="primary"
            variant="contained"
            disabled={isFetching}
            onClick={submitQuotation}
          >
            Create Quotation
          </Button>
        </Stack>
      </CardActions>
      {openResetFields && (
        <ClearListDialog
          open={openResetFields}
          setOpen={setOpenResetField}
          clearListFn={resetQuotation}
          isResetFields
        />
      )}
      <LoadingBackdrop open={isFetching || isCreated} />
      {openDraftPreview && (
        <QuotationDraftDialog
          open={openDraftPreview}
          setOpen={setOpenDraftPreview}
          company={company}
          quotation={generatePreviewDraftQuotation()}
        />
      )}
    </Card>
    
    {/* Auto-draft recovery dialog */}
    <AutoDraftRecoveryDialog
      open={showAutoDraftDialog}
      onClose={() => setShowAutoDraftDialog(false)}
      onRestore={handleRestoreAutoDraft}
      onDiscard={handleDiscardAutoDraft}
      autoDraft={autoDraftData}
    />
    </>
  );
};

export default CreateQuotation;

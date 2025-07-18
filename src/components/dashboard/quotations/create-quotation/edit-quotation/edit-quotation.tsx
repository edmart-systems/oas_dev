"use client";

import {
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
import EditQuotationBasicInfo from "./edit-quotation-basic-info";
import ClientInfo from "../client-info";
import QuotationListItems from "../quotation-line-items";
import TaxDiscountInfo from "../tax-discount-info";
import NewQuotationTscInfo from "../new-quotation-tsc-info";
import NewQuotationPriceSummary from "../new-quotation-price-summary";
import { OpenInNew, Preview, Save } from "@mui/icons-material";
import {
  NewEditQuotationData,
  EditQuotationPageData,
  NewQuotation,
  QuotationDraftPreviewData,
  QuotationError,
  QuotationInputClientData,
  QuotationInputLineItem,
  QuotationPriceSummary,
  TcsDto,
} from "@/types/quotations.types";
import { Quotation_category, Quotation_type } from "@prisma/client";
import { useAppDispatch } from "@/redux/store";
import { setUnits } from "@/redux/slices/units.slice";
import { setCurrencies } from "@/redux/slices/currencies.slice";
import { Currency2 } from "@/types/currency.types";
import { getDateStrYyMmDd, getTimeNum } from "@/utils/time.utils";
import {
  calculateQuotationPricesSummary,
  verifyClientInfo,
  verifyLineItems,
  verifyTcs,
} from "../create-quotation-methods";
import QuotationErrors from "../quotation-errors";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import ClearListDialog from "../clear-list-dialog";
import LoadingBackdrop from "@/components/common/loading-backdrop";
import {
  createEditedQuotation,
  createNewQuotationAction,
} from "@/server-actions/quotations-actions/quotations.actions";
import { ActionResponse } from "@/types/actions-response.types";
import { paths } from "@/utils/paths.utils";
import { useSession } from "next-auth/react";
import QuotationDraftDialog from "../draft-preview/quotation-draft-dialog";
import nProgress from "nprogress";

const MyDivider = styled(Divider)(({ theme }) => ({
  background: theme.palette.mode === "dark" ? "#b8b8b8" : "#dadada",
}));

type Props = {
  baseData: EditQuotationPageData;
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

const EditQuotation = ({ baseData }: Props) => {
  const { data: sessionData } = useSession();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    company,
    quotationTypes,
    quotationCategories,
    tcs,
    units,
    currencies,
    userSignature,
    quotation,
  } = baseData;

  const quotationId = quotation.quotationId;
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
    blankLineItem(getTimeNum(new Date())),
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
  const [selectedDate, setSelectedDate] = useState<string>(
    getDateStrYyMmDd(quotation.time)
  );

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
    setQuotationErrors([]);
    setSelectedQuoteType(quotationTypes[0]);
    setSelectedCategory(quotationCategories[0]);
    setEditTcs(false);
    setSelectedTcs(tcs[0]);
    setSelectedCurrency(currencies[0]);
    setClientData(blankClientData);
    setExcludeVat(false);
    setLineItems([blankLineItem(getTimeNum(new Date()))]);
  };

  const setIncomingQuotationHandler = () => {
    try {
      if (!quotation) return;

      setQuotationErrors([]);
      setSelectedQuoteType(quotation.type);
      setSelectedCategory(quotation.category);
      setEditTcs(quotation.tcsEdited);
      setSelectedTcs(quotation.tcs);
      setSelectedCurrency(quotation.currency);
      setClientData(quotation.clientData);
      setExcludeVat(quotation.vatExcluded);
      setLineItems(quotation.lineItems);
    } catch (err) {
      // console.log(err);
    }
  };

  useEffect(() => {
    calculatePrices();
  }, [lineItems, excludeVat]);

  useEffect(() => {
    dispatch(setUnits(units));
    dispatch(setCurrencies(currencies));
    setIncomingQuotationHandler();
  }, []);

  const resetErrors = () => {
    setQuotationErrors([]);
  };

  const submitQuotation = async () => {
    if (isFetching) return;
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

    const noChanges: boolean =
      selectedDate === getDateStrYyMmDd(quotation.time) &&
      JSON.stringify(quotation.tcs) === JSON.stringify(selectedTcs) &&
      JSON.stringify(quotation.type) === JSON.stringify(selectedQuoteType) &&
      JSON.stringify(quotation.category) === JSON.stringify(selectedCategory) &&
      JSON.stringify(quotation.currency) === JSON.stringify(selectedCurrency) &&
      JSON.stringify(quotation.clientData) === JSON.stringify(clientData) &&
      JSON.stringify(quotation.vatExcluded) === JSON.stringify(excludeVat) &&
      JSON.stringify(quotation.lineItems) === JSON.stringify(lineItems);

    if (noChanges) {
      toast("No changes to update.", {
        type: "error",
      });
      return;
    }

    const newEditQuotation: NewEditQuotationData = {
      quotationId: quotationId,
      time: getTimeNum(selectedDate),
      createTime: getTimeNum(),
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

    const res = await createEditedQuotation(newEditQuotation);

    setIsFetching(false);

    if (!res.status || !res.data) {
      toast("Failed to create edited quotation.", {
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

    toast("Quotation edited successfully.", {
      type: "success",
    });

    resetQuotation();
    setIsCreated(true);
    nProgress.start();
    router.push(paths.dashboard.quotations.edited(res.data));
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
        time: getTimeNum(selectedDate),
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
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <EditQuotationBasicInfo
            tin={company.tin ?? "N/A"}
            quotationId={quotationId}
            time={quotation.time}
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
            selectedCurrency={selectedCurrency}
            setSelectedCurrency={setSelectedCurrency}
            quotationCategories={quotationCategories}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
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
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" spacing={2}>
          <Button
            color="secondary"
            variant="outlined"
            startIcon={<Preview />}
            onClick={previewQuotationDraftHandler}
          >
            Preview Draft
          </Button>
        </Stack>
        <Stack direction="row" spacing={2}>
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
      {openDraftPreview && (
        <QuotationDraftDialog
          open={openDraftPreview}
          setOpen={setOpenDraftPreview}
          company={company}
          quotation={generatePreviewDraftQuotation()}
        />
      )}
      <LoadingBackdrop open={isFetching || isCreated} />
    </Card>
  );
};

export default EditQuotation;

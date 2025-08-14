"use client";
import React, {
  Dispatch,
  forwardRef,
  Ref,
  SetStateAction,
  useState,
} from "react";
import Dialog from "@mui/material/Dialog";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import Draggable from "react-draggable";
import {
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Paper,
  PaperProps,
  Stack,
  Typography,
} from "@mui/material";
import { AspectRatio, Close, Preview } from "@mui/icons-material";
import SignatureView from "./signature-view";
import { Signature } from "@phosphor-icons/react/dist/ssr";
import CreateSignature from "./create-signature";
import { SignatureMode } from "@/types/signature.types";
import { toast } from "react-toastify";
import { htmlToDatUrl } from "@/utils/html-base64-converter";
import ConfirmSignatureDialog from "./confirm-signature-dialog";
import { UserSignatureDto } from "@/types/user.types";
import { ActionResponse } from "@/types/actions-response.types";
import {
  registerUserSignature,
  updateUserSignature,
  updateUserSignatureDimensions,
} from "@/server-actions/user-actions/user-signature/user-signature.actions";
import { useRouter } from "next/navigation";
import nProgress from "nprogress";
import LoadingBackdrop from "@/components/common/loading-backdrop";
import ResizeSignature from "./resize-signature";
import { Dimensions } from "@/types/other.types";
import SignaturePreviewDialog from "./signature-preview/signature-preview-dialog";
import { SessionUser } from "@/server-actions/auth-actions/auth.actions";
import { userNameFormatter } from "@/utils/formatters.util";

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

type Props = {
  open: boolean;
  userId: string;
  setOpen: Dispatch<SetStateAction<boolean>>;
  userSignature: UserSignatureDto | null;
  setUserSignature: Dispatch<SetStateAction<UserSignatureDto | null>>;
  notFound: boolean;
  setNotFound: Dispatch<SetStateAction<boolean>>;
  user: SessionUser;
};

const SignatureDialog = ({
  userId,
  open,
  setOpen,
  userSignature,
  setUserSignature,
  notFound,
  setNotFound,
  user,
}: Props) => {
  const router = useRouter();
  const [createMode, setCreateMode] = useState<boolean>(false);
  const [signTxt, setSignTxt] = useState<string>("");
  const [trimmedDataURL, setTrimmedDataURL] = useState<string | null>(null);
  const [mode, setMode] = useState<SignatureMode>("type");
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [openConfirm, setOpenConfirm] = useState<boolean>(false);
  const [dataUrl, setDataUrl] = useState<string>("");

  //Resizing vars
  const [resizeMode, setResizeMode] = useState<boolean>(false);
  const [dimensions, setDimensions] = useState<Dimensions>({
    height: userSignature?.height ?? 0,
    width: userSignature?.width ?? 0,
  });
  const [previewSignature, setPreviewSignature] = useState<boolean>(false);

  const backHandler = () => {
    if (resizeMode) {
      setPreviewSignature(false);
      setResizeMode(false);
      return;
    }

    if (mode === "type") {
      setSignTxt("");
      setCreateMode(false);
      return;
    } else {
      setSignTxt("");
      setMode("type");
      return;
    }
  };

  const resetHandler = () => {
    setSignTxt("");
    setMode("type");
    setCreateMode(false);
    setIsFetching(false);
    setTrimmedDataURL(null);
    setOpenConfirm(false);
    setResizeMode(false);
    setDimensions({
      height: userSignature?.height ?? 0,
      width: userSignature?.width ?? 0,
    });
    setDataUrl("");
  };

  const closeHandler = () => {
    if (isFetching) return;
    resetHandler();
    setOpen(false);
  };

  const saveTypedSignatureHandler = async () => {
    if (isFetching) return;

    //Remove this block to allow typed signature
    toast("Typed signature is not allowed", { type: "warning" });
    return;
    //Remove this block to allow typed signature

    if (signTxt.length < 2) {
      toast("Invalid signature", { type: "error" });
      return;
    }

    let dataUrl = "";

    try {
      dataUrl = await htmlToDatUrl("sign-export-txt");
    } catch (err) {
      console.log(err);
      toast("Something went wrong", { type: "error" });
      return;
    }

    setDataUrl(dataUrl);
    setOpenConfirm(true);
  };

  const saveDrawSignatureHandler = () => {
    if (isFetching) return;
    if (!trimmedDataURL) {
      toast("Invalid signature", { type: "error" });
      return;
    }

    setDataUrl(trimmedDataURL);
    setOpenConfirm(true);
  };

  const uploadSignatureHandler = async () => {
    if (isFetching) return;
    if (dataUrl.length < 10) return;

    setIsFetching(true);

    let res: ActionResponse<UserSignatureDto>;

    if (userSignature) {
      res = await updateUserSignature({ dataUrl: dataUrl, userId: userId });
    } else {
      res = await registerUserSignature({ dataUrl: dataUrl, userId: userId });
    }

    if (!res.status || !res.data) {
      setIsFetching(false);
      return toast(res.message, { type: "error" });
    }

    toast("Signature registered successfully", { type: "success" });

    setNotFound(false);
    setUserSignature(res.data);
    setIsFetching(false);

    resetHandler();

    nProgress.start();
    router.refresh();
    closeHandler();
  };

  const openResizeSignature = () => {
    if (!userSignature) return;
    setResizeMode(true);
  };

  const saveNewSizeHandler = async () => {
    if (isFetching) return;
    if (!userSignature) return;
    if (
      userSignature.height === dimensions.height &&
      userSignature.width === dimensions.width
    ) {
      toast("Nothing to update.", { type: "info" });
      return;
    }

    setIsFetching(true);

    const res: ActionResponse<UserSignatureDto> =
      await updateUserSignatureDimensions(dimensions);

    if (!res.status || !res.data) {
      setIsFetching(false);
      return toast(res.message, { type: "error" });
    }

    toast("Signature updated successfully", { type: "success" });

    setNotFound(false);
    setUserSignature(res.data);
    setIsFetching(false);

    resetHandler();

    nProgress.start();
    router.refresh();
    closeHandler();
  };

  const generateResizedSignatureDto = (): UserSignatureDto | null => {
    if (!userSignature) return null;

    return {
      ...userSignature,
      height: dimensions.height,
      width: dimensions.width,
    };
  };

  return (
    <Dialog
      maxWidth="md"
      fullWidth={true}
      open={open}
      TransitionComponent={Transition}
      PaperComponent={PaperComponent}
      keepMounted
      // onClose={closeHandler}
      aria-describedby="filter-quotations-dialog-slide"
      aria-labelledby="draggable-dialog-title"
    >
      <Card sx={{ height: "600px" }}>
        <CardContent sx={{ height: "72px" }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            style={{ cursor: "move" }}
            id={"draggable-dialog-title"}
          >
            <Typography variant="h6" fontWeight={600}>
              Your Signature
            </Typography>
            <IconButton onClick={closeHandler} disabled={isFetching}>
              <Close />
            </IconButton>
          </Stack>
        </CardContent>
        <Divider />
        <CardContent sx={{ height: "456px" }}>
          {createMode ? (
            <CreateSignature
              setSignTxt={setSignTxt}
              signTxt={signTxt}
              setMode={setMode}
              mode={mode}
              trimmedDataURL={trimmedDataURL}
              setTrimmedDataURL={setTrimmedDataURL}
            />
          ) : resizeMode ? (
            <ResizeSignature
              signature={userSignature!}
              dimensions={dimensions}
              setDimensions={setDimensions}
            />
          ) : (
            <Stack height="100%" alignItems="center" justifyContent="center">
              <SignatureView
                src={userSignature ? userSignature.dataUrl : null}
              />
            </Stack>
          )}
        </CardContent>
        <Divider />
        <CardContent sx={{ height: "72px" }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            {createMode || resizeMode ? (
              <Button
                variant="contained"
                color="inherit"
                sx={{ width: "100px" }}
                onClick={backHandler}
                disabled={isFetching}
              >
                Back
              </Button>
            ) : (
              <>&ensp;</>
            )}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="flex-end"
            >
              {createMode && mode === "type" && signTxt.length > 1 && (
                <Button
                  variant="contained"
                  endIcon={<Signature />}
                  onClick={saveTypedSignatureHandler}
                  disabled={isFetching}
                >
                  Save Signature
                </Button>
              )}
              {createMode && mode === "draw" && trimmedDataURL && (
                <Button
                  variant="contained"
                  endIcon={<Signature />}
                  onClick={saveDrawSignatureHandler}
                  disabled={isFetching}
                >
                  Save Signature
                </Button>
              )}

              {resizeMode && (
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="center"
                  spacing={3}
                >
                  <Button
                    variant="contained"
                    endIcon={<Preview />}
                    onClick={() => setPreviewSignature(true)}
                    disabled={isFetching}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="contained"
                    endIcon={<AspectRatio />}
                    onClick={() => saveNewSizeHandler()}
                    disabled={isFetching}
                  >
                    Save New Size
                  </Button>
                </Stack>
              )}

              {notFound && !createMode && (
                <Button
                  variant="contained"
                  endIcon={<Signature />}
                  onClick={() => setCreateMode(true)}
                  disabled={isFetching}
                >
                  Create Signature
                </Button>
              )}

              {userSignature &&
                Boolean(userSignature.canUpdate) &&
                !createMode &&
                !resizeMode && (
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    spacing={3}
                  >
                    <Button
                      variant="contained"
                      endIcon={<AspectRatio />}
                      onClick={() => openResizeSignature()}
                    >
                      Resize Signature
                    </Button>
                    <Button
                      variant="contained"
                      endIcon={<Signature />}
                      onClick={() => setCreateMode(true)}
                    >
                      Change Signature
                    </Button>
                  </Stack>
                )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
      {openConfirm && dataUrl && (
        <ConfirmSignatureDialog
          open={openConfirm}
          setOpen={setOpenConfirm}
          dataUrl={dataUrl}
          submitFn={uploadSignatureHandler}
        />
      )}
      {resizeMode && previewSignature && (
        <SignaturePreviewDialog
          open={previewSignature}
          setOpen={setPreviewSignature}
          userName={userNameFormatter(user.firstName, user.lastName)}
          signature={generateResizedSignatureDto()}
        />
      )}
      <LoadingBackdrop open={isFetching} />
    </Dialog>
  );
};

export default SignatureDialog;

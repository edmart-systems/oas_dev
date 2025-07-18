"use client";
import React, {
  Dispatch,
  FormEvent,
  Fragment,
  SetStateAction,
  useState,
} from "react";
import bcrypt from "bcryptjs";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { UserRegInfo } from "@/types/user.types";
import { VerificationHash } from "@/types/verification.types";
import { toast } from "react-toastify";
import { Alert } from "@mui/material";
import { Warning } from "@phosphor-icons/react";
import { checkDigitsOnly } from "@/utils/verification-validation.utils";

type Props = {
  type: "sms" | "email";
  setOpen: Dispatch<SetStateAction<boolean>>;
  isOpen: boolean;
  userInfo: UserRegInfo;
  verificationHash: VerificationHash;
  verificationDoneHandler: () => void;
};

const VerifyEmailSmsDialog = ({
  type,
  setOpen,
  isOpen,
  userInfo,
  verificationHash,
  verificationDoneHandler,
}: Props) => {
  const maxRetry: number = 3;
  const { hash } = verificationHash;
  const [fails, setFails] = useState<number>(0);
  const [error, setError] = useState<string>("");

  const setErrorHandler = (error: string) => {
    error &&
      toast(error, {
        type: "error",
      });
    setError(error);
  };

  const verifyCode = async (userInput: string) => {
    setErrorHandler("");
    setFails((prev) => prev + 1);

    if (fails >= maxRetry) {
      toast("Retries Finished", {
        type: "error",
      });
      return;
    }

    if (userInput.length !== 6 || !checkDigitsOnly(userInput)) {
      setErrorHandler(
        `Wrong verification code. ${maxRetry - fails} tries left`
      );
      return;
    }

    const isOkay = await bcrypt.compare(userInput, hash);

    if (!isOkay) {
      setErrorHandler(
        `Wrong verification code. ${maxRetry - fails} tries left`
      );
      return;
    }

    toast(
      type == "email"
        ? "Email Verified Successfully"
        : "Phone Number Verified Successfully",
      {
        type: "success",
      }
    );

    setFails(0);
    handleClose();
    verificationDoneHandler();
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Fragment>
      <Dialog
        open={isOpen}
        // onClose={handleClose}
        PaperProps={{
          component: "form",
          onSubmit: (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries((formData as any).entries());
            const verCode = formJson.ver_code;
            return verifyCode(verCode);
          },
        }}
      >
        <DialogTitle>
          Verify {type == "email" ? "Email Address" : "Phone Number"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter the verification code that has been sent to your{" "}
            {type == "email"
              ? `email address '${userInfo.email}'`
              : `phone number '${userInfo.phone}'`}
            .
          </DialogContentText>
          <br />
          <TextField
            autoFocus
            required
            margin="dense"
            id="ver_code"
            name="ver_code"
            label="Verification Code"
            type="number"
            fullWidth
            variant="outlined"
            size="small"
          />
          {error && (
            <>
              <br />
              <Alert color="error" icon={<Warning />}>
                {error}
              </Alert>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined" color="error">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Verify
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};

export default VerifyEmailSmsDialog;

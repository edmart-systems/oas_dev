"use client";

import { Box, Button, Skeleton } from "@mui/material";
import { Signature } from "@phosphor-icons/react/dist/ssr";
import React, { useEffect, useState } from "react";
import SignatureDialog from "./signature-dialog";
import { UserSignatureDto } from "@/types/user.types";
import { fetchUserSignature } from "@/server-actions/user-actions/user-signature/user-signature.actions";
import { ActionResponse } from "@/types/actions-response.types";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";

type Props = {};

const UserSignatureButton = ({}: Props) => {
  const { data: userSession } = useSession();
  const [open, setOpen] = useState<boolean>(false);
  const [userSignature, setUserSignature] = useState<UserSignatureDto | null>(
    null
  );
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [notFound, setNotFound] = useState<boolean>(false);

  const fetchUserSignatureFn = async () => {
    if (!userSession) {
      return;
    }

    setIsFetching(true);
    const res: ActionResponse<UserSignatureDto> = await fetchUserSignature(
      userSession.user.co_user_id
    );

    if (!res.status || !res.data) {
      if (res.message.toLowerCase().includes("not found")) {
        setNotFound(true);
      }
      setIsFetching(false);
      return toast(res.message, { type: "info" });
    }
    setUserSignature(res.data);
    setIsFetching(false);
    setNotFound(false);
  };

  useEffect(() => {
    fetchUserSignatureFn();
  }, [userSession]);

  if (!userSession) {
    return (
      <Box>
        <Skeleton
          variant="rounded"
          width={120}
          height={40}
          sx={{ cursor: "pointer" }}
        />
      </Box>
    );
  }
  return (
    <Box>
      <Button
        variant="outlined"
        endIcon={<Signature />}
        onClick={() => setOpen(true)}
        disabled={isFetching}
      >
        Your Signature
      </Button>
      {!isFetching && open && (
        <SignatureDialog
          userId={userSession.user.co_user_id}
          open={open}
          setOpen={setOpen}
          userSignature={userSignature}
          notFound={notFound}
          setNotFound={setNotFound}
          setUserSignature={setUserSignature}
          user={userSession.user}
        />
      )}
    </Box>
  );
};

export default UserSignatureButton;

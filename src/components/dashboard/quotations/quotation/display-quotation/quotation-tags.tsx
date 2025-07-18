"use client";

import { QuotationId, QuotationTaggedUser } from "@/types/quotations.types";
import { SummarizedUser } from "@/types/user.types";
import { userNameFormatter } from "@/utils/formatters.util";
import { Add, Stars } from "@mui/icons-material";
import { Chip, Divider, Stack, Typography } from "@mui/material";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import AddQuotationTagsDialog from "./add-quotation-tags-dialog";

type Props = {
  taggedUsers: QuotationTaggedUser[] | null;
  creator: SummarizedUser;
  isVariant: boolean;
  quotationId: QuotationId;
};

const QuotationTags = ({
  taggedUsers,
  creator,
  isVariant,
  quotationId,
}: Props) => {
  const { data: sessionData } = useSession();
  const [displayedTags, setDisplayedTags] = useState<
    QuotationTaggedUser[] | null
  >(taggedUsers);
  const [openAddTag, setOpenAddTag] = useState<boolean>(false);

  const isYou: boolean = useMemo(
    () =>
      sessionData ? sessionData.user.co_user_id === creator.co_user_id : false,
    [sessionData]
  );

  if (
    (!taggedUsers && !isYou) ||
    (taggedUsers && !isYou && taggedUsers.length < 1)
  ) {
    return <></>;
  }

  return (
    <>
      <Divider />
      <Stack spacing={2}>
        <Stack direction="row" spacing={1}>
          <Typography variant="body1" fontWeight={600}>
            Tagged Users
          </Typography>
        </Stack>
        <Stack
          alignContent="center"
          justifyContent="flex-start"
          gap={1}
          direction="row"
          width="100%"
          flexWrap="wrap"
        >
          <Chip
            label={userNameFormatter(
              creator.firstName,
              creator.lastName,
              creator.otherName
            )}
            color="default"
            variant="filled"
            icon={<Stars />}
            sx={{ cursor: "pointer" }}
          />
          {displayedTags &&
            displayedTags.length > 0 &&
            displayedTags.map((item, index) => {
              return (
                <Chip
                  key={index}
                  label={userNameFormatter(
                    item.firstName,
                    item.lastName,
                    item.otherName
                  )}
                  variant="filled"
                  color="default"
                  sx={{ cursor: "pointer" }}
                />
              );
            })}
          {isYou && (
            <Chip
              icon={<Add />}
              label="Add"
              color="primary"
              sx={{ cursor: "pointer" }}
              onClick={() => setOpenAddTag((prev) => !prev)}
            />
          )}
        </Stack>
      </Stack>
      <AddQuotationTagsDialog
        isOpen={openAddTag}
        setIsOpen={setOpenAddTag}
        creator={creator}
        existingTags={displayedTags ?? []}
        setQuotationTags={setDisplayedTags}
        isVariant={isVariant}
        quotationId={quotationId}
      />
    </>
  );
};

export default QuotationTags;

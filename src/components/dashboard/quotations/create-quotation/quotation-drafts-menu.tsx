"use client";
import {
  deleteAllQuotationDrafts,
  removeQuotationDraft,
} from "@/redux/slices/quotation.slice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { paths } from "@/utils/paths.utils";
import { fDateTime12 } from "@/utils/time.utils";
import { DeleteForever, Drafts, Launch } from "@mui/icons-material";
import {
  Box,
  IconButton,
  ListSubheader,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Button } from "@mui/material";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useRouter, useSearchParams } from "next/navigation";
import nProgress from "nprogress";
import { MouseEvent, useState } from "react";
import ClearListDialog from "./clear-list-dialog";
import { useSession } from "next-auth/react";

type Props = {
  isCreatePage?: boolean;
};

const QuotationDraftsMenu = ({ isCreatePage = true }: Props) => {
  const { data: sessionData } = useSession();
  const summary = useAppSelector((state) => state.quotations.summary);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  // const selectedDraftParams = searchParams.get("draft");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openClearList, setOpenClearList] = useState<boolean>(false);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    isCreatePage && router.push(paths.dashboard.quotations.create);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const setSearchParams = (draftId: number) => {
    const currentParams = new URLSearchParams(searchParams as any);
    currentParams.delete("draft");
    currentParams.append("draft", String(draftId));
    nProgress.start();
    router.push(
      `${paths.dashboard.quotations.create}?${currentParams.toString()}`
    );
  };

  const menuItemClickHandler = (draftId: number) => {
    setSearchParams(draftId);
    handleClose();
  };

  const deleteHandler = (draftId: number) => {
    if (!sessionData) {
      handleClose();
      return;
    }

    const { user } = sessionData;
    dispatch(removeQuotationDraft({ draftId: draftId, userId: user.userId }));
    handleClose();
  };

  const deleteAllHandler = () => {
    if (!sessionData) {
      handleClose();
      return;
    }

    const { user } = sessionData;
    dispatch(deleteAllQuotationDrafts({ userId: user.userId }));
    handleClose();
  };

  return (
    <div>
      <Button
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        variant="outlined"
        endIcon={<Drafts />}
      >
        Drafts {summary.length > 0 && `(${summary.length})`}
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <ListSubheader sx={{ marginTop: "10px" }}>
          <Typography variant="body1" align="center">
            Quotation Drafts
          </Typography>
        </ListSubheader>
        {summary.length > 0 ? (
          <>
            {summary.map((item) => {
              return (
                <MenuItem key={item.quotationId}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    width="100%"
                  >
                    <Typography
                      variant="body2"
                      onClick={() => menuItemClickHandler(item.quotationId)}
                    >
                      {fDateTime12(item.quotationId)} - {item.name}
                    </Typography>
                    &ensp; &ensp;
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Tooltip title="Open Quotation" arrow>
                        <IconButton
                          size="small"
                          onClick={() => menuItemClickHandler(item.quotationId)}
                          color="secondary"
                        >
                          <Launch />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Quotation" arrow>
                        <IconButton
                          size="small"
                          onClick={() => deleteHandler(item.quotationId)}
                          color="error"
                        >
                          <DeleteForever />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </MenuItem>
              );
            })}
            <MenuItem key={4004533}>
              <Button
                variant="text"
                color="error"
                fullWidth
                onClick={() => setOpenClearList(true)}
              >
                Clear List
              </Button>
            </MenuItem>
          </>
        ) : (
          <MenuItem key={4004534} onClick={handleClose}>
            <Box
              component="img"
              alt="No items"
              src="/assets/Empty.gif"
              borderRadius={2}
              sx={{
                display: "inline-block",
                height: "auto",
                maxWidth: "100%",
                width: "200px",
              }}
            />
          </MenuItem>
        )}
      </Menu>
      {openClearList && (
        <ClearListDialog
          open={openClearList}
          setOpen={setOpenClearList}
          clearListFn={deleteAllHandler}
        />
      )}
    </div>
  );
};

export default QuotationDraftsMenu;

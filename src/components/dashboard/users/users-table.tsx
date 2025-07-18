"use client";

import React, {
  ChangeEvent,
  MouseEvent,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import {
  Button,
  Card,
  CardContent,
  Divider,
  Skeleton,
  Stack,
} from "@mui/material";
import UserTableTabs from "./user-table-tabs";
import UserTableActions from "./user-table-actions";
import {
  FullUser,
  UsersAndStatusCounts,
  UserStatus,
  UserStatusCounts,
} from "@/types/user.types";
import { fetchAllUsers } from "@/server-actions/user-actions/user.actions";
import { toast } from "react-toastify";
import { fDateTime12, fToNow } from "@/utils/time.utils";
import UserTableName from "./user-table-name";
import UserContactChip from "./user/user-contact-chip";
import {
  capitalizeFirstLetter,
  formatDisplayedPhoneNumber,
  userNameFormatter,
} from "@/utils/formatters.util";
import UserStatusChip from "./user/user-status-chip";
import { Launch, OpenInFull, Refresh } from "@mui/icons-material";
import { useRouter, useSearchParams } from "next/navigation";
import { paths } from "@/utils/paths.utils";
import UserTableNameFilter from "./user-table-name-filter";
import UserTableEmailFilter from "./user-table-email-filter";
import UserTablePhoneFilter from "./user-table-phone-filter";
import { useSession } from "next-auth/react";
import nProgress from "nprogress";
import MyCircularProgress from "@/components/common/my-circular-progress";

interface Data {
  name: string;
  contacts: string;
  phone: string;
  role: string;
  create: string;
  status: string;
  actions: string;
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  numeric: boolean;
}

interface EnhancedTableProps {
  numSelected: number;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  rowCount: number;
}

const fieldNames: readonly HeadCell[] = [
  {
    id: "name",
    numeric: false,
    disablePadding: false,
    label: "Name",
  },
  {
    id: "contacts",
    numeric: false,
    disablePadding: false,
    label: "Contacts",
  },
  {
    id: "role",
    numeric: false,
    disablePadding: false,
    label: "Role",
  },
  {
    id: "create",
    numeric: false,
    disablePadding: false,
    label: "Created At",
  },
  {
    id: "status",
    numeric: false,
    disablePadding: false,
    label: "Status",
  },
  {
    id: "actions",
    numeric: false,
    disablePadding: false,
    label: "Actions",
  },
];

const EnhancedTableHead = (props: EnhancedTableProps) => {
  const { onSelectAllClick, numSelected, rowCount } = props;

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              "aria-label": "select all users",
            }}
          />
        </TableCell>
        {fieldNames.map((item, index) => (
          <TableCell
            key={item.id}
            align="left"
            padding={item.disablePadding ? "none" : "normal"}
          >
            <TableSortLabel
            // onClick={createSortHandler(item.id)}
            >
              {item.label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

const fetchUsers = async (
  status: UserStatus | null
): Promise<UsersAndStatusCounts | null> => {
  try {
    const res = await fetchAllUsers(status);

    if (res.status) {
      return Promise.resolve(res.data as UsersAndStatusCounts);
    }

    return Promise.resolve(null);
  } catch (err) {
    return Promise.resolve(null);
  }
};

const UsersTable = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: sessionData } = useSession();
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [users, setUsers] = useState<FullUser[]>([]);
  const [statusCounts, setStatusCounts] = useState<UserStatusCounts>({
    active: 0,
    blocked: 0,
    inactive: 0,
    pending: 0,
    all: 0,
  });
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const [selectedStatusTab, setSelectedStatusTab] = useState<number>(0);

  const statusParam = searchParams.get("status");
  const nameParam = searchParams.get("name");
  const phoneParam = searchParams.get("phone");
  const emailParam = searchParams.get("email");

  const handleSelectAllClick = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = users.map((n) => n.co_user_id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleSelectClick = (event: MouseEvent<unknown>, id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event: ChangeEvent<HTMLInputElement>) => {
    setDense(event.target.checked);
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - users.length) : 0;

  const fetchUsersHandler = async (status: UserStatus | null) => {
    if (isFetching) {
      return;
    }
    setIsFetching(true);
    const usersData = await fetchUsers(status);
    if (!usersData) {
      toast("Failed to fetch users", {
        type: "error",
      });
      return setIsFetching(false);
    }

    const { users: _users, summary } = usersData;
    setUsers(_users);
    setStatusCounts(summary);
    setIsFetching(false);
  };

  const resetSearchParams = () => {
    nProgress.start();
    router.push(paths.dashboard.users.main);
    setSelectedStatusTab(0);
  };

  useEffect(() => {
    resetSearchParams();
    fetchUsersHandler(null);
  }, []);

  const refreshHandler = () => {
    if (isFetching) return;
    fetchUsersHandler(null);
  };

  const inSearchMode: boolean = [
    statusParam,
    nameParam,
    phoneParam,
    emailParam,
  ].some((item) => item !== null);

  const filteredItems = [...users].filter((item) => {
    const params = {
      status: statusParam,
      name: nameParam,
      phone: phoneParam,
      email: emailParam,
    };

    return Object.entries(params).every(([key, value]) => {
      if (value === null) {
        return true;
      }

      switch (key) {
        case "name":
          const userName = userNameFormatter(
            item.firstName,
            item.lastName,
            item.otherName
          ).toLowerCase();
          return userName.includes(value.toLowerCase());
        case "phone":
          return item.phone_number.includes(value.toLowerCase());
        case "email":
          return item.email.toLowerCase().includes(value.toLowerCase());
        case "status":
          return item.status.status === value;
        default:
          return true;
      }
    });
  });

  const visibleRows = useMemo(
    () =>
      inSearchMode
        ? filteredItems.slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage
          )
        : [...users].slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage
          ),
    [users, page, rowsPerPage, statusParam, nameParam, phoneParam, emailParam]
  );

  return (
    <Card>
      <Suspense fallback={<MyCircularProgress />}>
        <UserTableTabs
          statusCounts={statusCounts}
          selectedTab={selectedStatusTab}
          setSelectedTab={setSelectedStatusTab}
        />
      </Suspense>
      <Divider />
      <CardContent>
        <Stack direction="row" justifyContent="space-between">
          <Stack spacing={2} direction="row">
            <Suspense fallback={<MyCircularProgress />}>
              <UserTableNameFilter />
            </Suspense>
            <Suspense fallback={<MyCircularProgress />}>
              <UserTableEmailFilter />
            </Suspense>
            <Suspense fallback={<MyCircularProgress />}>
              <UserTablePhoneFilter />
            </Suspense>
            {inSearchMode && (
              <Button
                variant="text"
                onClick={() => {
                  resetSearchParams();
                }}
              >
                Clear Filters
              </Button>
            )}
          </Stack>

          {isFetching ? (
            <MyCircularProgress />
          ) : (
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={refreshHandler} color="primary">
                <Refresh />
              </IconButton>
            </Tooltip>
          )}

          {selected.length > 0 && (
            <Stack spacing={2} direction="row" alignItems="center">
              <Typography variant="subtitle1">
                {selected.length} Selected
              </Typography>
              <UserTableActions />
            </Stack>
          )}
        </Stack>
      </CardContent>
      <Divider />
      <Box sx={{ width: "100%" }}>
        <Box sx={{ width: "100%" }}>
          <TableContainer>
            <Table
              sx={{ minWidth: 750 }}
              aria-labelledby="tableTitle"
              size={dense ? "small" : "medium"}
            >
              <EnhancedTableHead
                numSelected={selected.length}
                onSelectAllClick={handleSelectAllClick}
                rowCount={users.length}
              />
              <TableBody>
                {visibleRows.map((row, index) => {
                  const isItemSelected = selected.includes(row.co_user_id);
                  const labelId = `enhanced-table-checkbox-${index}`;
                  const userRole = capitalizeFirstLetter(row.role.role);
                  const isYou = sessionData
                    ? sessionData.user.co_user_id === row.co_user_id
                    : false;

                  return (
                    <TableRow
                      hover
                      // onClick={(event) => handleClick(event, row.co_user_id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.co_user_id}
                      selected={isItemSelected}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          onClick={(event) =>
                            handleSelectClick(event, row.co_user_id)
                          }
                          inputProps={{
                            "aria-labelledby": labelId,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <UserTableName user={row} isYou={isYou} />
                      </TableCell>
                      <TableCell>
                        <UserContactChip
                          contact={row.email}
                          verified={row.email_verified === 1}
                          name="Email"
                        />
                        &ensp;
                        <UserContactChip
                          contact={formatDisplayedPhoneNumber(row.phone_number)}
                          verified={row.phone_verified === 1}
                          name="Phone"
                        />
                      </TableCell>
                      <TableCell>{userRole}</TableCell>
                      <TableCell>
                        <Tooltip title={fToNow(row.created_at)}>
                          <Typography variant="body2">
                            {fDateTime12(row.created_at)}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <UserStatusChip status={row.status} />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Open">
                          <IconButton
                            color="primary"
                            onClick={() => {
                              nProgress.start();
                              router.push(
                                paths.dashboard.users.single(row.co_user_id)
                              );
                            }}
                          >
                            <Launch sx={{ width: "20px", height: "20px" }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {emptyRows > 0 && (
                  <TableRow
                    style={{
                      height: (dense ? 33 : 53) * emptyRows,
                    }}
                  >
                    <TableCell colSpan={7} />
                  </TableRow>
                )}
                {visibleRows.length < 1 &&
                  isFetching &&
                  Array.from(Array(3)).map((item, index) => (
                    <TableRow key={item + "" + index}>
                      <TableCell colSpan={7} sx={{ textAlign: "center" }}>
                        <Typography variant="h5">
                          <Skeleton variant="rounded" />
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                {visibleRows.length < 1 && !isFetching && (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: "center" }}>
                      <Typography variant="body1">No users found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={users.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </Box>
    </Card>
  );
};

export default UsersTable;

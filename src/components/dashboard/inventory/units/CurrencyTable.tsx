import React, { useState } from "react";
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from "@mui/material";
import { PencilSimpleIcon } from "@phosphor-icons/react";

export type CurrencyRow = {
  currency_id: number;
  currency_code: string;
  currency_name: string;
  created_at?: string | Date;
  updated_at?: string | Date | null;
};

interface Props {
  currencies: CurrencyRow[];
  onEdit: (currency: CurrencyRow) => void;
}

const CurrencyTable: React.FC<Props> = ({ currencies, onEdit }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const paginated = currencies.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Id</TableCell>
            <TableCell>Code</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Updated</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginated.map((c) => (
            <TableRow key={c.currency_id} sx={{ "&:nth-of-type(odd)": { bgcolor: "action.hover" } }}>
              <TableCell>CU-{c.currency_id}</TableCell>
              <TableCell>{c.currency_code}</TableCell>
              <TableCell>{c.currency_name}</TableCell>
              <TableCell>{c.updated_at ? new Date(c.updated_at).toLocaleDateString() : "-"}</TableCell>
              <TableCell>{c.created_at ? new Date(c.created_at).toLocaleDateString() : "-"}</TableCell>
              <TableCell>
                <IconButton onClick={() => onEdit(c)}>
                  <PencilSimpleIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={currencies.length}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5]}
      />
    </TableContainer>
  );
};

export default CurrencyTable;

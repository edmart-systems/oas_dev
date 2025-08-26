import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, IconButton, TableContainer, TablePagination, Chip } from "@mui/material";
import { PencilSimple, Trash } from "@phosphor-icons/react";

interface CustomerTableProps {
  data: any[];
  onEdit: (row: any) => void;
  onDelete: (row: any) => void;
}

const CustomerTable = ({ data, onEdit, onDelete }: CustomerTableProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const paginated = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginated.map((row) => (
            <TableRow key={row.customer_id} sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.email || "-"}</TableCell>
              <TableCell>{row.phone || "-"}</TableCell>
              <TableCell>
                <Chip label={row.status} color={row.status?.toLowerCase() === 'active' ? 'success' : 'default'} size="small" />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => onEdit(row)} aria-label="edit" size="small"><PencilSimple size={18} /></IconButton>
                <IconButton onClick={() => onDelete(row)} aria-label="delete" size="small" color="error"><Trash size={18} /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={data.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        rowsPerPageOptions={[5]}
        sx={{ '& .MuiTablePagination-actions button': { color: 'primary.main' }, '& .MuiTablePagination-selectIcon': { color: 'primary.main' } }}
      />
    </TableContainer>
  );
};

export default CustomerTable;

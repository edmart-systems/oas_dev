import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, IconButton, TableContainer, TablePagination, Chip } from "@mui/material";
import { PencilSimple, Trash } from "@phosphor-icons/react";

interface OrderTableProps {
  data: any[];
  onEdit: (row: any) => void;
  onDelete: (row: any) => void;
}

const OrderTable = ({ data, onEdit, onDelete }: OrderTableProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const paginated = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Order #</TableCell>
            <TableCell>Supplier</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Items</TableCell>
            <TableCell>Total</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginated.map((row) => (
            <TableRow key={row.order_id} sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
              <TableCell>{row.order_number}</TableCell>
              <TableCell>{row.supplier?.supplier_name || row.supplier_id}</TableCell>
              <TableCell>
                <Chip label={row.status} size="small" color={row.status?.toLowerCase() === 'completed' || row.status?.toLowerCase() === 'delivered' ? 'success' : row.status?.toLowerCase() === 'cancelled' ? 'error' : 'default'} />
              </TableCell>
              <TableCell>{row.items_count}</TableCell>
              <TableCell>{row.total_amount}</TableCell>
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

export default OrderTable;

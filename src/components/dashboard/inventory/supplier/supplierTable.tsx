import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Stack,
} from "@mui/material";
import { EnvelopeIcon, PencilSimpleIcon, Phone, PhoneIcon, TrashIcon } from "@phosphor-icons/react";
import UserAvatar from "@/components/dashboard/nav-bar/user-avatar";
import React, { useState } from "react";
import { Supplier } from "@/modules/inventory/types/supplier.types";

interface Props{
    suppliers: Supplier[];
    onEdit:(supplier: Supplier) => void;
    onDelete:(supplier: Supplier) => void;
}
const SupplierTable = ({suppliers, onEdit, onDelete}:Props) => {
      // Pagination state
      const [page, setPage] = useState(0);
      const [rowsPerPage, setRowsPerPage] = useState(5);
    
      // Slice data for current page
  const paginatedSuppliers = suppliers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );



  return (
      <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>TIN Number</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
               <TableBody>
                {paginatedSuppliers.map((supplier) => (
                  <TableRow key={supplier.supplier_id}>
                    <TableCell>{supplier.supplier_name}</TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <EnvelopeIcon size={14} />
                          <span style={{ fontSize: '0.875rem' }}>{supplier.supplier_email}</span>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <PhoneIcon size={14} />
                          <span style={{ fontSize: '0.875rem' }}>{supplier.supplier_phone}</span>
                        </Stack>
                      </Stack>
                    </TableCell>
                    <TableCell>{supplier.supplier_address}</TableCell>
                    <TableCell>{supplier.supplier_tinNumber}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => onEdit(supplier)}>
                        <PencilSimpleIcon />
                      </IconButton>
                      <IconButton onClick={() => onDelete(supplier)} color="error">
                        <TrashIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {/* Pagination Controls */}
                  <TablePagination
                    component="div"
                    count={suppliers.length}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                    rowsPerPageOptions={[5]}
                    sx={{
                      '& .MuiTablePagination-actions button': { color: 'primary.main' },
                      '& .MuiTablePagination-selectIcon': { color: 'primary.main' }
                    }}
                  />
          </TableContainer>
  )
}

export default SupplierTable
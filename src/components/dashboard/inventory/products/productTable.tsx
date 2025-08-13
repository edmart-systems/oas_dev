import { Product } from '@/modules/inventory/types/purchase.types';
import {
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow
} from '@mui/material';
import { PencilSimple, Trash } from '@phosphor-icons/react';
import React, { useState } from 'react';

interface Props {
  Products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ProductTable = ({ Products, onEdit, onDelete }: Props) => {
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Slice products for current page
  const paginatedProducts = Products.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Barcode</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Buying Price</TableCell>
            <TableCell>Selling Price</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {paginatedProducts.map((product) => (
            <TableRow key={product.product_id} sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
              <TableCell>{product.product_name}</TableCell>
              <TableCell>{product.product_barcode}</TableCell>
              <TableCell>{product.product_description}</TableCell>
              <TableCell>${product.buying_price}</TableCell>
              <TableCell>${product.selling_price}</TableCell>
              <TableCell>
                <Chip
                  label={product.product_status === 1 ? 'Active' : 'Inactive'}
                  color={product.product_status === 1 ? 'success' : 'error'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => onEdit(product)}>
                  <PencilSimple />
                </IconButton>
                <IconButton
                  onClick={() => onDelete(product)}
                  color="error"
                >
                  <Trash />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TablePagination
        component="div"
        count={Products.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5]}
        sx={{
          '& .MuiTablePagination-actions button': {
            color: 'primary.main'
          },
          '& .MuiTablePagination-selectIcon': {
            color: 'primary.main'
          }
        }}
      />
    </TableContainer>
  );
};

export default ProductTable;

import { useCurrency } from '@/components/currency/currency-context';
import { Product } from '@/types/product.types';
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
  const { formatCurrency } = useCurrency();
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Slice products for current page
  const paginatedProducts = Products.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
    const safeCurrency = (amount: number) => {
    try {
      return formatCurrency(amount);
    } catch {
      return `$${amount.toFixed(2)}`;
    }
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>SKU</TableCell>
            <TableCell>Barcode</TableCell>
            <TableCell>Unit</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Tag</TableCell>
            <TableCell>Supplier</TableCell>
            <TableCell>Stock</TableCell>
            <TableCell>Reorder Level</TableCell>
            <TableCell>Buying Price</TableCell>
            <TableCell>Selling Price</TableCell>
            <TableCell>Markup %</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {paginatedProducts.map((product) => (
            <TableRow key={product.product_id} sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
              <TableCell>{product.product_name}</TableCell>
              <TableCell>{product.sku_code || '-'}</TableCell>
              <TableCell>{product.product_barcode}</TableCell>
              <TableCell>{product.unit?.name || '-'}</TableCell>
              <TableCell>{product.category?.category || '-'}</TableCell>
              <TableCell>{product.tag?.tag || '-'}</TableCell>
              <TableCell>{product.supplier?.supplier_name || '-'}</TableCell>
              <TableCell>{product.stock_quantity || 0}</TableCell>
              <TableCell>{product.reorder_level || '-'}</TableCell>
              <TableCell>{ safeCurrency(product.buying_price || 0)}</TableCell>
              <TableCell>{ safeCurrency( product.selling_price|| 0)}</TableCell>
              <TableCell>{product.markup_percentage || 0}%</TableCell>
              <TableCell>
                <Chip
                  label={
                    product.product_status === 1 ? 'Low' :
                    product.product_status === 2 ? 'High' : 'High'
                
                  }
                  color={
                    product.product_status === 1 ? 'error' :
                    product.product_status === 2 ? 'success' : 'success'
                  }
                  size="small"
                />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => onEdit(product)}>
                  <PencilSimple />
                </IconButton>
                {/* <IconButton
                  onClick={() => onDelete(product)}
                  color="error"
                >
                  <Trash />
                </IconButton> */}
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

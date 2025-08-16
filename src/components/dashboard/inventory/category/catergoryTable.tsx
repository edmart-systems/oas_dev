import React, { useState } from 'react';
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
import { PencilSimple } from "@phosphor-icons/react";
import UserAvatar from "@/components/dashboard/nav-bar/user-avatar";
import { Category } from '@/modules/inventory/types/category.types';

type Props = {
  categories: Category[];
  onEdit: (category: Category) => void;
}

const CatergoryTable = ({ categories, onEdit }: Props) => {
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Slice data for current page
  const paginatedCategories = categories.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Id</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Products with Category</TableCell>
            <TableCell>Updated At</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Created By</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedCategories.map((category) => (
            <TableRow
              key={category.category_id}
              sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}
            >
              <TableCell>CA-{category.category_id}</TableCell>
              <TableCell>{category.category}</TableCell>
              <TableCell
                title={category.Product?.length > 0
                  ? category.Product.map(p => p.product_name).join(", ")
                  : "No products"}
                sx={{
                  maxWidth: 200,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {category.Product?.length > 0
                  ? category.Product.map(p => p.product_name).join(", ")
                  : "No products"}
              </TableCell>
              <TableCell>
                {category.updated_at
                  ? new Date(category.updated_at).toLocaleDateString()
                  : "N/A"}
              </TableCell>
              <TableCell>
                {category.created_at
                  ? new Date(category.created_at).toLocaleDateString()
                  : "N/A"}
              </TableCell>
              <TableCell>
                <div title={`${category.creator?.firstName} ${category.creator?.lastName}`}>
                <UserAvatar
                userName={`${category.creator?.firstName} ${category.creator?.lastName}`}
                clickHandler={() => (`${category.creator?.firstName} ${category.creator?.lastName}`)}

                />
                </div>
              </TableCell>
              <TableCell>
                <IconButton onClick={()=>onEdit(category)} color="primary">
                  <PencilSimple />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      <TablePagination
        component="div"
        count={categories.length}
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
            color: 'primary.main',
          },
          '& .MuiTablePagination-selectIcon': {
            color: 'primary.main',
          }
        }}
      />
    </TableContainer>
  );
};

export default CatergoryTable;

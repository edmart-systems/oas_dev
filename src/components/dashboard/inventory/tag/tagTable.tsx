import { Tag } from '@/modules/inventory/types/tag.types';
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
import React, { useState } from "react";

interface Props {
  tags: Tag[];
  onEdit: () => void;
}

const TagTable = ({ tags, onEdit }: Props) => {
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Slice data for current page
  const paginatedTags = tags.slice(
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
            <TableCell>Products with Tag</TableCell>
            <TableCell>Updated At</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Created By</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedTags.map((tag) => (
            <TableRow key={tag.tag_id} sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
              <TableCell>TA-{tag.tag_id}</TableCell>
              <TableCell>{tag.tag}</TableCell>
              <TableCell
                title={tag.Product?.length > 0 ? tag.Product.map(p => p.product_name).join(", ") : "No products"}
                sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {tag.Product?.length > 0 ? tag.Product.map(p => p.product_name).join(", ") : "No products"}
              </TableCell>
              <TableCell>{tag.updated_at ? new Date(tag.updated_at).toLocaleDateString() : "N/A"}</TableCell>
              <TableCell>{tag.created_at ? new Date(tag.created_at).toLocaleDateString() : "N/A"}</TableCell>
              <TableCell>
                  <div title={`${tag.creator?.firstName} ${tag.creator?.lastName}`}>
                <UserAvatar
                userName={`${tag.creator?.firstName} ${tag.creator?.lastName}`}
                clickHandler={() => (`${tag.creator?.firstName} ${tag.creator?.lastName}`)}

                />
                </div>
              </TableCell>
              <TableCell>
                <IconButton onClick={onEdit}>
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
        count={tags.length}
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
  );
};

export default TagTable;

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
import UserAvatar from "@/components/dashboard/nav-bar/user-avatar";
import React, { useState } from "react";
import { InventoryPoint } from "@/modules/inventory/types/inventoryPoint.types";


interface Props {
  inventoryPoints: InventoryPoint[];
  onEdit: (inventoryPoint: InventoryPoint ) => void;
}

const InventoryPointTable = ({ inventoryPoints, onEdit }: Props) => {
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Slice data for current page
  const paginatedInventoryPoints = inventoryPoints.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Inventory Point Id</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Updated At</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Created By</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedInventoryPoints.map((inventoryPoint) => (
            <TableRow key={inventoryPoint.inventory_point_id} sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
              <TableCell>TA-{inventoryPoint.inventory_point_id}</TableCell>
              <TableCell>{inventoryPoint.inventory_point}</TableCell>
              <TableCell>{inventoryPoint.updated_at ? new Date(inventoryPoint.updated_at).toLocaleDateString() : "N/A"}</TableCell>
              <TableCell>{inventoryPoint.created_at ? new Date(inventoryPoint.created_at).toLocaleDateString() : "N/A"}</TableCell>
              <TableCell>
                  <div title={`${inventoryPoint.creator?.firstName} ${inventoryPoint.creator?.lastName}`}>
                <UserAvatar
                userName={`${inventoryPoint.creator?.firstName} ${inventoryPoint.creator?.lastName}`}
                clickHandler={() => (`${inventoryPoint.creator?.firstName} ${inventoryPoint.creator?.lastName}`)}
                />
                </div>
              </TableCell>
              <TableCell>
                <IconButton onClick={() => onEdit(inventoryPoint)}>
                  <PencilSimpleIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      <TablePagination
        component="div"
        count={inventoryPoints.length}
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

export default InventoryPointTable;

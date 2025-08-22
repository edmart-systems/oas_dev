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
import { PencilSimple } from "@phosphor-icons/react";
import { Stock } from "@/modules/inventory/types/stock.types";

interface Props {
  Stock: Stock[];
  onEdit: (stock: Stock) => void;
}

const StockTable = ({ Stock, onEdit }: Props) => {
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Slice data for current page
  const paginatedStock = Stock.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Stock Id</TableCell>
            <TableCell>Product</TableCell>
            <TableCell>Inventory Point</TableCell>
            <TableCell>Change Type</TableCell>
            <TableCell>Quantity Change</TableCell>
            <TableCell>Resulting Stock</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedStock.map((stock) => (
            <TableRow
              key={stock.stock_id}
              sx={{ "&:nth-of-type(odd)": { bgcolor: "action.hover" } }}
            >
              <TableCell>ST-{stock.stock_id}</TableCell>
              <TableCell>{stock.product?.product_name || "N/A"}</TableCell>
              <TableCell>{stock.inventory_point?.inventory_point || "N/A"}</TableCell>
              <TableCell>{stock.change_type}</TableCell>
              <TableCell>{stock.quantity_change}</TableCell>
              <TableCell>{stock.resulting_stock}</TableCell>
              <TableCell>
                {stock.created_at
                  ? new Date(stock.created_at).toLocaleDateString()
                  : "N/A"}
              </TableCell>
              <TableCell>
                <IconButton onClick={() => onEdit(stock)}>
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
        count={Stock.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5]}
        sx={{
          "& .MuiTablePagination-actions button": { color: "primary.main" },
          "& .MuiTablePagination-selectIcon": { color: "primary.main" },
        }}
      />
    </TableContainer>
  );
};

export default StockTable;

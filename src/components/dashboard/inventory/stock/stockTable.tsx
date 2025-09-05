import React, { useState, useMemo } from "react";
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Box,
} from "@mui/material";
import { 
  PencilSimple, 
  ShoppingCart, 
  ArrowsLeftRight, 
  Receipt,
  TrendUp,
  TrendDown
} from "@phosphor-icons/react";
import { Stock } from "@/modules/inventory/types/stock.types";

interface Props {
  stock: Stock[];
  onEdit: (stock: Stock) => void;
}

const StockTable = ({ stock, onEdit }: Props) => {
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Slice data for current page
  const paginatedStock = stock.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Memoize date formatting to avoid repeated Date object creation
  const formatDate = useMemo(() => (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  }, []);

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Product</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Change Type</TableCell>
            <TableCell>Quantity Change</TableCell>
            <TableCell>Resulting Stock</TableCell>
            <TableCell>Reference</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedStock.map((stock) => {
            const getChangeTypeIcon = (changeType: string) => {
              switch (changeType) {
                case 'PURCHASE': return <ShoppingCart size={16} />;
                case 'SALE': return <Receipt size={16} />;
                case 'TRANSFER': return <ArrowsLeftRight size={16} />;
                default: return <PencilSimple size={16} />;
              }
            };

            const getChangeTypeColor = (changeType: string) => {
              switch (changeType) {
                case 'PURCHASE': return 'success';
                case 'SALE': return 'error';
                case 'TRANSFER': return 'info';
                default: return 'default';
              }
            };

            return (
              <TableRow
                key={stock.stock_id}
                sx={{ "&:nth-of-type(odd)": { bgcolor: "action.hover" } }}
              >
                <TableCell>{stock.product?.product_name || "N/A"}</TableCell>
                <TableCell>{stock.location?.location_name || "N/A"}</TableCell>
                <TableCell>
                  <Chip
                    icon={getChangeTypeIcon(stock.change_type)}
                    label={stock.change_type}
                    color={getChangeTypeColor(stock.change_type) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {stock.quantity_change > 0 ? (
                      <TrendUp size={16} color="#4caf50" />
                    ) : (
                      <TrendDown size={16} color="#f44336" />
                    )}
                    <span style={{
                      color: stock.quantity_change > 0 ? '#4caf50' : '#f44336',
                      fontWeight: 'bold'
                    }}>
                      {stock.quantity_change > 0 ? '+' : ''}{stock.quantity_change}
                    </span>
                  </Box>
                </TableCell>
                <TableCell>
                  <strong>{stock.resulting_stock}</strong>
                </TableCell>
                <TableCell>
                  {stock.change_type === 'PURCHASE' ? `PO-${stock.reference_id}` :
                   stock.change_type === 'SALE' ? `SALE-${stock.reference_id}` :
                   stock.change_type === 'TRANSFER' ? `TRF-${stock.reference_id}` :
                   stock.reference_id || 'N/A'}
                </TableCell>
                <TableCell>
                  {stock.created_at ? formatDate(stock.created_at.toString()) : "N/A"}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => onEdit(stock)}>
                    <PencilSimple />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      <TablePagination
        component="div"
        count={stock.length}
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

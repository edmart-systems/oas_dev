'use client';

import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Box,
  Typography,
  Stack,
  Avatar,
  Tooltip,
  alpha,
  useTheme,
  Chip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import React, { useState } from "react";
import { Supplier } from "@/modules/inventory/types/supplier.types";

interface Props {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

const SupplierTable = ({ suppliers, onEdit, onDelete }: Props) => {
  const theme = useTheme();
  
  const colors = {
    primary: "#D98219",
    secondary: theme.palette.info.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    background: theme.palette.mode === "light" ? "#ffffff" : theme.palette.background.default,
    surface: theme.palette.background.paper,
    surfaceVariant: theme.palette.mode === "dark" ? alpha(theme.palette.grey[800], 0.7) : theme.palette.grey[50],
  };

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const paginatedSuppliers = suppliers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getSupplierInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        borderRadius: 3, 
        border: '1px solid #e0e0e0',
        overflow: 'hidden',
        backgroundColor: colors.surface,
      }}
    >
      <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0', backgroundColor: colors.surfaceVariant }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <BusinessIcon sx={{ color: colors.primary, fontSize: 28 }} />
          <Box>
            <Typography variant="h6" fontWeight="600" color={colors.primary}>
              Supplier Directory
            </Typography>
            <Typography variant="body2" color="text.primary">
              {suppliers.length} suppliers total
            </Typography>
          </Box>
        </Stack>
      </Box>

      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, backgroundColor: colors.primary, color: 'white', borderBottom: 'none' }}>
                Supplier
              </TableCell>
              <TableCell sx={{ fontWeight: 600, backgroundColor: colors.primary, color: 'white', borderBottom: 'none' }}>
                Contact Information
              </TableCell>
              <TableCell sx={{ fontWeight: 600, backgroundColor: colors.primary, color: 'white', borderBottom: 'none' }}>
                Address
              </TableCell>
              <TableCell sx={{ fontWeight: 600, backgroundColor: colors.primary, color: 'white', borderBottom: 'none' }}>
                TIN Number
              </TableCell>
              <TableCell sx={{ fontWeight: 600, backgroundColor: colors.primary, color: 'white', borderBottom: 'none' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedSuppliers.map((supplier) => (
              <TableRow 
                key={supplier.supplier_id}
                sx={{ 
                  '&:nth-of-type(even)': { backgroundColor: alpha(colors.primary, 0.02) },
                  '&:hover': { 
                    backgroundColor: alpha(colors.primary, 0.05),
                    transform: 'translateY(-1px)',
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: `0 4px 12px ${alpha(colors.primary, 0.1)}`,
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <TableCell sx={{ py: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: colors.primary, width: 48, height: 48, fontSize: '0.875rem', fontWeight: 600 }}>
                      {getSupplierInitials(supplier.supplier_name)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="600">
                        {supplier.supplier_name}
                      </Typography>
                      <Typography variant="caption" color="text.primary">
                        SUP-{supplier.supplier_id}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>

                <TableCell sx={{ py: 2 }}>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon sx={{ fontSize: 14, color: colors.primary }} />
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        {supplier.supplier_email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon sx={{ fontSize: 14, color: colors.primary }} />
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        {supplier.supplier_phone}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>

                <TableCell sx={{ py: 2, maxWidth: 200 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationIcon sx={{ fontSize: 14, color: colors.warning }} />
                    <Typography variant="body2" sx={{ 
                      overflow: "hidden", 
                      textOverflow: "ellipsis", 
                      whiteSpace: "nowrap" 
                    }}>
                      {supplier.supplier_address}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell sx={{ py: 2 }}>
                  <Chip
                    icon={<ReceiptIcon sx={{ fontSize: 14 }} />}
                    label={supplier.supplier_tinNumber}
                    size="small"
                    sx={{
                      backgroundColor: alpha(colors.success, 0.1),
                      color: colors.success,
                      fontWeight: 500,
                      fontFamily: 'monospace',
                    }}
                  />
                </TableCell>

                <TableCell sx={{ py: 2 }}>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Edit Supplier">
                      <IconButton 
                        onClick={() => onEdit(supplier)}
                        size="small"
                        sx={{
                          backgroundColor: alpha(colors.primary, 0.1),
                          color: colors.primary,
                          '&:hover': {
                            backgroundColor: alpha(colors.primary, 0.2),
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        <EditIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                    {/* <Tooltip title="Delete Supplier">
                      <IconButton
                        onClick={() => onDelete(supplier)}
                        size="small"
                        sx={{
                          backgroundColor: alpha(colors.error, 0.1),
                          color: colors.error,
                          '&:hover': {
                            backgroundColor: alpha(colors.error, 0.2),
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip> */}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ borderTop: '1px solid #e0e0e0', backgroundColor: colors.surfaceVariant }}>
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
          rowsPerPageOptions={[5, 10, 25]}
          sx={{
            '& .MuiTablePagination-actions button': { color: colors.primary },
            '& .MuiTablePagination-selectIcon': { color: colors.primary },
            '& .MuiSelect-select': { color: colors.primary },
            '& .MuiTablePagination-displayedRows': { color: colors.primary, fontWeight: 500 },
          }}
        />
      </Box>
    </Paper>
  );
};

export default SupplierTable;

'use client';

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
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';

export type CurrencyRow = {
  currency_id: number;
  currency_code: string;
  currency_name: string;
  created_at?: string | Date;
  updated_at?: string | Date | null;
};

interface Props {
  currencies: CurrencyRow[];
  onEdit: (currency: CurrencyRow) => void;
}

const CurrencyTable: React.FC<Props> = ({ currencies, onEdit }) => {
  const theme = useTheme();
  
  const colors = {
    primary: "#D98219",
    secondary: theme.palette.info.main,
    success: theme.palette.success.main,
    warning: theme.palette.primary.main,
    error: theme.palette.error.main,
    background: theme.palette.mode === "light" ? "#ffffff" : theme.palette.background.default,
    surface: theme.palette.background.paper,
    surfaceVariant: theme.palette.mode === "dark" ? alpha(theme.palette.grey[800], 0.7) : theme.palette.grey[50],
  };

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const paginated = currencies.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
          <MoneyIcon sx={{ color: colors.primary, fontSize: 28 }} />
          <Box>
            <Typography variant="h6" fontWeight="600" color={colors.primary}>
              Currency Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currencies.length} currencies total
            </Typography>
          </Box>
        </Stack>
      </Box>

      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, backgroundColor: colors.primary, color: 'white', borderBottom: 'none' }}>
                Currency
              </TableCell>
              <TableCell sx={{ fontWeight: 600, backgroundColor: colors.primary, color: 'white', borderBottom: 'none' }}>
                Code
              </TableCell>
              <TableCell sx={{ fontWeight: 600, backgroundColor: colors.primary, color: 'white', borderBottom: 'none' }}>
                Name
              </TableCell>
              <TableCell sx={{ fontWeight: 600, backgroundColor: colors.primary, color: 'white', borderBottom: 'none' }}>
                Created
              </TableCell>
              <TableCell sx={{ fontWeight: 600, backgroundColor: colors.primary, color: 'white', borderBottom: 'none' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginated.map((c) => (
              <TableRow 
                key={c.currency_id}
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
                    <Avatar sx={{ bgcolor: colors.primary, width: 40, height: 40, fontSize: '0.875rem', fontWeight: 600 }}>
                      {c.currency_code}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="600">
                        {c.currency_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        CU-{c.currency_id}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>

                <TableCell sx={{ py: 2 }}>
                  <Chip
                    label={c.currency_code}
                    size="small"
                    sx={{
                      backgroundColor: alpha(colors.primary, 0.1),
                      color: colors.primary,
                      fontWeight: 600,
                      fontFamily: 'monospace',
                    }}
                  />
                </TableCell>

                <TableCell sx={{ py: 2 }}>
                  <Typography variant="body2" fontWeight="500">
                    {c.currency_name}
                  </Typography>
                </TableCell>

                <TableCell sx={{ py: 2 }}>
                  <Typography variant="body2">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString() : "-"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {c.updated_at ? `Updated ${new Date(c.updated_at).toLocaleDateString()}` : ""}
                  </Typography>
                </TableCell>

                <TableCell sx={{ py: 2 }}>
                  <Tooltip title="Edit Currency">
                    <IconButton 
                      onClick={() => onEdit(c)}
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ borderTop: '1px solid #e0e0e0', backgroundColor: colors.surfaceVariant }}>
        <TablePagination
          component="div"
          count={currencies.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
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

export default CurrencyTable;

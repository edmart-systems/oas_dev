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
  TableRow,
  Paper,
  Box,
  Typography,
  Stack,
  Avatar,
  Tooltip,
  alpha,
  useTheme,
  Badge,
  LinearProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Inventory as InventoryIcon,
  QrCode as QrCodeIcon,
  Category as CategoryIcon,
  LocalOffer as TagIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import React, { useState } from 'react';

interface Props {
  Products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ProductTable = ({ Products, onEdit, onDelete }: Props) => {
  const { formatCurrency } = useCurrency();
  const theme = useTheme();
  
  // Color theme
  const colors = {
  primary: "#D98219",
  secondary: theme.palette.info.main,
  success: theme.palette.success.main,
  warning: theme.palette.warning.main,
  error: theme.palette.error.main,
background: theme.palette.mode === "light" ? "#ffffff" : theme.palette.background.default,
  surface: theme.palette.background.paper,
  surfaceVariant:
    theme.palette.mode === "dark"
      ? alpha(theme.palette.grey[800], 0.7)
      : theme.palette.grey[50], // fallback for light mode
  border: theme.palette.divider,
  textSecondary: theme.palette.text.secondary,
};

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  const getMarkupColor = (markup: number) => {
    if (markup < 10) return colors.error;
    if (markup < 30) return colors.warning;
    return colors.success;
  };

  const getStockStatus = (stock: number, reorderLevel: number) => {
    if (stock === 0) return { label: 'Out of Stock', color: colors.error, severity: 'error' as const };
    if (stock <= reorderLevel) return { label: 'Low Stock', color: colors.warning, severity: 'warning' as const };
    return { label: 'In Stock', color: colors.success, severity: 'success' as const };
  };

  const getProductInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1: return { label: 'Active', color: colors.success, bg: alpha(colors.success, 0.1) };
      case 2: return { label: 'Inactive', color: colors.error, bg: alpha(colors.error, 0.1) };
      default: return { label: 'Draft', color: colors.warning, bg: alpha(colors.warning, 0.1) };
    }
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
      {/* Table Header */}
      <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0', backgroundColor: colors.surfaceVariant }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <InventoryIcon sx={{ color: colors.primary, fontSize: 28 }} />
            <Box>
              <Typography variant="h6" fontWeight="600" color={colors.primary}>
                Product Inventory
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Products.length} products total
              </Typography>
            </Box>
          </Stack>
          <Badge 
            badgeContent={Products.filter(p => (p.stock_quantity || 0) <= (p.reorder_level || 0)).length}
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: colors.error,
                color: 'white',
              }
            }}
          >
            <Chip 
              icon={<AssessmentIcon />}
              label="Low Stock Alerts" 
              variant="outlined"
              sx={{ 
                borderColor: colors.error + '40',
                color: colors.error,
                '&:hover': { backgroundColor: colors.error + '10' }
              }}
            />
          </Badge>
        </Stack>
      </Box>

      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell 
                sx={{ 
                  fontWeight: 600, 
                  backgroundColor: colors.primary,
                  color: 'white',
                  borderBottom: 'none',
                }}
              >
                Product
              </TableCell>
              <TableCell sx={{ fontWeight: 600, backgroundColor: colors.primary, color: 'white', borderBottom: 'none' }}>
                Details
              </TableCell>
              <TableCell sx={{ fontWeight: 600, backgroundColor: colors.primary, color: 'white', borderBottom: 'none' }}>
                Classification
              </TableCell>
              <TableCell sx={{ fontWeight: 600, backgroundColor: colors.primary, color: 'white', borderBottom: 'none' }}>
                Stock Status
              </TableCell>
              <TableCell sx={{ fontWeight: 600, backgroundColor: colors.primary, color: 'white', borderBottom: 'none' }}>
                Pricing
              </TableCell>
              {/* <TableCell sx={{ fontWeight: 600, backgroundColor: colors.primary, color: 'white', borderBottom: 'none' }}>
                Status
              </TableCell> */}
              <TableCell sx={{ fontWeight: 600, backgroundColor: colors.primary, color: 'white', borderBottom: 'none' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedProducts.map((product, index) => {
              const stockStatus = getStockStatus(product.stock_quantity || 0, product.reorder_level || 0);
              const statusInfo = getStatusColor(product.product_status);
              const markup = product.markup_percentage || 0;
              
              return (
                <TableRow 
                  key={product.product_id}
                  sx={{ 
                    '&:nth-of-type(even)': { 
                      backgroundColor: alpha(colors.primary, 0.02) 
                    },
                    '&:hover': { 
                      backgroundColor: alpha(colors.primary, 0.05),
                      transform: 'translateY(-1px)',
                      transition: 'all 0.2s ease-in-out',
                      boxShadow: `0 4px 12px ${alpha(colors.primary, 0.1)}`,
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  {/* Product Column */}
                  <TableCell sx={{ py: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar 
                        sx={{ 
                          bgcolor: colors.primary,
                          width: 48,
                          height: 48,
                          fontSize: '0.875rem',
                          fontWeight: 600,
                        }}
                      >
                        {getProductInitials(product.product_name)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 0.5 }}>
                          {product.product_name}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <QrCodeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {product.product_barcode}
                          </Typography>
                        </Stack>
                        {product.sku_code && (
                          <Typography variant="caption" color="text.secondary">
                            SKU: {product.sku_code}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </TableCell>

                  {/* Details Column */}
                  <TableCell sx={{ py: 2 }}>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight="500">Unit:</Typography>
                        <Chip 
                          label={product.unit?.name || '-'} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontSize: '0.75rem', height: 24 }}
                        />
                      </Box>
                      {product.supplier?.supplier_name && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BusinessIcon sx={{ fontSize: 14, color: colors.secondary }} />
                          <Typography variant="caption" color="text.secondary">
                            {product.supplier.supplier_name}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </TableCell>

                  {/* Classification Column */}
                  <TableCell sx={{ py: 2 }}>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CategoryIcon sx={{ fontSize: 14, color: colors.warning }} />
                        <Chip 
                          label={product.category?.category || '-'} 
                          size="small"
                          sx={{ 
                            backgroundColor: alpha(colors.warning, 0.1),
                            color: colors.warning,
                            fontSize: '0.75rem',
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TagIcon sx={{ fontSize: 14, color: colors.secondary }} />
                        <Chip 
                          label={product.tag?.tag || '-'} 
                          size="small"
                          sx={{ 
                            backgroundColor: alpha(colors.secondary, 0.1),
                            color: colors.secondary,
                            fontSize: '0.75rem',
                          }}
                        />
                      </Box>
                    </Stack>
                  </TableCell>

                  {/* Stock Status Column */}
                  <TableCell sx={{ py: 2 }}>
                    <Box>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="body2" fontWeight="600">
                          {product.stock_quantity || 0}
                        </Typography>
                        <Chip
                          label={stockStatus.label}
                          size="small"
                          color={stockStatus.severity}
                          sx={{ fontSize: '0.75rem' }}
                        />
                      </Stack>
                      {product.reorder_level && (
                        <>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(((product.stock_quantity || 0) / product.reorder_level) * 100, 100)}
                            sx={{
                              height: 4,
                              borderRadius: 2,
                              backgroundColor: alpha(stockStatus.color, 0.2),
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: stockStatus.color,
                                borderRadius: 2,
                              },
                            }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            Reorder at: {product.reorder_level}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </TableCell>

                  {/* Pricing Column */}
                  <TableCell sx={{ py: 2 }}>
                    <Stack spacing={1}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Buying</Typography>
                        <Typography variant="body2" fontWeight="500">
                          {safeCurrency(product.buying_price || 0)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Selling</Typography>
                        <Typography variant="body2" fontWeight="600" color={colors.success}>
                          {safeCurrency(product.selling_price || 0)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {markup > 0 ? (
                          <TrendingUpIcon sx={{ fontSize: 14, color: getMarkupColor(markup) }} />
                        ) : (
                          <TrendingDownIcon sx={{ fontSize: 14, color: colors.error }} />
                        )}
                        <Chip
                          label={`${markup}%`}
                          size="small"
                          sx={{
                            backgroundColor: alpha(getMarkupColor(markup), 0.1),
                            color: getMarkupColor(markup),
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    </Stack>
                  </TableCell>

                  {/* Status Column */}
                  {/* <TableCell sx={{ py: 2 }}>
                    <Chip
                      label={statusInfo.label}
                      sx={{
                        backgroundColor: statusInfo.bg,
                        color: statusInfo.color,
                        fontWeight: 500,
                        border: `1px solid ${statusInfo.color}40`,
                      }}
                    />
                  </TableCell> */}

                  {/* Actions Column */}
                  <TableCell sx={{ py: 2 }}>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Edit Product">
                        <IconButton 
                          onClick={() => onEdit(product)}
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
                      {/* <Tooltip title="Delete Product">
                        <IconButton
                          onClick={() => onDelete(product)}
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
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Enhanced Pagination */}
      <Box sx={{ borderTop: '1px solid #e0e0e0', backgroundColor: colors.surfaceVariant }}>
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
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            '& .MuiTablePagination-root': {
              color: colors.primary,
            },
            '& .MuiTablePagination-actions button': {
              color: colors.primary,
              '&:hover': {
                backgroundColor: alpha(colors.primary, 0.1),
              }
            },
            '& .MuiTablePagination-selectIcon': {
              color: colors.primary,
            },
            '& .MuiSelect-select': {
              color: colors.primary,
            },
            '& .MuiTablePagination-displayedRows': {
              color: colors.primary,
              fontWeight: 500,
            },
          }}
          labelDisplayedRows={({ from, to, count }) => (
            <Box component="span" sx={{ color: colors.primary, fontWeight: 500 }}>
              {`${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`}
            </Box>
          )}
        />
      </Box>
    </Paper>
  );
};

export default ProductTable;
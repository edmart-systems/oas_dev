'use client';

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
  Paper,
  Box,
  Typography,
  Stack,
  Avatar,
  Tooltip,
  alpha,
  useTheme,
  Badge,
  Chip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Category as CategoryIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import UserAvatar from "@/components/dashboard/nav-bar/user-avatar";
import { Category } from '@/modules/inventory/types/category.types';

type Props = {
  categories: Category[];
  onEdit: (category: Category) => void;
}

const CategoryTable = ({ categories, onEdit }: Props) => {
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

  const paginatedCategories = categories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getCategoryInitials = (name: string) => {
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
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <CategoryIcon sx={{ color: colors.primary, fontSize: 28 }} />
            <Box>
              <Typography variant="h6" fontWeight="600" color={colors.primary}>
                Category Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {categories.length} categories total
              </Typography>
            </Box>
          </Stack>
          <Badge 
            badgeContent={categories.filter(c => c.Product?.length === 0).length}
            color="primary"
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: colors.primary,
                color: 'white',
              }
            }}
          >
            <Chip 
              icon={<AssessmentIcon />}
              label="Unused Categories" 
              variant="outlined"
              sx={{ 
                borderColor: colors.primary + '40',
                color: colors.primary,
                '&:hover': { backgroundColor: colors.primary + '10' }
              }}
            />
          </Badge>
        </Stack>
      </Box>

      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, backgroundColor: colors.primary, color: 'white', borderBottom: 'none' }}>
                Category
              </TableCell>
              <TableCell sx={{ fontWeight: 600, backgroundColor: colors.primary, color: 'white', borderBottom: 'none' }}>
                Products
              </TableCell>
              <TableCell sx={{ fontWeight: 600, backgroundColor: colors.primary, color: 'white', borderBottom: 'none' }}>
                Created
              </TableCell>
              <TableCell sx={{ fontWeight: 600, backgroundColor: colors.primary, color: 'white', borderBottom: 'none' }}>
                Creator
              </TableCell>
              <TableCell sx={{ fontWeight: 600, backgroundColor: colors.primary, color: 'white', borderBottom: 'none' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedCategories.map((category) => (
              <TableRow
                key={category.category_id}
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
                      {getCategoryInitials(category.category)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="600">
                        {category.category}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        CA-{category.category_id}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>

                <TableCell sx={{ py: 2 }}>
                  <Box>
                    <Chip
                      label={`${category.Product?.length || 0} products`}
                      size="small"
                      sx={{
                        backgroundColor: alpha(colors.secondary, 0.1),
                        color: colors.secondary,
                        fontWeight: 500,
                      }}
                    />
                    {category.Product?.length > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {category.Product.slice(0, 2).map(p => p.product_name).join(", ")}
                        {category.Product.length > 2 && ` +${category.Product.length - 2} more`}
                      </Typography>
                    )}
                  </Box>
                </TableCell>

                <TableCell sx={{ py: 2 }}>
                  <Typography variant="body2">
                    {category.created_at ? new Date(category.created_at).toLocaleDateString() : "N/A"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {category.updated_at ? `Updated ${new Date(category.updated_at).toLocaleDateString()}` : ""}
                  </Typography>
                </TableCell>

                <TableCell sx={{ py: 2 }}>
                  <UserAvatar
                    userName={`${category.creator?.firstName} ${category.creator?.lastName}`}
                    clickHandler={() => {}}
                  />
                </TableCell>

                <TableCell sx={{ py: 2 }}>
                  <Tooltip title="Edit Category">
                    <IconButton 
                      onClick={() => onEdit(category)}
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
          count={categories.length}
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

export default CategoryTable;

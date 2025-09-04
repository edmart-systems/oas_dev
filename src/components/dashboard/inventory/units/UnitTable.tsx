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
  Straighten as UnitIcon,
} from '@mui/icons-material';
import { se } from "date-fns/locale";

export type UnitRow = {
  unit_id: number;
  name: string;
  short_name: string;
  unit_desc: string | null;
  created_at?: string | Date;
  updated_at?: string | Date | null;
};

interface Props {
  units: UnitRow[];
  onEdit: (unit: UnitRow) => void;
}

const UnitTable: React.FC<Props> = ({ units, onEdit }) => {
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

  const paginated = units.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
          <UnitIcon sx={{ color: colors.primary, fontSize: 28 }} />
          <Box>
            <Typography variant="h6" fontWeight="600" color={colors.primary}>
              Unit Management
            </Typography>
            <Typography variant="body2" color="text.primary">
              {units.length} units total
            </Typography>
          </Box>
        </Stack>
      </Box>

      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, backgroundColor: colors.primary, color: 'white', borderBottom: 'none' }}>
                Unit
              </TableCell>
              <TableCell sx={{ fontWeight: 600, backgroundColor: colors.primary, color: 'white', borderBottom: 'none' }}>
                Short Name
              </TableCell>
              <TableCell sx={{ fontWeight: 600, backgroundColor: colors.primary, color: 'white', borderBottom: 'none' }}>
                Description
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
            {paginated.map((u) => (
              <TableRow 
                key={u.unit_id}
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
                      {u.short_name}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="600">
                        {u.name}
                      </Typography>
                      <Typography variant="caption" color="text.primary">
                        UN-{u.unit_id}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>

                <TableCell sx={{ py: 2 }}>
                  <Chip
                    label={u.short_name}
                    size="small"
                    sx={{
                      backgroundColor: alpha(colors.primary, 0.1),
                      color: colors.primary,
                      fontWeight: 600,
                    }}
                  />
                </TableCell>

                <TableCell sx={{ py: 2, maxWidth: 200 }}>
                  <Typography variant="body2" sx={{ 
                    overflow: "hidden", 
                    textOverflow: "ellipsis", 
                    whiteSpace: "nowrap" 
                  }}>
                    {u.unit_desc || "-"}
                  </Typography>
                </TableCell>

                <TableCell sx={{ py: 2 }}>
                  <Typography variant="body2">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : "-"}
                  </Typography>
                  <Typography variant="caption" color="text.primary">
                    {u.updated_at ? `Updated ${new Date(u.updated_at).toLocaleDateString()}` : ""}
                  </Typography>
                </TableCell>

                <TableCell sx={{ py: 2 }}>
                  <Tooltip title="Edit Unit">
                    <IconButton 
                      onClick={() => onEdit(u)}
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
          count={units.length}
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

export default UnitTable;

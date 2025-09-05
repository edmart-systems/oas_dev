import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Avatar,
  Box,
  Typography,
} from "@mui/material";
import { PencilSimple } from "@phosphor-icons/react";
import UserAvatar from "@/components/dashboard/nav-bar/user-avatar";
import React, { useState } from "react";
import { Location } from "@/modules/inventory/types/location.types";

interface Props {
  inventoryPoints: Location[];
  onEdit: (inventoryPoint: Location) => void;
}

const InventoryPointTable = ({ inventoryPoints, onEdit }: Props) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Parent</TableCell>
            <TableCell>Address</TableCell>
            <TableCell>Assigned User</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {inventoryPoints.map((inventoryPoint) => (
            <TableRow key={inventoryPoint.location_id}>
              <TableCell>
                <Typography variant="body2" fontWeight="medium">
                  {inventoryPoint.location_name}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={inventoryPoint.location_type}
                  size="small"
                  color={inventoryPoint.location_type === 'MAIN_STORE' ? 'primary' : 'default'}
                />
              </TableCell>
              <TableCell>
                {inventoryPoint.location_parent_id ? 'Has Parent' : 'Root'}
              </TableCell>
              <TableCell>{inventoryPoint.location_address || '-'}</TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {(inventoryPoint as any).assigned_to ? 'Assigned' : 'Unassigned'}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={inventoryPoint.is_active ? 'Active' : 'Inactive'}
                  size="small"
                  color={inventoryPoint.is_active ? 'success' : 'default'}
                />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => onEdit(inventoryPoint)} size="small">
                  <PencilSimple />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default InventoryPointTable;
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Eye, Trash } from "@phosphor-icons/react";
import { useCurrency } from "@/components/currency/currency-context";
import { PurchaseHistoryProps } from "@/modules/inventory/types";


export default function PurchaseHistory({ orders, suppliers, onDelete }: PurchaseHistoryProps) {
  const { formatCurrency } = useCurrency();
  
  const safeCurrency = (amount: number) => {
    try {
      return formatCurrency(amount);
    } catch {
      return `$${amount.toFixed(2)}`;
    }
  };

  return (
    <Card>
      <CardHeader title="Purchase Orders" />
      <CardContent>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Purchase ID</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Unit Cost</TableCell>
                <TableCell>Total Cost</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((purchase) => {
                const supplier = suppliers.find(s => s.id === purchase.supplier_id);
                return (
                  <TableRow key={purchase.purchase_id}>
                    <TableCell>PO-{purchase.purchase_id}</TableCell>
                    <TableCell>{supplier?.name || 'Unknown'}</TableCell>
                    <TableCell>
                      {purchase.purchase_created_at 
                        ? new Date(purchase.purchase_created_at).toLocaleDateString() 
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{purchase.purchase_quantity || 0}</TableCell>
                    <TableCell>{safeCurrency(purchase.purchase_unit_cost || 0)}</TableCell>
                    <TableCell>{safeCurrency(purchase.purchase_total_cost || 0)}</TableCell>
                    <TableCell>
                      <IconButton>
                        <Eye />
                      </IconButton>
                      <IconButton onClick={() => onDelete(purchase.purchase_id)} color="error">
                        <Trash />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

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
import { Eye } from "@phosphor-icons/react";
import { useCurrency } from "@/components/currency/currency-context";
import { PurchaseHistoryProps } from "@/modules/inventory/types";
import PurchaseDownloadButtons from "./purchase-pdf/purchase-download-buttons";
import { CompanyDto } from "@/types/company.types";

export default function PurchaseHistory({ orders, suppliers, onDelete, company, inventoryPoints, products }: PurchaseHistoryProps & { company?: CompanyDto }) {
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
      <CardHeader title="Purchases" />
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

                // Compute tax and total if needed, example 10% tax
                const tax = (purchase.purchase_total_cost || 0) * 0.1;
                const productNameMap = products.reduce((acc, p) => {
                  acc[p.product_id] = p.product_name;
                  return acc;
                }, {} as Record<number, string>);
               

                return (
                  <TableRow key={purchase.purchase_id} sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
                    <TableCell>PO-{purchase.purchase_id}</TableCell>
                    <TableCell>{supplier?.name || "Unknown"}</TableCell>
                    <TableCell>
                      {purchase.purchase_created_at
                        ? new Date(purchase.purchase_created_at).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>{purchase.purchase_quantity || 0}</TableCell>
                    <TableCell>{safeCurrency(purchase.purchase_unit_cost || 0)}</TableCell>
                    <TableCell>{safeCurrency(purchase.purchase_total_cost || 0)}</TableCell>
                    <TableCell>
                      {company && (
                        <PurchaseDownloadButtons
                        purchase={purchase}
                        company={company}
                        supplierName={supplier?.name || "Unknown Supplier"}
                        inventoryPointName={inventoryPoints.find(ip => ip.id === purchase.inventory_point_id)?.name || "Unknown Location"}
                        productNames={purchase.purchase_items?.reduce((acc, item) => {
                        acc[item.product_id] = productNameMap[item.product_id] || "Unknown Product";
                        return acc;
                        }, {} as Record<number, string>)}
                      />
                      
                      )}
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

"use client";

import {
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  CircularProgress,
  Box,
} from "@mui/material";
import { useCurrency } from "@/components/currency/currency-context";
import PurchaseDownloadButtons from "../purchase-pdf/purchase-download-buttons";
import { Purchase } from "@/modules/inventory/types/purchase.types";
import { Supplier } from "@/modules/inventory/types/supplier.types";
import { InventoryPoint } from "@/modules/inventory/types/inventoryPoint.types";
import { Product } from "@/types/product.types";
import { useEffect, useState } from "react";
import { getCompany } from "@/server-actions/user-actions/inventory.actions";
import { toast } from "react-toastify";
import { CompanyDto } from "@/types/company.types";

interface Props {
  purchases: Purchase[];
}

export default function PurchaseHistoryTable({ purchases }: Props) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [company, setCompany] = useState<CompanyDto | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [inventoryPoints, setInventoryPoints] = useState<InventoryPoint[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const { formatCurrency } = useCurrency();

  const safeCurrency = (amount: number) => {
    try {
      return formatCurrency(amount);
    } catch {
      return `$${amount.toFixed(2)}`;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, suppliersRes, inventoryPointsRes] = await Promise.all([
          fetch("/api/inventory/product"),
          fetch("/api/inventory/supplier"),
          fetch("/api/inventory/inventory_point"),
        ]);

        const [productsData, suppliersData, inventoryPointsData] = await Promise.all([
          productsRes.json(),
          suppliersRes.json(),
          inventoryPointsRes.json(),
        ]);

        const companyData = await getCompany();
        setCompany(companyData);
        setProducts(productsData);
        setSuppliers(suppliersData);
        setInventoryPoints(inventoryPointsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load purchase history data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

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
              {purchases
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((purchase) => {
                  const supplier = suppliers.find(
                    (s) => s.supplier_id === purchase.supplier_id
                  );
                  const inventoryPoint = inventoryPoints.find(
                    (ip) => ip.inventory_point_id === purchase.inventory_point_id
                  );

                  const productNameMap = products.reduce((acc, p) => {
                    acc[p.product_id] = p.product_name;
                    return acc;
                  }, {} as Record<number, string>);

                  return (
                    <TableRow
                      key={purchase.purchase_id}
                      sx={{ "&:nth-of-type(odd)": { bgcolor: "action.hover" } }}
                    >
                      <TableCell>PO-{purchase.purchase_id}</TableCell>
                      <TableCell>{supplier?.supplier_name || "Unknown Supplier"}</TableCell>
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
                            supplierName={supplier?.supplier_name || "Unknown Supplier"}
                            inventoryPointName={
                              inventoryPoint?.inventory_point || "Unknown Location"
                            }
                            productNames={
                              purchase.Purchase_items?.reduce((acc, item) => {
                                acc[item.product_id] =
                                  productNameMap[item.product_id] || "Unknown Product";
                                return acc;
                              }, {} as Record<number, string>) || {}
                            }
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={purchases.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
            sx={{
              "& .MuiTablePagination-actions button": { color: "primary.main" },
              "& .MuiTablePagination-selectIcon": { color: "primary.main" },
            }}
          />
        </TableContainer>
      </CardContent>
    </Card>
  );
}

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
  Stack,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import SaleDownloadButtons from "../sale-pdf/sale-download-buttons";
import { SaleReceipt } from "../sale-pdf/sale-pdf-doc";
import { CompanyDto } from "@/types/company.types";
import { getCompany } from "@/server-actions/user-actions/inventory.actions";
import { useCurrency } from "@/components/currency/currency-context";

interface SaleItem {
  sale_item_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount?: number;
  tax?: number;
}

interface SellerInfo { firstName?: string | null; lastName?: string | null; co_user_id?: string | null }

interface Sale {
  sale_id: number;
  sale_no: string;
  seller_id?: number;
  seller?: SellerInfo;
  inventory_point_id?: number;
  sale_total_quantity?: number;
  sale_total_amount?: number;
  sale_total_discount?: number;
  sale_total_tax?: number;
  sale_grand_total: number;
  sale_created_at?: string;
  Sale_items?: SaleItem[];
}

interface Product { product_id: number; product_name: string; }
interface InventoryPoint { inventory_point_id: number; inventory_point: string }

interface Props { sales: Sale[]; }

export default function SalesHistoryTable({ sales }: Props) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [company, setCompany] = useState<CompanyDto | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventoryPoints, setInventoryPoints] = useState<InventoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useCurrency();

  const safeCurrency = (amount: number) => {
    try {
      return formatCurrency(amount);
    } catch {
      return `$${(amount ?? 0).toFixed(2)}`;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, inventoryPointsRes] = await Promise.all([
          fetch("/api/inventory/product"),
          fetch("/api/inventory/inventory_point"),
        ]);
        const [productsData, inventoryPointsData] = await Promise.all([
          productsRes.json(),
          inventoryPointsRes.ok ? inventoryPointsRes.json() : Promise.resolve([]),
        ]);
        setProducts(productsData);
        setInventoryPoints(inventoryPointsData);
        const companyData = await getCompany();
        setCompany(companyData);
      } catch (error) {
        console.error("Failed to fetch sales dependencies:", error);
        toast.error("Failed to load sales history data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const productNameMap = useMemo(() => {
    return products.reduce((acc, p) => { acc[p.product_id] = p.product_name; return acc; }, {} as Record<number, string>);
  }, [products]);

  // Filters state
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [sellerFilter, setSellerFilter] = useState<string>("");
  const [inventoryPointFilter, setInventoryPointFilter] = useState<string>("all");

  // Derived lists for selectors
  const sellerOptions = useMemo(() => {
    const set = new Map<string, string>();
    for (const s of sales) {
      const name = s.seller ? `${s.seller.firstName ?? ""} ${s.seller.lastName ?? ""}`.trim() : "";
      const key = name || (s.seller?.co_user_id ?? (s.seller_id ? `#${s.seller_id}` : ""));
      if (key) set.set(key, name || key);
    }
    const options = Array.from(set.entries()).map(([value, label]) => ({ value, label }));
    // Auto-select first seller if not already set
    if (options.length > 0 && !sellerFilter) {
      setSellerFilter(options[0].value);
    }
    return options;
  }, [sales, sellerFilter]);

  const inventoryPointOptions = useMemo(() => {
    if (inventoryPoints.length > 0) return inventoryPoints.map(ip => ({ value: String(ip.inventory_point_id), label: ip.inventory_point }));
    // fallback derive from sales
    const set = new Set<number>();
    for (const s of sales) if (s.inventory_point_id) set.add(s.inventory_point_id);
    return Array.from(set.values()).map(v => ({ value: String(v), label: `Location ${v}` }));
  }, [inventoryPoints, sales]);

  // Apply filters client-side
  const filteredSales = useMemo(() => {
    const term = search.trim().toLowerCase();
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    if (to) {
      to.setHours(23,59,59,999);
    }

    return sales.filter(sale => {
      // Search by sale no or product name
      const saleNoMatch = term ? sale.sale_no?.toLowerCase().includes(term) : true;
      const productMatch = term
        ? (sale.Sale_items || []).some(it => (productNameMap[it.product_id] || "").toLowerCase().includes(term))
        : true;

      // Date range
      const created = sale.sale_created_at ? new Date(sale.sale_created_at) : null;
      const fromOk = from ? (created ? created >= from : false) : true;
      const toOk = to ? (created ? created <= to : false) : true;

      // Seller filter
      const sellerName = sale.seller ? `${sale.seller.firstName ?? ""} ${sale.seller.lastName ?? ""}`.trim() : "";
      const sellerKey = sellerName || (sale.seller?.co_user_id ?? (sale.seller_id ? `#${sale.seller_id}` : ""));
      const sellerOk = !sellerFilter || (sellerKey === sellerFilter);

      // Inventory point filter
      const ipOk = inventoryPointFilter === "all" ? true : (String(sale.inventory_point_id ?? "") === inventoryPointFilter);

      return (saleNoMatch || productMatch) && fromOk && toOk && sellerOk && ipOk;
    });
  }, [sales, productNameMap, search, fromDate, toDate, sellerFilter, inventoryPointFilter]);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(0);
  }, [search, fromDate, toDate, sellerFilter, inventoryPointFilter, rowsPerPage]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card>
      <CardHeader title="Sales" />
      <CardContent>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            label="Search (Sale No / Product)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
          />
          <TextField
            label="From"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="To"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Seller</InputLabel>
            <Select
              label="Seller"
              value={sellerFilter}
              onChange={(e) => setSellerFilter(e.target.value)}
            >
              {sellerOptions.map(o => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Inventory Point</InputLabel>
            <Select
              label="Inventory Point"
              value={inventoryPointFilter}
              onChange={(e) => setInventoryPointFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              {inventoryPointOptions.map(o => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sale No</TableCell>
                <TableCell>Seller</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Net</TableCell>
                <TableCell>Tax</TableCell>
                <TableCell>Discount</TableCell>
                <TableCell>Grand Total</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSales.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((sale) => {
                const sellerName = sale.seller
                  ? `${sale.seller.firstName ?? ""} ${sale.seller.lastName ?? ""}`.trim() || (sale.seller.co_user_id ? `User ${sale.seller.co_user_id}` : undefined)
                  : undefined;
                const receipt: SaleReceipt = {
                  sale_no: sale.sale_no,
                  sale_created_at: sale.sale_created_at ?? new Date().toISOString(),
                  seller_name: sellerName ?? (sale.seller_id ? `User #${sale.seller_id}` : undefined),
                  items: (sale.Sale_items || []).map((it) => ({
                    name: productNameMap[it.product_id] || `Product ${it.product_id}`,
                    quantity: it.quantity,
                    unit_price: it.unit_price,
                    discount: it.discount ?? 0,
                    tax: it.tax ?? 0,
                    total_price: it.total_price,
                  })),
                  subtotal: sale.sale_total_amount,
                  discount_total: sale.sale_total_discount,
                  tax_total: sale.sale_total_tax,
                  grand_total: sale.sale_grand_total,
                };

                return (
                  <TableRow key={sale.sale_id} sx={{ "&:nth-of-type(odd)": { bgcolor: "action.hover" } }}>
                    <TableCell>{sale.sale_no}</TableCell>
                    <TableCell>{sellerName ?? receipt.seller_name ?? "-"}</TableCell>
                    <TableCell>{sale.sale_created_at ? new Date(sale.sale_created_at).toLocaleDateString() : "N/A"}</TableCell>
                    <TableCell>{sale.sale_total_quantity ?? 0}</TableCell>
                    <TableCell>{safeCurrency(sale.sale_total_amount ?? 0)}</TableCell>
                    <TableCell>{safeCurrency(sale.sale_total_tax ?? 0)}</TableCell>
                    <TableCell>{safeCurrency(sale.sale_total_discount ?? 0)}</TableCell>
                    <TableCell>{safeCurrency(sale.sale_grand_total ?? 0)}</TableCell>
                    <TableCell>
                      {company && (
                        <SaleDownloadButtons receipt={receipt} company={company} />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={filteredSales.length}
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

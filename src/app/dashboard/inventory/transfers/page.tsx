"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Plus, Eye, PencilSimple, Trash, MagnifyingGlass, ArrowRight } from "@phosphor-icons/react";
import PageTitle from "@/components/dashboard/common/page-title";
import InventoryHorizontalNav from "@/components/dashboard/inventory/inventory-horizontal-nav";
import TransfersMain from "@/components/dashboard/inventory/transfers/TransfersMain";

interface Transfer {
  id: number;
  transferNumber: string;
  product: string;
  fromWarehouse: string;
  toWarehouse: string;
  quantity: number;
  transferDate: string;
  expectedDate: string;
  status: "Pending" | "In Transit" | "Completed" | "Cancelled";
  reason: string;
}

const TransfersPage = () => {
  // Reuse the shared TransfersMain which is wired to the real /api/inventory/transfer
  return <TransfersMain />;
};

export default TransfersPage;
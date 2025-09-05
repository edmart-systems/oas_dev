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
import RoleGuard from "@/components/dashboard/inventory/RoleGuard";

const TransfersPage = () => {
  return (
    <RoleGuard>
      <TransfersMain />
    </RoleGuard>
  );
};

export default TransfersPage;
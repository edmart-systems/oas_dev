import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
} from "@mui/material";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { Eye } from "@phosphor-icons/react";
import UserSignatureButton from "@/components/dashboard/users/user/signature/user-signature-button";
import { fetchUserSignature } from "@/server-actions/user-actions/user-signature/user-signature.actions";
import { UserSignatureDto } from "@/types/user.types";
import TransferViewDialog from "./TransferViewDialog";

interface TransferItem {
  product: { product_id: number; product_name: string } | null;
  quantity: number;
}

interface PendingTransfer {
  transfer_id: number;
  created_at: string;
  status: string;
  note?: string | null;
  from_location: { location_id: number; location_name: string };
  to_location: { location_id: number; location_name: string };
  assigned_user: { userId: number; firstName: string; lastName: string } | null;
  creator?: { co_user_id: string; firstName: string; lastName: string } | null;
  signature_data?: string | null;
  items: TransferItem[];
}

const PendingTransfers: React.FC = () => {
  const { data: session } = useSession();
  const [transfers, setTransfers] = useState<PendingTransfer[]>([]);
  const [selectedTransfer, setSelectedTransfer] = useState<PendingTransfer | null>(null);
  const [viewTransfer, setViewTransfer] = useState<PendingTransfer | null>(null);
  const [userSignature, setUserSignature] = useState<UserSignatureDto | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPendingTransfers = async () => {
    try {
      const res = await fetch(`/api/inventory/transfer/pending?userId=${session?.user?.userId}`);
      if (res.ok) {
        const data = await res.json();
        setTransfers(data);
      }
    } catch (err) {
      console.error("Failed to fetch pending transfers:", err);
    }
  };

  const fetchUserSignatureFn = async () => {
    if (!session?.user?.co_user_id) return;
    
    try {
      const res = await fetchUserSignature(session.user.co_user_id);
      if (res.status && res.data) {
        setUserSignature(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch user signature:", err);
    }
  };

  useEffect(() => {
    if (session?.user?.userId) {
      fetchPendingTransfers();
      fetchUserSignatureFn();
    }
  }, [session]);

  const handleSign = async () => {
    if (!selectedTransfer || !userSignature) {
      toast.error("Please create your signature first");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/inventory/transfer/${selectedTransfer.transfer_id}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature_data: userSignature.dataUrl }),
      });

      if (res.ok) {
        toast.success("Transfer signed successfully");
        setSelectedTransfer(null);
        fetchPendingTransfers();
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to sign transfer");
      }
    } catch (err) {
      toast.error("Failed to sign transfer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader 
          title="Pending Transfer Approvals" 
          action={<UserSignatureButton />}
        />
        <CardContent>
          {transfers.length === 0 ? (
            <Typography color="text.secondary">No pending transfers</Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Route</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transfers.map((transfer) => (
                  <TableRow key={transfer.transfer_id}>
                    <TableCell>{new Date(transfer.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      {transfer.from_location.location_name} → {transfer.to_location.location_name}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {transfer.items.map((item, idx) => (
                          <Chip
                            key={idx}
                            label={`${item.product?.product_name || "#"} × ${item.quantity}`}
                            size="small"
                          />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip label={transfer.status} color="warning" size="small" />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Eye />}
                          onClick={() => setViewTransfer(transfer)}
                        >
                          View
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => setSelectedTransfer(transfer)}
                          disabled={!userSignature}
                        >
                          {userSignature ? "Sign" : "Create Signature First"}
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedTransfer && (
        <TransferViewDialog
          open={!!selectedTransfer}
          setOpen={() => setSelectedTransfer(null)}
          transfer={selectedTransfer}
          isSigningMode={true}
          userSignature={userSignature}
          onSign={handleSign}
          signingLoading={loading}
        />
      )}
      
      {viewTransfer && (
        <TransferViewDialog
          open={!!viewTransfer}
          setOpen={() => setViewTransfer(null)}
          transfer={viewTransfer}
        />
      )}
    </>
  );
};

export default PendingTransfers;
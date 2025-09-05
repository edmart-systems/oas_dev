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
  Typography,
} from "@mui/material";
import { useSession } from "next-auth/react";
import { Eye } from "@phosphor-icons/react";
import TransferViewDialog from "./TransferViewDialog";

interface TransferItem {
  product: { product_id: number; product_name: string } | null;
  quantity: number;
}

interface SignedTransfer {
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

const SignedTransfers: React.FC = () => {
  const { data: session } = useSession();
  const [transfers, setTransfers] = useState<SignedTransfer[]>([]);
  const [selectedTransfer, setSelectedTransfer] = useState<SignedTransfer | null>(null);

  const fetchSignedTransfers = async () => {
    try {
      const res = await fetch(`/api/inventory/transfer/signed?userId=${session?.user?.userId}`);
      if (res.ok) {
        const data = await res.json();
        setTransfers(data);
      }
    } catch (err) {
      console.error("Failed to fetch signed transfers:", err);
    }
  };

  useEffect(() => {
    if (session?.user?.userId) {
      fetchSignedTransfers();
    }
  }, [session]);

  return (
    <>
      <Card>
        <CardHeader title="Your Signed Transfer Notes" />
        <CardContent>
          {transfers.length === 0 ? (
            <Typography color="text.secondary">No signed transfers</Typography>
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
                      <Chip 
                        label={transfer.status} 
                        color={transfer.status === 'COMPLETED' ? 'success' : 'default'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Eye />}
                        onClick={() => setSelectedTransfer(transfer)}
                      >
                        View
                      </Button>
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
        />
      )}
    </>
  );
};

export default SignedTransfers;
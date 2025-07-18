"use client";
import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Card, Stack, Typography, useTheme } from "@mui/material";
import { QuotationOutputLineItem } from "@/types/quotations.types";
import { Currency2 } from "@/types/currency.types";
import { hoverBackground } from "@/utils/styles.utils";

type Props = {
  listItems: QuotationOutputLineItem[];
  currency: Currency2;
};

const ListItemsTable = ({ listItems, currency }: Props) => {
  const theme = useTheme();

  return (
    <TableContainer
      component={Card}
      sx={{ width: "100%", overflow: "scroll", maxHeight: 600 }}
    >
      <Table sx={{ minWidth: 650 }} stickyHeader aria-label="list-items table">
        <TableHead>
          <TableRow>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              S/N
            </TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>
              Unit Price ({currency.currency_code})
            </TableCell>
            <TableCell sx={{ fontWeight: 600 }}>
              Total ({currency.currency_code})
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {listItems.map((row, index) => (
            <TableRow
              key={row.id + "-" + row.quantity}
              sx={(theme) => ({
                "&:last-child td, &:last-child th": { border: 0 },
                background: index % 2 == 0 ? hoverBackground(theme) : "",
              })}
            >
              <TableCell align="center">{index + 1}</TableCell>
              <TableCell sx={{ maxWidth: "260px", textAlign: "justify" }}>
                <Stack>
                  <Typography>{row.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {row.description}
                  </Typography>
                </Stack>
              </TableCell>

              <TableCell>
                {row.quantity} {row.units}
              </TableCell>
              <TableCell>{row.unitPrice.toLocaleString()}</TableCell>
              <TableCell>
                {(row.quantity * row.unitPrice).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ListItemsTable;

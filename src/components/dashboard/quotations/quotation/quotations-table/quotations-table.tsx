"use client";

import {
  Box,
  Card,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { SummarizedQuotation } from "@/types/quotations.types";
import QuotationRaw from "./quotation-row";

type Props = {
  isFetching: boolean;
  visibleRows: SummarizedQuotation[];
};

const QuotationsTable = ({ isFetching, visibleRows }: Props) => {
  const [openRow, setOpenRow] = useState<number>(0);
  const dense = false;
  const emptyRows = 0;
  // const emptyRows =
  //   page > 0 ? Math.max(0, (1 + page) * rowsPerPage - users.length) : 0;
  return (
    <Card>
      <Box sx={{ width: "100%" }}>
        <Box sx={{ width: "100%" }}>
          <TableContainer>
            <Table
              sx={{ minWidth: 750 }}
              aria-labelledby="tableTitle"
              size={dense ? "small" : "medium"}
            >
              <TableBody>
                {visibleRows.map((row, index) => (
                  <QuotationRaw
                    quotation={row}
                    key={row.id + "0" + index}
                    index={index + 1}
                    openIndex={openRow}
                    setOpenIndex={setOpenRow}
                  />
                ))}
                {emptyRows > 0 && (
                  <TableRow
                    style={{
                      height: (dense ? 33 : 53) * emptyRows,
                    }}
                  >
                    <TableCell colSpan={7} />
                  </TableRow>
                )}
                {visibleRows.length < 1 &&
                  isFetching &&
                  Array.from(Array(3)).map((item, index) => (
                    <TableRow key={item + "" + index}>
                      <TableCell colSpan={7} sx={{ textAlign: "center" }}>
                        <Typography variant="h5">
                          <Skeleton variant="rounded" />
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                {visibleRows.length < 1 && !isFetching && (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: "center" }}>
                      <Typography variant="body1">
                        No quotations found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Card>
  );
};

export default QuotationsTable;

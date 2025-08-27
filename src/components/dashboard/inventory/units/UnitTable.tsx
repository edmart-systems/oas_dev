import React, { useState } from "react";
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from "@mui/material";
import { PencilSimpleIcon } from "@phosphor-icons/react";

export type UnitRow = {
  unit_id: number;
  name: string;
  short_name: string;
  unit_desc: string | null;
  created_at?: string | Date;
  updated_at?: string | Date | null;
};

interface Props {
  units: UnitRow[];
  onEdit: (unit: UnitRow) => void;
}

const UnitTable: React.FC<Props> = ({ units, onEdit }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const paginated = units.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Id</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Short</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Updated</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginated.map((u) => (
            <TableRow key={u.unit_id} sx={{ "&:nth-of-type(odd)": { bgcolor: "action.hover" } }}>
              <TableCell>UN-{u.unit_id}</TableCell>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.short_name}</TableCell>
              <TableCell sx={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {u.unit_desc || "-"}
              </TableCell>
              <TableCell>{u.updated_at ? new Date(u.updated_at).toLocaleDateString() : "-"}</TableCell>
              <TableCell>{u.created_at ? new Date(u.created_at).toLocaleDateString() : "-"}</TableCell>
              <TableCell>
                <IconButton onClick={() => onEdit(u)}>
                  <PencilSimpleIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={units.length}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5]}
      />
    </TableContainer>
  );
};

export default UnitTable;

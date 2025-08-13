import React from 'react'
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { PencilSimple } from "@phosphor-icons/react";
import UserAvatar from "@/components/dashboard/nav-bar/user-avatar";
import { Category } from '@/modules/inventory/types/category.types';



type Props = {
  categories: Category[];
  onEdit: () => void;
}

const CatergoryTable = ({ categories, onEdit }: Props) => {
  return (
      <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Id</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Products with Category</TableCell>
                      <TableCell>Updated At</TableCell>
                      <TableCell>Created At</TableCell>
                      <TableCell>Created By</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.category_id}>
                        <TableCell>CA-{category.category_id}</TableCell>
                        <TableCell>{category.category}</TableCell>
                        <TableCell 
                          title={category.Product?.length > 0 ? category.Product.map(p => p.product_name).join(", ") : "No products"}
                          sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          {category.Product?.length > 0 
                            ? category.Product.map(p => p.product_name).join(", ") 
                            : "No products"}
                        </TableCell>
                        <TableCell>{category.updated_at? new Date(category.updated_at).toLocaleDateString()
                            : "N/A"
                          }</TableCell>
                        <TableCell>{category.created_at? new Date(category.created_at).toLocaleDateString()
                            : "N/A"
                          }</TableCell>
                        <TableCell>
                          {/* {category.creator ? `${category.creator.firstName} ${category.creator.lastName}` : category.created_by || "N/A"} */}
                          <UserAvatar/>
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={onEdit} color="primary">
                            <PencilSimple />
                          </IconButton>
                          {/* <IconButton onClick={() => handleDelete(category.id)} color="error">
                            <Trash />
                          </IconButton> */}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
  )
}

export default CatergoryTable
import { Tag } from '@/modules/inventory/types/tag.types';
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


interface Props {
  tags: Tag[];
  onEdit: () => void;
}

const TagTable = ({tags, onEdit}: Props) => {
  return (
      <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Id</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Products with Tag</TableCell>
                  <TableCell>Updated At</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Created By</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tags.map((tag) => (
                  <TableRow key={tag.tag_id}>
                    <TableCell>TA-{tag.tag_id}</TableCell>
                    <TableCell>{tag.tag}</TableCell>
                    <TableCell 
                      title={tag.Product?.length > 0 ? tag.Product.map(p => p.product_name).join(", ") : "No products"}
                      sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {tag.Product?.length > 0 
                        ? tag.Product.map(p => p.product_name).join(", ") 
                        : "No products"}
                    </TableCell>
                    <TableCell>{tag.updated_at? new Date(tag.updated_at).toLocaleDateString()
                        : "N/A"
                      }</TableCell>
                    <TableCell>{tag.created_at? new Date(tag.created_at).toLocaleDateString()
                        : "N/A"
                      }</TableCell>
                    <TableCell>
                    {/* {tag.creator ? `${tag.creator.firstName} ${tag.creator.lastName}` : tag.created_by || "N/A"} */}
                    <UserAvatar/>
                  </TableCell>
                    <TableCell>
                      <IconButton onClick={onEdit}>
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

export default TagTable
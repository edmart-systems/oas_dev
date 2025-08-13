import React, { useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  TextField,
} from "@mui/material";
import { Plus, MagnifyingGlass } from "@phosphor-icons/react";
import { Tag } from '@/modules/inventory/types/tag.types';
import TagTable from './tagTable';

interface Props {
    tags: Tag[]
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onAdd: () => void;    
    onEdit: () => void;
}

const TagMain = ({tags, searchTerm, onSearchChange, onAdd, onEdit}: Props) => {
  return (
       <Card>
        <CardHeader
          title="Tags"
          action={
            <Stack direction="row" spacing={2}>
              <TextField
                size="small"
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                InputProps={{
                  startAdornment: <MagnifyingGlass size={20} />,
                }}
              />
              <Button variant="contained" startIcon={<Plus />} onClick={onAdd }>
                Add Tag
              </Button>
            </Stack>
          }
        />
        <CardContent>
            {/* Tag table  */}
            <TagTable tags={tags} onEdit={onEdit} />
        
        </CardContent>
      </Card>
    
  )
}

export default TagMain
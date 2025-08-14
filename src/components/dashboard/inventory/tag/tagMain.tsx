import React, { useEffect, useState } from 'react'
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
import { toast } from 'react-toastify';
import TagForm from './tagForm';



const TagMain = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState({
      tag: false,
    });
  const handleDialogOpen = (type: keyof typeof openDialog) =>
  setOpenDialog({ ...openDialog, [type]: true });

  const handleDialogClose = (type: keyof typeof openDialog) =>
  setOpenDialog({ ...openDialog, [type]: false });

   
  useEffect(() => {
      fetchData();
    }, []);
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory/tag");
      if (!res.ok) throw new Error("Failed to fetch tags");

      const data: Tag[] = await res.json();
      setTags(data);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
      toast.error("Failed to fetch tags");
    } finally {
      setLoading(false);
    }
  };
  const filteredTags = tags.filter(tag =>
    tag.tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <MagnifyingGlass size={20} />,
                }}
              />
              <Button variant="contained" startIcon={<Plus />} onClick={()=> handleDialogOpen('tag')}>
                Add Tag
              </Button>
            </Stack>
          }
        />
        <CardContent>
            {/* Tag table  */}
            <TagTable tags={filteredTags} onEdit={() => handleDialogOpen('tag'  )} />
        
        </CardContent>
        <TagForm
                      open={openDialog.tag}
                      onClose={() => handleDialogClose('tag')}
                      onSuccess={(newTag) => {
                        toast.success('Tag added successfully');
                      }}
                    />
      </Card>

    
  )
}

export default TagMain
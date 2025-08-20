import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  TextField,
} from "@mui/material";
import { PlusIcon as Plus, MagnifyingGlassIcon as MagnifyingGlass } from "@phosphor-icons/react";
import { Tag } from '@/modules/inventory/types/tag.types';
import TagTable from './tagTable';
import { toast } from 'react-toastify';
import TagForm from './tagForm';
import MyCircularProgress from '@/components/common/my-circular-progress';


const TagMain = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [loading, setLoading] = useState(true);

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
      console.error(error);
    } finally{
      setLoading(false);
    }
  };

  const filteredTags = tags.filter(tag =>
    (tag.tag || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setSelectedTag(null); 
    setOpenForm(true);
  };

  const handleEdit = (tag: Tag) => {
    setSelectedTag(tag); 
    setOpenForm(true);
  };

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
            />
            <Button variant="contained" disabled={loading} startIcon={<Plus />} onClick={handleAdd}>
              Add Tag
            </Button>
          </Stack>
        }
      />
      <CardContent>
        { loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                  <MyCircularProgress />
                </Box>

           ):(
                <TagTable tags={filteredTags} onEdit={handleEdit} />
         )}
                

        
      </CardContent>

      <TagForm
        open={openForm}
        initialData={selectedTag}
        onClose={() => setOpenForm(false)}
        onSuccess={(newTag) => {
          fetchData();
          setOpenForm(false);
          toast.success(selectedTag ? "Tag updated successfully" : "Tag added successfully");
        }}
      />
    </Card>
  );
};

export default TagMain
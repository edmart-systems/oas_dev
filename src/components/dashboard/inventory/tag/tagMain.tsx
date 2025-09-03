'use client';

import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  TextField,
  alpha,
  useTheme,
} from "@mui/material";
import { PlusIcon as Plus, MagnifyingGlassIcon as MagnifyingGlass } from "@phosphor-icons/react";
import { Tag } from '@/modules/inventory/types/tag.types';
import TagTable from './tagTable';
import { toast } from 'react-toastify';
import TagForm from './tagForm';
import MyCircularProgress from '@/components/common/my-circular-progress';

const TagMain = () => {
  const theme = useTheme();

  const colors = {
    primary: "#D98219",
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    surface: theme.palette.background.paper,
    surfaceVariant: theme.palette.mode === "dark" ? alpha(theme.palette.grey[800], 0.7) : "#ffffff",
    border: theme.palette.divider,
  };

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
      toast.error("Failed to fetch tags");
    } finally {
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
    <Stack spacing={3}>
      <Card
        sx={{
          borderRadius: 3,
          backgroundColor: colors.surface,
          boxShadow: `0 4px 16px ${alpha(colors.warning, 0.08)}`,
        }}
      >
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
              <Button 
                variant="contained" 
                disabled={loading} 
                startIcon={<Plus />} 
                onClick={handleAdd}
                sx={{
                  backgroundColor: colors.primary,
                  "&:hover": {
                    backgroundColor: alpha(colors.primary, 0.9),
                  },
                }}
              >
                Add Tag
              </Button>
            </Stack>
          }
          sx={{
            borderBottom: `1px solid ${colors.border}`,
            backgroundColor: colors.surfaceVariant,
          }}
        />
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={200}>
              <MyCircularProgress />
            </Box>
          ) : (
            <TagTable tags={filteredTags} onEdit={handleEdit} />
          )}
        </CardContent>
      </Card>

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
    </Stack>
  );
};

export default TagMain;

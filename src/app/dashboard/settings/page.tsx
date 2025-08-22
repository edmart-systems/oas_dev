"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import PageTitle from "@/components/dashboard/common/page-title";
import { useCurrency } from "@/components/currency/currency-context";
import UserAvatar from "@/components/dashboard/nav-bar/user-avatar";



import { 
  Box, 
  Stack, 
  Typography, 
  Card, 
  CardContent, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Button,
  Input
} from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import Image from "next/image";
import LoadingBackdrop from "@/components/common/loading-backdrop";

const SettingsPage = () => {
  const { currency, setCurrency, currencies } = useCurrency();
  const { data: session, update } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  
  useEffect(() => {
    if (session?.user?.profile_picture) {
      setProfilePicture(session.user.profile_picture);
    }
  }, [session]);
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (isUploading || isDeleting) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast("Image size must be less than 5MB", { type: "error" });
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      toast("Please select an image file", { type: "error" });
      return;
    }
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const response = await fetch('/api/user/profile-picture', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.status) {
        const newImageUrl = result.data.profile_picture;
        setProfilePicture(newImageUrl);
        

        
        // Update session without awaiting
        update({
          ...session,
          user: {
            ...session?.user,
            profile_picture: newImageUrl
          }
        });
        
        toast("Profile picture updated successfully", { type: "success" });
      } else {
        toast(result.message || "Failed to upload image", { type: "error" });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast("Failed to upload image", { type: "error" });
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };
  
  const handleDeletePicture = async () => {
    if (isUploading || isDeleting) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch('/api/user/profile-picture', {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.status) {
        setProfilePicture(null);
        

        
        // Update session without awaiting
        update({
          ...session,
          user: {
            ...session?.user,
            profile_picture: null
          }
        });
        
        toast("Profile picture deleted successfully", { type: "success" });
      } else {
        toast(result.message || "Failed to delete image", { type: "error" });
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast("Failed to delete image", { type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <Stack spacing={3}>
      <PageTitle title="Settings" />
      
      <Card sx={{ maxWidth: 400 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Profile Settings
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <UserAvatar 
              userName={session?.user ? `${session.user.firstName} ${session.user.lastName}` : "Current User"} 
              src={profilePicture} 
              size={80} 
            />
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'center' }}>
              <Input
                accept="image/*"
                style={{ display: 'none' }}
                id="profile-picture-upload"
                type="file"
                onChange={handleImageUpload}
                disabled={isUploading || isDeleting}
              />
              <label htmlFor="profile-picture-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<PhotoCamera />}
                  disabled={isUploading || isDeleting}
                  size="small"
                >
                  {profilePicture ? 'Change Photo' : 'Upload Photo'}
                </Button>
              </label>
              {profilePicture && (
                <Button
                  variant="text"
                  color="error"
                  onClick={handleDeletePicture}
                  disabled={isUploading || isDeleting}
                  size="small"
                >
                  Remove Photo
                </Button>
              )}
            </Box>
          </Box>
          
          <Typography variant="h6" gutterBottom>
            Currency Settings
          </Typography>
          {currencies.length === 0 ? (
            <Typography>Loading currencies...</Typography>
          ) : (
            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select
                value={currency?.code || ''}
                onChange={(e) => {
                  const selected = currencies.find(c => c.code === e.target.value);
                  if (selected) setCurrency(selected);
                }}
                label="Currency"
              >
                {currencies.map((curr) => (
                  <MenuItem key={curr.code} value={curr.code}>
                    {curr.symbol} - {curr.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </CardContent>
      </Card>


      <Stack width="100%" justifyContent="center" alignItems="center">
        <Box
          component="img"
          alt="Dash"
          src="/assets/Settings.gif"
          borderRadius={2}
          sx={{
            display: "inline-block",
            height: "auto",
            maxWidth: "100%",
            width: "600px",
            opacity: 0.4,
          }}
        />
      </Stack>
      
      <LoadingBackdrop open={isUploading || isDeleting} />
    </Stack>
  );
};

export default SettingsPage;

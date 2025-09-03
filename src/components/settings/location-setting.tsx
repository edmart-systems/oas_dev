"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useCurrentLocation } from "@/hooks/use-current-location";
import { LocationResponseDto } from "@/modules/inventory/dtos/location.dto";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Chip,
  CircularProgress,
  Paper,
  useTheme
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  LocationOn as MapPin,
  Add as Plus,
  Business as Building2,
  Inventory as Package,
  Check
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

// Styled Card with primary color and stronger shadow
const PrimaryCard = styled(Card)(({ theme }) => ({
  backgroundColor: "#D98219",
  color: "#fff",
  boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
  "& .MuiCardContent-root": { color: "#fff" },
}));

// Hoverable Paper for overview
const HoverPaper = styled(Paper)(({ theme }) => ({
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
  },
}));

const LocationManagement = () => {
  const theme = useTheme();
  const { currentLocationId, setCurrentLocation, loading: loadingCurrent } = useCurrentLocation();

  const [locations, setLocations] = useState<LocationResponseDto[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"BRANCH" | "INVENTORY_POINT">("BRANCH");
  const [newParentId, setNewParentId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchLocations = async () => {
    try {
      const res = await fetch("/api/inventory/location");
      const data = await res.json();
      setLocations(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { fetchLocations(); }, []);
  useEffect(() => { if (currentLocationId) setSelectedLocationId(currentLocationId); }, [currentLocationId]);

  const handleSaveLocation = async () => {
    if (!selectedLocationId) return;
    setSaving(true);

    const selectedLocation = locations.find(loc => loc.location_id === selectedLocationId);
    if (!selectedLocation) { toast.error("Selected location not found"); setSaving(false); return; }

    if (selectedLocation.location_type !== "INVENTORY_POINT") {
      const inventoryPoints = locations.filter(loc => loc.location_type === "INVENTORY_POINT");
      if (!inventoryPoints.length) toast.info("No Inventory Points yet. Using MAIN_STORE as working location.");
      else { toast.warning("Select an Inventory Point as working location."); setSaving(false); return; }
    }

    const success = await setCurrentLocation(selectedLocationId);
    toast[success ? "success" : "error"](success ? "Location updated successfully" : "Failed to update location");
    setSaving(false);
  };

  const handleCreate = async () => {
    if (!newName) return toast.error("Enter a location name");
    if (newType === "INVENTORY_POINT" && !newParentId) return toast.error("Select a BRANCH for the inventory point");

    let parentId = newParentId;
    if (newType === "BRANCH") {
      const mainStore = locations.find(loc => loc.location_type === "MAIN_STORE");
      if (mainStore) parentId = mainStore.location_id;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/inventory/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location_name: newName, location_type: newType, ...(parentId && { location_parent_id: parentId }) }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`${newType} created successfully`);
        setNewName(""); setNewParentId(null); setShowCreateForm(false);
        fetchLocations();
      } else toast.error(data.error || "Failed to create location");
    } catch (error) {
      console.error(error); toast.error("Failed to create location");
    } finally { setCreating(false); }
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case "MAIN_STORE":
      case "BRANCH": return <Building2 sx={{ color: "#D98219" }} />;
      case "INVENTORY_POINT": return <Package sx={{ color: "#D98219" }} />;
      default: return <MapPin />;
    }
  };

  const formatLocationType = (type: string) =>
    type.replace("_", " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

  if (loadingCurrent) {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: theme.palette.mode === "dark" ? "#000" : "#fff"
      }}>
        <Chip
          icon={<CircularProgress size={20} sx={{ color: 'white' }} />}
          label="Loading location settings..."
          sx={{ bgcolor: "#D98219", color: "#fff", fontWeight: 600, px: 2, py: 1 }}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.mode === "dark" ? "#000" : "#fff" }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Avatar sx={{ bgcolor: "#fff", boxShadow: 3, width: 64, height: 64, mx: 'auto', mb: 2 }}>
            <MapPin sx={{ fontSize: 32, color: "#D98219" }} />
          </Avatar>
          <Typography variant="h3" component="h1"
            sx={{ fontWeight: 'bold', color: theme.palette.mode === "dark" ? "#fff" : "#111827", mb: 2 }}>
            Location Management
          </Typography>
          <Typography variant="h6"
            sx={{ color: theme.palette.mode === "dark" ? "#9ca3af" : "#6b7280", maxWidth: 600, mx: 'auto' }}>
            Manage your working locations and create new branches or inventory points for your business
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* Working Location */}
          <Grid size={{ xs:12, md: 6 }}>
            <Card sx={{ borderRadius: 4, boxShadow: 8, overflow: 'hidden' }}>
              <PrimaryCard sx={{ borderRadius: 0 }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Default Working Location</Typography>
                  <Typography sx={{ mt: 1, color: 'rgba(255,255,255,0.8)' }}>
                    Set your primary working location for inventory operations
                  </Typography>
                </CardContent>
              </PrimaryCard>
              <CardContent sx={{ p: 3 }}>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Select Working Location</InputLabel>
                  <Select value={selectedLocationId || ''} onChange={(e) => setSelectedLocationId(e.target.value as number)} label="Select Working Location">
                    {locations.map(loc => (
                      <MenuItem key={loc.location_id} value={loc.location_id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getLocationIcon(loc.location_type)}
                            <Typography sx={{ ml: 1 }}>{loc.location_name}</Typography>
                          </Box>
                          {selectedLocationId === loc.location_id && <Check sx={{ color: "#D98219" }} />}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  onClick={handleSaveLocation}
                  disabled={saving || !selectedLocationId || selectedLocationId === currentLocationId}
                  variant="contained"
                  fullWidth
                  startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Check />}
                  sx={{ bgcolor: "#D98219", py: 1.5, fontWeight: 600 }}
                >
                  {saving ? "Saving..." : "Save Working Location"}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Create Location */}
          <Grid size={{ xs:12, md: 6 }}>
            <Card sx={{ borderRadius: 4, boxShadow: 8, overflow: 'hidden' }}>
              <PrimaryCard sx={{ borderRadius: 0 }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Add New Location</Typography>
                  <Typography sx={{ mt: 1, color: 'rgba(255,255,255,0.8)' }}>Create branches and inventory points for your business</Typography>
                </CardContent>
              </PrimaryCard>
              <CardContent sx={{ p: 3 }}>
                {!showCreateForm ? (
                  <Box sx={{ textAlign: 'center' }}>
                    <Button onClick={() => setShowCreateForm(true)} variant="contained" startIcon={<Plus />}
                      sx={{ bgcolor: "#D98219", py: 1.5, px: 4, fontWeight: 600 }}>Create Location</Button>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField label="Location Name" value={newName} onChange={(e) => setNewName(e.target.value)} fullWidth />
                    <FormControl fullWidth>
                      <Select value={newType} onChange={(e) => setNewType(e.target.value as "BRANCH" | "INVENTORY_POINT")}>
                        <MenuItem value="BRANCH">Branch</MenuItem>
                        <MenuItem value="INVENTORY_POINT">Inventory Point</MenuItem>
                      </Select>
                    </FormControl>
                    {newType === "INVENTORY_POINT" && (
                      <FormControl fullWidth>
                        <Select value={newParentId || ""} onChange={(e) => setNewParentId(e.target.value as number)}>
                          <MenuItem value="" disabled>Select a Branch</MenuItem>
                          {locations.filter(l => l.location_type === "BRANCH").map(branch => (
                            <MenuItem key={branch.location_id} value={branch.location_id}>{branch.location_name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button onClick={() => { setShowCreateForm(false); setNewName(""); setNewParentId(null); }} variant="outlined" fullWidth>Cancel</Button>
                      <Button onClick={handleCreate} variant="contained" fullWidth sx={{ bgcolor: "#D98219" }}>
                        {creating ? "Creating..." : "Create"}
                      </Button>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Locations Overview */}
        <Grid container spacing={2}>
          {locations.map(location => (
            <Grid size={{ xs:12, md: 4 , sm:6}} key={location.location_id}>
              <HoverPaper sx={{
                p: 2, borderRadius: 3, border: 2,
                borderColor: currentLocationId === location.location_id ? "#D98219" : "transparent",
                bgcolor: theme.palette.mode === "dark" ? "#000" : "#fff",
                boxShadow: theme.palette.mode === "dark" ? '0 6px 20px rgba(255,255,255,0.1)' : '0 6px 20px rgba(0,0,0,0.1)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {getLocationIcon(location.location_type)}
                  <Box sx={{ ml: 2, flex: 1 }}>
                    <Typography sx={{ fontWeight: 600, color: theme.palette.mode === "dark" ? "#fff" : "#111827" }}>
                      {location.location_name}
                    </Typography>
                    <Typography sx={{ color: theme.palette.mode === "dark" ? "#9ca3af" : "#6b7280" }}>
                      {formatLocationType(location.location_type)}
                    </Typography>
                  </Box>
                  {currentLocationId === location.location_id &&
                    <Chip label="Active" size="small" sx={{ bgcolor: "#D98219", color: "#fff" }} />}
                </Box>
              </HoverPaper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default LocationManagement;

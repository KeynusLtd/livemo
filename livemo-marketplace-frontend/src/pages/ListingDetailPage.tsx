import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { fetchListing } from "../lib/marketplaceApi";
import { useCartStore } from "../stores/cartStore";

export function ListingDetailPage() {
  const { id } = useParams();
  const listingId = id ?? "";

  const addItem = useCartStore((s) => s.addItem);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["listing", listingId],
    queryFn: () => fetchListing(listingId),
    enabled: Boolean(listingId),
  });

  const imageUrl = useMemo(() => {
    return (
      data?.imageUrl ??
      "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1600&q=60"
    );
  }, [data?.imageUrl]);

  if (!listingId) {
    return <Alert severity="error">Missing listing id.</Alert>;
  }

  if (isError) {
    return (
      <Alert severity="error">
        Unable to load listing. Make sure the backend is running and accessible via `/api`.
      </Alert>
    );
  }

  if (isLoading || !data) {
    return <Typography color="text.secondary">Loading...</Typography>;
  }

  return (
    <Stack spacing={3}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Box
            component="img"
            src={imageUrl}
            alt={data.title}
            sx={{
              width: "100%",
              height: { xs: 280, md: 420 },
              objectFit: "cover",
              borderRadius: 3,
              border: 1,
              borderColor: "divider",
            }}
          />
        </Grid>

        <Grid item xs={12} md={5}>
          <Stack spacing={2}>
            <Typography variant="h4" fontWeight={900}>
              {data.title}
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
              <Chip label={data.type === "livestock" ? "Livestock" : "Product"} />
              {data.certifications?.map((c) => (
                <Chip key={c} variant="outlined" label={c} />
              ))}
            </Stack>

            <Typography variant="h5" fontWeight={900}>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: data.currency || 'USD',
                maximumFractionDigits: 0
              }).format(data.price)}
            </Typography>

            {data.location && <Typography color="text.secondary">{data.location}</Typography>}

            <Button
              variant="contained"
              color="primary"
              onClick={() =>
                addItem({
                  id: data.id,
                  title: data.title,
                  price: data.price,
                  imageUrl: data.imageUrl,
                  currency: data.currency
                }, 1)
              }
            >
              Add to cart
            </Button>

            <Button component={RouterLink} to="/cart" variant="outlined">
              View cart
            </Button>
          </Stack>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={800}>
                Details
              </Typography>
              <Divider sx={{ my: 2 }} />
              {data.description ? (
                <Typography color="text.secondary">{data.description}</Typography>
              ) : (
                <Typography color="text.secondary">No description provided.</Typography>
              )}

              {data.type === "livestock" && (data.ageMonths !== undefined || data.certifications?.length) && (
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 3 }}>
                  {data.ageMonths !== undefined && (
                    <Box>
                      <Typography fontWeight={800}>Age (months)</Typography>
                      <Typography color="text.secondary">{data.ageMonths}</Typography>
                    </Box>
                  )}
                  {!!data.certifications?.length && (
                    <Box>
                      <Typography fontWeight={800}>Health certifications</Typography>
                      <Typography color="text.secondary">{data.certifications.join(", ")}</Typography>
                    </Box>
                  )}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={800}>
                {data.type === "livestock" ? "Seller / Farmer" : "Seller / Merchant"}
              </Typography>
              <Divider sx={{ my: 2 }} />

              {data.seller ? (
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar>{(data.seller.farmName || "F").slice(0, 1)}</Avatar>
                    <Box>
                      <Typography fontWeight={900}>{data.seller.farmName}</Typography>
                      {data.seller.location && (
                        <Typography color="text.secondary">{data.seller.location}</Typography>
                      )}
                    </Box>
                  </Stack>

                  {data.seller.profileUrl && (
                    <Button component={RouterLink} to={data.seller.profileUrl} variant="outlined">
                      View profile
                    </Button>
                  )}
                </Stack>
              ) : (
                <Typography color="text.secondary">
                  Seller information is not available for this listing.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}


import { Card, CardActionArea, CardContent, CardMedia, Chip, Stack, Typography, Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import type { Listing } from "../lib/marketplaceApi";

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Card
      sx={(t) => ({
        borderRadius: 3,
        height: "100%",
        overflow: "hidden",
        border: `1px solid ${t.palette.divider}`,
        boxShadow: "0 4px 10px rgba(0,0,0,0.04)",
      })}
    >
      <CardActionArea component={RouterLink} to={`/marketplace/listings/${listing.id}`} sx={{ height: "100%" }}>
        <Box sx={{ position: "relative", pt: "62%", overflow: "hidden" }}>
          <CardMedia
            component="img"
            image={
              listing.imageUrl ??
              "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1200&q=60"
            }
            alt={listing.title}
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <Box
            sx={(t) => ({
              position: "absolute",
              top: 8,
              left: 8,
              px: 1.2,
              py: 0.3,
              borderRadius: 999,
              bgcolor: "rgba(0,0,0,0.55)",
              color: "common.white",
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 0.4,
            })}
          >
            {listing.type === "livestock" ? "Livestock" : "Product"}
          </Box>
        </Box>

        <CardContent sx={{ pb: 2.25 }}>
          <Stack spacing={1.1}>
            <Typography fontWeight={800} sx={{ lineHeight: 1.3 }}>
              {listing.title}
            </Typography>
            {listing.location && (
              <Typography color="text.secondary" sx={{ fontSize: 14 }}>
                {listing.location}
              </Typography>
            )}
            <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
              {listing.certifications?.slice(0, 2).map((c) => (
                <Chip key={c} size="small" variant="outlined" label={c} />
              ))}
            </Stack>
            <Typography
              fontWeight={900}
              sx={(t) => ({
                mt: 0.5,
                fontSize: 18,
                color: t.palette.primary.main,
              })}
            >
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: listing.currency || 'USD',
                maximumFractionDigits: 0
              }).format(listing.price)}
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

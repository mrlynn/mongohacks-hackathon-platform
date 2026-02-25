"use client";

import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  EmojiEvents as TrophyIcon,
  Schedule as ScheduleIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import { IEvent } from "@/lib/db/models/Event";

interface ModernTemplateProps {
  event: IEvent;
}

export default function ModernTemplate({ event }: ModernTemplateProps) {
  const { landingPage } = event;
  const hero = landingPage?.customContent?.hero || {};
  const about = landingPage?.customContent?.about || event.description;
  const prizes = landingPage?.customContent?.prizes || [];
  const schedule = landingPage?.customContent?.schedule || [];
  const sponsors = landingPage?.customContent?.sponsors || [];
  const faq = landingPage?.customContent?.faq || [];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: hero.backgroundImage
            ? `linear-gradient(rgba(0, 104, 74, 0.85), rgba(0, 104, 74, 0.85)), url(${hero.backgroundImage})`
            : "linear-gradient(135deg, #00684A 0%, #004D37 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
          py: { xs: 8, md: 16 },
          textAlign: "center",
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: "2.5rem", md: "3.5rem" },
            }}
          >
            {hero.headline || event.name}
          </Typography>
          <Typography
            variant="h5"
            sx={{ mb: 4, opacity: 0.95, maxWidth: 800, mx: "auto" }}
          >
            {hero.subheadline || event.theme}
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mb: 4 }}>
            <Chip
              label={`${new Date(event.startDate).toLocaleDateString()} - ${new Date(event.endDate).toLocaleDateString()}`}
              sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600 }}
            />
            <Chip
              label={event.location}
              sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600 }}
            />
          </Box>
          <Button
            variant="contained"
            size="large"
            href={`/events/${event._id}/register`}
            sx={{
              bgcolor: "white",
              color: "primary.main",
              px: 6,
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: 700,
              "&:hover": { bgcolor: "grey.100" },
            }}
          >
            {hero.ctaText || "Register Now"}
          </Button>
        </Container>
      </Box>

      {/* About Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 4, textAlign: "center" }}>
          About
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontSize: "1.1rem",
            lineHeight: 1.8,
            maxWidth: 900,
            mx: "auto",
            color: "text.secondary",
          }}
        >
          {about}
        </Typography>
      </Container>

      {/* Prizes Section */}
      {prizes.length > 0 && (
        <Box sx={{ bgcolor: "grey.50", py: 8 }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: "center", mb: 6 }}>
              <TrophyIcon sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
                Prizes
              </Typography>
            </Box>
            <Grid container spacing={4}>
              {prizes.map((prize, idx) => (
                <Grid item xs={12} md={4} key={idx}>
                  <Card elevation={2} sx={{ height: "100%", textAlign: "center" }}>
                    <CardContent sx={{ py: 4 }}>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                        {prize.title}
                      </Typography>
                      {prize.value && (
                        <Typography
                          variant="h4"
                          sx={{ color: "primary.main", fontWeight: 700, mb: 2 }}
                        >
                          {prize.value}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        {prize.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* Schedule Section */}
      {schedule.length > 0 && (
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <ScheduleIcon sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
              Schedule
            </Typography>
          </Box>
          <Box sx={{ maxWidth: 800, mx: "auto" }}>
            {schedule.map((item, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  gap: 3,
                  mb: 3,
                  pb: 3,
                  borderBottom: idx < schedule.length - 1 ? "1px solid" : "none",
                  borderColor: "grey.200",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "primary.main", minWidth: 100 }}
                >
                  {item.time}
                </Typography>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {item.title}
                  </Typography>
                  {item.description && (
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      )}

      {/* Sponsors Section */}
      {sponsors.length > 0 && (
        <Box sx={{ bgcolor: "grey.50", py: 8 }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: "center", mb: 6 }}>
              <BusinessIcon sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
                Sponsors
              </Typography>
            </Box>
            <Grid container spacing={4} justifyContent="center">
              {sponsors.map((sponsor, idx) => (
                <Grid item xs={6} sm={4} md={3} key={idx}>
                  <Card elevation={1} sx={{ p: 3, textAlign: "center" }}>
                    {sponsor.logo ? (
                      <img
                        src={sponsor.logo}
                        alt={sponsor.name}
                        style={{ maxWidth: "100%", height: 60, objectFit: "contain" }}
                      />
                    ) : (
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {sponsor.name}
                      </Typography>
                    )}
                    <Chip
                      label={sponsor.tier}
                      size="small"
                      sx={{ mt: 2 }}
                      color={
                        sponsor.tier === "Gold"
                          ? "warning"
                          : sponsor.tier === "Silver"
                            ? "default"
                            : "primary"
                      }
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* FAQ Section */}
      {faq.length > 0 && (
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 6, textAlign: "center" }}>
            Frequently Asked Questions
          </Typography>
          <Box sx={{ maxWidth: 900, mx: "auto" }}>
            {faq.map((item, idx) => (
              <Accordion key={idx} elevation={1}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {item.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="text.secondary">{item.answer}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Container>
      )}

      {/* Footer CTA */}
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: 8,
          textAlign: "center",
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
            Ready to Build Something Amazing?
          </Typography>
          <Button
            variant="contained"
            size="large"
            href={`/events/${event._id}/register`}
            sx={{
              bgcolor: "white",
              color: "primary.main",
              px: 6,
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: 700,
              "&:hover": { bgcolor: "grey.100" },
            }}
          >
            Register Now
          </Button>
        </Container>
      </Box>
    </Box>
  );
}

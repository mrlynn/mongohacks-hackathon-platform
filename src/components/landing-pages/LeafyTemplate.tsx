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
import { mongoColors } from "@/styles/theme";

interface LeafyTemplateProps {
  event: IEvent;
}

export default function LeafyTemplate({ event }: LeafyTemplateProps) {
  const { landingPage } = event;
  const hero = landingPage?.customContent?.hero || {};
  const about = landingPage?.customContent?.about || event.description;
  const prizes = landingPage?.customContent?.prizes || [];
  const schedule = landingPage?.customContent?.schedule || [];
  const sponsors = landingPage?.customContent?.sponsors || [];
  const faq = landingPage?.customContent?.faq || [];

  return (
    <Box sx={{ bgcolor: "#FFFFFF" }}>
      {/* Hero Section — Clean white, no gradient */}
      <Box
        sx={{
          position: "relative",
          py: { xs: 10, md: 16 },
          textAlign: "center",
          bgcolor: "#FFFFFF",
          overflow: "hidden",
          ...(hero.backgroundImage && {
            backgroundImage: `url(${hero.backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: "rgba(255, 255, 255, 0.92)",
            },
          }),
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          {/* Green accent bar */}
          <Box
            sx={{
              width: 80,
              height: 4,
              bgcolor: mongoColors.green.main,
              borderRadius: 2,
              mx: "auto",
              mb: 4,
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              color: mongoColors.slate.main,
              letterSpacing: "-0.02em",
            }}
          >
            {hero.headline || event.name}
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              maxWidth: 800,
              mx: "auto",
              color: "#3D4F58",
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            {hero.subheadline || event.theme}
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              mb: 5,
              flexWrap: "wrap",
            }}
          >
            <Chip
              label={`${new Date(event.startDate).toLocaleDateString()} - ${new Date(event.endDate).toLocaleDateString()}`}
              variant="outlined"
              sx={{
                fontWeight: 600,
                color: mongoColors.green.main,
                borderColor: mongoColors.green.main,
                fontSize: "0.9rem",
              }}
            />
            <Chip
              label={event.location}
              variant="outlined"
              sx={{
                fontWeight: 600,
                color: mongoColors.green.main,
                borderColor: mongoColors.green.main,
                fontSize: "0.9rem",
              }}
            />
          </Box>
          <Button
            variant="contained"
            size="large"
            href={`/events/${event._id}/register`}
            sx={{
              background: `linear-gradient(135deg, ${mongoColors.green.main} 0%, ${mongoColors.green.dark} 100%)`,
              color: "white",
              px: 6,
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: 600,
              borderRadius: 2,
              boxShadow: "0 4px 14px rgba(0, 104, 74, 0.3)",
              "&:hover": {
                boxShadow: "0 6px 20px rgba(0, 104, 74, 0.4)",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease",
            }}
          >
            {hero.ctaText || "Register Now"}
          </Button>
        </Container>
      </Box>

      {/* About Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Box
            sx={{
              width: 48,
              height: 4,
              bgcolor: mongoColors.green.main,
              borderRadius: 2,
              mx: "auto",
              mb: 3,
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: mongoColors.slate.main,
            }}
          >
            About
          </Typography>
        </Box>
        <Typography
          variant="body1"
          sx={{
            fontSize: "1.125rem",
            lineHeight: 1.9,
            maxWidth: 800,
            mx: "auto",
            color: "#3D4F58",
            textAlign: "center",
          }}
        >
          {about}
        </Typography>
      </Container>

      {/* Prizes Section */}
      {prizes.length > 0 && (
        <Box sx={{ bgcolor: "#F9FBFA", py: 10 }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: "center", mb: 6 }}>
              <TrophyIcon
                sx={{ fontSize: 44, color: mongoColors.green.main, mb: 2 }}
              />
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, color: mongoColors.slate.main }}
              >
                Prizes
              </Typography>
            </Box>
            <Grid container spacing={4}>
              {prizes.map((prize, idx) => (
                <Grid key={idx} size={{ xs: 12, md: 4 }}>
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      textAlign: "center",
                      border: "1px solid #E7EEEC",
                      borderRadius: 3,
                      borderTop: `3px solid ${mongoColors.green.main}`,
                      transition: "border-color 0.2s ease",
                      "&:hover": {
                        borderColor: mongoColors.green.main,
                      },
                    }}
                  >
                    <CardContent sx={{ py: 5 }}>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          mb: 2,
                          color: mongoColors.slate.main,
                        }}
                      >
                        {prize.title}
                      </Typography>
                      {prize.value && (
                        <Typography
                          variant="h4"
                          sx={{
                            color: mongoColors.green.main,
                            fontWeight: 700,
                            mb: 2,
                          }}
                        >
                          {prize.value}
                        </Typography>
                      )}
                      <Typography variant="body2" sx={{ color: "#3D4F58" }}>
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
        <Container maxWidth="lg" sx={{ py: 10 }}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <ScheduleIcon
              sx={{ fontSize: 44, color: mongoColors.green.main, mb: 2 }}
            />
            <Typography
              variant="h3"
              sx={{ fontWeight: 700, color: mongoColors.slate.main }}
            >
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
                  position: "relative",
                  pb: idx < schedule.length - 1 ? 4 : 0,
                  mb: idx < schedule.length - 1 ? 0 : 0,
                }}
              >
                {/* Timeline */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    minWidth: 24,
                  }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: mongoColors.green.main,
                      flexShrink: 0,
                      mt: 0.5,
                    }}
                  />
                  {idx < schedule.length - 1 && (
                    <Box
                      sx={{
                        width: 1,
                        flexGrow: 1,
                        bgcolor: "#E7EEEC",
                        mt: 1,
                      }}
                    />
                  )}
                </Box>
                {/* Content */}
                <Box sx={{ pb: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: mongoColors.green.main,
                      mb: 0.5,
                    }}
                  >
                    {item.time}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: mongoColors.slate.main,
                      mb: 0.5,
                    }}
                  >
                    {item.title}
                  </Typography>
                  {item.description && (
                    <Typography variant="body2" sx={{ color: "#3D4F58" }}>
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
        <Box sx={{ bgcolor: "#F9FBFA", py: 10 }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: "center", mb: 6 }}>
              <BusinessIcon
                sx={{ fontSize: 44, color: mongoColors.green.main, mb: 2 }}
              />
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, color: mongoColors.slate.main }}
              >
                Sponsors
              </Typography>
            </Box>
            <Grid container spacing={4} justifyContent="center">
              {sponsors.map((sponsor, idx) => (
                <Grid key={idx} size={{ xs: 6, sm: 4, md: 3 }}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: "center",
                      border: "1px solid #E7EEEC",
                      borderRadius: 3,
                    }}
                  >
                    {sponsor.logo ? (
                      <img
                        src={sponsor.logo}
                        alt={sponsor.name}
                        style={{
                          maxWidth: "100%",
                          height: 60,
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: mongoColors.slate.main,
                        }}
                      >
                        {sponsor.name}
                      </Typography>
                    )}
                    <Chip
                      label={sponsor.tier}
                      size="small"
                      sx={{
                        mt: 2,
                        fontWeight: 600,
                        bgcolor:
                          sponsor.tier === "Gold"
                            ? "#FFB302"
                            : sponsor.tier === "Silver"
                              ? "#B8C4C2"
                              : mongoColors.green.main,
                        color:
                          sponsor.tier === "Gold"
                            ? mongoColors.slate.main
                            : "white",
                      }}
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* FAQ Section — Callout-inspired */}
      {faq.length > 0 && (
        <Container maxWidth="lg" sx={{ py: 10 }}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Box
              sx={{
                width: 48,
                height: 4,
                bgcolor: mongoColors.green.main,
                borderRadius: 2,
                mx: "auto",
                mb: 3,
              }}
            />
            <Typography
              variant="h3"
              sx={{ fontWeight: 700, color: mongoColors.slate.main }}
            >
              Frequently Asked Questions
            </Typography>
          </Box>
          <Box sx={{ maxWidth: 900, mx: "auto" }}>
            {faq.map((item, idx) => (
              <Accordion
                key={idx}
                elevation={0}
                sx={{
                  mb: 2,
                  borderLeft: `3px solid ${mongoColors.green.light}`,
                  bgcolor: "rgba(0, 104, 74, 0.03)",
                  border: "1px solid #E7EEEC",
                  borderLeftWidth: 3,
                  borderLeftColor: mongoColors.green.light,
                  borderRadius: "8px !important",
                  "&:before": { display: "none" },
                  overflow: "hidden",
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMoreIcon
                      sx={{ color: mongoColors.green.main }}
                    />
                  }
                  sx={{
                    "&:hover": {
                      bgcolor: "rgba(0, 104, 74, 0.04)",
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: mongoColors.slate.main,
                      fontSize: "1rem",
                    }}
                  >
                    {item.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <Typography
                    sx={{ color: "#3D4F58", lineHeight: 1.8 }}
                  >
                    {item.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Container>
      )}

      {/* Footer CTA */}
      <Box
        sx={{
          bgcolor: mongoColors.green.main,
          color: "white",
          py: 10,
          textAlign: "center",
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            sx={{ fontWeight: 700, mb: 2 }}
          >
            Ready to Build Something Amazing?
          </Typography>
          <Typography
            variant="h6"
            sx={{ mb: 4, opacity: 0.9, fontWeight: 400 }}
          >
            Join developers from around the world
          </Typography>
          <Button
            variant="outlined"
            size="large"
            href={`/events/${event._id}/register`}
            sx={{
              borderColor: "white",
              color: "white",
              borderWidth: 2,
              px: 6,
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: 600,
              borderRadius: 2,
              "&:hover": {
                bgcolor: "white",
                color: mongoColors.green.main,
                borderColor: "white",
                borderWidth: 2,
              },
              transition: "all 0.2s ease",
            }}
          >
            Register Now
          </Button>
        </Container>
      </Box>
    </Box>
  );
}

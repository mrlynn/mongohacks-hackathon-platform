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
  Bolt as BoltIcon,
} from "@mui/icons-material";
import { IEvent } from "@/lib/db/models/Event";

interface BoldTemplateProps {
  event: IEvent;
}

export default function BoldTemplate({ event }: BoldTemplateProps) {
  const { landingPage } = event;
  const hero = landingPage?.customContent?.hero || {};
  const about = landingPage?.customContent?.about || event.description;
  const prizes = landingPage?.customContent?.prizes || [];
  const schedule = landingPage?.customContent?.schedule || [];
  const faq = landingPage?.customContent?.faq || [];
  const partners = (event as any).partners || [];
  const partnerPrizes = (event as any).partnerPrizes || [];

  return (
    <Box>
      {/* Hero Section - Bold & Vibrant */}
      <Box
        sx={{
          background: hero.backgroundImage
            ? `linear-gradient(135deg, rgba(0, 104, 249, 0.95), rgba(176, 57, 248, 0.95)), url(${hero.backgroundImage})`
            : "linear-gradient(135deg, #0068F9 0%, #B039F8 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
          py: { xs: 12, md: 20 },
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <BoltIcon sx={{ fontSize: 80, mb: 3, animation: "pulse 2s infinite" }} />
          <Typography
            variant="h1"
            sx={{
              fontWeight: 900,
              mb: 3,
              fontSize: { xs: "3rem", md: "5rem" },
              textShadow: "0 4px 12px rgba(0,0,0,0.3)",
              letterSpacing: "-0.02em",
            }}
          >
            {hero.headline || event.name}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              mb: 5,
              fontWeight: 600,
              opacity: 0.95,
              maxWidth: 900,
              mx: "auto",
            }}
          >
            {hero.subheadline || event.theme}
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              mb: 4,
              flexWrap: "wrap",
            }}
          >
            <Chip
              label={`${new Date(event.startDate).toLocaleDateString()} - ${new Date(event.endDate).toLocaleDateString()}`}
              sx={{
                bgcolor: "rgba(255,255,255,0.25)",
                color: "white",
                fontWeight: 700,
                fontSize: "1rem",
                py: 3,
                px: 2,
                backdropFilter: "blur(10px)",
              }}
            />
            <Chip
              label={event.location}
              sx={{
                bgcolor: "rgba(255,255,255,0.25)",
                color: "white",
                fontWeight: 700,
                fontSize: "1rem",
                py: 3,
                px: 2,
                backdropFilter: "blur(10px)",
              }}
            />
          </Box>
          <Button
            variant="contained"
            size="large"
            href={`/events/${event._id}/register`}
            sx={{
              bgcolor: "white",
              color: "#0068F9",
              px: 8,
              py: 2,
              fontSize: "1.3rem",
              fontWeight: 900,
              borderRadius: 50,
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              "&:hover": {
                bgcolor: "#f0f0f0",
                transform: "scale(1.05)",
                boxShadow: "0 12px 32px rgba(0,0,0,0.3)",
              },
              transition: "all 0.3s ease",
            }}
          >
            {hero.ctaText || "Register Now"}
          </Button>
        </Container>
      </Box>

      {/* About Section - Angular Design */}
      <Box
        sx={{
          py: 10,
          background: "linear-gradient(to bottom, white, #f5f5f5)",
          clipPath: "polygon(0 5%, 100% 0, 100% 95%, 0 100%)",
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              mb: 4,
              textAlign: "center",
              color: "#0068F9",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            About
          </Typography>
          <Typography
            variant="h6"
            sx={{
              lineHeight: 2,
              maxWidth: 900,
              mx: "auto",
              textAlign: "center",
              color: "text.primary",
              fontWeight: 500,
            }}
          >
            {about}
          </Typography>
        </Container>
      </Box>

      {/* Prizes Section - Explosive Layout */}
      {prizes.length > 0 && (
        <Box sx={{ py: 10, bgcolor: "#0068F9", color: "white" }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: "center", mb: 8 }}>
              <TrophyIcon sx={{ fontSize: 64, mb: 2 }} />
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  mb: 2,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Win Big
              </Typography>
            </Box>
            <Grid container spacing={4}>
              {prizes.map((prize, idx) => (
                <Grid key={idx} size={{ xs: 12, md: 4 }}>
                  <Card
                    elevation={8}
                    sx={{
                      height: "100%",
                      textAlign: "center",
                      transform: idx === 0 ? "scale(1.1)" : "scale(1)",
                      transition: "transform 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.1)",
                      },
                      background:
                        idx === 0
                          ? "linear-gradient(135deg, #FFD700, #FFA500)"
                          : idx === 1
                            ? "linear-gradient(135deg, #C0C0C0, #A8A8A8)"
                            : "linear-gradient(135deg, #CD7F32, #B87333)",
                    }}
                  >
                    <CardContent sx={{ py: 5 }}>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 900, mb: 2, color: "white" }}
                      >
                        {prize.title}
                      </Typography>
                      {prize.value && (
                        <Typography
                          variant="h2"
                          sx={{
                            fontWeight: 900,
                            mb: 3,
                            color: "white",
                            textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                          }}
                        >
                          {prize.value}
                        </Typography>
                      )}
                      <Typography
                        variant="body1"
                        sx={{ color: "white", fontWeight: 600 }}
                      >
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

      {/* Schedule Section - Timeline Style */}
      {schedule.length > 0 && (
        <Container maxWidth="lg" sx={{ py: 10 }}>
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <ScheduleIcon sx={{ fontSize: 64, color: "#B039F8", mb: 2 }} />
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                mb: 2,
                color: "#0068F9",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
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
                  gap: 4,
                  mb: 4,
                  pb: 4,
                  borderLeft: "4px solid #0068F9",
                  pl: 3,
                  position: "relative",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    left: -10,
                    top: 0,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    bgcolor: "#0068F9",
                  },
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 900,
                    color: "#B039F8",
                    minWidth: 120,
                    textTransform: "uppercase",
                  }}
                >
                  {item.time}
                </Typography>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    {item.title}
                  </Typography>
                  {item.description && (
                    <Typography variant="body1" color="text.secondary">
                      {item.description}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      )}

      {/* Partners Section */}
      {partners.length > 0 && (
        <Box sx={{ bgcolor: "grey.50", py: 10 }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: "center", mb: 8 }}>
              <BusinessIcon sx={{ fontSize: 64, color: "#0068F9", mb: 2 }} />
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  color: "#0068F9",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Powered By
              </Typography>
            </Box>
            <Grid container spacing={4} justifyContent="center">
              {partners.map((partner: any, idx: number) => (
                <Grid key={partner._id || idx} size={{ xs: 6, sm: 4, md: 3 }}>
                  <Card
                    elevation={3}
                    sx={{
                      p: 3,
                      textAlign: "center",
                      height: "100%",
                      transition: "transform 0.3s ease",
                      "&:hover": { transform: "translateY(-8px)" },
                    }}
                  >
                    {partner.logo ? (
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        style={{
                          maxWidth: "100%",
                          height: 60,
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {partner.name}
                      </Typography>
                    )}
                    <Chip
                      label={partner.tier}
                      size="small"
                      sx={{
                        mt: 2,
                        fontWeight: 700,
                        bgcolor: "#0068F9",
                        color: "white",
                      }}
                    />
                    {partner.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 1.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {partner.description}
                      </Typography>
                    )}
                    {partner.website && (
                      <Button
                        size="small"
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          mt: 1,
                          textTransform: "none",
                          fontWeight: 700,
                          color: "#0068F9",
                        }}
                      >
                        Visit Website
                      </Button>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Partner Prizes */}
            {partnerPrizes.length > 0 && (
              <Box sx={{ mt: 8 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 900,
                    mb: 4,
                    textAlign: "center",
                    color: "#B039F8",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Partner Prizes
                </Typography>
                <Grid container spacing={4}>
                  {partnerPrizes.map((prize: any, idx: number) => (
                    <Grid key={idx} size={{ xs: 12, sm: 6, md: 4 }}>
                      <Card
                        elevation={4}
                        sx={{
                          height: "100%",
                          textAlign: "center",
                          transition: "transform 0.3s ease",
                          "&:hover": { transform: "scale(1.05)" },
                        }}
                      >
                        <CardContent sx={{ py: 4 }}>
                          <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
                            {prize.title}
                          </Typography>
                          {prize.value && (
                            <Typography
                              variant="h3"
                              sx={{ color: "#0068F9", fontWeight: 900, mb: 2 }}
                            >
                              {prize.value}
                            </Typography>
                          )}
                          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                            {prize.description}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: "#B039F8" }}>
                            Sponsored by {prize.partnerName}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Container>
        </Box>
      )}

      {/* FAQ Section */}
      {faq.length > 0 && (
        <Container maxWidth="lg" sx={{ py: 10 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              mb: 8,
              textAlign: "center",
              color: "#0068F9",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            FAQ
          </Typography>
          <Box sx={{ maxWidth: 900, mx: "auto" }}>
            {faq.map((item, idx) => (
              <Accordion key={idx} elevation={2} sx={{ mb: 2 }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    bgcolor: "grey.50",
                    "&:hover": { bgcolor: "grey.100" },
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {item.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 3 }}>
                  <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                    {item.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Container>
      )}

      {/* Footer CTA - Explosive */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #0068F9 0%, #B039F8 100%)",
          color: "white",
          py: 12,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              mb: 4,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Don't Wait. Build Now.
          </Typography>
          <Button
            variant="contained"
            size="large"
            href={`/events/${event._id}/register`}
            sx={{
              bgcolor: "white",
              color: "#0068F9",
              px: 8,
              py: 2,
              fontSize: "1.3rem",
              fontWeight: 900,
              borderRadius: 50,
              boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
              "&:hover": {
                bgcolor: "#f0f0f0",
                transform: "scale(1.1)",
                boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Register Now
          </Button>
        </Container>
      </Box>
    </Box>
  );
}

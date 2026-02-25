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
  Diversity3 as CommunityIcon,
} from "@mui/icons-material";
import { IEvent } from "@/lib/db/models/Event";
import { mongoColors } from "@/styles/theme";

interface CommunityTemplateProps {
  event: IEvent;
}

const accentColors = [
  mongoColors.green.light, // #13AA52
  mongoColors.blue.main,   // #0068F9
  mongoColors.purple.main, // #B039F8
];

export default function CommunityTemplate({ event }: CommunityTemplateProps) {
  const { landingPage } = event;
  const hero = landingPage?.customContent?.hero || {};
  const about = landingPage?.customContent?.about || event.description;
  const prizes = landingPage?.customContent?.prizes || [];
  const schedule = landingPage?.customContent?.schedule || [];
  const sponsors = landingPage?.customContent?.sponsors || [];
  const faq = landingPage?.customContent?.faq || [];

  return (
    <Box>
      {/* Hero Section — Vibrant gradient with decorative shapes */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          py: { xs: 10, md: 18 },
          textAlign: "center",
          color: "white",
          background: hero.backgroundImage
            ? `linear-gradient(135deg, rgba(0, 104, 74, 0.9), rgba(0, 104, 249, 0.9)), url(${hero.backgroundImage})`
            : `linear-gradient(135deg, ${mongoColors.green.main} 0%, ${mongoColors.blue.main} 100%)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          // Decorative blob shapes
          "&::before": {
            content: '""',
            position: "absolute",
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.06)",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: -150,
            left: -80,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.04)",
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <CommunityIcon sx={{ fontSize: 64, mb: 3, opacity: 0.9 }} />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 3,
              fontSize: { xs: "2.5rem", md: "4rem" },
              letterSpacing: "-0.02em",
            }}
          >
            {hero.headline || event.name}
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 5,
              opacity: 0.9,
              maxWidth: 800,
              mx: "auto",
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
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                fontWeight: 600,
                fontSize: "0.9rem",
                borderRadius: 50,
                backdropFilter: "blur(8px)",
              }}
            />
            <Chip
              label={event.location}
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                fontWeight: 600,
                fontSize: "0.9rem",
                borderRadius: 50,
                backdropFilter: "blur(8px)",
              }}
            />
          </Box>
          <Button
            variant="contained"
            size="large"
            href={`/events/${event._id}/register`}
            sx={{
              bgcolor: "white",
              color: mongoColors.green.main,
              px: 6,
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: 700,
              borderRadius: 50,
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
              "&:hover": {
                bgcolor: "#f0f0f0",
                transform: "scale(1.05)",
                boxShadow: "0 12px 32px rgba(0, 0, 0, 0.2)",
              },
              transition: "all 0.3s ease",
            }}
          >
            {hero.ctaText || "Register Now"}
          </Button>
        </Container>
      </Box>

      {/* About Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: mongoColors.slate.main,
              display: "inline-block",
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: -8,
                left: "50%",
                transform: "translateX(-50%)",
                width: 60,
                height: 4,
                borderRadius: 2,
                background: mongoColors.purple.main,
              },
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
            color: "#5C6C75",
            textAlign: "center",
            mt: 4,
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
                sx={{ fontSize: 48, color: mongoColors.green.light, mb: 2 }}
              />
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, color: mongoColors.slate.main }}
              >
                Prizes
              </Typography>
            </Box>
            <Grid container spacing={4}>
              {prizes.map((prize, idx) => {
                const accent = accentColors[idx % 3];
                return (
                  <Grid key={idx} size={{ xs: 12, md: 4 }}>
                    <Card
                      elevation={0}
                      sx={{
                        height: "100%",
                        textAlign: "center",
                        borderRadius: 4,
                        border: "1px solid #E7EEEC",
                        borderTop: `4px solid ${accent}`,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: `0 8px 24px ${accent}20`,
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
                              color: accent,
                              fontWeight: 800,
                              mb: 2,
                            }}
                          >
                            {prize.value}
                          </Typography>
                        )}
                        <Typography
                          variant="body2"
                          sx={{ color: "#5C6C75" }}
                        >
                          {prize.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Container>
        </Box>
      )}

      {/* Schedule Section — Numbered colored stepper */}
      {schedule.length > 0 && (
        <Container maxWidth="lg" sx={{ py: 10 }}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <ScheduleIcon
              sx={{ fontSize: 48, color: mongoColors.blue.main, mb: 2 }}
            />
            <Typography
              variant="h3"
              sx={{ fontWeight: 700, color: mongoColors.slate.main }}
            >
              Schedule
            </Typography>
          </Box>
          <Box sx={{ maxWidth: 800, mx: "auto" }}>
            {schedule.map((item, idx) => {
              const accent = accentColors[idx % 3];
              return (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    gap: 3,
                    position: "relative",
                    pb: idx < schedule.length - 1 ? 0 : 0,
                    mb: idx < schedule.length - 1 ? 3 : 0,
                  }}
                >
                  {/* Numbered circle + connecting line */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      minWidth: 44,
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        bgcolor: accent,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: 700,
                        fontSize: "1rem",
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </Box>
                    {idx < schedule.length - 1 && (
                      <Box
                        sx={{
                          width: 0,
                          flexGrow: 1,
                          borderLeft: "2px dashed #E7EEEC",
                          mt: 1,
                          minHeight: 32,
                        }}
                      />
                    )}
                  </Box>
                  {/* Content */}
                  <Box sx={{ pt: 0.5, pb: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: accent,
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
                      <Typography variant="body2" sx={{ color: "#5C6C75" }}>
                        {item.description}
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Container>
      )}

      {/* Sponsors Section */}
      {sponsors.length > 0 && (
        <Box sx={{ bgcolor: "#F9FBFA", py: 10 }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: "center", mb: 6 }}>
              <BusinessIcon
                sx={{ fontSize: 48, color: mongoColors.purple.main, mb: 2 }}
              />
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, color: mongoColors.slate.main }}
              >
                Sponsors
              </Typography>
            </Box>
            <Grid container spacing={4} justifyContent="center">
              {sponsors.map((sponsor, idx) => {
                const accent = accentColors[idx % 3];
                return (
                  <Grid key={idx} size={{ xs: 6, sm: 4, md: 3 }}>
                    <Card
                      elevation={0}
                      sx={{
                        p: 3,
                        textAlign: "center",
                        borderRadius: 4,
                        border: "1px solid #E7EEEC",
                        borderLeft: `4px solid ${accent}`,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 16px rgba(0, 30, 43, 0.08)",
                        },
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
                          bgcolor: `${accent}18`,
                          color: accent,
                          border: `1px solid ${accent}40`,
                        }}
                      />
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Container>
        </Box>
      )}

      {/* FAQ Section — Colorful rotating accents */}
      {faq.length > 0 && (
        <Container maxWidth="lg" sx={{ py: 10 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 6,
              textAlign: "center",
              color: mongoColors.slate.main,
            }}
          >
            Frequently Asked Questions
          </Typography>
          <Box sx={{ maxWidth: 900, mx: "auto" }}>
            {faq.map((item, idx) => {
              const accent = accentColors[idx % 3];
              return (
                <Accordion
                  key={idx}
                  elevation={0}
                  sx={{
                    mb: 2,
                    border: "1px solid #E7EEEC",
                    borderLeft: `4px solid ${accent}`,
                    borderRadius: "12px !important",
                    bgcolor: `${accent}06`,
                    "&:before": { display: "none" },
                    overflow: "hidden",
                    "&:hover": {
                      bgcolor: `${accent}0A`,
                    },
                    transition: "background-color 0.2s ease",
                  }}
                >
                  <AccordionSummary
                    expandIcon={
                      <ExpandMoreIcon sx={{ color: accent }} />
                    }
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
                      sx={{ color: "#5C6C75", lineHeight: 1.8 }}
                    >
                      {item.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        </Container>
      )}

      {/* Footer CTA — Full MongoDB rainbow gradient */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          py: 12,
          textAlign: "center",
          color: "white",
          background: `linear-gradient(135deg, ${mongoColors.green.light} 0%, ${mongoColors.blue.main} 50%, ${mongoColors.purple.main} 100%)`,
          // Decorative blob
          "&::before": {
            content: '""',
            position: "absolute",
            top: -80,
            right: -60,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.06)",
          },
        }}
      >
        <Container
          maxWidth="lg"
          sx={{ position: "relative", zIndex: 1 }}
        >
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
            Join the Community
          </Typography>
          <Typography
            variant="h6"
            sx={{ mb: 4, opacity: 0.9, fontWeight: 400 }}
          >
            Build, learn, and connect with developers worldwide
          </Typography>
          <Button
            variant="contained"
            size="large"
            href={`/events/${event._id}/register`}
            sx={{
              bgcolor: "white",
              color: mongoColors.green.main,
              px: 6,
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: 700,
              borderRadius: 50,
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
              "&:hover": {
                bgcolor: "#f0f0f0",
                transform: "scale(1.05)",
                boxShadow: "0 12px 32px rgba(0, 0, 0, 0.2)",
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

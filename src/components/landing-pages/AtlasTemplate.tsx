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
  Hub as HubIcon,
} from "@mui/icons-material";
import { IEvent } from "@/lib/db/models/Event";
import { mongoColors } from "@/styles/theme";

interface AtlasTemplateProps {
  event: IEvent;
}

const glassCard = {
  bgcolor: "rgba(17, 39, 51, 0.6)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(19, 170, 82, 0.15)",
  borderRadius: 4,
};

const accentColors = [mongoColors.green.light, mongoColors.blue.main, mongoColors.purple.main];

export default function AtlasTemplate({ event }: AtlasTemplateProps) {
  const { landingPage } = event;
  const hero = landingPage?.customContent?.hero || {};
  const about = landingPage?.customContent?.about || event.description;
  const prizes = landingPage?.customContent?.prizes || [];
  const schedule = landingPage?.customContent?.schedule || [];
  const faq = landingPage?.customContent?.faq || [];
  const partners = (event as any).partners || [];
  const partnerPrizes = (event as any).partnerPrizes || [];

  return (
    <Box sx={{ bgcolor: mongoColors.slate.main, color: "white" }}>
      {/* Hero Section — Dark with dot-grid mesh */}
      <Box
        sx={{
          position: "relative",
          py: { xs: 12, md: 18 },
          textAlign: "center",
          overflow: "hidden",
          background: hero.backgroundImage
            ? `linear-gradient(to bottom, rgba(0, 30, 43, 0.85), rgba(0, 30, 43, 0.95)), url(${hero.backgroundImage})`
            : mongoColors.slate.main,
          backgroundSize: "cover",
          backgroundPosition: "center",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(19, 170, 82, 0.08) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(19, 170, 82, 0.12) 0%, transparent 60%)",
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <HubIcon
            sx={{
              fontSize: 56,
              color: mongoColors.green.light,
              mb: 3,
              opacity: 0.9,
            }}
          />
          <Typography
            variant="h1"
            sx={{
              fontWeight: 800,
              mb: 3,
              fontSize: { xs: "2.5rem", md: "4.5rem" },
              letterSpacing: "-0.02em",
              color: "white",
            }}
          >
            {hero.headline || event.name}
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 5,
              opacity: 0.85,
              maxWidth: 800,
              mx: "auto",
              color: "#B8C4C2",
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
                bgcolor: "rgba(19, 170, 82, 0.1)",
                color: mongoColors.green.light,
                fontWeight: 600,
                fontSize: "0.9rem",
                border: "1px solid rgba(19, 170, 82, 0.3)",
                backdropFilter: "blur(8px)",
              }}
            />
            <Chip
              label={event.location}
              sx={{
                bgcolor: "rgba(19, 170, 82, 0.1)",
                color: mongoColors.green.light,
                fontWeight: 600,
                fontSize: "0.9rem",
                border: "1px solid rgba(19, 170, 82, 0.3)",
                backdropFilter: "blur(8px)",
              }}
            />
          </Box>
          <Button
            variant="contained"
            size="large"
            href={`/events/${event._id}/register`}
            sx={{
              bgcolor: mongoColors.green.light,
              color: mongoColors.slate.main,
              px: 6,
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: 700,
              borderRadius: 2,
              boxShadow: `0 0 30px rgba(19, 170, 82, 0.35)`,
              "&:hover": {
                bgcolor: "#10C054",
                boxShadow: `0 0 40px rgba(19, 170, 82, 0.5)`,
                transform: "translateY(-2px)",
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
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: mongoColors.blue.main,
              mx: "auto",
              mb: 2,
            }}
          />
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            About
          </Typography>
        </Box>
        <Card
          elevation={0}
          sx={{
            ...glassCard,
            p: { xs: 3, md: 5 },
            maxWidth: 900,
            mx: "auto",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              lineHeight: 1.9,
              color: "#B8C4C2",
              fontWeight: 400,
              textAlign: "center",
            }}
          >
            {about}
          </Typography>
        </Card>
      </Container>

      {/* Prizes Section */}
      {prizes.length > 0 && (
        <Box sx={{ py: 10, bgcolor: "#112733" }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: "center", mb: 8 }}>
              <TrophyIcon
                sx={{ fontSize: 52, color: mongoColors.green.light, mb: 2 }}
              />
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                Prizes
              </Typography>
            </Box>
            <Grid container spacing={4}>
              {prizes.map((prize, idx) => (
                <Grid key={idx} size={{ xs: 12, md: 4 }}>
                  <Card
                    elevation={0}
                    sx={{
                      ...glassCard,
                      height: "100%",
                      textAlign: "center",
                      position: "relative",
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: mongoColors.green.light,
                        transform: "translateY(-4px)",
                        boxShadow: `0 8px 30px rgba(19, 170, 82, 0.15)`,
                      },
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: accentColors[idx % 3],
                      },
                    }}
                  >
                    <CardContent sx={{ py: 5, position: "relative" }}>
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 700, mb: 2, color: "white" }}
                      >
                        {prize.title}
                      </Typography>
                      {prize.value && (
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: 800,
                            mb: 3,
                            color: accentColors[idx % 3],
                            textShadow: `0 0 20px ${accentColors[idx % 3]}66`,
                          }}
                        >
                          {prize.value}
                        </Typography>
                      )}
                      <Typography
                        variant="body1"
                        sx={{ color: "#B8C4C2" }}
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

      {/* Schedule Section — Connected-node timeline */}
      {schedule.length > 0 && (
        <Container maxWidth="lg" sx={{ py: 10 }}>
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <ScheduleIcon
              sx={{ fontSize: 52, color: mongoColors.green.light, mb: 2 }}
            />
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
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
                  pb: idx < schedule.length - 1 ? 0 : 0,
                  mb: idx < schedule.length - 1 ? 4 : 0,
                }}
              >
                {/* Timeline node */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    minWidth: 32,
                  }}
                >
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      bgcolor:
                        idx === 0
                          ? mongoColors.green.light
                          : "transparent",
                      border: `2px solid ${mongoColors.green.light}`,
                      flexShrink: 0,
                      mt: 1,
                      boxShadow:
                        idx === 0
                          ? `0 0 12px rgba(19, 170, 82, 0.4)`
                          : "none",
                    }}
                  />
                  {idx < schedule.length - 1 && (
                    <Box
                      sx={{
                        width: 1,
                        flexGrow: 1,
                        bgcolor: "rgba(19, 170, 82, 0.3)",
                        mt: 1,
                        minHeight: 40,
                      }}
                    />
                  )}
                </Box>
                {/* Content card */}
                <Card
                  elevation={0}
                  sx={{
                    ...glassCard,
                    flex: 1,
                    p: 2.5,
                    mb: 0,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: mongoColors.blue.main,
                      mb: 0.5,
                    }}
                  >
                    {item.time}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "white", mb: 0.5 }}
                  >
                    {item.title}
                  </Typography>
                  {item.description && (
                    <Typography variant="body2" sx={{ color: "#B8C4C2" }}>
                      {item.description}
                    </Typography>
                  )}
                </Card>
              </Box>
            ))}
          </Box>
        </Container>
      )}

      {/* Partners Section */}
      {partners.length > 0 && (
        <Box sx={{ py: 10, bgcolor: "#112733" }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: "center", mb: 8 }}>
              <BusinessIcon
                sx={{ fontSize: 52, color: mongoColors.green.light, mb: 2 }}
              />
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                Partners
              </Typography>
            </Box>
            <Grid container spacing={4} justifyContent="center">
              {partners.map((partner: any, idx: number) => {
                const tierColor =
                  partner.tier === "platinum" || partner.tier === "gold"
                    ? "#FFB302"
                    : partner.tier === "silver"
                      ? "#B8C4C2"
                      : mongoColors.green.light;
                return (
                  <Grid key={partner._id || idx} size={{ xs: 6, sm: 4, md: 3 }}>
                    <Card
                      elevation={0}
                      sx={{
                        ...glassCard,
                        p: 3,
                        textAlign: "center",
                        height: "100%",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          borderColor: mongoColors.green.light,
                          boxShadow: `0 0 20px rgba(19, 170, 82, 0.15)`,
                        },
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
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, color: "#B8C4C2" }}
                        >
                          {partner.name}
                        </Typography>
                      )}
                      <Chip
                        label={partner.tier}
                        size="small"
                        sx={{
                          mt: 2,
                          fontWeight: 600,
                          bgcolor: "transparent",
                          color: tierColor,
                          border: `1px solid ${tierColor}`,
                        }}
                      />
                      {partner.description && (
                        <Typography
                          variant="body2"
                          sx={{
                            mt: 1.5,
                            color: "#B8C4C2",
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
                            color: mongoColors.green.light,
                          }}
                        >
                          Visit Website
                        </Button>
                      )}
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            {/* Partner Prizes */}
            {partnerPrizes.length > 0 && (
              <Box sx={{ mt: 8 }}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, mb: 4, textAlign: "center", color: "white" }}
                >
                  Partner Prizes
                </Typography>
                <Grid container spacing={4}>
                  {partnerPrizes.map((prize: any, idx: number) => (
                    <Grid key={idx} size={{ xs: 12, sm: 6, md: 4 }}>
                      <Card
                        elevation={0}
                        sx={{
                          ...glassCard,
                          height: "100%",
                          textAlign: "center",
                          position: "relative",
                          overflow: "hidden",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            borderColor: mongoColors.green.light,
                            transform: "translateY(-4px)",
                            boxShadow: `0 8px 30px rgba(19, 170, 82, 0.15)`,
                          },
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 3,
                            background: accentColors[idx % 3],
                          },
                        }}
                      >
                        <CardContent sx={{ py: 4, position: "relative" }}>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 700, mb: 1, color: "white" }}
                          >
                            {prize.title}
                          </Typography>
                          {prize.value && (
                            <Typography
                              variant="h4"
                              sx={{
                                fontWeight: 800,
                                mb: 2,
                                color: accentColors[idx % 3],
                                textShadow: `0 0 20px ${accentColors[idx % 3]}66`,
                              }}
                            >
                              {prize.value}
                            </Typography>
                          )}
                          <Typography variant="body2" sx={{ color: "#B8C4C2", mb: 1 }}>
                            {prize.description}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#B8C4C2", opacity: 0.7 }}>
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
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 6,
              textAlign: "center",
            }}
          >
            Frequently Asked Questions
          </Typography>
          <Box sx={{ maxWidth: 900, mx: "auto" }}>
            {faq.map((item, idx) => (
              <Accordion
                key={idx}
                elevation={0}
                sx={{
                  ...glassCard,
                  borderColor: `rgba(0, 104, 249, 0.2)`,
                  mb: 2,
                  "&:before": { display: "none" },
                  "&:hover": {
                    borderColor: mongoColors.blue.main,
                  },
                  transition: "border-color 0.2s ease",
                  overflow: "hidden",
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMoreIcon sx={{ color: mongoColors.blue.main }} />
                  }
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: "white",
                      fontSize: "1rem",
                    }}
                  >
                    {item.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <Typography
                    sx={{ color: "#B8C4C2", lineHeight: 1.8 }}
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
          py: 12,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(135deg, ${mongoColors.slate.main} 0%, #112733 50%, ${mongoColors.slate.main} 100%)`,
          "&::before": {
            content: '""',
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(19, 170, 82, 0.12) 0%, transparent 70%)`,
          },
        }}
      >
        <Container
          maxWidth="lg"
          sx={{ position: "relative", zIndex: 1 }}
        >
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            Ready to Build?
          </Typography>
          <Typography
            variant="h6"
            sx={{ mb: 4, color: "#B8C4C2", fontWeight: 400 }}
          >
            Join the hackathon and ship something incredible
          </Typography>
          <Button
            variant="contained"
            size="large"
            href={`/events/${event._id}/register`}
            sx={{
              bgcolor: mongoColors.green.light,
              color: mongoColors.slate.main,
              px: 6,
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: 700,
              borderRadius: 2,
              boxShadow: `0 0 30px rgba(19, 170, 82, 0.35)`,
              "&:hover": {
                bgcolor: "#10C054",
                boxShadow: `0 0 40px rgba(19, 170, 82, 0.5)`,
                transform: "translateY(-2px)",
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

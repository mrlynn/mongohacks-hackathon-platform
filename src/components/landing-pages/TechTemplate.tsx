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
  Code as CodeIcon,
  Terminal as TerminalIcon,
} from "@mui/icons-material";
import { IEvent } from "@/lib/db/models/Event";

interface TechTemplateProps {
  event: IEvent;
}

export default function TechTemplate({ event }: TechTemplateProps) {
  const { landingPage } = event;
  const hero = landingPage?.customContent?.hero || {};
  const about = landingPage?.customContent?.about || event.description;
  const prizes = landingPage?.customContent?.prizes || [];
  const schedule = landingPage?.customContent?.schedule || [];
  const sponsors = landingPage?.customContent?.sponsors || [];
  const faq = landingPage?.customContent?.faq || [];

  return (
    <Box sx={{ bgcolor: "#0a0e27", color: "white" }}>
      {/* Hero Section - Dark Tech */}
      <Box
        sx={{
          background: hero.backgroundImage
            ? `linear-gradient(to bottom, rgba(10, 14, 39, 0.8), rgba(10, 14, 39, 0.95)), url(${hero.backgroundImage})`
            : "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          py: { xs: 12, md: 18 },
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          borderBottom: "2px solid #00ED64",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 50% 0%, rgba(0, 237, 100, 0.15) 0%, transparent 50%)",
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 3 }}>
            <CodeIcon sx={{ fontSize: 60, color: "#00ED64" }} />
            <TerminalIcon sx={{ fontSize: 60, color: "#00ED64" }} />
          </Box>
          <Typography
            variant="h1"
            sx={{
              fontWeight: 700,
              mb: 3,
              fontSize: { xs: "2.5rem", md: "4.5rem" },
              fontFamily: "'Courier New', monospace",
              color: "#00ED64",
              textShadow: "0 0 20px rgba(0, 237, 100, 0.5)",
              letterSpacing: "-0.02em",
            }}
          >
            {`> ${hero.headline || event.name}_`}
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 5,
              opacity: 0.9,
              maxWidth: 800,
              mx: "auto",
              fontFamily: "'Courier New', monospace",
              color: "#B0FFB0",
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
              label={`${new Date(event.startDate).toLocaleDateString()} → ${new Date(event.endDate).toLocaleDateString()}`}
              sx={{
                bgcolor: "rgba(0, 237, 100, 0.15)",
                color: "#00ED64",
                fontWeight: 600,
                fontSize: "0.9rem",
                border: "1px solid #00ED64",
                fontFamily: "'Courier New', monospace",
              }}
            />
            <Chip
              label={event.location}
              sx={{
                bgcolor: "rgba(0, 237, 100, 0.15)",
                color: "#00ED64",
                fontWeight: 600,
                fontSize: "0.9rem",
                border: "1px solid #00ED64",
                fontFamily: "'Courier New', monospace",
              }}
            />
          </Box>
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: "#00ED64",
              color: "#0a0e27",
              px: 6,
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: 700,
              fontFamily: "'Courier New', monospace",
              border: "2px solid #00ED64",
              boxShadow: "0 0 30px rgba(0, 237, 100, 0.4)",
              "&:hover": {
                bgcolor: "#00c753",
                boxShadow: "0 0 50px rgba(0, 237, 100, 0.6)",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            {`$ ${hero.ctaText || "register_now"}`}
          </Button>
        </Container>
      </Box>

      {/* About Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box
          sx={{
            p: 4,
            border: "2px solid #00ED64",
            borderRadius: 2,
            bgcolor: "rgba(0, 237, 100, 0.05)",
            position: "relative",
            "&::before": {
              content: '"> About"',
              position: "absolute",
              top: -12,
              left: 20,
              bgcolor: "#0a0e27",
              px: 2,
              color: "#00ED64",
              fontFamily: "'Courier New', monospace",
              fontWeight: 600,
            },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              lineHeight: 1.9,
              color: "#B0FFB0",
              fontFamily: "'Courier New', monospace",
            }}
          >
            {about}
          </Typography>
        </Box>
      </Container>

      {/* Prizes Section */}
      {prizes.length > 0 && (
        <Box
          sx={{
            py: 10,
            borderTop: "2px solid #00ED64",
            borderBottom: "2px solid #00ED64",
            bgcolor: "rgba(0, 237, 100, 0.03)",
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ textAlign: "center", mb: 8 }}>
              <TrophyIcon sx={{ fontSize: 56, color: "#00ED64", mb: 2 }} />
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  fontFamily: "'Courier New', monospace",
                  color: "#00ED64",
                }}
              >
                {`> Prizes.list()`}
              </Typography>
            </Box>
            <Grid container spacing={4}>
              {prizes.map((prize, idx) => (
                <Grid item xs={12} md={4} key={idx}>
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      textAlign: "center",
                      bgcolor: "rgba(0, 237, 100, 0.08)",
                      border: "2px solid",
                      borderColor: idx === 0 ? "#00ED64" : "rgba(0, 237, 100, 0.3)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: "#00ED64",
                        boxShadow: "0 0 30px rgba(0, 237, 100, 0.3)",
                        transform: "translateY(-8px)",
                      },
                    }}
                  >
                    <CardContent sx={{ py: 5 }}>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          mb: 2,
                          color: "#00ED64",
                          fontFamily: "'Courier New', monospace",
                        }}
                      >
                        {`[${prize.title}]`}
                      </Typography>
                      {prize.value && (
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: 700,
                            mb: 3,
                            color: "#00ED64",
                            fontFamily: "'Courier New', monospace",
                            textShadow: "0 0 15px rgba(0, 237, 100, 0.5)",
                          }}
                        >
                          {prize.value}
                        </Typography>
                      )}
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#B0FFB0",
                          fontFamily: "'Courier New', monospace",
                        }}
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

      {/* Schedule Section */}
      {schedule.length > 0 && (
        <Container maxWidth="lg" sx={{ py: 10 }}>
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <ScheduleIcon sx={{ fontSize: 56, color: "#00ED64", mb: 2 }} />
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontFamily: "'Courier New', monospace",
                color: "#00ED64",
              }}
            >
              {`> Timeline.execute()`}
            </Typography>
          </Box>
          <Box sx={{ maxWidth: 800, mx: "auto" }}>
            {schedule.map((item, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  gap: 3,
                  mb: 4,
                  pb: 4,
                  borderBottom:
                    idx < schedule.length - 1 ? "1px solid rgba(0, 237, 100, 0.3)" : "none",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#00ED64",
                    minWidth: 120,
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  {item.time}
                </Typography>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mb: 1,
                      color: "#B0FFB0",
                      fontFamily: "'Courier New', monospace",
                    }}
                  >
                    {`$ ${item.title}`}
                  </Typography>
                  {item.description && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(176, 255, 176, 0.7)",
                        fontFamily: "'Courier New', monospace",
                      }}
                    >
                      {`// ${item.description}`}
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
        <Box
          sx={{
            py: 10,
            borderTop: "2px solid #00ED64",
            bgcolor: "rgba(0, 237, 100, 0.03)",
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ textAlign: "center", mb: 8 }}>
              <BusinessIcon sx={{ fontSize: 56, color: "#00ED64", mb: 2 }} />
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  color: "#00ED64",
                  fontFamily: "'Courier New', monospace",
                }}
              >
                {`> Sponsors.load()`}
              </Typography>
            </Box>
            <Grid container spacing={4} justifyContent="center">
              {sponsors.map((sponsor, idx) => (
                <Grid item xs={6} sm={4} md={3} key={idx}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: "center",
                      bgcolor: "rgba(0, 237, 100, 0.08)",
                      border: "1px solid rgba(0, 237, 100, 0.3)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: "#00ED64",
                        boxShadow: "0 0 20px rgba(0, 237, 100, 0.3)",
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
                          filter: "brightness(0) invert(1)",
                        }}
                      />
                    ) : (
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: "#B0FFB0",
                          fontFamily: "'Courier New', monospace",
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
                        bgcolor: "transparent",
                        color: "#00ED64",
                        border: "1px solid #00ED64",
                        fontFamily: "'Courier New', monospace",
                      }}
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
        <Container maxWidth="lg" sx={{ py: 10 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: 8,
              textAlign: "center",
              color: "#00ED64",
              fontFamily: "'Courier New', monospace",
            }}
          >
            {`> FAQ.query()`}
          </Typography>
          <Box sx={{ maxWidth: 900, mx: "auto" }}>
            {faq.map((item, idx) => (
              <Accordion
                key={idx}
                elevation={0}
                sx={{
                  bgcolor: "rgba(0, 237, 100, 0.05)",
                  border: "1px solid rgba(0, 237, 100, 0.3)",
                  mb: 2,
                  "&:before": { display: "none" },
                  "&:hover": {
                    borderColor: "#00ED64",
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: "#00ED64" }} />}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: "#B0FFB0",
                      fontFamily: "'Courier New', monospace",
                    }}
                  >
                    {`? ${item.question}`}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography
                    sx={{
                      color: "rgba(176, 255, 176, 0.8)",
                      fontFamily: "'Courier New', monospace",
                      lineHeight: 1.8,
                    }}
                  >
                    {`>> ${item.answer}`}
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
          py: 10,
          textAlign: "center",
          borderTop: "2px solid #00ED64",
          background: "linear-gradient(to bottom, #0a0e27, #000)",
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: 4,
              color: "#00ED64",
              fontFamily: "'Courier New', monospace",
            }}
          >
            {`> Ready? execute()`}
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: "#00ED64",
              color: "#0a0e27",
              px: 6,
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: 700,
              fontFamily: "'Courier New', monospace",
              border: "2px solid #00ED64",
              boxShadow: "0 0 30px rgba(0, 237, 100, 0.4)",
              "&:hover": {
                bgcolor: "#00c753",
                boxShadow: "0 0 50px rgba(0, 237, 100, 0.6)",
                transform: "translateY(-4px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            $ register_now
          </Button>
        </Container>
      </Box>
    </Box>
  );
}

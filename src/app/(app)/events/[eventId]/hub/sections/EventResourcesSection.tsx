'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Link,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import {
  Info as InfoIcon,
  AccessTime as ClockIcon,
  CalendarMonth as CalendarIcon,
  Link as LinkIcon,
  People as PeopleIcon,
  EmojiEvents as TrophyIcon,
  OpenInNew as ExternalIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { format, parseISO, isBefore, isAfter } from 'date-fns';
import { useToast } from '@/contexts/ToastContext';

interface ScheduleItem {
  _id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  type: 'workshop' | 'meal' | 'ceremony' | 'deadline' | 'social' | 'other';
  location?: string;
  required?: boolean;
}

interface EventData {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: {
    type?: 'in-person' | 'virtual' | 'hybrid';
    venue?: string;
    address?: string;
    city?: string;
    virtualLink?: string;
  };
  resources?: {
    discordLink?: string;
    slackLink?: string;
    documentationUrl?: string;
    faqUrl?: string;
    rules?: string;
  };
  schedule?: ScheduleItem[];
}

interface EventResourcesSectionProps {
  event: EventData;
  upcomingSchedule: ScheduleItem[];
}

const scheduleTypeConfig = {
  workshop: { color: 'primary', icon: '🎓', label: 'Workshop' },
  meal: { color: 'success', icon: '🍕', label: 'Meal' },
  ceremony: { color: 'warning', icon: '🎤', label: 'Ceremony' },
  deadline: { color: 'error', icon: '⏰', label: 'Deadline' },
  social: { color: 'info', icon: '🎉', label: 'Social' },
  other: { color: 'default', icon: '📌', label: 'Event' },
};

export default function EventResourcesSection({
  event,
  upcomingSchedule,
}: EventResourcesSectionProps) {
  const { showSuccess } = useToast();

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess(`${label} copied to clipboard! 📋`);
    } catch (err) {
      showSuccess(`Failed to copy ${label}`);
    }
  };

  const formatScheduleTime = (startTime: string, endTime?: string) => {
    const start = parseISO(startTime);
    const startFormatted = format(start, 'MMM d, h:mm a');
    
    if (endTime) {
      const end = parseISO(endTime);
      const endFormatted = format(end, 'h:mm a');
      return `${startFormatted} - ${endFormatted}`;
    }
    
    return startFormatted;
  };

  const hasResources = event.resources && (
    event.resources.discordLink ||
    event.resources.slackLink ||
    event.resources.documentationUrl ||
    event.resources.faqUrl
  );

  return (
    <Box id="resources">
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <InfoIcon color="primary" />
        Event Resources
      </Typography>

      <Grid container spacing={3}>
        {/* Event Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon fontSize="small" />
                Event Information
              </Typography>
              
              <Stack spacing={2} sx={{ mt: 2 }}>
                {/* Event Dates */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Event Dates
                  </Typography>
                  <Typography variant="body2">
                    {format(parseISO(event.startDate), 'MMMM d, yyyy')} -{' '}
                    {format(parseISO(event.endDate), 'MMMM d, yyyy')}
                  </Typography>
                </Box>

                {/* Location */}
                {event.location && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Location
                    </Typography>
                    {event.location.type === 'virtual' && event.location.virtualLink ? (
                      <Link
                        href={event.location.virtualLink}
                        target="_blank"
                        rel="noopener"
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        Virtual Event
                        <ExternalIcon fontSize="small" />
                      </Link>
                    ) : event.location.type === 'hybrid' ? (
                      <Box>
                        <Typography variant="body2">Hybrid Event</Typography>
                        {event.location.venue && (
                          <Typography variant="body2" color="text.secondary">
                            {event.location.venue}
                            {event.location.city && `, ${event.location.city}`}
                          </Typography>
                        )}
                        {event.location.virtualLink && (
                          <Link
                            href={event.location.virtualLink}
                            target="_blank"
                            rel="noopener"
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}
                          >
                            Join Online
                            <ExternalIcon fontSize="small" />
                          </Link>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2">
                        {event.location.venue}
                        {event.location.city && `, ${event.location.city}`}
                      </Typography>
                    )}
                  </Box>
                )}

                {/* Description */}
                {event.description && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      About
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.description}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Links & Resources */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinkIcon fontSize="small" />
                Links & Resources
              </Typography>

              {hasResources ? (
                <Stack spacing={2} sx={{ mt: 2 }}>
                  {event.resources?.discordLink && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Discord Community
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Link
                          href={event.resources.discordLink}
                          target="_blank"
                          rel="noopener"
                          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                        >
                          Join Discord Server
                          <ExternalIcon fontSize="small" />
                        </Link>
                        <Tooltip title="Copy Discord link">
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(event.resources!.discordLink!, 'Discord link')}
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  )}

                  {event.resources?.slackLink && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Slack Workspace
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Link
                          href={event.resources.slackLink}
                          target="_blank"
                          rel="noopener"
                          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                        >
                          Join Slack Workspace
                          <ExternalIcon fontSize="small" />
                        </Link>
                        <Tooltip title="Copy Slack link">
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(event.resources!.slackLink!, 'Slack link')}
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  )}

                  {event.resources?.documentationUrl && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Documentation
                      </Typography>
                      <Link
                        href={event.resources.documentationUrl}
                        target="_blank"
                        rel="noopener"
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        View Documentation
                        <ExternalIcon fontSize="small" />
                      </Link>
                    </Box>
                  )}

                  {event.resources?.faqUrl && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        FAQ
                      </Typography>
                      <Link
                        href={event.resources.faqUrl}
                        target="_blank"
                        rel="noopener"
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        View FAQ
                        <ExternalIcon fontSize="small" />
                      </Link>
                    </Box>
                  )}

                  {event.resources?.rules && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Rules & Guidelines
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {event.resources.rules}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  No resources available yet. Check back later for event links and documentation.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Schedule */}
        {upcomingSchedule && upcomingSchedule.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ClockIcon fontSize="small" />
                  Upcoming Schedule
                </Typography>

                <Stack spacing={2} sx={{ mt: 2 }}>
                  {upcomingSchedule.map((item, index) => {
                    const config = scheduleTypeConfig[item.type] || scheduleTypeConfig.other;
                    
                    return (
                      <Box key={item._id || index}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          <Typography variant="h6" sx={{ fontSize: '1.5rem', lineHeight: 1 }}>
                            {config.icon}
                          </Typography>
                          
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {item.title}
                              </Typography>
                              <Chip
                                label={config.label}
                                color={config.color as any}
                                size="small"
                              />
                              {item.required && (
                                <Chip
                                  label="Required"
                                  color="error"
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              <ClockIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                              {formatScheduleTime(item.startTime, item.endTime)}
                            </Typography>
                            
                            {item.location && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                📍 {item.location}
                              </Typography>
                            )}
                            
                            {item.description && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {item.description}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        
                        {index < upcomingSchedule.length - 1 && (
                          <Divider sx={{ mt: 2 }} />
                        )}
                      </Box>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

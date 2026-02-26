"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  Chip,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  ChatBubbleOutline,
  Send as SendIcon,
  Reply as ReplyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

interface Note {
  _id: string;
  teamId: string;
  authorId: { _id: string; name: string; email: string } | string;
  content: string;
  parentNoteId: string | null;
  editedAt?: string;
  createdAt: string;
}

interface TeamNotesProps {
  teamId: string;
  eventId: string;
  isMember: boolean;
  currentUserId: string;
  isLeader: boolean;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function getAuthor(note: Note) {
  if (typeof note.authorId === "object" && note.authorId !== null) {
    return note.authorId;
  }
  return { _id: note.authorId as string, name: "Unknown", email: "" };
}

export default function TeamNotes({
  teamId,
  eventId,
  isMember,
  currentUserId,
  isLeader,
}: TeamNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState("");
  const [posting, setPosting] = useState(false);

  // Reply state
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyPosting, setReplyPosting] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // Menu state
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuNoteId, setMenuNoteId] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/events/${eventId}/teams/${teamId}/notes`
      );
      const data = await res.json();
      if (data.success) {
        setNotes(data.notes);
      }
    } catch {}
    setLoading(false);
  }, [eventId, teamId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handlePost = async () => {
    if (!newContent.trim()) return;
    setPosting(true);
    try {
      const res = await fetch(
        `/api/events/${eventId}/teams/${teamId}/notes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newContent.trim() }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setNotes((prev) => [...prev, data.note]);
        setNewContent("");
      }
    } catch {}
    setPosting(false);
  };

  const handleReply = async (parentNoteId: string) => {
    if (!replyContent.trim()) return;
    setReplyPosting(true);
    try {
      const res = await fetch(
        `/api/events/${eventId}/teams/${teamId}/notes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: replyContent.trim(),
            parentNoteId,
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setNotes((prev) => [...prev, data.note]);
        setReplyContent("");
        setReplyingTo(null);
      }
    } catch {}
    setReplyPosting(false);
  };

  const handleEdit = async (noteId: string) => {
    if (!editContent.trim()) return;
    setEditSaving(true);
    try {
      const res = await fetch(
        `/api/events/${eventId}/teams/${teamId}/notes/${noteId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: editContent.trim() }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setNotes((prev) =>
          prev.map((n) => (n._id === noteId ? data.note : n))
        );
        setEditingId(null);
        setEditContent("");
      }
    } catch {}
    setEditSaving(false);
  };

  const handleDelete = async (noteId: string) => {
    try {
      const res = await fetch(
        `/api/events/${eventId}/teams/${teamId}/notes/${noteId}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (data.success) {
        // Remove note and its children
        setNotes((prev) =>
          prev.filter(
            (n) => n._id !== noteId && n.parentNoteId !== noteId
          )
        );
      }
    } catch {}
    setMenuAnchor(null);
    setMenuNoteId(null);
  };

  const topLevelNotes = notes.filter((n) => !n.parentNoteId);
  const getReplies = (parentId: string) =>
    notes.filter((n) => n.parentNoteId === parentId);

  const canModify = (note: Note) => {
    const author = getAuthor(note);
    return author._id === currentUserId || isLeader;
  };

  const renderNote = (note: Note, isReply = false) => {
    const author = getAuthor(note);
    const isEditing = editingId === note._id;

    return (
      <Box
        key={note._id}
        sx={{
          display: "flex",
          gap: 1.5,
          ml: isReply ? 6 : 0,
          pl: isReply ? 2 : 0,
          borderLeft: isReply ? "2px solid" : "none",
          borderColor: "divider",
          py: 1.5,
        }}
      >
        <Avatar
          sx={{
            width: isReply ? 28 : 32,
            height: isReply ? 28 : 32,
            bgcolor: "primary.main",
            fontSize: isReply ? "0.75rem" : "0.875rem",
            flexShrink: 0,
            mt: 0.25,
          }}
        >
          {author.name?.charAt(0).toUpperCase() || "U"}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              {author.name}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {timeAgo(note.createdAt)}
            </Typography>
            {note.editedAt && (
              <Chip
                label="edited"
                size="small"
                variant="outlined"
                sx={{ height: 18, fontSize: "0.65rem" }}
              />
            )}
            {canModify(note) && (
              <IconButton
                size="small"
                onClick={(e) => {
                  setMenuAnchor(e.currentTarget);
                  setMenuNoteId(note._id);
                }}
                sx={{ ml: "auto", p: 0.25 }}
              >
                <MoreIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
          </Box>

          {isEditing ? (
            <Box sx={{ mt: 1 }}>
              <TextField
                fullWidth
                multiline
                size="small"
                minRows={1}
                maxRows={6}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                slotProps={{ htmlInput: { maxLength: 2000 } }}
              />
              <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleEdit(note._id)}
                  disabled={editSaving || !editContent.trim()}
                >
                  {editSaving ? "Saving..." : "Save"}
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    setEditingId(null);
                    setEditContent("");
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            <Typography
              variant="body2"
              sx={{ mt: 0.5, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
            >
              {note.content}
            </Typography>
          )}

          {/* Reply button (only for top-level notes) */}
          {!isReply && !isEditing && isMember && (
            <Button
              size="small"
              startIcon={<ReplyIcon sx={{ fontSize: 14 }} />}
              onClick={() => {
                setReplyingTo(replyingTo === note._id ? null : note._id);
                setReplyContent("");
              }}
              sx={{
                mt: 0.5,
                p: 0,
                minWidth: 0,
                textTransform: "none",
                color: "text.secondary",
                fontSize: "0.75rem",
              }}
            >
              Reply
            </Button>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <ChatBubbleOutline sx={{ color: "primary.main" }} />
        <Typography variant="h6">
          Team Notes ({topLevelNotes.length})
        </Typography>
      </Box>

      {/* New note input */}
      {isMember && (
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            mb: 3,
            p: 2,
            bgcolor: "grey.50",
            borderRadius: 1,
          }}
        >
          <TextField
            fullWidth
            multiline
            size="small"
            minRows={2}
            maxRows={6}
            placeholder="Share an update with your team..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 2000 } }}
          />
          <Button
            variant="contained"
            onClick={handlePost}
            disabled={posting || !newContent.trim()}
            sx={{ alignSelf: "flex-end", minWidth: 80 }}
            startIcon={<SendIcon />}
          >
            {posting ? "..." : "Post"}
          </Button>
        </Box>
      )}

      {/* Notes list */}
      {loading ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress size={24} />
        </Box>
      ) : topLevelNotes.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <ChatBubbleOutline
            sx={{ fontSize: 40, color: "text.disabled", mb: 1 }}
          />
          <Typography color="text.secondary" variant="body2">
            No notes yet. Start the conversation!
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {topLevelNotes.map((note) => (
            <Box key={note._id}>
              {renderNote(note)}

              {/* Replies */}
              {getReplies(note._id).map((reply) => renderNote(reply, true))}

              {/* Inline reply form */}
              {replyingTo === note._id && (
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    ml: 6,
                    pl: 2,
                    borderLeft: "2px solid",
                    borderColor: "primary.main",
                    py: 1,
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    minRows={1}
                    maxRows={4}
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    slotProps={{ htmlInput: { maxLength: 2000 } }}
                    autoFocus
                  />
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.5,
                    }}
                  >
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleReply(note._id)}
                      disabled={replyPosting || !replyContent.trim()}
                      sx={{ minWidth: 64 }}
                    >
                      {replyPosting ? "..." : "Reply"}
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent("");
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}

      {/* Context menu for edit/delete */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => {
          setMenuAnchor(null);
          setMenuNoteId(null);
        }}
        PaperProps={{ sx: { minWidth: 140 } }}
      >
        <MenuItem
          onClick={() => {
            const note = notes.find((n) => n._id === menuNoteId);
            if (note) {
              setEditingId(note._id);
              setEditContent(note.content);
            }
            setMenuAnchor(null);
            setMenuNoteId(null);
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuNoteId) handleDelete(menuNoteId);
          }}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}

import React from "react";
import PersonIcon from "@mui/icons-material/Person";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import GroupsIcon from "@mui/icons-material/Groups";
import CodeIcon from "@mui/icons-material/Code";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import GavelIcon from "@mui/icons-material/Gavel";
import RateReviewIcon from "@mui/icons-material/RateReview";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import WebIcon from "@mui/icons-material/Web";
import PublishIcon from "@mui/icons-material/Publish";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PaletteIcon from "@mui/icons-material/Palette";
import HandshakeIcon from "@mui/icons-material/Handshake";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import GroupIcon from "@mui/icons-material/Group";
import SettingsIcon from "@mui/icons-material/Settings";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import InfoIcon from "@mui/icons-material/Info";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const iconMap: Record<string, React.ElementType> = {
  Person: PersonIcon,
  EmojiEvents: EmojiEventsIcon,
  HowToReg: HowToRegIcon,
  Groups: GroupsIcon,
  Code: CodeIcon,
  CloudUpload: CloudUploadIcon,
  Leaderboard: LeaderboardIcon,
  Gavel: GavelIcon,
  RateReview: RateReviewIcon,
  CheckCircle: CheckCircleIcon,
  AddCircle: AddCircleIcon,
  Web: WebIcon,
  Publish: PublishIcon,
  PersonAdd: PersonAddIcon,
  Palette: PaletteIcon,
  Handshake: HandshakeIcon,
  Analytics: AnalyticsIcon,
  Group: GroupIcon,
  Settings: SettingsIcon,
  FileCopy: FileCopyIcon,
  Info: InfoIcon,
};

export function getStepIcon(name: string): React.ElementType {
  return iconMap[name] || HelpOutlineIcon;
}

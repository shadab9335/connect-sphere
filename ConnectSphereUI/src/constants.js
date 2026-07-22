import { CricketScene, MoviesScene, TravelScene, RunningScene, CyclingScene, ChessScene, GamingScene } from "./scenes";
import ChessImg from './images/chess.webp';
import CricketImg from './images/cricket.webp';
import CyclingImg from './images/cycling.webp';
import GamingImg from './images/gaming.webp';
import MoviesImg from './images/movies.webp';
import RunningImg from './images/running.webp';
import TravelImg from './images/travel.webp';
//!----------------------- adding images for the filters ----------------------
import AllActivity from './images/extracurricular-activities.png';
import CricketIcon from './images/cricket_icon.png';
import MoviesIcon from './images/popcorn.png';
import TravelIcon from './images/travel.png';
import RunningIcon from './images/running.png';
import CyclingIcon from './images/cycling.png';
import ChessIcon from './images/chess.png';
import GamingIcon from './images/gaming.png';
import PhotographyIcon from './images/photography.png';
import MusicIcon from './images/music.png';
import CookingIcon from './images/cook.png';
import YogaIcon from './images/yoga.png';


export const COLORS = {
  primary: "#6C63FF",
  secondary: "#FF6584",
  accent: "#43E97B",
  amber: "#FFB347",
  sky: "#38BDF8",
  bg: "#F0F4FF",
  card: "#FFFFFF",
  text: "#1A1A2E",
  muted: "#8892B0",
  border: "#E2E8F8",
};

// ── Work-location dropdowns (used at signup + on profile edit) ────────────
export const DEPARTMENTS = [
  "Application Development",
  "Cloud & Infrastructure Engineering",
  "Data Engineering & Analytics",
  "Quality Engineering & Testing",
  "DevOps & Site Reliability",
];

export const BUILDINGS = ["G1", "G2", "C1", "C2"];

export const FLOORS = ["Floor 1", "Floor 2", "Floor 3", "Floor 4", "Floor 5"];


export const INTERESTS = [
  {
    id: "Cricket",
    label: "Cricket",
    emoji: "🏏",
    description: "Matches, office leagues & weekend games",
    tone: "Energetic & social",
  },
  {
    id: "Chess",
    label: "Chess",
    emoji: "♟️",
    description: "Casual play, tournaments & tactics",
    tone: "Strategic thinkers",
  },
  {
    id: "Badminton",
    label: "Badminton",
    emoji: "🏸",
    description: "Lunch games & after‑work matches",
    tone: "Fast-paced fun",
  },
  {
    id: "Running",
    label: "Running",
    emoji: "🏃",
    description: "Morning runs & fitness groups",
    tone: "Active lifestyle",
  },
  {
    id: "Photography",
    label: "Photography",
    emoji: "📷",
    description: "Office walks, shots & techniques",
    tone: "Creative minds",
  },
  {
    id: "Gaming",
    label: "Gaming",
    emoji: "🎮",
    description: "Console, PC & casual gaming",
    tone: "Friendly competition",
  },
  {
    id: "Cooking",
    label: "Cooking",
    emoji: "🍳",
    description: "Recipes, food discussions & tips",
    tone: "Food lovers",
  },
  {
    id: "Movies",
    label: "Movies",
    emoji: "🎬",
    description: "Movie nights & recommendations",
    tone: "Pop culture fans",
  },
  {
    id: "Travel",
    label: "Travel",
    emoji: "✈️",
    description: "Trips, treks & travel stories",
    tone: "Explorers",
  },
  {
    id: "Music",
    label: "Music",
    emoji: "🎵",
    description: "Listening sessions & discussions",
    tone: "Music enthusiasts",
  },
  {
    id: "Yoga",
    label: "Yoga",
    emoji: "🧘",
    description: "Wellness, balance & mindset",
    tone: "Mindful living",
  },
  {
    id: "Cycling",
    label: "Cycling",
    emoji: "🚴",
    description: "Weekend rides & routes",
    tone: "Outdoor energy",
  },
];


export const MOCK_USERS = [
  {
    id: "E1042", name: "Arjun Mehta", dept: "Engineering", location: " Floor 3, Tower A", interests: [{ id: "Cricket", label: "Cricket", emoji: "🏏", description: "Matches, office leagues & weekend games", tone: "Energetic & social" }, {
      id: "Gaming",
      label: "Gaming",
      emoji: "🎮",
      description: "Console, PC & casual gaming",
      tone: "Friendly competition"
    }, {
      id: "Movies",
      label: "Movies",
      emoji: "🎬",
      description: "Movie nights & recommendations",
      tone: "Pop culture fans"
    }], avatar: "AM", color: "#6C63FF", online: true, mutual: 4
  },

  {
    id: "E2031", name: "Priya Sharma", dept: "Product", location: "Floor 5, Tower B", interests: [{
      id: "Yoga",
      label: "Yoga",
      emoji: "🧘",
      description: "Wellness, balance & mindset",
      tone: "Mindful living"
    }, {
      id: "Photography",
      label: "Photography",
      emoji: "📷",
      description: "Office walks, shots & techniques",
      tone: "Creative minds"
    }, {
      id: "Travel",
      label: "Travel",
      emoji: "✈️",
      description: "Trips, treks & travel stories",
      tone: "Explorers"
    }], avatar: "PS", color: "#FF6584", online: true, mutual: 7
  },

  {
    id: "E3018", name: "Rahul Nair", dept: "Design", location: "Floor 2, Tower A", interests: [{
      id: "Cricket",
      label: "Cricket",
      emoji: "🏏",
      description: "Matches, office leagues & weekend games",
      tone: "Energetic & social"
    }, {
      id: "Music",
      label: "Music",
      emoji: "🎵",
      description: "Listening sessions & discussions",
      tone: "Music enthusiasts"
    }, {
      id: "Cycling",
      label: "Cycling",
      emoji: "🚴",
      description: "Weekend rides & routes",
      tone: "Outdoor energy"
    }], avatar: "RN", color: "#43E97B", online: false, mutual: 2
  },

  {
    id: "E4055", name: "Sneha Iyer", dept: "Marketing", location: "Floor 4, Tower C", interests: [{
      id: "Running",
      label: "Running",
      emoji: "🏃",
      description: "Morning runs & fitness groups",
      tone: "Active lifestyle"
    }, {
      id: "Cooking",
      label: "Cooking",
      emoji: "🍳",
      description: "Recipes, food discussions & tips",
      tone: "Food lovers"
    }, {
      id: "Chess",
      label: "Chess",
      emoji: "♟️",
      description: "Casual play, tournaments & tactics",
      tone: "Strategic thinkers"
    }], avatar: "SI", color: "#FFB347", online: true, mutual: 5
  },

  {
    id: "E5009", name: "Karan Patel", dept: "Analytics", location: "Floor 1, Tower B", interests: [{
      id: "Gaming",
      label: "Gaming",
      emoji: "🎮",
      description: "Console, PC & casual gaming",
      tone: "Friendly competition"
    }, {
      id: "Movies",
      label: "Movies",
      emoji: "🎬",
      description: "Movie nights & recommendations",
      tone: "Pop culture fans"
    }, {
      id: "Chess",
      label: "Chess",
      emoji: "♟️",
      description: "Casual play, tournaments & tactics",
      tone: "Strategic thinkers"
    }], avatar: "KP", color: "#38BDF8", online: false, mutual: 3
  }




]


export const MOCK_EVENTS = [
  { id: 1, title: "Weekend Cricket Match", interest: "Cricket", host: "Arjun Mehta", hostId: "E1042", location: "Cubbon Park", date: "Sat, Apr 5", time: "7:00 AM", joined: 9, max: 22, color: "linear-gradient(135deg, rgb(191 82 127), rgb(28 17 193 / 80%))", emoji: "🏏" },
  { id: 2, title: "Lunchtime Chess Club", interest: "Chess", host: "Sneha Iyer", hostId: "E4055", location: "Cafeteria, Floor 5", date: "Mon, Mar 31", time: "1:00 PM", joined: 4, max: 8, color: "linear-gradient(135deg, rgb(191 82 127), rgb(28 17 193 / 80%))", emoji: "♟️" },
  { id: 3, title: "Evening Run – MG Road", interest: "Running", host: "Priya Sharma", hostId: "E2031", location: "MG Road", date: "Wed, Apr 2", time: "6:30 PM", joined: 6, max: 20, color: "linear-gradient(135deg, rgb(191 82 127), rgb(28 17 193 / 80%))", emoji: "🏃" },
  { id: 4, title: "Office Photography Walk", interest: "Photography", host: "Rahul Nair", hostId: "E3018", location: "Campus Grounds", date: "Fri, Apr 4", time: "5:00 PM", joined: 5, max: 12, color: "linear-gradient(135deg, rgb(191 82 127), rgb(28 17 193 / 80%))", emoji: "📸" },
];

export const FEED_TABS = [
  { id: "All", image: AllActivity },
  { id: "Cricket", image: CricketIcon },
  { id: "Movies", image: MoviesIcon },
  { id: "Travel", image: TravelIcon },
  { id: "Cycling", image: CyclingIcon },
  { id: "Running", image: RunningIcon },
  { id: "Chess", image: ChessIcon },
  { id: "Gaming", image: GamingIcon },
  { id: "Photography", image: PhotographyIcon },
  { id: "Music", image: MusicIcon },
  { id: "Cooking", image: CookingIcon },
  { id: "Yoga", image: YogaIcon },
];



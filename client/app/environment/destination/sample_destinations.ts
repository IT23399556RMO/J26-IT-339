// D:\WORKSPACE\Research_Project\J26-IT-339\client\app\environment\destination\sample_destinations.ts
"use client";

export interface DestinationOption {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  region: string;
  icon: string;
  climateZone: string;
  description: string;
  activityCategory: string; // Added to satisfy ML contextualization requirements
}

export const SAMPLE_DESTINATIONS: DestinationOption[] = [
  {
    id: "kandy",
    name: "Kandy",
    latitude: 7.2906,
    longitude: 80.6337,
    region: "Central Province",
    icon: "🛕",
    climateZone: "Wet Highland",
    description: "Sacred Buddhist shrine in the Royal Palace complex, nestled in misty tropical hills.",
    activityCategory: "Heritage"
  },
  {
    id: "nuwara_eliya",
    name: "Nuwara Eliya",
    latitude: 6.9497,
    longitude: 80.7839,
    region: "Central Province",
    icon: "⛰️",
    climateZone: "Montane Zone",
    description: "High-altitude tea country known for its cool, temperate climate and colonial architecture.",
    activityCategory: "Hill Country"
  },
  {
    id: "matale",
    name: "Matale",
    latitude: 7.4723,
    longitude: 80.6234,
    region: "Central Province",
    icon: "🌿",
    climateZone: "Wet Zone",
    description: "Agricultural hub famous for spice gardens and historical temples.",
    activityCategory: "Heritage"
  },
  {
    id: "sigiriya",
    name: "Sigiriya",
    latitude: 7.9569,
    longitude: 80.7597,
    region: "Central Province",
    icon: "🏰",
    climateZone: "Dry Zone",
    description: "Ancient 5th-century palace citadel rising 200m above the jungle plains.",
    activityCategory: "Heritage"
  },
  {
    id: "dambulla",
    name: "Dambulla",
    latitude: 7.8500,
    longitude: 80.6500,
    region: "Central Province",
    icon: "🗿",
    climateZone: "Dry Zone",
    description: "Extensive cave temple complex containing ancient Buddhist murals and statues.",
    activityCategory: "Heritage"
  },
  {
    id: "horton_plains",
    name: "Horton Plains",
    latitude: 6.8031,
    longitude: 80.7979,
    region: "Central Province",
    icon: "🦌",
    climateZone: "Montane Zone",
    description: "Protected national park featuring cloud forests and the World's End precipice.",
    activityCategory: "Hill Country"
  },
  {
    id: "knuckles",
    name: "Knuckles",
    latitude: 7.4007,
    longitude: 80.8106,
    region: "Central Province",
    icon: "🥾",
    climateZone: "Wet Highland",
    description: "Rugged mountain range offering challenging trekking and diverse biodiversity.",
    activityCategory: "Adventure"
  },
  {
    id: "adams_peak",
    name: "Adams Peak",
    latitude: 6.8093,
    longitude: 80.4992,
    region: "Sabaragamuwa Province",
    icon: "🌄",
    climateZone: "Montane Zone",
    description: "Sacred mountain renowned for its challenging nocturnal pilgrimage climb.",
    activityCategory: "Adventure"
  },
  {
    id: "pidurangala",
    name: "Pidurangala",
    latitude: 7.9656,
    longitude: 80.7618,
    region: "Central Province",
    icon: "🧗",
    climateZone: "Dry Zone",
    description: "Steep rock formation offering panoramic views of the adjacent Sigiriya rock.",
    activityCategory: "Adventure"
  },
  {
    id: "peradeniya",
    name: "Peradeniya",
    latitude: 7.2718,
    longitude: 80.5970,
    region: "Central Province",
    icon: "🌸",
    climateZone: "Wet Highland",
    description: "Historical botanical gardens featuring massive palm avenues and orchid houses.",
    activityCategory: "Heritage"
  }
];
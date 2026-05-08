import type { Planet } from "../types/planet";

export const planets: Planet[] = [
  {
    id: "mars",
    name: "Mars",
    description: "The Red Planet exploration mission.",
    distance: "225M km",
    travelTime: "6-9 months",
    dayLength: "24h 37m",
    modelPath: "/models/mars.glb",
    position: {
      x: 200,
      y: 0,
      z: -200,
    },
    gravity: "0.38g",
    scale: 0.4,
    distanceFromSurfaceFactor: 1.19,
    lateralFactor: 0.85,
    moons: "2",
    avgTemp: "-65C",
    signalDelay: "3-22 min",
    price: {
      basic: 249999,
      premium: 499999,
    },
  },
  {
    id: "saturn",
    name: "Saturn",
    description: "Ring fly-through luxury cruise.",
    distance: "1.4B km",
    travelTime: "6-7 years",
    dayLength: "10h 33m",
    modelPath: "/models/saturn.glb",
    position: {
      x: 400,
      y: 0,
      z: -420,
    },
    scale: 0.02,
    distanceFromSurfaceFactor: 0.6,
    lateralFactor: 0.4,
    gravity: "1.06g",
    moons: "140+",
    avgTemp: "-178C",
    signalDelay: "68-90 min",
    price: {
      basic: 699999,
      premium: 1299999,
    },
  },
];
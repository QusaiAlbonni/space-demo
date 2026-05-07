import type { Planet } from "../types/planet";

export const planets: Planet[] = [

  {
    id: "jupiter",
    name: "Jupiter",
    description: "Orbit experience around the gas giant.",
    distance: "778M km",
    travelTime: "5-6 years",
    dayLength: "9h 56m",
    modelPath: "/models/jupiter.glb",
    position: {
      x: 4.6,
      y: 0.2,
      z: -3.6,
    },
    gravity: "2.53g",
    moons: "95+",
    avgTemp: "-145C",
    signalDelay: "35-52 min",
    price: {
      basic: 499999,
      premium: 999999,
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
      x: 6.0,
      y: 0.2,
      z: -5.0,
    },
    scale: 10,
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
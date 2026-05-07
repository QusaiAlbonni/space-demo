export type Planet = {
  id: string;
  name: string;
  description: string;
  distance: string;
  modelPath: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  scale?: number;
  travelTime: string;
  dayLength: string;
  gravity: string;
  moons: string;
  avgTemp: string;
  signalDelay: string;
  price: {
    basic: number;
    premium: number;
  };
};
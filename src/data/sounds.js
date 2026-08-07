import {
  BsCloudRain,
  BsWater,
  BsTree,
  BsFire,
  BsCupHot,
  BsWind,
  BsFeather,
  BsMusicNoteBeamed,
} from 'react-icons/bs';
import rain from '../assets/audio/rain.wav';
import ocean from '../assets/audio/ocean.wav';
import forest from '../assets/audio/forest.wav';
import fireplace from '../assets/audio/fireplace.wav';
import coffee from '../assets/audio/coffee.wav';
import wind from '../assets/audio/wind.wav';
import birds from '../assets/audio/birds.wav';
import piano from '../assets/audio/piano.wav';

export const sounds = [
  {
    id: 'rain',
    name: 'Rain',
    Icon: BsCloudRain,
    src: rain,
    color: '#3b82f6',
    defaultVolume: 0.5,
  },
  {
    id: 'ocean',
    name: 'Ocean',
    Icon: BsWater,
    src: ocean,
    color: '#0ea5e9',
    defaultVolume: 0.5,
  },
  {
    id: 'forest',
    name: 'Forest',
    Icon: BsTree,
    src: forest,
    color: '#10b981',
    defaultVolume: 0.5,
  },
  {
    id: 'fireplace',
    name: 'Fireplace',
    Icon: BsFire,
    src: fireplace,
    color: '#f97316',
    defaultVolume: 0.5,
  },
  {
    id: 'coffee',
    name: 'Coffee Shop',
    Icon: BsCupHot,
    src: coffee,
    color: '#a16207',
    defaultVolume: 0.5,
  },
  {
    id: 'wind',
    name: 'Wind',
    Icon: BsWind,
    src: wind,
    color: '#22d3ee',
    defaultVolume: 0.5,
  },
  {
    id: 'birds',
    name: 'Birds',
    Icon: BsFeather,
    src: birds,
    color: '#facc15',
    defaultVolume: 0.5,
  },
  {
    id: 'piano',
    name: 'Piano',
    Icon: BsMusicNoteBeamed,
    src: piano,
    color: '#a855f7',
    defaultVolume: 0.4,
  },
];

// Ambient noise generator types (white/pink/brown)
export const noiseTypes = ['white', 'pink', 'brown'];

export const soundMeta = sounds;
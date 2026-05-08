export const CARS = [
  {
    id: 'sf90',
    file: 'public/models/2021_ferrari_sf90_spider.glb',
    marque: 'Ferrari',
    model: 'SF90',
    line: 'Spider',
    year: '2021',
    tagline: 'Hybrid fury from Maranello. 1,000 horses, zero apologies.',
    origin: 'Maranello, IT',
    layout: 'AWD · 4.0L twin-turbo V8 + 3 e-motors',
    specs: [
      { label: 'Power',    value: '986',  unit: 'hp' },
      { label: '0–60 mph', value: '2.5',  unit: 's' },
      { label: 'Top',      value: '211',  unit: 'mph' },
      { label: 'Weight',   value: '1570', unit: 'kg' }
    ],
    accent: '#ff2d2d',
    framing: { camera: [4.8, 1.4, 5.4], target: [0, 0.55, 0], scale: 1.0 }
  },
  {
    id: 'rs3',
    file: 'public/models/2023_audi_rs3_sedan_performance.glb',
    marque: 'Audi',
    model: 'RS3',
    line: 'Sedan Performance',
    year: '2023',
    tagline: 'Five-cylinder fury, four doors quiet about it.',
    origin: 'Ingolstadt, DE',
    layout: 'AWD · 2.5L 5-cyl turbo',
    specs: [
      { label: 'Power',    value: '401',  unit: 'hp' },
      { label: '0–60 mph', value: '3.3',  unit: 's' },
      { label: 'Top',      value: '180',  unit: 'mph' },
      { label: 'Weight',   value: '1655', unit: 'kg' }
    ],
    accent: '#ff4b1f',
    framing: { camera: [4.6, 1.4, 5.2], target: [0, 0.55, 0], scale: 1.0 }
  },
  {
    id: 'laferrari',
    file: 'public/models/ferrari_laferrari__www.vecarz.com.glb',
    marque: 'Ferrari',
    model: 'LaFerrari',
    line: 'Hypercar',
    year: '2015',
    tagline: 'The Ferrari. Not a Ferrari — the Ferrari.',
    origin: 'Maranello, IT',
    layout: 'RWD · 6.3L V12 + HY-KERS',
    specs: [
      { label: 'Power',    value: '950',  unit: 'hp' },
      { label: '0–60 mph', value: '2.6',  unit: 's' },
      { label: 'Top',      value: '217',  unit: 'mph' },
      { label: 'Weight',   value: '1255', unit: 'kg' }
    ],
    accent: '#cc0000',
    framing: { camera: [5.0, 1.4, 5.6], target: [0, 0.5, 0], scale: 1.0 }
  },
  {
    id: 'aventador',
    file: 'public/models/lamborghini_aventador.glb',
    marque: 'Lamborghini',
    model: 'Aventador',
    line: 'LP 700-4',
    year: '2020',
    tagline: 'Naturally aspirated V12. No turbo, no filter, no compromise.',
    origin: 'Sant\'Agata Bolognese, IT',
    layout: 'AWD · 6.5L NA V12',
    specs: [
      { label: 'Power',    value: '700',  unit: 'hp' },
      { label: '0–60 mph', value: '2.9',  unit: 's' },
      { label: 'Top',      value: '217',  unit: 'mph' },
      { label: 'Weight',   value: '1575', unit: 'kg' }
    ],
    accent: '#c8ff00',
    framing: { camera: [5.0, 1.45, 5.6], target: [0, 0.55, 0], scale: 1.0 }
  },
  {
    id: 'revuelto',
    file: 'public/models/lamborghini_revuelto_grays_widebody.glb',
    marque: 'Lamborghini',
    model: 'Revuelto',
    line: 'Grays Widebody',
    year: '2024',
    tagline: 'The V12 evolves. Electrified, unfiltered, untamed.',
    origin: 'Sant\'Agata Bolognese, IT',
    layout: 'AWD · 6.5L V12 + 3 e-motors',
    specs: [
      { label: 'Power',    value: '1001', unit: 'hp' },
      { label: '0–60 mph', value: '2.5',  unit: 's' },
      { label: 'Top',      value: '217',  unit: 'mph' },
      { label: 'Weight',   value: '1772', unit: 'kg' }
    ],
    accent: '#8a2be2',
    framing: { camera: [5.0, 1.45, 5.6], target: [0, 0.55, 0], scale: 1.0 }
  },
  {
    id: 'gtr',
    file: 'public/models/nissan_gtr35_lb-silhouette__www.vecarz.com.glb',
    marque: 'Nissan',
    model: 'GT-R R35',
    line: 'LB · Silhouette Works',
    year: '2020',
    tagline: 'Godzilla, widebody. The street wears the kit.',
    origin: 'Yokohama, JP · LB Works',
    layout: 'AWD · 3.8L twin-turbo V6',
    specs: [
      { label: 'Power',    value: '600', unit: 'hp' },
      { label: '0–60 mph', value: '2.7', unit: 's' },
      { label: 'Top',      value: '196', unit: 'mph' },
      { label: 'Weight',   value: '1740', unit: 'kg' }
    ],
    accent: '#ffb302',
    framing: { camera: [5.2, 1.45, 5.6], target: [0, 0.6, 0], scale: 1.0 }
  },
];

export const PAINTS = [
  { name: 'Carbon',    hex: '#0c0c0e', metal: 1.0,  rough: 0.25 },
  { name: 'Pearl',     hex: '#ece9e0', metal: 0.7,  rough: 0.3  },
  { name: 'Signal',    hex: '#ff4b1f', metal: 0.85, rough: 0.28 },
  { name: 'Mamba',     hex: '#d8b400', metal: 0.85, rough: 0.32 },
  { name: 'Riviera',   hex: '#0e3a8a', metal: 0.95, rough: 0.22 },
  { name: 'Mantis',    hex: '#3a6b35', metal: 0.85, rough: 0.3  },
  { name: 'Bordeaux',  hex: '#5a0a16', metal: 1.0,  rough: 0.22 },
  { name: 'Rosso',     hex: '#d40000', metal: 0.9,  rough: 0.25 },
  { name: 'British',   hex: '#004225', metal: 0.8,  rough: 0.35 },
  { name: 'Midnight',  hex: '#191970', metal: 0.9,  rough: 0.2  },
  { name: 'Miami',     hex: '#00b4d8', metal: 0.85, rough: 0.3  },
  { name: 'Nardo',     hex: '#9aa0a3', metal: 0.8,  rough: 0.45 },
  { name: 'Chalk',     hex: '#d1d1d1', metal: 0.6,  rough: 0.4  },
  { name: 'Acid',      hex: '#b0ff00', metal: 0.9,  rough: 0.25 },
  { name: 'Sunburst',  hex: '#ff8c00', metal: 0.95, rough: 0.22 },
  { name: 'Frozen',    hex: '#e0e0e0', metal: 0.95, rough: 0.05 }
];

export const ENVIRONMENTS = [
  {
    id: 'studio',
    name: 'Studio',
    sub: 'Cyclorama · 5600K',
    bgTop: '#1a1a1d',
    bgBottom: '#050507',
    floor: '#101012',
    keyColor: '#ffffff',
    keyIntensity: 4.0,
    fillColor: '#e0eaff',
    fillIntensity: 1.2,
    rimColor: '#ff8855',
    rimIntensity: 1.6,
    fog: '#070708',
    fogDensity: 0.018
  },
  {
    id: 'sunset',
    name: 'Sunset',
    sub: 'Golden Hour · Pacific',
    bgTop: '#ff6b2b',
    bgBottom: '#1a0816',
    floor: '#2e1010',
    keyColor: '#ffb060',
    keyIntensity: 3.8,
    fillColor: '#ff5533',
    fillIntensity: 1.6,
    rimColor: '#1a3a8a',
    rimIntensity: 2.2,
    fog: '#2e1010',
    fogDensity: 0.022
  },
  {
    id: 'midnight',
    name: 'Midnight',
    sub: 'Neon Canyon',
    bgTop: '#1a1d3a',
    bgBottom: '#05050a',
    floor: '#0a0a14',
    keyColor: '#9b6cff',
    keyIntensity: 2.5,
    fillColor: '#1fb0ff',
    fillIntensity: 2.4,
    rimColor: '#ff2d8a',
    rimIntensity: 2.6,
    fog: '#08081a',
    fogDensity: 0.03
  },
  {
    id: 'snow',
    name: 'Snow',
    sub: 'Overcast · Ice',
    bgTop: '#c8d4e0',
    bgBottom: '#6a7c8a',
    floor: '#b0bec8',
    keyColor: '#ddeeff',
    keyIntensity: 5.2,
    fillColor: '#aabbd0',
    fillIntensity: 2.2,
    rimColor: '#ffffff',
    rimIntensity: 1.8,
    fog: '#9aacbc',
    fogDensity: 0.014
  }
];

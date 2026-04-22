export const wasteTypes = [
  {
    emoji: '♻️',
    title: 'Dry Waste',
    desc: 'Paper, plastics, metals',
    query: 'How do I dispose of dry waste?'
  }, 
  {
    emoji: '🌿',
    title: 'Wet Waste',
    desc: 'Food, leaves, garden',
    query: 'How do I dispose of wet waste?'
  },
  {
    emoji: '⚠️',
    title: 'Hazardous',
    desc: 'Chemical, paint, oil',
    query: 'How do I dispose of hazardous waste?'
  },
  {
    emoji: '💻',
    title: 'E-Waste',
    desc: 'Electronics, batteries',
    query: 'How do I dispose of e-waste?'
  },
  {
    emoji: '🏥',
    title: 'Medical',
    desc: 'Syringes, bandages',
    query: 'How do I dispose of medical waste?'
  },
  {
    emoji: '🪟',
    title: 'Glass',
    desc: 'Bottles, jars, windows',
    query: 'How do I dispose of glass waste?'
  },
];

export const wasteCategories = [
  {
    id: 1,
    name: 'Organic/Wet Waste',
    color: '#27AE60',
    examples: ['Food scraps', 'Garden waste', 'Paper']
  },
  {
    id: 2,
    name: 'Dry Waste',
    color: '#3498DB',
    examples: ['Plastic', 'Metal', 'Paper products']
  },
  {
    id: 3,
    name: 'Hazardous Waste',
    color: '#E74C3C',
    examples: ['Batteries', 'Oils', 'Chemicals']
  },
  {
    id: 4,
    name: 'E-Waste',
    color: '#9B59B6',
    examples: ['Electronics', 'Mobiles', 'Cables']
  }
];

export const quickTopics = [
  { icon: '♻️', label: 'Dry Waste', query: 'How do I segregate and dispose of dry waste?' },
  { icon: '🌿', label: 'Wet Waste', query: 'How do I segregate and compost wet waste?' },
  { icon: '⚠️', label: 'Hazardous', query: 'What are hazardous waste items and how to dispose?' },
  { icon: '💻', label: 'E-Waste', query: 'Where can I dispose of old electronics and e-waste?' },
  { icon: '🏥', label: 'Medical', query: 'How do I safely dispose of medical waste at home?' },
];

export const dumperBins = [
  {
    id: 1,
    name: 'Central Waste Management Hub',
    zone: 'Central Zone',
    ward: 'Ward 1',
    circle: 'Circle A',
    lat: 17.3850,
    lng: 78.4867,
    address: 'Main Road, Central Area',
    types: ['dry', 'wet', 'hazardous']
  },
  {
    id: 2,
    name: 'East Zone Collection Point',
    zone: 'East Zone',
    ward: 'Ward 5',
    circle: 'Circle B',
    lat: 17.4065,
    lng: 78.4772,
    address: 'East Street, Industrial Area',
    types: ['dry', 'wet']
  },
  {
    id: 3,
    name: 'E-Waste Disposal Center',
    zone: 'Central Zone',
    ward: 'Ward 2',
    circle: 'Circle C',
    lat: 17.3900,
    lng: 78.4900,
    address: 'Tech Park, Central Area',
    types: ['e-waste', 'hazardous']
  },
  {
    id: 4,
    name: 'North Recycling Station',
    zone: 'North Zone',
    ward: 'Ward 10',
    circle: 'Circle D',
    lat: 17.4200,
    lng: 78.4500,
    address: 'North Highway, Residential Area',
    types: ['dry', 'wet', 'hazardous']
  },
  {
    id: 5,
    name: 'South Community Center',
    zone: 'South Zone',
    ward: 'Ward 15',
    circle: 'Circle E',
    lat: 17.3700,
    lng: 78.4800,
    address: 'South Boulevard, Community Area',
    types: ['dry', 'wet']
  },
];
 
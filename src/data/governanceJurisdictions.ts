/**
 * AI-governance jurisdictions — the real-world acts, regulations, and
 * frameworks that the platform helps organizations comply with.
 *
 * Powers the home-page governance globe (`GovernanceGlobe.tsx`): each entry is
 * plotted as a glowing marker at its capital/seat-of-government coordinates and
 * surfaced in the rotating spotlight carousel. Coordinates are [lat, lng].
 *
 * `weight` (0–1) drives marker size — flagship, broadly-scoped acts read larger
 * than narrower or emerging ones.
 */

export type JurisdictionStatus = 'in-force' | 'enacted' | 'proposed' | 'framework';

export interface GovernanceJurisdiction {
  id: string;
  /** Short act / regulation name, e.g. "EU AI Act". */
  act: string;
  /** Human-readable jurisdiction, e.g. "European Union". */
  region: string;
  /** One-line plain-language note shown in the spotlight card. */
  note: string;
  /** [latitude, longitude] of the seat of government. */
  location: [number, number];
  status: JurisdictionStatus;
  /** Relative prominence 0–1 → marker size. */
  weight: number;
}

export const STATUS_LABELS: Record<JurisdictionStatus, string> = {
  'in-force': 'In force',
  enacted: 'Enacted',
  proposed: 'Proposed',
  framework: 'Framework',
};

/**
 * Curated set of jurisdictions with active or emerging AI governance regimes.
 * Ordered roughly by global prominence — the carousel advances in this order.
 */
export const governanceJurisdictions: GovernanceJurisdiction[] = [
  {
    id: 'eu-ai-act',
    act: 'EU AI Act',
    region: 'European Union',
    note: 'The world’s first comprehensive, risk-tiered AI law (Reg. 2024/1689).',
    location: [50.85, 4.35], // Brussels
    status: 'in-force',
    weight: 1,
  },
  {
    id: 'us-federal',
    act: 'NIST AI RMF & Federal Policy',
    region: 'United States',
    note: 'Voluntary risk framework plus a fast-moving patchwork of agency rules.',
    location: [38.9, -77.04], // Washington, D.C.
    status: 'framework',
    weight: 0.9,
  },
  {
    id: 'us-colorado',
    act: 'Colorado AI Act (SB 205)',
    region: 'Colorado, USA',
    note: 'First U.S. state law governing high-risk automated decision systems.',
    location: [39.74, -104.99], // Denver
    status: 'enacted',
    weight: 0.6,
  },
  {
    id: 'us-california',
    act: 'California AI Transparency Acts',
    region: 'California, USA',
    note: 'Disclosure, training-data, and frontier-model safety obligations.',
    location: [38.58, -121.49], // Sacramento
    status: 'enacted',
    weight: 0.65,
  },
  {
    id: 'us-texas',
    act: 'Texas TRAIGA',
    region: 'Texas, USA',
    note: 'Responsible AI Governance Act targeting harmful and deceptive uses.',
    location: [30.27, -97.74], // Austin
    status: 'enacted',
    weight: 0.55,
  },
  {
    id: 'uk',
    act: 'UK Pro-Innovation Framework',
    region: 'United Kingdom',
    note: 'Principles-based, regulator-led approach coordinated across sectors.',
    location: [51.51, -0.13], // London
    status: 'framework',
    weight: 0.75,
  },
  {
    id: 'canada',
    act: 'AIDA (Bill C-27)',
    region: 'Canada',
    note: 'Artificial Intelligence and Data Act for high-impact systems.',
    location: [45.42, -75.7], // Ottawa
    status: 'proposed',
    weight: 0.6,
  },
  {
    id: 'china',
    act: 'Generative AI Measures',
    region: 'China',
    note: 'Interim measures plus algorithm and deep-synthesis registration rules.',
    location: [39.9, 116.4], // Beijing
    status: 'in-force',
    weight: 0.8,
  },
  {
    id: 'south-korea',
    act: 'AI Basic Act',
    region: 'South Korea',
    note: 'Framework Act establishing trust and high-impact AI obligations.',
    location: [37.57, 126.98], // Seoul
    status: 'enacted',
    weight: 0.6,
  },
  {
    id: 'japan',
    act: 'AI Promotion Act',
    region: 'Japan',
    note: 'Light-touch, innovation-first governance with guidance for business.',
    location: [35.68, 139.69], // Tokyo
    status: 'enacted',
    weight: 0.55,
  },
  {
    id: 'singapore',
    act: 'Model AI Governance Framework',
    region: 'Singapore',
    note: 'Influential voluntary framework with the AI Verify testing toolkit.',
    location: [1.35, 103.82], // Singapore
    status: 'framework',
    weight: 0.55,
  },
  {
    id: 'brazil',
    act: 'AI Bill (PL 2338)',
    region: 'Brazil',
    note: 'Rights-based, risk-tiered bill advancing through the National Congress.',
    location: [-15.79, -47.88], // Brasília
    status: 'proposed',
    weight: 0.55,
  },
  {
    id: 'australia',
    act: 'AI Safety Standards',
    region: 'Australia',
    note: 'Voluntary safety standard with mandatory guardrails under consultation.',
    location: [-35.28, 149.13], // Canberra
    status: 'framework',
    weight: 0.5,
  },
  {
    id: 'iso-42001',
    act: 'ISO/IEC 42001',
    region: 'International',
    note: 'The global certifiable standard for AI management systems.',
    location: [46.2, 6.14], // Geneva
    status: 'framework',
    weight: 0.7,
  },
];

/**
 * Per-status marker RGB (0–1) for cobe theming — the vibrant neon scheme from
 * the original interactive globe. Amber = binding law, cyan = proposed,
 * green = voluntary framework.
 */
export const STATUS_MARKER_RGB: Record<JurisdictionStatus, [number, number, number]> = {
  'in-force': [1.0, 0.722, 0.0], // #ffb800 amber
  enacted: [1.0, 0.722, 0.0], // #ffb800 amber
  proposed: [0.0, 0.831, 1.0], // #00d4ff cyan
  framework: [0.0, 1.0, 0.533], // #00ff88 green
};

/** Tailwind token name for each status — keeps the on-screen legend in sync. */
export const STATUS_TW_COLOR: Record<JurisdictionStatus, string> = {
  'in-force': 'amber',
  enacted: 'amber',
  proposed: 'cyan',
  framework: 'green',
};

/** CSS hex per status — used by the canvas (D3) globe for dot fills. */
export const STATUS_HEX: Record<JurisdictionStatus, string> = {
  'in-force': '#ffb800',
  enacted: '#ffb800',
  proposed: '#00d4ff',
  framework: '#00ff88',
};

/** EU member states as named in world-atlas (Malta omitted — absent at 110m). */
export const EU_MEMBERS = [
  'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czechia', 'Denmark',
  'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Ireland',
  'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Netherlands', 'Poland',
  'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden',
];

/**
 * Geometry binding for each jurisdiction → the country and/or US-state polygons
 * that get a dotted fill. Empty (`{}`) means no polygon at this atlas
 * resolution (city-states / global standards) — the globe falls back to a small
 * marker cluster at the jurisdiction's coordinates.
 */
export interface JurisdictionGeo {
  countries?: string[];
  states?: string[];
}

export const JURISDICTION_GEO: Record<string, JurisdictionGeo> = {
  'eu-ai-act': { countries: EU_MEMBERS },
  'us-federal': { countries: ['United States of America'] },
  'us-colorado': { states: ['Colorado'] },
  'us-california': { states: ['California'] },
  'us-texas': { states: ['Texas'] },
  uk: { countries: ['United Kingdom'] },
  canada: { countries: ['Canada'] },
  china: { countries: ['China'] },
  'south-korea': { countries: ['South Korea'] },
  japan: { countries: ['Japan'] },
  singapore: {}, // city-state — marker fallback
  brazil: { countries: ['Brazil'] },
  australia: { countries: ['Australia'] },
  'iso-42001': {}, // global standard — marker fallback (Geneva)
};

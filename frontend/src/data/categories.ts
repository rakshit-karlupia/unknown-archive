import type { CategoryInfo, RecentDiscovery } from '../types/archive';

export const CATEGORIES: CategoryInfo[] = [
  {
    slug: 'secret-operations',
    number: '01',
    name: 'Secret Operations',
    tagline: 'Area 51, classified projects, military bases',
    description:
      'Declassified reconnaissance airfields, Cold War submarine salvage operations, continuity bunkers, and alleged underground facilities.',
    disciplines: ['Declassified History', 'Aerospace Engineering', 'Intelligence Studies', 'Geophysics'],
    accentColor: '#6C9EFF',
    image: '/images/cat-01-operations.svg',
  },
  {
    slug: 'time-anomalies',
    number: '02',
    name: 'Time Anomalies',
    tagline: 'Time slips, alleged travellers, time machines',
    description:
      'Alleged time slips, internet time-traveller claims, viral historical photographs, and the relativistic physics of closed timelike curves.',
    disciplines: ['Archival Forensics', 'Media History', 'General Relativity', 'Photographic Analysis'],
    accentColor: '#6C9EFF',
    image: '/images/cat-02-time.svg',
  },
  {
    slug: 'strange-encounters',
    number: '03',
    name: 'Strange Encounters',
    tagline: 'Men in Black, mysterious identities, visitors',
    description:
      'Unidentified forensic cases, undeciphered manuscripts, mysterious visitors, and strange historical accounts tested against archival DNA and records.',
    disciplines: ['Forensic Genealogy', 'Codicology', 'Folklore Studies', 'Criminal History'],
    accentColor: '#E5B66A',
    image: '/images/cat-03-encounters.svg',
  },
  {
    slug: 'secret-societies',
    number: '04',
    name: 'Secret Societies',
    tagline: 'Illuminati, Freemasons, private organizations',
    description:
      'Documented fraternal orders, Enlightenment networks, medieval knighthoods, private policy summits, and modern hoaxes separated from primary history.',
    disciplines: ['Archival History', 'Sociology', 'Medieval Studies', 'Political Science'],
    accentColor: '#E5B66A',
    image: '/images/cat-04-societies.svg',
  },
  {
    slug: 'strange-signals',
    number: '05',
    name: 'Strange Signals',
    tagline: 'Numbers stations, radio anomalies, broadcasts',
    description:
      'Unexplained narrowband radio spikes, Cold War shortwave numbers stations, and unsolved television broadcast signal intrusions.',
    disciplines: ['Radio Astronomy', 'Signal Intelligence', 'Broadcast Engineering', 'Spectroscopy'],
    accentColor: '#6C9EFF',
    image: '/images/cat-05-signals.svg',
  },
  {
    slug: 'unknown-creatures',
    number: '06',
    name: 'Unknown Creatures',
    tagline: 'Cryptids, unusual animals, folklore',
    description:
      'Legendary creatures and reported sightings evaluated through environmental DNA surveys, sonar expeditions, and evolutionary biology.',
    disciplines: ['Environmental DNA', 'Zoology', 'Acoustic Sonar', 'Folklore History'],
    accentColor: '#6C9EFF',
    image: '/images/cat-06-creatures.svg',
  },
  {
    slug: 'hidden-earth',
    number: '07',
    name: 'Hidden Earth',
    tagline: 'Antarctica, underground worlds, ocean secrets',
    description:
      'Subglacial lakes sealed beneath Antarctic ice sheets, abyssal ocean trenches, and maritime zones mapped by satellite radar and sonar.',
    disciplines: ['Glaciology', 'Oceanography', 'Bathymetry', 'Geophysics'],
    accentColor: '#6C9EFF',
    image: '/images/cat-07-earth.svg',
  },
  {
    slug: 'lost-civilizations',
    number: '08',
    name: 'Lost Civilizations',
    tagline: 'Atlantis, ancient technology, lost cities',
    description:
      'Bronze Age urban networks, precision astronomical gearwork, monumental engineering, and desert geoglyphs examined via modern archaeology.',
    disciplines: ['Archaeology', 'Archaeoastronomy', 'Geoarchaeology', 'Epigraphy'],
    accentColor: '#E5B66A',
    image: '/images/cat-08-civilizations.svg',
  },
  {
    slug: 'ufo-and-extraterrestrial',
    number: '09',
    name: 'UFO & Extraterrestrial',
    tagline: 'Project Blue Book, Roswell, cosmic searches',
    description:
      'Declassified Air Force aerial sighting investigations, Cold War balloon programs, and the astrophysical search for technosignatures.',
    disciplines: ['Declassified Aviation', 'Astrobiology', 'Exoplanet Science', 'Atmospheric Physics'],
    accentColor: '#6C9EFF',
    image: '/images/cat-09-ufo.svg',
  },
  {
    slug: 'disappearances',
    number: '10',
    name: 'Disappearances',
    tagline: 'Franklin Expedition, Mary Celeste, MH370, Roanoke',
    description:
      'Missing expeditions, ghost ships, vanished flights, and unsolved cold cases reconstructed through satellite telemetry, DNA, and forensics.',
    disciplines: ['Forensic Science', 'Marine Archaeology', 'Satellite Telemetry', 'Archival Law'],
    accentColor: '#E5B66A',
    image: '/images/cat-10-disappearances.svg',
  },
  {
    slug: 'secret-experiments',
    number: '11',
    name: 'Secret Experiments',
    tagline: 'MKUltra, Stargate, controversial projects',
    description:
      'Documented Cold War behavioral, biological, and nuclear research programs—alongside viral internet hoaxes often mistaken for real history.',
    disciplines: ['Declassified Ethics', 'Medical History', 'Intelligence Oversight', 'Nuclear History'],
    accentColor: '#E5B66A',
    image: '/images/cat-11-experiments.svg',
  },
  {
    slug: 'scientific-mysteries',
    number: '12',
    name: 'Scientific Mysteries',
    tagline: 'Dark matter, quantum physics, consciousness',
    description:
      'Frontier questions in cosmology, terminal neurophysiology, and gravitational physics where verified observations point to deeper laws.',
    disciplines: ['Astrophysics', 'Neuroscience', 'Cosmology', 'Theoretical Physics'],
    accentColor: '#6C9EFF',
    image: '/images/cat-12-scientific.svg',
  },
];

export const RECENT_DISCOVERIES: RecentDiscovery[] = [
  {
    id: 'disc-2024-antikythera',
    title: 'Bayesian Calibration Suggests 354-Day Lunar Calendar Ring on Antikythera Mechanism',
    date: 'June 2024',
    institution: 'University of Glasgow / Astronomical Journal of Horology',
    summary:
      'Statistical modeling of LIGO gravitational-wave data-analysis methods applied to micro-CT scans indicated the fragmented calendar ring originally held 354 holes matching a lunar year rather than 365.',
    relatedMysterySlug: 'antikythera-mechanism',
    sourceUrl: 'https://www.gla.ac.uk/news/archiveofnews/2024/june/headline_1087833_en.html',
    discipline: 'Archaeoastronomy & Metrology',
  },
  {
    id: 'disc-2024-nazca-ai',
    title: 'AI-Assisted Aerial Survey Identifies 303 New Figurative Geoglyphs in Nazca',
    date: 'September 2024',
    institution: 'Yamagata University & IBM Research (PNAS)',
    summary:
      'High-resolution drone imagery combined with machine-learning pattern recognition nearly doubled the known count of figurative relief-style geoglyphs along ancient desert walkways.',
    relatedMysterySlug: 'nazca-lines',
    sourceUrl: 'https://www.pnas.org/doi/10.1073/pnas.2407652121',
    discipline: 'Remote Sensing & Archaeology',
  },
  {
    id: 'disc-2024-wow-maser',
    title: 'Arecibo REDS Archival Analysis Proposes Natural Hydrogen Maser Flare Origin for Wow! Signal',
    date: 'August 2024',
    institution: 'Planetary Habitability Laboratory, University of Puerto Rico at Arecibo',
    summary:
      'Archival 2017–2020 Arecibo observations revealed narrower, fainter cold hydrogen line spikes matching the 1420 MHz characteristics of the 1977 signal, pointing to a rare astrophysical maser flare.',
    relatedMysterySlug: 'wow-signal',
    sourceUrl: 'https://arxiv.org/abs/2408.08513',
    discipline: 'Radio Astronomy',
  },
  {
    id: 'disc-2023-nile-branch',
    title: 'Buried Ahramat Nile Branch Mapped Beneath Giza and 31 Pyramid Complexes',
    date: 'May 2024',
    institution: 'University of North Carolina Wilmington (Communications Earth & Environment)',
    summary:
      'Radar satellite imagery and sediment coring confirmed a vanished 64-kilometer Nile tributary that once ran right beside the pyramid fields, explaining heavy limestone transport logistics.',
    relatedMysterySlug: 'ancient-egyptian-pyramids',
    sourceUrl: 'https://www.nature.com/articles/s43247-024-01379-7',
    discipline: 'Geoarchaeology',
  },
  {
    id: 'disc-2023-nde-eeg',
    title: 'Surge of Gamma-Band Neural Coherence Documented in Dying Human Brains',
    date: 'May 2023',
    institution: 'University of Michigan Medical School (PNAS)',
    summary:
      'Continuous EEG recordings of four comatose patients after life-support withdrawal showed organized gamma oscillations and functional connectivity in cortical regions tied to conscious processing.',
    relatedMysterySlug: 'consciousness-terminal-gamma',
    sourceUrl: 'https://www.pnas.org/doi/10.1073/pnas.2216268120',
    discipline: 'Neuroscience',
  },
];

export const TRUSTED_INSTITUTIONS = [
  {
    name: 'NASA',
    fullName: 'National Aeronautics and Space Administration',
    focus: 'Exoplanets, Cosmic Surveys, Earth Observation & IceBridge Radar',
    url: 'https://www.nasa.gov',
  },
  {
    name: 'NOAA',
    fullName: 'National Oceanic and Atmospheric Administration',
    focus: 'Ocean Bathymetry, Mariana Trench Acoustics & Marine Meteorology',
    url: 'https://oceanexplorer.noaa.gov',
  },
  {
    name: 'Smithsonian',
    fullName: 'Smithsonian Institution Open Access',
    focus: 'Anthropology, Ancient Civilizations & Archival Collections',
    url: 'https://www.si.edu/openaccess',
  },
  {
    name: 'NARA & CIA FOIA',
    fullName: 'U.S. National Archives & Declassified Reading Rooms',
    focus: 'Area 51, Project Blue Book, MKUltra, Azorian & Stargate Records',
    url: 'https://www.archives.gov',
  },
  {
    name: 'British Antarctic Survey',
    fullName: 'BAS Polar Data Centre',
    focus: 'BEDMAP Subglacial Topography, Ice Cores & Subglacial Lakes',
    url: 'https://www.bas.ac.uk',
  },
  {
    name: 'Peer-Reviewed Journals',
    fullName: 'Nature, Science, PNAS & The Astrophysical Journal',
    focus: 'Primary Empirical Studies, Ancient DNA & General Relativity',
    url: 'https://scholar.google.com',
  },
];

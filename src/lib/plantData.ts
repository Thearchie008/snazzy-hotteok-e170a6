import type { PlantStage, PlantStats } from './types'

export interface SpeciesData {
  key: string
  name: string
  description: string
  lore: string
  baseStats: PlantStats
  stageEmojis: [string, string, string, string, string]
  gradientFrom: string
  gradientTo: string
  glowColor: string
  accentColor: string
  badgeColor: string
}

export const SPECIES: Record<string, SpeciesData> = {
  thornbriar: {
    key: 'thornbriar',
    name: 'Thornbriar',
    description: 'Ferocious rose creature with razor-sharp thorns',
    lore: 'Born from cursed garden soil, Thornbriar creatures channel rage into every spike.',
    baseStats: { hp: 80, maxHp: 80, attack: 15, defense: 8, speed: 10 },
    stageEmojis: ['🌱', '🌹', '🥀', '🌺', '🌸'],
    gradientFrom: 'from-rose-950',
    gradientTo: 'to-red-800',
    glowColor: '#f43f5e',
    accentColor: 'text-rose-400',
    badgeColor: 'bg-rose-900 text-rose-300 border-rose-700',
  },
  venomvine: {
    key: 'venomvine',
    name: 'Venomvine',
    description: 'Slithering vine creature dripping with paralytic poison',
    lore: 'Ancient forests whisper of Venomvines that can corrode stone with a single touch.',
    baseStats: { hp: 70, maxHp: 70, attack: 12, defense: 10, speed: 16 },
    stageEmojis: ['🌱', '🌿', '🍃', '🪴', '🌾'],
    gradientFrom: 'from-purple-950',
    gradientTo: 'to-violet-800',
    glowColor: '#a855f7',
    accentColor: 'text-violet-400',
    badgeColor: 'bg-violet-900 text-violet-300 border-violet-700',
  },
  mushroar: {
    key: 'mushroar',
    name: 'Mushroar',
    description: 'Hulking mushroom beast with earth-shaking stomps',
    lore: 'Mushroars hibernate for centuries, erupting from forest floors with colossal fury.',
    baseStats: { hp: 110, maxHp: 110, attack: 10, defense: 14, speed: 7 },
    stageEmojis: ['🌱', '🍄', '🍄', '🍄', '🍄'],
    gradientFrom: 'from-amber-950',
    gradientTo: 'to-orange-800',
    glowColor: '#f97316',
    accentColor: 'text-amber-400',
    badgeColor: 'bg-amber-900 text-amber-300 border-amber-700',
  },
  blazepetal: {
    key: 'blazepetal',
    name: 'Blazepetal',
    description: 'Volcanic sunflower that scorches everything nearby',
    lore: 'Blazepetrals thrive near volcano mouths, their petals burning at 1000 degrees.',
    baseStats: { hp: 75, maxHp: 75, attack: 16, defense: 7, speed: 14 },
    stageEmojis: ['🌱', '🌻', '🌻', '🌻', '🌻'],
    gradientFrom: 'from-yellow-950',
    gradientTo: 'to-amber-700',
    glowColor: '#eab308',
    accentColor: 'text-yellow-400',
    badgeColor: 'bg-yellow-900 text-yellow-300 border-yellow-700',
  },
  frostfern: {
    key: 'frostfern',
    name: 'Frostfern',
    description: 'Crystalline fern that freezes the air around it',
    lore: 'Grown in arctic tundra, Frostferns shatter steel and encase enemies in ice.',
    baseStats: { hp: 90, maxHp: 90, attack: 11, defense: 16, speed: 9 },
    stageEmojis: ['🌱', '🌿', '❄️', '❄️', '🧊'],
    gradientFrom: 'from-cyan-950',
    gradientTo: 'to-sky-800',
    glowColor: '#06b6d4',
    accentColor: 'text-cyan-400',
    badgeColor: 'bg-cyan-900 text-cyan-300 border-cyan-700',
  },
  stormkale: {
    key: 'stormkale',
    name: 'Stormkale',
    description: 'Lightning-charged leafy beast crackling with electricity',
    lore: 'Stormkales are drawn to thunderstorms, absorbing lightning to fuel their attacks.',
    baseStats: { hp: 72, maxHp: 72, attack: 14, defense: 9, speed: 18 },
    stageEmojis: ['🌱', '🌿', '⚡', '⚡', '🌩️'],
    gradientFrom: 'from-indigo-950',
    gradientTo: 'to-blue-800',
    glowColor: '#6366f1',
    accentColor: 'text-indigo-400',
    badgeColor: 'bg-indigo-900 text-indigo-300 border-indigo-700',
  },
  shadowmoss: {
    key: 'shadowmoss',
    name: 'Shadowmoss',
    description: 'Dark moss entity that phases through shadows',
    lore: 'Shadowmoss creatures have haunted ancient ruins for millennia, feeding on fear.',
    baseStats: { hp: 85, maxHp: 85, attack: 13, defense: 13, speed: 13 },
    stageEmojis: ['🌱', '🌑', '🌑', '🌑', '🌑'],
    gradientFrom: 'from-slate-950',
    gradientTo: 'to-zinc-800',
    glowColor: '#64748b',
    accentColor: 'text-slate-400',
    badgeColor: 'bg-slate-800 text-slate-300 border-slate-600',
  },
  glowshroom: {
    key: 'glowshroom',
    name: 'Glowshroom',
    description: 'Bioluminescent mushroom that blinds foes with brilliance',
    lore: 'Deep cave explorers fear the Glowshroom — its light lures, then overwhelms.',
    baseStats: { hp: 88, maxHp: 88, attack: 12, defense: 12, speed: 11 },
    stageEmojis: ['🌱', '🍄', '✨', '💚', '🌟'],
    gradientFrom: 'from-emerald-950',
    gradientTo: 'to-green-800',
    glowColor: '#10b981',
    accentColor: 'text-emerald-400',
    badgeColor: 'bg-emerald-900 text-emerald-300 border-emerald-700',
  },
}

export const STAGE_NAMES: Record<PlantStage, string> = {
  0: 'Seed',
  1: 'Sprout',
  2: 'Sapling',
  3: 'Elder',
  4: 'Ancient',
}

export const XP_THRESHOLDS: [number, number, number, number, number] = [
  0, 100, 300, 700, 1500,
]

export function getStageForXp(xp: number): PlantStage {
  if (xp >= XP_THRESHOLDS[4]) return 4
  if (xp >= XP_THRESHOLDS[3]) return 3
  if (xp >= XP_THRESHOLDS[2]) return 2
  if (xp >= XP_THRESHOLDS[1]) return 1
  return 0
}

export function getXpToNextStage(xp: number, stage: PlantStage): number | null {
  if (stage === 4) return null
  return XP_THRESHOLDS[stage + 1] - xp
}

export function getXpProgressPercent(xp: number, stage: PlantStage): number {
  if (stage === 4) return 100
  const stageStart = XP_THRESHOLDS[stage]
  const stageEnd = XP_THRESHOLDS[stage + 1]
  return Math.round(((xp - stageStart) / (stageEnd - stageStart)) * 100)
}

export function getSpeciesEmoji(species: string, stage: PlantStage): string {
  return SPECIES[species]?.stageEmojis[stage] ?? '🌱'
}

export type PlantStage = 0 | 1 | 2 | 3 | 4

export type StatKey = 'attack' | 'defense' | 'speed' | 'hp'

export interface PlantStats {
  hp: number
  maxHp: number
  attack: number
  defense: number
  speed: number
}

export interface Plant {
  id: string
  name: string
  species: string
  ownerId: string
  ownerName: string
  stage: PlantStage
  xp: number
  stats: PlantStats
  statPoints: number
  createdAt: string
  lastFed: string
  battleWins: number
  battleLosses: number
}

export interface BattleLogEntry {
  turn: number
  attacker: string
  defender: string
  damage: number
  defenderHpLeft: number
}

export interface BattleResult {
  winner: Plant
  loser: Plant
  log: BattleLogEntry[]
  attackerWon: boolean
}

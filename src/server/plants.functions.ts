import { createServerFn } from '@tanstack/react-start'
import { getStore } from '@netlify/blobs'
import type { Plant, PlantStage, StatKey, BattleResult } from '../lib/types'
import { getStageForXp, XP_THRESHOLDS, SPECIES } from '../lib/plantData'

function getPlantsStore() {
  return getStore({ name: 'monster-plants', consistency: 'strong' })
}

async function savePlant(plant: Plant): Promise<void> {
  const store = getPlantsStore()
  await store.setJSON(`plant:${plant.id}`, plant)
}

async function loadPlant(plantId: string): Promise<Plant | null> {
  const store = getPlantsStore()
  return store.get(`plant:${plantId}`, { type: 'json' }) as Promise<Plant | null>
}

async function getPlayerIndex(ownerId: string): Promise<string[]> {
  const store = getPlantsStore()
  const ids = await store.get(`player:${ownerId}`, { type: 'json' })
  return (ids as string[] | null) ?? []
}

async function savePlayerIndex(ownerId: string, ids: string[]): Promise<void> {
  const store = getPlantsStore()
  await store.setJSON(`player:${ownerId}`, ids)
}

export const createPlant = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { ownerId: string; ownerName: string; name: string; species: string }) => data,
  )
  .handler(async ({ data }) => {
    const species = SPECIES[data.species]
    if (!species) throw new Error('Invalid species')

    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    const plant: Plant = {
      id,
      name: data.name,
      species: data.species,
      ownerId: data.ownerId,
      ownerName: data.ownerName,
      stage: 0,
      xp: 0,
      stats: { ...species.baseStats },
      statPoints: 0,
      createdAt: now,
      lastFed: new Date(0).toISOString(),
      battleWins: 0,
      battleLosses: 0,
    }

    await savePlant(plant)

    const ids = await getPlayerIndex(data.ownerId)
    ids.push(id)
    await savePlayerIndex(data.ownerId, ids)

    return plant
  })

export const getPlant = createServerFn({ method: 'GET' })
  .inputValidator((data: { plantId: string }) => data)
  .handler(async ({ data }) => {
    return loadPlant(data.plantId)
  })

export const getPlayerPlants = createServerFn({ method: 'GET' })
  .inputValidator((data: { ownerId: string }) => data)
  .handler(async ({ data }) => {
    const ids = await getPlayerIndex(data.ownerId)
    const plants = await Promise.all(ids.map((id) => loadPlant(id)))
    return plants.filter((p): p is Plant => p !== null)
  })

export const getAllPlants = createServerFn({ method: 'GET' }).handler(async () => {
  const store = getPlantsStore()
  const { blobs } = await store.list({ prefix: 'plant:' })
  const plants = await Promise.all(
    blobs.map((b) => store.get(b.key, { type: 'json' }) as Promise<Plant | null>),
  )
  return plants.filter((p): p is Plant => p !== null)
})

export const feedPlant = createServerFn({ method: 'POST' })
  .inputValidator((data: { plantId: string; ownerId: string }) => data)
  .handler(async ({ data }) => {
    const plant = await loadPlant(data.plantId)
    if (!plant) throw new Error('Plant not found')
    if (plant.ownerId !== data.ownerId) throw new Error('Not your plant')

    const XP_GAIN = 50
    const oldStage = plant.stage
    plant.xp += XP_GAIN
    plant.lastFed = new Date().toISOString()

    const newStage = getStageForXp(plant.xp)
    const stagedUp = newStage > oldStage

    if (stagedUp) {
      plant.stage = newStage as PlantStage
      plant.statPoints += 3
    }

    await savePlant(plant)
    return { plant, stagedUp, xpGained: XP_GAIN }
  })

export const upgradeStat = createServerFn({ method: 'POST' })
  .inputValidator((data: { plantId: string; ownerId: string; stat: StatKey }) => data)
  .handler(async ({ data }) => {
    const plant = await loadPlant(data.plantId)
    if (!plant) throw new Error('Plant not found')
    if (plant.ownerId !== data.ownerId) throw new Error('Not your plant')
    if (plant.statPoints < 1) throw new Error('No stat points available')

    const INCREASES: Record<StatKey, Partial<Plant['stats']>> = {
      hp: { hp: plant.stats.hp + 20, maxHp: plant.stats.maxHp + 20 },
      attack: { attack: plant.stats.attack + 5 },
      defense: { defense: plant.stats.defense + 5 },
      speed: { speed: plant.stats.speed + 5 },
    }

    plant.stats = { ...plant.stats, ...INCREASES[data.stat] }
    plant.statPoints -= 1

    await savePlant(plant)
    return plant
  })

export const battlePlants = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { attackerId: string; defenderId: string; attackerOwnerId: string }) => data,
  )
  .handler(async ({ data }) => {
    const [attacker, defender] = await Promise.all([
      loadPlant(data.attackerId),
      loadPlant(data.defenderId),
    ])
    if (!attacker) throw new Error('Your plant not found')
    if (!defender) throw new Error('Opponent plant not found')
    if (attacker.ownerId !== data.attackerOwnerId) throw new Error('Not your plant')
    if (attacker.id === defender.id) throw new Error('Cannot battle yourself')

    // Simulate battle with cloned HP values
    const aHP = { current: attacker.stats.hp }
    const dHP = { current: defender.stats.hp }
    const log: BattleResult['log'] = []
    let turn = 0
    const MAX_TURNS = 50

    // Determine who goes first based on speed
    let aFirst = attacker.stats.speed >= defender.stats.speed
    let aAtk = true // attacker attacks this turn?

    if (aFirst) {
      aAtk = true
    } else {
      aAtk = false
    }

    while (aHP.current > 0 && dHP.current > 0 && turn < MAX_TURNS) {
      turn++
      const atkPlant = aAtk ? attacker : defender
      const defPlant = aAtk ? defender : attacker
      const defHP = aAtk ? dHP : aHP

      const rawDmg = Math.max(1, atkPlant.stats.attack - Math.floor(defPlant.stats.defense * 0.5))
      const damage = rawDmg + Math.floor(Math.random() * 4)
      defHP.current = Math.max(0, defHP.current - damage)

      log.push({
        turn,
        attacker: atkPlant.name,
        defender: defPlant.name,
        damage,
        defenderHpLeft: defHP.current,
      })

      aAtk = !aAtk
    }

    const attackerWon = dHP.current <= 0

    // Award XP to winner
    const winner = attackerWon ? attacker : defender
    const loser = attackerWon ? defender : attacker

    winner.xp += 100
    winner.battleWins += 1
    loser.battleLosses += 1

    const winnerOldStage = winner.stage
    const winnerNewStage = getStageForXp(winner.xp)
    if (winnerNewStage > winnerOldStage) {
      winner.stage = winnerNewStage as PlantStage
      winner.statPoints += 3
    }

    await Promise.all([savePlant(winner), savePlant(loser)])

    return { winner, loser, log, attackerWon } as BattleResult
  })

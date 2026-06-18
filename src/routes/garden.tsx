import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { getPlayerPlants } from '../server/plants.functions'
import { SPECIES, STAGE_NAMES, getXpProgressPercent, getXpToNextStage, getSpeciesEmoji } from '../lib/plantData'
import type { Plant } from '../lib/types'

export const Route = createFileRoute('/garden')({
  component: Garden,
})

function PlantCard({ plant }: { plant: Plant }) {
  const species = SPECIES[plant.species]
  if (!species) return null
  const emoji = getSpeciesEmoji(plant.species, plant.stage)
  const xpPct = getXpProgressPercent(plant.xp, plant.stage)
  const xpToNext = getXpToNextStage(plant.xp, plant.stage)

  return (
    <Link
      to="/plant/$plantId"
      params={{ plantId: plant.id }}
      className="plant-card p-5 cursor-pointer group block"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${species.gradientFrom} ${species.gradientTo} opacity-20 rounded-2xl`} />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div
            className="text-5xl group-hover:scale-110 transition-transform duration-300"
            style={{ filter: `drop-shadow(0 0 12px ${species.glowColor})` }}
          >
            {emoji}
          </div>
          <div className="text-right">
            <span className={`text-xs px-2 py-1 rounded-full border ${species.badgeColor}`}>
              {STAGE_NAMES[plant.stage]}
            </span>
            {plant.statPoints > 0 && (
              <div className="mt-1 text-xs text-yellow-400 font-bold animate-pulse">
                ✨ {plant.statPoints} pts
              </div>
            )}
          </div>
        </div>

        <h3 className="font-bold text-white text-lg leading-tight">{plant.name}</h3>
        <p className={`text-xs font-medium ${species.accentColor} mb-3`}>{species.name}</p>

        {/* XP Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{plant.xp} XP</span>
            <span>{xpToNext !== null ? `${xpToNext} to next` : 'MAX'}</span>
          </div>
          <div className="xp-bar">
            <div className="xp-bar-fill" style={{ width: `${xpPct}%` }} />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-1 text-center">
          {[
            { label: 'ATK', value: plant.stats.attack, color: 'text-red-400' },
            { label: 'DEF', value: plant.stats.defense, color: 'text-blue-400' },
            { label: 'SPD', value: plant.stats.speed, color: 'text-yellow-400' },
            { label: 'HP', value: plant.stats.maxHp, color: 'text-green-400' },
          ].map((s) => (
            <div key={s.label} className="bg-black/30 rounded-lg p-1">
              <p className={`text-xs font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex justify-between text-xs text-gray-500">
          <span>⚔️ {plant.battleWins}W {plant.battleLosses}L</span>
          <span>Stage {plant.stage}/4</span>
        </div>
      </div>
    </Link>
  )
}

function Garden() {
  const [plants, setPlants] = useState<Plant[]>([])
  const [loading, setLoading] = useState(true)
  const [playerId, setPlayerId] = useState<string>('')

  useEffect(() => {
    let id = localStorage.getItem('ecoguardian-player-id')
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem('ecoguardian-player-id', id)
    }
    setPlayerId(id)

    getPlayerPlants({ data: { ownerId: id } })
      .then(setPlants)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">My Garden</h1>
          <p className="text-gray-400 mt-1">
            {plants.length === 0 && !loading ? 'No monsters yet — hatch one!' : `${plants.length} monster${plants.length !== 1 ? 's' : ''} growing`}
          </p>
        </div>
        <Link to="/hatch" className="btn-primary">
          🥚 Hatch New
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="plant-card h-52 animate-pulse bg-white/5" />
          ))}
        </div>
      ) : plants.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-7xl mb-4">🌱</div>
          <h2 className="text-2xl font-bold text-white mb-2">Your garden is empty</h2>
          <p className="text-gray-400 mb-8">Hatch your first monster plant to get started!</p>
          <Link to="/hatch" className="btn-primary">
            🥚 Hatch Your First Monster
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {plants.map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      )}
    </div>
  )
}

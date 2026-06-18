import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { getPlant, feedPlant, upgradeStat } from '../server/plants.functions'
import {
  SPECIES,
  STAGE_NAMES,
  XP_THRESHOLDS,
  getXpProgressPercent,
  getXpToNextStage,
  getSpeciesEmoji,
} from '../lib/plantData'
import type { Plant, StatKey } from '../lib/types'

export const Route = createFileRoute('/plant/$plantId')({
  loader: async ({ params }) => {
    const plant = await getPlant({ data: { plantId: params.plantId } })
    return { plant }
  },
  component: PlantDetail,
})

function StatRow({
  label,
  value,
  max,
  color,
  barColor,
  statKey,
  canUpgrade,
  onUpgrade,
}: {
  label: string
  value: number
  max: number
  color: string
  barColor: string
  statKey: StatKey
  canUpgrade: boolean
  onUpgrade: (s: StatKey) => void
}) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="flex items-center gap-3">
      <span className={`text-xs font-bold w-8 ${color}`}>{label}</span>
      <div className="flex-1 stat-bar">
        <div className={`stat-bar-fill ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-white w-8 text-right">{value}</span>
      {canUpgrade && (
        <button
          onClick={() => onUpgrade(statKey)}
          className="w-6 h-6 rounded-full bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold flex items-center justify-center transition-colors active:scale-90"
          title={`Upgrade ${label}`}
        >
          +
        </button>
      )}
    </div>
  )
}

function StageUpOverlay({
  plant,
  onClose,
}: {
  plant: Plant
  onClose: () => void
}) {
  const species = SPECIES[plant.species]
  const emoji = getSpeciesEmoji(plant.species, plant.stage)

  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      onClick={onClose}
      style={{
        background: `radial-gradient(circle at center, ${species?.glowColor ?? '#10b981'}33 0%, #000000cc 60%)`,
      }}
    >
      <div
        className="text-9xl animate-stageup mb-6"
        style={{ filter: `drop-shadow(0 0 60px ${species?.glowColor ?? '#10b981'})` }}
      >
        {emoji}
      </div>
      <div className="text-center animate-slide-up">
        <p className="text-yellow-400 text-lg font-bold uppercase tracking-widest mb-2">Stage Up!</p>
        <h2 className="text-4xl font-black text-white mb-2">{plant.name}</h2>
        <p className={`text-xl font-bold ${species?.accentColor}`}>
          became {STAGE_NAMES[plant.stage]}!
        </p>
        <p className="text-sm text-gray-400 mt-3">+3 stat points awarded</p>
      </div>
      <p className="mt-10 text-xs text-gray-500">tap to dismiss</p>
    </div>
  )
}

function PlantDetail() {
  const { plant: initialPlant } = Route.useLoaderData()
  const [plant, setPlant] = useState<Plant | null>(initialPlant)
  const [playerId, setPlayerId] = useState('')
  const [feeding, setFeeding] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [showStageUp, setShowStageUp] = useState(false)
  const [feedMessage, setFeedMessage] = useState<string | null>(null)
  const plantRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let id = localStorage.getItem('ecoguardian-player-id')
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem('ecoguardian-player-id', id)
    }
    setPlayerId(id)
  }, [])

  if (!plant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🌱</div>
          <p className="text-gray-400">Monster not found</p>
          <Link to="/garden" className="btn-primary mt-4 inline-block">
            Back to Garden
          </Link>
        </div>
      </div>
    )
  }

  const species = SPECIES[plant.species]
  const isOwner = playerId === plant.ownerId
  const emoji = getSpeciesEmoji(plant.species, plant.stage)
  const xpPct = getXpProgressPercent(plant.xp, plant.stage)
  const xpToNext = getXpToNextStage(plant.xp, plant.stage)

  async function handleFeed() {
    if (!isOwner || feeding) return
    setFeeding(true)
    try {
      const result = await feedPlant({ data: { plantId: plant!.id, ownerId: playerId } })
      setPlant(result.plant)
      setFeedMessage(`+${result.xpGained} XP`)
      setTimeout(() => setFeedMessage(null), 1500)
      if (result.stagedUp) {
        setTimeout(() => setShowStageUp(true), 400)
      }
    } finally {
      setFeeding(false)
    }
  }

  async function handleUpgrade(stat: StatKey) {
    if (!isOwner || upgrading) return
    setUpgrading(true)
    try {
      const updated = await upgradeStat({ data: { plantId: plant!.id, ownerId: playerId, stat } })
      setPlant(updated)
    } finally {
      setUpgrading(false)
    }
  }

  const maxStatValue = 200

  return (
    <>
      {showStageUp && plant && (
        <StageUpOverlay plant={plant} onClose={() => setShowStageUp(false)} />
      )}

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Back */}
        <Link to="/garden" className="text-gray-400 hover:text-white text-sm flex items-center gap-1 mb-6 transition-colors w-fit">
          ← My Garden
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Plant Visual */}
          <div>
            <div
              ref={plantRef}
              className={`glass-panel text-center py-12 bg-gradient-to-br ${species?.gradientFrom} ${species?.gradientTo}`}
              style={{ borderColor: `${species?.glowColor}44` }}
            >
              <div
                className="text-9xl animate-float inline-block mb-6"
                style={{
                  filter: `drop-shadow(0 0 30px ${species?.glowColor}) drop-shadow(0 0 60px ${species?.glowColor}66)`,
                  '--glow-color': species?.glowColor,
                } as React.CSSProperties}
              >
                {emoji}
              </div>
              <h1 className="text-3xl font-black text-white">{plant.name}</h1>
              <p className={`font-medium ${species?.accentColor} mt-1`}>{species?.name}</p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className={`px-3 py-1 rounded-full text-sm border ${species?.badgeColor}`}>
                  {STAGE_NAMES[plant.stage]} (Stage {plant.stage}/4)
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-3">Trainer: {plant.ownerName}</p>
            </div>

            {/* XP Bar */}
            <div className="glass-panel mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300 font-medium">Experience</span>
                <span className="text-gray-400">
                  {plant.stage < 4 ? `${xpToNext} XP to ${STAGE_NAMES[(plant.stage + 1) as 1 | 2 | 3 | 4]}` : 'MAX LEVEL'}
                </span>
              </div>
              <div className="xp-bar mb-1">
                <div
                  className="xp-bar-fill"
                  style={{ width: `${xpPct}%`, transition: 'width 0.7s ease-out' }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{plant.xp} XP total</span>
                <span>{plant.stage < 4 ? `${XP_THRESHOLDS[plant.stage + 1]} needed` : '🏆 Ancient'}</span>
              </div>
            </div>

            {/* Feed Button */}
            {isOwner && plant.stage < 4 && (
              <div className="mt-4 relative">
                <button
                  onClick={handleFeed}
                  disabled={feeding}
                  className="btn-primary w-full text-lg relative overflow-hidden"
                >
                  {feeding ? '⏳ Feeding…' : '🌿 Feed Monster (+50 XP)'}
                </button>
                {feedMessage && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-emerald-400 font-bold text-lg animate-slide-up pointer-events-none">
                    {feedMessage}
                  </div>
                )}
              </div>
            )}

            {/* Battle record */}
            <div className="glass-panel mt-4 flex justify-around text-center">
              <div>
                <p className="text-2xl font-black text-emerald-400">{plant.battleWins}</p>
                <p className="text-xs text-gray-400">Wins</p>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <p className="text-2xl font-black text-red-400">{plant.battleLosses}</p>
                <p className="text-xs text-gray-400">Losses</p>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <p className="text-2xl font-black text-yellow-400">
                  {plant.battleWins + plant.battleLosses > 0
                    ? Math.round((plant.battleWins / (plant.battleWins + plant.battleLosses)) * 100)
                    : 0}%
                </p>
                <p className="text-xs text-gray-400">Win Rate</p>
              </div>
            </div>
          </div>

          {/* Right: Stats */}
          <div>
            <div className="glass-panel mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Stats</h2>
                {plant.statPoints > 0 && isOwner && (
                  <span className="px-3 py-1 rounded-full bg-yellow-900/50 border border-yellow-600/50 text-yellow-300 text-xs font-bold animate-pulse">
                    ✨ {plant.statPoints} stat point{plant.statPoints !== 1 ? 's' : ''} available!
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <StatRow
                  label="ATK"
                  value={plant.stats.attack}
                  max={maxStatValue}
                  color="text-red-400"
                  barColor="bg-gradient-to-r from-red-800 to-red-400"
                  statKey="attack"
                  canUpgrade={isOwner && plant.statPoints > 0}
                  onUpgrade={handleUpgrade}
                />
                <StatRow
                  label="DEF"
                  value={plant.stats.defense}
                  max={maxStatValue}
                  color="text-blue-400"
                  barColor="bg-gradient-to-r from-blue-800 to-blue-400"
                  statKey="defense"
                  canUpgrade={isOwner && plant.statPoints > 0}
                  onUpgrade={handleUpgrade}
                />
                <StatRow
                  label="SPD"
                  value={plant.stats.speed}
                  max={maxStatValue}
                  color="text-yellow-400"
                  barColor="bg-gradient-to-r from-yellow-800 to-yellow-400"
                  statKey="speed"
                  canUpgrade={isOwner && plant.statPoints > 0}
                  onUpgrade={handleUpgrade}
                />
                <StatRow
                  label="HP"
                  value={plant.stats.maxHp}
                  max={maxStatValue}
                  color="text-green-400"
                  barColor="bg-gradient-to-r from-green-800 to-green-400"
                  statKey="hp"
                  canUpgrade={isOwner && plant.statPoints > 0}
                  onUpgrade={handleUpgrade}
                />
              </div>

              {isOwner && plant.statPoints > 0 && (
                <p className="text-xs text-gray-500 mt-4">
                  Click + to upgrade a stat. ATK/DEF/SPD +5, HP +20
                </p>
              )}
            </div>

            {/* Species Info */}
            <div className={`glass-panel bg-gradient-to-br ${species?.gradientFrom} ${species?.gradientTo} border-0`}>
              <h3 className={`font-bold ${species?.accentColor} mb-2`}>{species?.name}</h3>
              <p className="text-sm text-gray-300 leading-relaxed">{species?.lore}</p>
            </div>

            {/* Stage Progress */}
            <div className="glass-panel mt-4">
              <h3 className="font-bold text-white mb-3">Growth Stages</h3>
              <div className="flex items-center gap-1">
                {([0, 1, 2, 3, 4] as const).map((s) => (
                  <div key={s} className="flex-1 text-center">
                    <div
                      className={`text-2xl mb-1 transition-all duration-300 ${
                        s === plant.stage
                          ? 'scale-125 animate-float'
                          : s < plant.stage
                          ? 'opacity-70'
                          : 'opacity-20 grayscale'
                      }`}
                    >
                      {species?.stageEmojis[s]}
                    </div>
                    <p
                      className={`text-xs ${
                        s === plant.stage ? `font-bold ${species?.accentColor}` : 'text-gray-500'
                      }`}
                    >
                      {STAGE_NAMES[s]}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {isOwner && (
              <Link to="/battle" className="btn-danger mt-4 w-full text-center block">
                ⚔️ Take to Battle
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

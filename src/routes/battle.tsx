import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { getAllPlants, battlePlants } from '../server/plants.functions'
import { SPECIES, STAGE_NAMES, getSpeciesEmoji } from '../lib/plantData'
import type { Plant, BattleResult } from '../lib/types'

export const Route = createFileRoute('/battle')({
  component: BattleArena,
})

function MiniPlantCard({
  plant,
  selected,
  onClick,
  dim,
}: {
  plant: Plant
  selected: boolean
  onClick: () => void
  dim?: boolean
}) {
  const species = SPECIES[plant.species]
  const emoji = getSpeciesEmoji(plant.species, plant.stage)

  return (
    <button
      onClick={onClick}
      className={`plant-card p-4 text-left w-full transition-all duration-200 ${dim ? 'opacity-40' : ''} ${
        selected
          ? 'ring-2 scale-105'
          : 'hover:border-white/30'
      }`}
      style={
        selected
          ? { ringColor: species?.glowColor, borderColor: species?.glowColor, boxShadow: `0 0 20px ${species?.glowColor}66` }
          : undefined
      }
    >
      <div className="flex items-center gap-3">
        <span
          className="text-3xl"
          style={selected ? { filter: `drop-shadow(0 0 10px ${species?.glowColor})` } : undefined}
        >
          {emoji}
        </span>
        <div>
          <p className="font-bold text-white text-sm">{plant.name}</p>
          <p className={`text-xs ${species?.accentColor}`}>{species?.name}</p>
          <p className="text-xs text-gray-500">{STAGE_NAMES[plant.stage]} • by {plant.ownerName}</p>
          <div className="flex gap-2 text-xs text-gray-400 mt-1">
            <span>⚔️{plant.stats.attack}</span>
            <span>🛡️{plant.stats.defense}</span>
            <span>💨{plant.stats.speed}</span>
            <span>❤️{plant.stats.maxHp}</span>
          </div>
        </div>
      </div>
    </button>
  )
}

function HpBar({ current, max, color }: { current: number; max: number; color: string }) {
  const pct = Math.max(0, Math.round((current / max) * 100))
  const barColor = pct > 50 ? 'bg-green-500' : pct > 25 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span className={color}>HP</span>
        <span>{current}/{max}</span>
      </div>
      <div className="stat-bar">
        <div className={`stat-bar-fill ${barColor} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function BattleArena() {
  const [playerId, setPlayerId] = useState('')
  const [allPlants, setAllPlants] = useState<Plant[]>([])
  const [myPlants, setMyPlants] = useState<Plant[]>([])
  const [opponentPlants, setOpponentPlants] = useState<Plant[]>([])
  const [attacker, setAttacker] = useState<Plant | null>(null)
  const [defender, setDefender] = useState<Plant | null>(null)
  const [battling, setBattling] = useState(false)
  const [result, setResult] = useState<BattleResult | null>(null)
  const [visibleLog, setVisibleLog] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let id = localStorage.getItem('ecoguardian-player-id')
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem('ecoguardian-player-id', id)
    }
    setPlayerId(id)

    getAllPlants()
      .then((plants) => {
        setAllPlants(plants)
        setMyPlants(plants.filter((p) => p.ownerId === id))
        setOpponentPlants(plants.filter((p) => p.ownerId !== id))
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleBattle() {
    if (!attacker || !defender || battling) return
    setBattling(true)
    setResult(null)
    setVisibleLog(0)

    try {
      const res = await battlePlants({
        data: {
          attackerId: attacker.id,
          defenderId: defender.id,
          attackerOwnerId: playerId,
        },
      })
      setResult(res)

      // Animate log entries one by one
      let i = 0
      const interval = setInterval(() => {
        i++
        setVisibleLog(i)
        if (i >= res.log.length) clearInterval(interval)
      }, 200)
    } catch (e) {
      console.error(e)
    } finally {
      setBattling(false)
    }
  }

  function resetBattle() {
    setResult(null)
    setVisibleLog(0)
    setAttacker(null)
    setDefender(null)
    // Refresh plants
    getAllPlants().then((plants) => {
      setAllPlants(plants)
      setMyPlants(plants.filter((p) => p.ownerId === playerId))
      setOpponentPlants(plants.filter((p) => p.ownerId !== playerId))
    })
  }

  const attackerSpecies = attacker ? SPECIES[attacker.species] : null
  const defenderSpecies = defender ? SPECIES[defender.species] : null

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Battle Arena</h1>
        <p className="text-gray-400 mt-1">Challenge other trainers — winner earns 100 XP</p>
      </div>

      {/* Battle Stage */}
      {(attacker || defender) && (
        <div className="glass-panel mb-8 py-8">
          <div className="flex items-center justify-around gap-4">
            {/* Attacker side */}
            <div className={`text-center flex-1 transition-all duration-500 ${result && !result.attackerWon ? 'opacity-40' : ''}`}>
              {attacker ? (
                <>
                  <div
                    className={`text-7xl mb-3 inline-block ${result?.attackerWon ? 'animate-victory-pulse' : result ? '' : 'animate-float'}`}
                    style={{ filter: `drop-shadow(0 0 20px ${attackerSpecies?.glowColor})` }}
                  >
                    {getSpeciesEmoji(attacker.species, attacker.stage)}
                  </div>
                  <p className="font-bold text-white">{attacker.name}</p>
                  <p className={`text-xs ${attackerSpecies?.accentColor}`}>{attackerSpecies?.name}</p>
                  <div className="max-w-xs mx-auto mt-2">
                    <HpBar
                      current={result ? (result.attackerWon ? attacker.stats.hp : 0) : attacker.stats.hp}
                      max={attacker.stats.maxHp}
                      color="text-emerald-400"
                    />
                  </div>
                  {result?.attackerWon && (
                    <div className="mt-2 text-yellow-400 font-bold text-sm animate-slide-up">🏆 WINNER!</div>
                  )}
                </>
              ) : (
                <div className="text-gray-600">
                  <div className="text-5xl mb-2">❓</div>
                  <p className="text-sm">Select your monster</p>
                </div>
              )}
            </div>

            {/* VS */}
            <div className="text-center flex-shrink-0">
              <div className="text-3xl font-black text-gray-600">VS</div>
              {attacker && defender && !result && (
                <button
                  onClick={handleBattle}
                  disabled={battling}
                  className="btn-danger mt-4 text-sm px-4 py-2"
                >
                  {battling ? '⚔️ Fighting…' : '⚔️ BATTLE!'}
                </button>
              )}
              {result && (
                <button onClick={resetBattle} className="btn-primary mt-4 text-sm px-4 py-2">
                  🔄 New Battle
                </button>
              )}
            </div>

            {/* Defender side */}
            <div className={`text-center flex-1 transition-all duration-500 ${result && result.attackerWon ? 'opacity-40' : ''}`}>
              {defender ? (
                <>
                  <div
                    className={`text-7xl mb-3 inline-block ${result && !result.attackerWon ? 'animate-victory-pulse' : result ? '' : 'animate-float'}`}
                    style={{ filter: `drop-shadow(0 0 20px ${defenderSpecies?.glowColor})` }}
                  >
                    {getSpeciesEmoji(defender.species, defender.stage)}
                  </div>
                  <p className="font-bold text-white">{defender.name}</p>
                  <p className={`text-xs ${defenderSpecies?.accentColor}`}>{defenderSpecies?.name}</p>
                  <div className="max-w-xs mx-auto mt-2">
                    <HpBar
                      current={result ? (result.attackerWon ? 0 : defender.stats.hp) : defender.stats.hp}
                      max={defender.stats.maxHp}
                      color="text-red-400"
                    />
                  </div>
                  {result && !result.attackerWon && (
                    <div className="mt-2 text-yellow-400 font-bold text-sm animate-slide-up">🏆 WINNER!</div>
                  )}
                </>
              ) : (
                <div className="text-gray-600">
                  <div className="text-5xl mb-2">❓</div>
                  <p className="text-sm">Select an opponent</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Battle Log */}
      {result && result.log.length > 0 && (
        <div className="glass-panel mb-8">
          <h3 className="font-bold text-white mb-3">Battle Log</h3>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {result.log.slice(0, visibleLog).map((entry) => (
              <div key={entry.turn} className="text-xs text-gray-400 flex items-center gap-2 animate-slide-up">
                <span className="text-gray-600 w-6 text-right">T{entry.turn}</span>
                <span className="text-white">{entry.attacker}</span>
                <span className="text-red-400">→ -{entry.damage} dmg →</span>
                <span className="text-white">{entry.defender}</span>
                <span className={entry.defenderHpLeft <= 0 ? 'text-red-400 font-bold' : 'text-gray-500'}>
                  ({entry.defenderHpLeft <= 0 ? 'KO!' : `${entry.defenderHpLeft} HP left`})
                </span>
              </div>
            ))}
          </div>
          {result && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-sm text-emerald-400 font-bold">
                🏆 {result.winner.name} wins! +100 XP
              </p>
            </div>
          )}
        </div>
      )}

      {/* Plant Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Plants */}
        <div>
          <h2 className="text-lg font-bold text-white mb-3">Your Monsters</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="plant-card h-20 animate-pulse bg-white/5" />
              ))}
            </div>
          ) : myPlants.length === 0 ? (
            <div className="glass-panel text-center py-8">
              <p className="text-gray-400 text-sm">No monsters yet.</p>
              <a href="/hatch" className="text-emerald-400 text-sm hover:underline mt-1 block">
                Hatch one first →
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {myPlants.map((p) => (
                <MiniPlantCard
                  key={p.id}
                  plant={p}
                  selected={attacker?.id === p.id}
                  onClick={() => setAttacker(p)}
                  dim={!!result}
                />
              ))}
            </div>
          )}
        </div>

        {/* Opponents */}
        <div>
          <h2 className="text-lg font-bold text-white mb-3">Challengers</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="plant-card h-20 animate-pulse bg-white/5" />
              ))}
            </div>
          ) : opponentPlants.length === 0 ? (
            <div className="glass-panel text-center py-8">
              <p className="text-gray-400 text-sm">No other players yet.</p>
              <p className="text-gray-500 text-xs mt-1">Share the link and challenge friends!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {opponentPlants.map((p) => (
                <MiniPlantCard
                  key={p.id}
                  plant={p}
                  selected={defender?.id === p.id}
                  onClick={() => setDefender(p)}
                  dim={!!result}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

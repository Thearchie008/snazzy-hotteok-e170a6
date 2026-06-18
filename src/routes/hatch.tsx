import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { createPlant } from '../server/plants.functions'
import { SPECIES } from '../lib/plantData'

export const Route = createFileRoute('/hatch')({
  component: Hatch,
})

function Hatch() {
  const navigate = useNavigate()
  const [playerId, setPlayerId] = useState('')
  const [selectedSpecies, setSelectedSpecies] = useState('')
  const [plantName, setPlantName] = useState('')
  const [trainerName, setTrainerName] = useState('')
  const [hatching, setHatching] = useState(false)
  const [hatchedId, setHatchedId] = useState<string | null>(null)
  const [hatchEmoji, setHatchEmoji] = useState('🌱')

  useEffect(() => {
    let id = localStorage.getItem('ecoguardian-player-id')
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem('ecoguardian-player-id', id)
    }
    setPlayerId(id)

    const savedName = localStorage.getItem('ecoguardian-trainer-name') ?? ''
    setTrainerName(savedName)
  }, [])

  const canSubmit = selectedSpecies && plantName.trim() && trainerName.trim() && !hatching

  async function handleHatch() {
    if (!canSubmit) return
    setHatching(true)
    setHatchEmoji('🌰')

    try {
      localStorage.setItem('ecoguardian-trainer-name', trainerName.trim())
      const plant = await createPlant({
        data: {
          ownerId: playerId,
          ownerName: trainerName.trim(),
          name: plantName.trim(),
          species: selectedSpecies,
        },
      })
      setHatchedId(plant.id)
      setHatchEmoji(SPECIES[selectedSpecies]?.stageEmojis[0] ?? '🌱')

      setTimeout(() => {
        navigate({ to: '/plant/$plantId', params: { plantId: plant.id } })
      }, 2200)
    } catch {
      setHatching(false)
    }
  }

  if (hatching) {
    const species = SPECIES[selectedSpecies]
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{
          background: `radial-gradient(circle at center, ${species?.glowColor ?? '#10b981'}22 0%, transparent 60%)`,
        }}
      >
        <div
          key={hatchedId ?? 'hatching'}
          className="text-9xl animate-hatch mb-8"
          style={{
            filter: `drop-shadow(0 0 40px ${species?.glowColor ?? '#10b981'})`,
          }}
        >
          {hatchEmoji}
        </div>
        <div className="animate-slide-up text-center">
          <h2 className="text-3xl font-black text-white mb-2">{plantName} is awakening!</h2>
          <p className={`text-lg font-semibold ${species?.accentColor ?? 'text-emerald-400'}`}>
            A {species?.name} stirs from its seed…
          </p>
        </div>
        <div className="mt-8 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Hatch a Monster</h1>
        <p className="text-gray-400 mt-1">Choose your species and bring a new creature into the world</p>
      </div>

      {/* Trainer Name */}
      <div className="glass-panel mb-6">
        <h2 className="text-lg font-bold text-white mb-4">Your Trainer Name</h2>
        <input
          type="text"
          value={trainerName}
          onChange={(e) => setTrainerName(e.target.value)}
          placeholder="Enter your trainer name…"
          maxLength={24}
          className="w-full bg-gray-800 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>

      {/* Species Selection */}
      <div className="glass-panel mb-6">
        <h2 className="text-lg font-bold text-white mb-4">Choose Species</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.values(SPECIES).map((s) => (
            <button
              key={s.key}
              onClick={() => setSelectedSpecies(s.key)}
              className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                selectedSpecies === s.key
                  ? `border-2 bg-gradient-to-br ${s.gradientFrom} ${s.gradientTo}`
                  : 'border-white/10 hover:border-white/30 bg-white/5'
              }`}
              style={{
                borderColor: selectedSpecies === s.key ? s.glowColor : undefined,
                boxShadow: selectedSpecies === s.key ? `0 0 20px ${s.glowColor}44` : undefined,
              }}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{s.stageEmojis[4]}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold ${s.accentColor}`}>{s.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{s.description}</p>
                  <div className="flex gap-2 mt-2 text-xs text-gray-500">
                    <span>⚔️ ATK {s.baseStats.attack}</span>
                    <span>🛡️ DEF {s.baseStats.defense}</span>
                    <span>💨 SPD {s.baseStats.speed}</span>
                    <span>❤️ HP {s.baseStats.hp}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Plant Name */}
      {selectedSpecies && (
        <div className="glass-panel mb-6 animate-slide-up">
          <h2 className="text-lg font-bold text-white mb-4">Name Your Monster</h2>
          <input
            type="text"
            value={plantName}
            onChange={(e) => setPlantName(e.target.value)}
            placeholder={`Give your ${SPECIES[selectedSpecies]?.name ?? 'monster'} a fearsome name…`}
            maxLength={20}
            className="w-full bg-gray-800 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      )}

      {/* Lore */}
      {selectedSpecies && (
        <div className="mb-6 p-4 rounded-xl border border-white/10 bg-emerald-950/20 animate-slide-up">
          <p className="text-sm text-emerald-300 italic">&ldquo;{SPECIES[selectedSpecies].lore}&rdquo;</p>
        </div>
      )}

      <button onClick={handleHatch} disabled={!canSubmit} className="btn-primary w-full text-lg">
        🥚 Hatch {plantName || 'Monster'}
      </button>
    </div>
  )
}

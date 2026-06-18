import { createFileRoute, Link } from '@tanstack/react-router'
import { getAllPlants } from '../server/plants.functions'
import { SPECIES, STAGE_NAMES, getSpeciesEmoji } from '../lib/plantData'
import type { Plant } from '../lib/types'

export const Route = createFileRoute('/')({
  loader: async () => {
    const plants = await getAllPlants()
    // Show most recent 6 plants
    const recent = plants
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6)
    return { recent, total: plants.length }
  },
  component: Home,
})

function PlantPreviewCard({ plant }: { plant: Plant }) {
  const species = SPECIES[plant.species]
  if (!species) return null
  const emoji = getSpeciesEmoji(plant.species, plant.stage)

  return (
    <Link
      to="/plant/$plantId"
      params={{ plantId: plant.id }}
      className="plant-card p-5 flex flex-col items-center gap-3 cursor-pointer group"
    >
      <div
        className="text-5xl animate-float"
        style={{ '--glow-color': species.glowColor } as React.CSSProperties}
      >
        <span className="animate-glow-pulse inline-block">{emoji}</span>
      </div>
      <div className="text-center">
        <p className="font-bold text-white group-hover:text-emerald-300 transition-colors">{plant.name}</p>
        <p className={`text-xs font-medium ${species.accentColor}`}>{species.name}</p>
        <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs border ${species.badgeColor}`}>
          {STAGE_NAMES[plant.stage]}
        </span>
      </div>
      <p className="text-xs text-gray-500">by {plant.ownerName}</p>
    </Link>
  )
}

function Home() {
  const { recent, total } = Route.useLoaderData()

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/30 via-transparent to-transparent pointer-events-none" />
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, #059669 0%, transparent 50%), radial-gradient(circle at 80% 20%, #7c3aed 0%, transparent 40%)',
          }}
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="text-8xl mb-6 animate-float inline-block" style={{ filter: 'drop-shadow(0 0 30px #10b981)' }}>
            🌿
          </div>
          <h1 className="text-5xl sm:text-6xl font-black mb-4 bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 bg-clip-text text-transparent">
            Eco Guardian
          </h1>
          <p className="text-xl text-gray-400 mb-3 max-w-2xl mx-auto">
            Grow monstrous plant creatures from seeds. Befriend them. Battle rivals.
          </p>
          <p className="text-sm text-emerald-600 mb-10">
            {total > 0 ? `${total} monsters roaming the garden` : 'Be the first to hatch a monster!'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/hatch" className="btn-primary text-center text-lg px-8 py-4">
              🥚 Hatch Your First Monster
            </Link>
            <Link
              to="/garden"
              className="px-8 py-4 rounded-xl font-semibold text-emerald-300 border border-emerald-700/50 hover:border-emerald-500 hover:bg-emerald-950/50 transition-all duration-200 text-center text-lg"
            >
              🌱 View My Garden
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: '🌱',
              title: 'Grow & Evolve',
              desc: 'Feed your monsters to gain XP and grow through 5 magnificent stages — from humble seed to Ancient creature.',
            },
            {
              icon: '⚔️',
              title: 'Battle & Conquer',
              desc: 'Challenge other players\' monsters to battle. Strategy matters — upgrade your stats wisely!',
            },
            {
              icon: '✨',
              title: 'Upgrade Stats',
              desc: 'Each evolution grants stat points. Boost attack, defense, speed, or HP to shape your strategy.',
            },
          ].map((f) => (
            <div key={f.title} className="glass-panel text-center">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Species Preview */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-2">Choose Your Species</h2>
          <p className="text-gray-400 text-sm mb-6">8 unique monster plant species, each with distinct abilities</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.values(SPECIES).map((s) => (
              <div
                key={s.key}
                className={`glass-panel p-4 text-center bg-gradient-to-br ${s.gradientFrom} ${s.gradientTo} border-0`}
              >
                <div className="text-3xl mb-2">{s.stageEmojis[4]}</div>
                <p className={`font-bold text-sm ${s.accentColor}`}>{s.name}</p>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{s.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Monsters */}
        {recent.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Recently Hatched</h2>
            <p className="text-gray-400 text-sm mb-6">The latest monsters awakening in the garden</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {recent.map((plant) => (
                <PlantPreviewCard key={plant.id} plant={plant} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

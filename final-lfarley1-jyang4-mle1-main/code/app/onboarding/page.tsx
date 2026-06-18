'use client'
import { useEffect, useState, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { getOnboardingOptions, submitOnboarding, OnboardingOptions } from '@/lib/api'
import { useKitchenStore } from '@/store/kitchenStore'

type Section = 'dietary_restrictions' | 'allergies' | 'pantry_staples'

const sectionMeta: Record<Section, { label: string; emoji: string; description: string; placeholder: string }> = {
  dietary_restrictions: { label: 'Dietary Preferences', emoji: '🥗', description: 'Select any diets you follow', placeholder: 'Add custom diet...' },
  allergies: { label: 'Allergies', emoji: '⚠️', description: 'Select any ingredients you are allergic to', placeholder: 'Add custom allergy...' },
  pantry_staples: { label: 'Pantry Staples', emoji: '🧂', description: 'What do you always have at home?', placeholder: 'Add custom staple...' },
}

export default function OnboardingPage() {
  const router = useRouter()
  const { completeOnboarding } = useKitchenStore()
  const [options, setOptions] = useState<OnboardingOptions | null>(null)
  const [selected, setSelected] = useState<Record<Section, string[]>>({
    dietary_restrictions: [],
    allergies: [],
    pantry_staples: [],
  })
  const [customInputs, setCustomInputs] = useState<Record<Section, string>>({
    dietary_restrictions: '',
    allergies: '',
    pantry_staples: '',
  })
  const [customItems, setCustomItems] = useState<Record<Section, string[]>>({
    dietary_restrictions: [],
    allergies: [],
    pantry_staples: [],
  })
  const [userSkill, setUserSkill] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getOnboardingOptions().then(setOptions)
  }, [])

  const toggle = (section: Section, item: string) => {
    setSelected(prev => {
      const noPreferenceItems = ['No Diet Preferences', 'No Allergies']
      const isNoPreference = noPreferenceItems.includes(item)
      if (isNoPreference) {
        if (prev[section].includes(item)) return { ...prev, [section]: [] }
        return { ...prev, [section]: [item] }
      }
      const filtered = prev[section].filter(i => !noPreferenceItems.includes(i))
      if (filtered.includes(item)) return { ...prev, [section]: filtered.filter(i => i !== item) }
      return { ...prev, [section]: [...filtered, item] }
    })
  }

  const addCustomItem = (section: Section) => {
    const trimmed = customInputs[section].trim()
    if (!trimmed) return
    const alreadyExists = options?.[section].includes(trimmed) || customItems[section].includes(trimmed)
    if (!alreadyExists) {
      setCustomItems(prev => ({ ...prev, [section]: [...prev[section], trimmed] }))
    }
    // auto-select it
    setSelected(prev => ({
      ...prev,
      [section]: prev[section].includes(trimmed) ? prev[section] : [...prev[section], trimmed]
    }))
    setCustomInputs(prev => ({ ...prev, [section]: '' }))
  }

  const removeCustomItem = (section: Section, item: string) => {
    setCustomItems(prev => ({ ...prev, [section]: prev[section].filter(i => i !== item) }))
    setSelected(prev => ({ ...prev, [section]: prev[section].filter(i => i !== item) }))
  }

  const handleKey = (e: KeyboardEvent, section: Section) => {
    if (e.key === 'Enter') addCustomItem(section)
  }

  const handleSubmit = async () => {
    setLoading(true)
    const payload = { ...selected, user_skill: userSkill }
    await submitOnboarding(payload)
    completeOnboarding(payload)
    router.push('/')
  }

  if (!options) return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">🍳 KitchenSink</h1>
          <p className="text-gray-500 mt-2">Let's personalize your experience</p>
        </div>

        <div className="flex flex-col gap-6">

          {/* cooking skill level */}
          {options.user_skill && options.user_skill.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="mb-4">
                <h2 className="font-bold text-gray-800 text-lg">👨‍🍳 Cooking Skill Level</h2>
                <p className="text-sm text-gray-400">How experienced are you in the kitchen?</p>
              </div>
              <div className="flex flex-col gap-3">
                {options.user_skill.map(({ value, description }) => (
                  <button
                    key={value}
                    onClick={() => setUserSkill(value)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all
                      ${userSkill === value
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-green-400'}`}>
                    <p className="font-semibold text-sm">{value}</p>
                    <p className={`text-xs mt-0.5 ${userSkill === value ? 'text-green-100' : 'text-gray-400'}`}>
                      {description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* dietary, allergies, pantry */}
          {(Object.keys(sectionMeta) as Section[]).map(section => (
            <div key={section} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="mb-4">
                <h2 className="font-bold text-gray-800 text-lg">
                  {sectionMeta[section].emoji} {sectionMeta[section].label}
                </h2>
                <p className="text-sm text-gray-400">{sectionMeta[section].description}</p>
              </div>

              {/* preset options */}
              <div className="flex flex-wrap gap-2 mb-4">
                {options[section].map(item => {
                  const active = selected[section].includes(item)
                  return (
                    <button key={item} onClick={() => toggle(section, item)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all
                        ${active
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-green-400'}`}>
                      {active ? '✓ ' : ''}{item}
                    </button>
                  )
                })}

                {/* custom items */}
                {customItems[section].map(item => (
                  <span key={item} className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium">
                    ✓ {item}
                    <button
                      onClick={() => removeCustomItem(section, item)}
                      className="ml-1 text-green-600 hover:text-red-500 font-bold text-base leading-none">
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* custom input */}
              <div className="flex gap-2 mt-2">
                <input
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder={sectionMeta[section].placeholder}
                  value={customInputs[section]}
                  onChange={e => setCustomInputs(prev => ({ ...prev, [section]: e.target.value }))}
                  onKeyDown={e => handleKey(e, section)}
                />
                <button
                  onClick={() => addCustomItem(section)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                  Add
                </button>
              </div>
            </div>
          ))}

        </div>

        <button onClick={handleSubmit} disabled={loading}
          className="w-full mt-6 bg-green-500 hover:bg-green-600 disabled:bg-gray-200
            text-white font-semibold py-3 rounded-xl transition-colors">
          {loading ? 'Saving...' : "Let's Cook →"}
        </button>
        <button onClick={() => router.push('/')}
          className="w-full mt-2 text-sm text-gray-400 hover:text-gray-600 py-2">
          Skip for now
        </button>
      </div>
    </main>
  )
}
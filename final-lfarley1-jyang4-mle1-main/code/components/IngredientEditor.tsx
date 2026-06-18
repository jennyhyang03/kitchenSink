'use client'
import { useState, KeyboardEvent } from 'react'

interface Props {
  ingredients: string[]
  onChange: (updated: string[]) => void
}

export default function IngredientEditor({ ingredients, onChange }: Props) {
  const [input, setInput] = useState('')

  const add = () => {
    const trimmed = input.trim().toLowerCase()
    if (trimmed && !ingredients.includes(trimmed)) {
      onChange([...ingredients, trimmed])
    }
    setInput('')
  }

  const remove = (item: string) => onChange(ingredients.filter(i => i !== item))

  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter') add()
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Add an ingredient..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
        />
        <button onClick={add}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {ingredients.map(item => (
          <span key={item} className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium">
            {item}
            <button onClick={() => remove(item)} className="ml-1 text-green-600 hover:text-red-500 font-bold text-base leading-none">×</button>
          </span>
        ))}
      </div>
    </div>
  )
}
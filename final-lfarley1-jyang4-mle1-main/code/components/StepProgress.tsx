'use client'

const steps = ['Preferences', 'Upload Photo', 'Edit Ingredients', 'View Recipes']

export default function StepProgress({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
              ${i < current ? 'bg-amber-500 border-amber-500 text-white' :
                i === current ? 'bg-white border-green-500 text-green-600' :
                'bg-white border-gray-300 text-gray-400'}`}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className={`text-xs mt-1 font-medium ${i === current ? 'text-green-600' : 'text-gray-400'}`}>
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-16 h-0.5 mb-4 mx-1 ${i < current ? 'bg-green-500' : 'bg-gray-300'}`} />
          )}
        </div>
      ))}
    </div>
  )
}
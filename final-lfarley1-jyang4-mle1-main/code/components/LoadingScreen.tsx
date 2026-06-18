export default function LoadingScreen({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <div className="text-5xl animate-bounce">🍳</div>
      <p className="text-gray-600 font-medium">{message}</p>
      <div className="flex gap-1 mt-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </main>
  )
}
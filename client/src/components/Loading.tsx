export default function Loading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 bg-bg">
      <div className="!text-[22px] font-bold text-text-h tracking-tight">CCE</div>
      <div className="spinner" />
      <p className="text-text-subtle text-sm">Starting up…</p>
    </div>
  )
}

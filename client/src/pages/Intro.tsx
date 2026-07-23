export default function Intro() {
  return(
    <div className="max-w-[1120px] w-full mx-auto px-6 box-border animate-fade-up">
      <div className="text-center pt-16 pb-22">
        <span className="pill !border !border-border-input">Real-time · CRDT-synced · Multi-user</span>
        <h1 className="!m-0 !mt-6 !mb-5 text-[64px] leading-[1.05] tracking-[-0.03em]">Collaborative<br/>Code Editor</h1>
        <p className="text-[19px] leading-relaxed text-text max-w-[560px] mx-auto">Real-time multi-editing with conflict-free synchronization. Review and edit code together, in the same file, at the same time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pb-24">
        <div className="card">
          <div className="label-blue text-[12px] tracking-[.08em] font-bold mb-3">WHAT</div>
          <p className="text-[15px] leading-relaxed text-text">A collaborative code editor that enables real-time multi-editing with conflict-free synchronization.</p>
        </div>
        <div className="card">
          <div className="label-green text-[12px] tracking-[.08em] font-bold mb-3">WHY</div>
          <p className="text-[15px] leading-relaxed text-text">Code reviews need teams reviewing and editing the same file at once — reducing the friction of async review.</p>
        </div>
        <div className="card">
          <div className="label-purple text-[12px] tracking-[.08em] font-bold mb-3">HOW</div>
          <p className="text-[15px] leading-relaxed text-text">A HocusPocus WebSocket server binds the editor; Yjs CRDTs converge changes; Redis persists state; PostgreSQL is the source of truth.</p>
        </div>
      </div>
    </div>
  )
}
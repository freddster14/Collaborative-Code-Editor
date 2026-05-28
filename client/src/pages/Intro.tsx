export default function Intro() {
  return(
    <div>
      <h2>WHAT?</h2>
      <p>A collaborative code editor that enables real-time multi-editing with conflict-free synchronization.</p> 
      <h2>WHY?</h2>
      <p>Code reviews are needed when working in projects. This enables teams to review and edit code simultaneosly, in the same file, in real time. Reducing the friction of async code review.
      </p>
      <h2>HOW?</h2>
      <p>Websocket server (HocusPocus) binds with the editor to manage all changes on the file. CRDT's strong eventual consistency algorithm ensures the file changes converge with all local users. Redis solves cross-instance synchronization and persists data on server restarts. PostgreSQL acts as a source of truth.
      </p>
    </div>
  )
}
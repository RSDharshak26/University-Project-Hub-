export default function HomePage() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>University Project Hub</h1>
      <p>Discover, collaborate, and showcase student projects.</p>
      <nav style={{ marginTop: "2rem" }}>
        <a href="/projects" style={{ marginRight: "1rem" }}>Projects</a>
        <a href="/login" style={{ marginRight: "1rem" }}>Login</a>
        <a href="/register">Register</a>
      </nav>
    </main>
  );
}


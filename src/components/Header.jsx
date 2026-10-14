import { supabase } from "../supabaseClient";

function Header({ showForm, setShowForm }) {
  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <header className="header" style={{ position: "relative" }}>
      <button
        onClick={handleLogout}
        style={{
          position: "absolute",
          top: -32,
          left: 0,
          background: "none",
          border: "none",
          color: "#a8a29e",
          fontSize: 13,
          fontFamily: "inherit",
          cursor: "pointer",
        }}
      >
        Log out
      </button>

      <div className="logo">
        <img src="/logo.png" alt="Today I Learned logo" />
        <h1>Today I Learned!</h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          className="btn btn-large btn-open"
          onClick={() => setShowForm((show) => !show)}
        >
          {showForm ? "Close" : "Share a fact"}
        </button>
      </div>
    </header>
  );
}

export default Header;

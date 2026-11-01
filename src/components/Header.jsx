import { supabase } from "../supabaseClient";

function Header({ showForm, setShowForm }) {
  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <header className="header">
      <button className="btn-logout" onClick={handleLogout}>
        Log out
      </button>

      <div className="logo">
        <img src="/logo.png" alt="Today I Learned logo" />
        <h1>Today I Learned!</h1>
      </div>

      <button
        className="btn btn-large btn-open"
        onClick={() => setShowForm((show) => !show)}
      >
        {showForm ? "Close" : "Share a fact"}
      </button>
    </header>
  );
}

export default Header;

import { useState } from "react";
import { supabase } from "../supabaseClient";

const inputStyle = { width: "100%", maxWidth: "none" };
const linkButtonStyle = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
};

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    const { error } = isSignup
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    setIsLoading(false);

    if (error) return setError(error.message);
    if (isSignup) {
      setMessage(
        "Account created! Check your email to confirm it, then log in.",
      );
    }
  }

  function toggleMode() {
    setIsSignup((s) => !s);
    setError("");
    setMessage("");
  }

  return (
    <div className="container">
      <div
        className="logo"
        style={{ justifyContent: "center", marginBottom: 40 }}
      >
        <img src="/logo.png" alt="Today I Learned logo" />
        <h1>Today I Learned!</h1>
      </div>

      <form
        className="fact-form"
        style={{ flexDirection: "column", maxWidth: 400, margin: "0 auto" }}
        onSubmit={handleSubmit}
      >
        <h2 style={{ marginBottom: 8 }}>
          {isSignup ? "Create an account" : "Log in"}
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          style={inputStyle}
        />

        <button className="btn btn-large" disabled={isLoading}>
          {isLoading ? "Please wait..." : isSignup ? "Sign up" : "Log in"}
        </button>

        {error && <p className="form-error">{error}</p>}
        {message && <p className="form-success">{message}</p>}

        <button
          type="button"
          onClick={toggleMode}
          className="link-button"
          style={linkButtonStyle}
        >
          {isSignup
            ? "Already have an account? Log in"
            : "Don't have an account? Sign up"}
        </button>
      </form>
    </div>
  );
}

export default Login;

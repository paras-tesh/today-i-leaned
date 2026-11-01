import { useState } from "react";
import { supabase } from "../supabaseClient";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

    if (error) {
      setError(error.message);
      return;
    }

    if (isSignup) {
      setMessage(
        "Account created! If email confirmation is enabled, check your inbox.",
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
      <div className="logo login-logo">
        <img src="/logo.png" alt="Today I Learned logo" />
        <h1>Today I Learned!</h1>
      </div>

      <form className="fact-form login-form" onSubmit={handleSubmit}>
        <h2>{isSignup ? "Create an account" : "Log in"}</h2>

        <input
          type="email"
          placeholder="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />

        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="button"
            className="btn-eye"
            onClick={() => setShowPassword((show) => !show)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <button className="btn btn-large" disabled={isLoading}>
          {isLoading ? "Please wait..." : isSignup ? "Sign up" : "Log in"}
        </button>

        {error ? <p className="form-error">{error}</p> : null}
        {message ? <p className="form-success">{message}</p> : null}

        <button type="button" className="btn-link" onClick={toggleMode}>
          {isSignup
            ? "Already have an account? Log in"
            : "Don't have an account? Sign up"}
        </button>
      </form>
    </div>
  );
}

export default Login;

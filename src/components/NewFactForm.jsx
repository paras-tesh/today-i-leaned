import { useState } from "react";
import { CATEGORIES } from "../data";
import { FACTS_URL, apiHeaders } from "../supabaseClient";

const MAX_LENGTH = 200;

function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

function NewFactForm({ setFacts, setShowForm }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const textLength = text.length;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!text.trim()) {
      setError("Fact text can't be empty.");
      return;
    }
    if (textLength > MAX_LENGTH) {
      setError(`Text can't be longer than ${MAX_LENGTH} characters.`);
      return;
    }
    if (!isValidHttpUrl(source)) {
      setError("Source must be a valid URL starting with http:// or https://");
      return;
    }
    if (!category) {
      setError("Please choose a category.");
      return;
    }

    setIsUploading(true);

    try {
      const res = await fetch(FACTS_URL, {
        method: "POST",
        headers: {
          ...apiHeaders,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({ text, source, category }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(errBody || `Request failed (${res.status})`);
      }

      const [newFact] = await res.json();
      if (newFact) setFacts((facts) => [newFact, ...facts]);

      setText("");
      setSource("");
      setCategory("");
      setShowForm(false);
    } catch (err) {
      setError(`Failed to post the fact: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form className="fact-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Share a fact with the world..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isUploading}
      />
      <span>{MAX_LENGTH - textLength}</span>
      <input
        type="text"
        placeholder="Trustworthy source..."
        value={source}
        onChange={(e) => setSource(e.target.value)}
        disabled={isUploading}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        disabled={isUploading}
      >
        <option value="">Choose category:</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.name} value={cat.name}>
            {cat.name.toUpperCase()}
          </option>
        ))}
      </select>
      <button className="btn btn-large" disabled={isUploading}>
        {isUploading ? "Posting..." : "Post"}
      </button>
      {error ? <p className="form-error">{error}</p> : null}
    </form>
  );
}

export default NewFactForm;

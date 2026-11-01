import { useState } from "react";
import { CATEGORIES } from "../data";
import { FACTS_URL, apiHeaders } from "../supabaseClient";

function Fact({ fact, setFacts }) {
  const isDisputed =
    fact.votesInteresting + fact.votesMindblowing < fact.votesFalse;

  // Which vote (if any) this browser already cast for this fact
  const [votedType, setVotedType] = useState(() =>
    localStorage.getItem(`voted-${fact.id}`),
  );
  const [isVoting, setIsVoting] = useState(false);

  async function handleVote(columnName) {
    if (isVoting) return;
    setIsVoting(true);

    const updates = {};

    if (votedType === columnName) {
      // Same emoji clicked again -> remove the vote
      updates[columnName] = fact[columnName] - 1;
    } else {
      // Switching vote -> remove the old one, add the new one
      if (votedType) updates[votedType] = fact[votedType] - 1;
      updates[columnName] = fact[columnName] + 1;
    }

    try {
      const res = await fetch(`${FACTS_URL}?id=eq.${fact.id}`, {
        method: "PATCH",
        headers: {
          ...apiHeaders,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      const [updatedFact] = await res.json();
      setFacts((facts) =>
        facts.map((f) => (f.id === fact.id ? updatedFact : f)),
      );

      const newVote = votedType === columnName ? null : columnName;
      setVotedType(newVote);

      if (newVote) {
        localStorage.setItem(`voted-${fact.id}`, newVote);
      } else {
        localStorage.removeItem(`voted-${fact.id}`);
      }
    } catch (err) {
      alert(`Failed to update vote: ${err.message}`);
    } finally {
      setIsVoting(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this fact?")) return;

    const res = await fetch(`${FACTS_URL}?id=eq.${fact.id}`, {
      method: "DELETE",
      headers: apiHeaders,
    });

    if (res.ok) {
      setFacts((facts) => facts.filter((f) => f.id !== fact.id));
    } else {
      alert("Failed to delete the fact.");
    }
  }

  function voteButtonStyle(type) {
    return votedType === type ? { outline: "2px solid #fafaf9" } : undefined;
  }

  return (
    <li className="fact">
      <p>
        {isDisputed ? <span className="disputed">[⛔️ DISPUTED]</span> : null}
        {fact.text}
        <a
          className="source"
          href={fact.source}
          target="_blank"
          rel="noreferrer"
        >
          (Source)
        </a>
      </p>

      <span
        className="tag"
        style={{
          backgroundColor: CATEGORIES.find((cat) => cat.name === fact.category)
            ?.color,
        }}
      >
        {fact.category}
      </span>

      <div className="vote-buttons">
        <button
          onClick={() => handleVote("votesInteresting")}
          disabled={isVoting}
          style={voteButtonStyle("votesInteresting")}
        >
          👍 {fact.votesInteresting}
        </button>
        <button
          onClick={() => handleVote("votesMindblowing")}
          disabled={isVoting}
          style={voteButtonStyle("votesMindblowing")}
        >
          🤯 {fact.votesMindblowing}
        </button>
        <button
          onClick={() => handleVote("votesFalse")}
          disabled={isVoting}
          style={voteButtonStyle("votesFalse")}
        >
          ⛔️ {fact.votesFalse}
        </button>
        <button onClick={handleDelete}>🗑️ Delete</button>
      </div>
    </li>
  );
}

export default Fact;

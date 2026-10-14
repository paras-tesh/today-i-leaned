import { useState } from "react";
import { CATEGORIES } from "../data";

const SUPABASE_URL = "https://axeoeumxspzlcctwrmvg.supabase.co/rest/v1/facts";
const SUPABASE_KEY = "sb_publishable_6ckZ0wXxF2GE3VUOOLJhVQ_iKo1IgeV";

const VOTE_TYPES = [
  { key: "votesInteresting", emoji: "👍" },
  { key: "votesMindblowing", emoji: "🤯" },
  { key: "votesFalse", emoji: "⛔️" },
];

async function supabaseRequest(id, options) {
  const res = await fetch(`${SUPABASE_URL}?id=eq.${id}`, options);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res;
}

function Fact({ fact, setFacts }) {
  const isDisputed =
    fact.votesInteresting + fact.votesMindblowing < fact.votesFalse;

  const [votedType, setVotedType] = useState(() =>
    localStorage.getItem(`voted-${fact.id}`),
  );
  const [isVoting, setIsVoting] = useState(false);

  async function handleVote(columnName) {
    if (isVoting) return;
    setIsVoting(true);

    const updates = {
      [columnName]: fact[columnName] + (votedType === columnName ? -1 : 1),
    };
    if (votedType && votedType !== columnName) {
      updates[votedType] = fact[votedType] - 1;
    }

    try {
      const res = await supabaseRequest(fact.id, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_KEY,
          authorization: `Bearer ${SUPABASE_KEY}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify(updates),
      });

      const [updatedFact] = await res.json();
      setFacts((facts) =>
        facts.map((f) => (f.id === fact.id ? updatedFact : f)),
      );

      const newVote = votedType === columnName ? null : columnName;
      setVotedType(newVote);
      newVote
        ? localStorage.setItem(`voted-${fact.id}`, newVote)
        : localStorage.removeItem(`voted-${fact.id}`);
    } catch (err) {
      alert(`Failed to update vote: ${err.message}`);
    } finally {
      setIsVoting(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this fact?")) return;

    try {
      await supabaseRequest(fact.id, {
        method: "DELETE",
        headers: {
          apikey: SUPABASE_KEY,
          authorization: `Bearer ${SUPABASE_KEY}`,
        },
      });
      setFacts((facts) => facts.filter((f) => f.id !== fact.id));
    } catch (err) {
      alert(`Failed to delete the fact: ${err.message}`);
    }
  }

  return (
    <li className="fact">
      <p>
        {isDisputed && <span className="disputed">[⛔️ DISPUTED]</span>}
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
          backgroundColor: CATEGORIES.find((c) => c.name === fact.category)
            ?.color,
        }}
      >
        {fact.category}
      </span>

      <div className="vote-buttons">
        {VOTE_TYPES.map(({ key, emoji }) => (
          <button
            key={key}
            onClick={() => handleVote(key)}
            disabled={isVoting}
            className={votedType === key ? "voted" : ""}
          >
            {emoji} {fact[key]}
          </button>
        ))}
        <button onClick={handleDelete}>🗑️ Delete</button>
      </div>
    </li>
  );
}

export default Fact;

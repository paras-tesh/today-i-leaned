import { useEffect, useState } from "react";
import "./style.css";

import { supabase, FACTS_URL, apiHeaders } from "./supabaseClient";
import Header from "./components/Header.jsx";
import NewFactForm from "./components/NewFactForm.jsx";
import CategoryFilter from "./components/CategoryFilter.jsx";
import FactList from "./components/FactList.jsx";
import Login from "./components/Login.jsx";

function App() {
  const [session, setSession] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [currentCategory, setCurrentCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  // Restore an existing session on load and keep listening for
  // login / logout / token refresh while the app is open.
  useEffect(function () {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsCheckingSession(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // Load facts whenever the category changes (only when logged in).
  useEffect(
    function () {
      if (!session) return;

      let ignore = false; // avoids showing stale results after a fast category switch

      async function getFacts() {
        setIsLoading(true);

        let query = `${FACTS_URL}?select=*&order=id.desc`;
        if (currentCategory !== "all") {
          query += `&category=eq.${currentCategory}`;
        }

        try {
          const res = await fetch(query, { headers: apiHeaders });
          const data = await res.json();
          if (!ignore) setFacts(Array.isArray(data) ? data : []);
        } catch {
          if (!ignore) setFacts([]);
        } finally {
          if (!ignore) setIsLoading(false);
        }
      }
      getFacts();

      return () => {
        ignore = true;
      };
    },
    [currentCategory, session],
  );

  if (isCheckingSession) return <p className="message">Loading...</p>;
  if (!session) return <Login />;

  return (
    <>
      <Header showForm={showForm} setShowForm={setShowForm} />

      {showForm ? (
        <NewFactForm setFacts={setFacts} setShowForm={setShowForm} />
      ) : null}

      <main className="main">
        <CategoryFilter
          currentCategory={currentCategory}
          setCurrentCategory={setCurrentCategory}
        />
        {isLoading ? (
          <p className="message">Loading...</p>
        ) : (
          <FactList facts={facts} setFacts={setFacts} />
        )}
      </main>
    </>
  );
}

export default App;

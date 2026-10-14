import { useEffect, useState } from "react";
import "./style.css";
import { supabase } from "./supabaseClient";

import Header from "./components/Header.jsx";
import NewFactForm from "./components/NewFactForm.jsx";
import CategoryFilter from "./components/CategoryFilter.jsx";
import FactList from "./components/FactList.jsx";
import Login from "./components/Login.jsx";

const SUPABASE_URL = "https://axeoeumxspzlcctwrmvg.supabase.co/rest/v1/facts";
const SUPABASE_KEY = "sb_publishable_6ckZ0wXxF2GE3VUOOLJhVQ_iKo1IgeV";

function App() {
  const [session, setSession] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [currentCategory, setCurrentCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(
    function () {
      if (!session) return;

      async function getFacts() {
        setIsLoading(true);

        let query = `${SUPABASE_URL}?select=*`;
        if (currentCategory !== "all") {
          query += `&category=eq.${currentCategory}`;
        }

        const res = await fetch(query, {
          headers: {
            apikey: SUPABASE_KEY,
            authorization: `Bearer ${SUPABASE_KEY}`,
          },
        });
        const data = await res.json();

        setFacts(data);
        setIsLoading(false);
      }
      getFacts();
    },
    [currentCategory, session],
  );

  if (isCheckingSession) return <p className="message">Loading...</p>;
  if (!session) return <Login />;

  return (
    <>
      <Header showForm={showForm} setShowForm={setShowForm} session={session} />

      {showForm ? (
        <NewFactForm setFacts={setFacts} setShowForm={setShowForm} />
      ) : null}

      <main className="main">
        <CategoryFilter setCurrentCategory={setCurrentCategory} />
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

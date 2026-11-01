import { useEffect, useRef, useState } from "react";
import { CATEGORIES } from "../data";

const ALL_GRADIENT = "linear-gradient(135deg, #3b82f6, #ef444e, #16a34a, #eab308)";

function CategoryFilter({ currentCategory, setCurrentCategory }) {
  // On small screens the list is collapsed behind a "Category" button
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);

  const active = CATEGORIES.find((cat) => cat.name === currentCategory);

  function selectCategory(name) {
    setCurrentCategory(name);
    setIsOpen(false);
  }

  // Close the menu with Escape or when tapping outside of it
  useEffect(
    function () {
      if (!isOpen) return;

      function handleKey(e) {
        if (e.key === "Escape") setIsOpen(false);
      }
      function handlePointer(e) {
        if (rootRef.current && !rootRef.current.contains(e.target)) {
          setIsOpen(false);
        }
      }

      document.addEventListener("keydown", handleKey);
      document.addEventListener("pointerdown", handlePointer);
      return () => {
        document.removeEventListener("keydown", handleKey);
        document.removeEventListener("pointerdown", handlePointer);
      };
    },
    [isOpen],
  );

  return (
    <aside className="filter" ref={rootRef}>
      <button
        type="button"
        className="filter-toggle"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls="category-list"
      >
        <span
          className="filter-dot"
          style={{ background: active ? active.color : ALL_GRADIENT }}
        />
        <span className="filter-label">
          Category: <strong>{active ? active.name : "all"}</strong>
        </span>
        <span className={`filter-chevron ${isOpen ? "open" : ""}`} aria-hidden="true">
          ▾
        </span>
      </button>

      <ul
        id="category-list"
        className={`category-list ${isOpen ? "open" : ""}`}
      >
        <li className="category category-all">
          <button
            className={`btn btn-all-categories ${currentCategory === "all" ? "active" : ""}`}
            onClick={() => selectCategory("all")}
          >
            All
          </button>
        </li>

        {CATEGORIES.map((cat) => (
          <li className="category" key={cat.name}>
            <button
              className={`btn btn-category ${currentCategory === cat.name ? "active" : ""}`}
              style={{ backgroundColor: cat.color }}
              onClick={() => selectCategory(cat.name)}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default CategoryFilter;

import React, { useState, useRef, useEffect, useMemo } from "react";
import "./searchableselect.css";

/**
 * A searchable single-select dropdown.
 *
 * options: [{ value, label, sub, keywords }]
 *   - label: main line (e.g. doctor name)
 *   - sub:   secondary line (e.g. "Cardiology · Ahmedabad")
 *   - keywords: string matched against the query (name + dept + city)
 * value: currently selected value
 * onChange(option): called with the whole option object
 */
const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder = "Search…",
  emptyText = "No matches",
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const boxRef = useRef(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.slice(0, 50);
    return options
      .filter((o) => (o.keywords || o.label).toLowerCase().includes(q))
      .slice(0, 50);
  }, [options, query]);

  const pick = (o) => {
    onChange(o);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="ss-box" ref={boxRef}>
      <button
        type="button"
        className={`ss-trigger ${selected ? "has-val" : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        {selected ? (
          <span className="ss-selected">
            <strong>{selected.label}</strong>
            {selected.sub && <small>{selected.sub}</small>}
          </span>
        ) : (
          <span className="ss-ph">{placeholder}</span>
        )}
        <span className={`ss-chev ${open ? "up" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="ss-panel">
          <input
            className="ss-search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a name, department or city…"
          />
          <div className="ss-list">
            {results.length === 0 && <div className="ss-empty">{emptyText}</div>}
            {results.map((o) => (
              <button
                type="button"
                key={o.value}
                className={`ss-opt ${o.value === value ? "active" : ""}`}
                onClick={() => pick(o)}
              >
                <strong>{o.label}</strong>
                {o.sub && <small>{o.sub}</small>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;

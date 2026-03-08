import { useEffect, useMemo, useRef, useState } from "react";
import "../../styles/components/plt-modal.css";
import type { GameState } from "../types/gameTypes";
import { CrtModal } from "./CrtModal";
import { buildPltIndex, type PltEntry } from "./plt-index";

type PLTModalProps = {
  onClose: () => void;
  state: GameState;
  hasPower?: boolean;
  hasLink?: boolean;
  entries?: PltEntry[];
};

const KEY_ROWS: string[][] = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

function normalizeTerm(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function renderLibraryText(raw: string) {
  const stripped = raw.replace(/~/g, "");
  const withBreaks = stripped.replace(/\^\^/g, "\n\n").replace(/\^/g, "\n");

  return withBreaks.trim();
}

export function PLTModal({ onClose, state, entries }: PLTModalProps) {
  const [query, setQuery] = useState("");
  const [loadedEntries, setLoadedEntries] = useState<PltEntry[] | null>(
    entries ?? null,
  );
  const [display, setDisplay] = useState<string>(() => {
    if (!(state.itemState.itemSettings["PLT"] as any)?.isOn)
      return "The PLT is off.";
    if (!state.worldState.powerRestoredSections["library-power"])
      return "No link. The LINK indicator remains dark.";
    return entries
      ? "Enter a search term to consult the Central Library."
      : "Link established. Loading library index...";
  });

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (entries) {
      setLoadedEntries(entries);
      return;
    }

    let cancelled = false;

    import("./plt-entries").then((mod) => {
      if (cancelled) return;
      setLoadedEntries(mod.DEFAULT_PLT_ENTRIES);
      setDisplay((prev) =>
        prev === "Link established. Loading library index..."
          ? "Enter a search term to consult the Central Library."
          : prev,
      );
    });

    return () => {
      cancelled = true;
    };
  }, [entries]);

  const { entryList, index } = useMemo(() => {
    const entryList = loadedEntries ?? [];
    return buildPltIndex(entryList);
  }, [loadedEntries]);

  const [flashKey, setFlashKey] = useState<string | null>(null);
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key?.toLowerCase();
      if (!k) return;
      const isRendered = KEY_ROWS.some((row) => row.includes(k));
      if (!isRendered) return;

      setFlashKey(k);
      window.setTimeout(() => {
        setFlashKey((cur) => (cur === k ? null : cur));
      }, 120);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function runLookup(termRaw: string) {
    if (!(state.itemState.itemSettings["PLT"] as any)?.isOn) {
      setDisplay("The PLT is off.");
      return;
    }
    if (!state.worldState.powerRestoredSections["library-power"]) {
      setDisplay("No link. The LINK indicator remains dark.");
      return;
    }
    if (!loadedEntries) {
      setDisplay("The PLT is still indexing the Central Library.");
      return;
    }

    const term = normalizeTerm(termRaw);
    if (!term) {
      setDisplay("Type something to search for.");
      return;
    }

    const hitId = index.get(term);
    if (hitId) {
      const found = entryList.find((e) => e.id === hitId);
      setDisplay(found ? renderLibraryText(found.body) : "Entry index error.");
      return;
    }
    const candidates: PltEntry[] = [];
    for (const e of entryList) {
      const allTerms = e.terms.map(normalizeTerm);
      if (allTerms.some((t) => t.includes(term) || term.includes(t))) {
        candidates.push(e);
      }
    }

    if (candidates.length === 1) {
      setDisplay(renderLibraryText(candidates[0].body));
      return;
    }

    if (candidates.length > 1) {
      const names = candidates
        .slice(0, 8)
        .map((c) => c.terms[0])
        .join(", ");

      setDisplay(
        `You'll have to be more specific.\n\nPossible matches: ${names}${
          candidates.length > 8 ? ", ..." : ""
        }`
      );
      return;
    }

    setDisplay("I'm afraid I have no entry for that.");
  }

  return (
    <CrtModal
      title="PLT Viewer"
      onClose={onClose}
      width={510}
      showHeader={false}
    >
      <div className="plt">
        <div className="plt-top">
          <div className="plt-logoArea">
            <div className="plt-logoLine1">
              <div className="plt-logoText">OMNI</div>
              <div className="plt-logoTag">MINI-PEDIA</div>
            </div>
            <div className="plt-logoStrap">
              Public Library Terminal-3 • Central Library Access
            </div>
          </div>

          <div className="plt-indicators">
            <div className="plt-indicatorStack">
              <div
                className={`plt-light ${
                  (state.itemState.itemSettings["PLT"] as any)?.isOn
                    ? "is-on"
                    : ""
                }`}
              />
              <div className="plt-lightLabel">PWR</div>
            </div>
            <div className="plt-indicatorStack">
              <div
                className={`plt-light ${
                  state.worldState.powerRestoredSections["library-power"]
                    ? "is-on"
                    : ""
                }`}
              />
              <div className="plt-lightLabel">LINK</div>
            </div>
          </div>
        </div>

        {/* Reader portion */}
        <div className="plt-reader" aria-live="polite">
          <pre className="plt-readerText">{display}</pre>
        </div>

        {/* Search bar */}
        <form
          className="plt-searchRow"
          onSubmit={(e) => {
            e.preventDefault();
            runLookup(query);
            setQuery("");
          }}
        >
          <label className="plt-searchLabel" htmlFor="plt-search">
            SEARCH
          </label>
          <input
            id="plt-search"
            ref={inputRef}
            className="plt-searchInput"
            value={query}
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              (state.itemState.itemSettings["PLT"] as any)?.isOn
                ? state.worldState.powerRestoredSections["library-power"]
                  ? "Enter query item here"
                  : "LINK unavailable"
                : "Power off"
            }
            disabled={
              !(state.itemState.itemSettings["PLT"] as any)?.isOn ||
              !state.worldState.powerRestoredSections["library-power"] ||
              !loadedEntries
            }
          />
        </form>

        {/* Virtual keyboard (non-clickable) */}
        <div className="plt-kbd">
          <div className="plt-kbdGrid" aria-hidden="true">
            {KEY_ROWS.map((row, i) => (
              <div className="plt-kbdRow" key={i}>
                {row.map((k) => (
                  <div
                    key={k}
                    className={`plt-key ${flashKey === k ? "is-flash" : ""}`}
                    data-key={k}
                  >
                    {k.toUpperCase()}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </CrtModal>
  );
}

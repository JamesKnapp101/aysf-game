import { getCometKeyRows } from "./cometKeyboardHelpers";

type CometKeyboardProps = {
  flashKey: string | null;
};

export function CometKeyboard({ flashKey }: CometKeyboardProps) {
  const keyRows = getCometKeyRows();

  return (
    <div className="comet-kbd">
      <div className="comet-kbdGrid" aria-hidden="true">
        {keyRows.map((row, i) => (
          <div className="comet-kbdRow" key={i}>
            {row.map((key) => (
              <div
                key={key}
                className={`comet-key ${flashKey === key ? "is-flash" : ""}`}
                data-key={key}
              >
                {key.toUpperCase()}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

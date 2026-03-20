const COMET_KEY_ROWS: string[][] = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

export function isCometKeyboardKey(key: string): boolean {
  return COMET_KEY_ROWS.some((row) => row.includes(key));
}

type CometKeyboardProps = {
  flashKey: string | null;
};

export function CometKeyboard({ flashKey }: CometKeyboardProps) {
  return (
    <div className="comet-kbd">
      <div className="comet-kbdGrid" aria-hidden="true">
        {COMET_KEY_ROWS.map((row, i) => (
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

type ClickForMoreProps = {
  visible: boolean;
};

export const ClickForMoreOverlay: React.FC<ClickForMoreProps> = ({
  visible,
}) => {
  if (!visible) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        padding: "8px 10px",
        background:
          "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.85))",
        textAlign: "center",
        fontWeight: 700,
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      Click for more
    </div>
  );
};

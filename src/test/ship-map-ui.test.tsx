import { ShipMapPanel } from "@game/components/ShipMap";
import {
  getShipMapBounds,
  getPrimaryShipMapNodeForRoom,
  getShipMapNodesForLevel,
  getShipMapShapesForLevel,
} from "@game/map/shipMapModel";
import type { ShipMapNode, ShipMapShape } from "@game/map/shipMapTypes";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { createTestState } from "./helpers/gameTestHelpers";

function getViewBoxNumbers(svg: SVGSVGElement | null): number[] {
  return svg?.getAttribute("viewBox")?.split(/\s+/).map(Number) ?? [];
}

function getNodeCenter(node: ShipMapNode): { x: number; y: number } {
  return {
    x: node.x + node.width / 2,
    y: node.y + node.height / 2,
  };
}

function getEllipseCenter(shape: ShipMapShape): { x: number; y: number } {
  return {
    x: shape.x + shape.width / 2,
    y: shape.y + shape.height / 2,
  };
}

function isPointInsideEllipse(
  point: { x: number; y: number },
  shape: ShipMapShape,
): boolean {
  if (shape.type !== "ellipse") return false;

  const center = getEllipseCenter(shape);
  const normalizedX = (point.x - center.x) / (shape.width / 2);
  const normalizedY = (point.y - center.y) / (shape.height / 2);

  return normalizedX * normalizedX + normalizedY * normalizedY <= 1;
}

describe("ship map UI", () => {
  it("opens the full ship map overlay from the minimap", async () => {
    const user = userEvent.setup();
    const state = createTestState({ roomId: "ParkCenter" });
    const gameRoot = document.createElement("div");
    const mount = document.createElement("div");
    gameRoot.className = "game-root";
    gameRoot.append(mount);
    document.body.append(gameRoot);

    const view = render(<ShipMapPanel state={state} />, { container: mount });
    const { container } = view;

    expect(screen.getByRole("button", { name: /open ship map/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /open ship map/i }));

    const overlay = screen.getByRole("dialog", { name: /ship map/i });
    expect(overlay).toBeInTheDocument();
    expect(overlay.parentElement).toBe(gameRoot);
    expect(screen.getByText("SHIP MAP")).toBeInTheDocument();
    expect(container.querySelector(".ship-map-overlay")).toBeNull();

    view.unmount();
    gameRoot.remove();
  });

  it("zooms the minimap with the mouse wheel", async () => {
    const state = createTestState({ roomId: "ParkCenter" });

    render(<ShipMapPanel state={state} />);

    const minimap = screen.getByRole("button", { name: /open ship map/i });
    const svg = minimap.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(minimap.querySelector(".ship-map-current-marker")).toBeNull();
    expect(
      minimap.querySelector('.ship-map-node[data-status="current"]'),
    ).toBeInTheDocument();

    const initialViewBox = svg?.getAttribute("viewBox");

    fireEvent.wheel(minimap, { deltaY: -120 });

    await waitFor(() => {
      expect(svg?.getAttribute("viewBox")).not.toBe(initialViewBox);
    });
  });

  it("starts zoomed in but can zoom back out to the full level", async () => {
    const state = createTestState({ roomId: "ParkCenter" });
    const fullLevelBounds = getShipMapBounds(
      getShipMapNodesForLevel("level-three"),
      140,
      getShipMapShapesForLevel("level-three"),
    );

    render(<ShipMapPanel state={state} />);

    const minimap = screen.getByRole("button", { name: /open ship map/i });
    const svg = minimap.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(fullLevelBounds).toBeDefined();

    expect(getViewBoxNumbers(svg)[2]).toBeLessThan(fullLevelBounds!.width);

    for (let i = 0; i < 9; i += 1) {
      fireEvent.wheel(minimap, { deltaY: 120 });
    }

    await waitFor(() => {
      expect(getViewBoxNumbers(svg)[2]).toBe(fullLevelBounds!.width);
      expect(getViewBoxNumbers(svg)[3]).toBe(fullLevelBounds!.height);
    });
  });

  it("recenters the minimap when the player moves on the same level", async () => {
    const { rerender } = render(
      <ShipMapPanel state={createTestState({ roomId: "MovieTheaterLobby" })} />,
    );

    const minimap = screen.getByRole("button", { name: /open ship map/i });
    const svg = minimap.querySelector("svg");
    const initialViewBox = svg?.getAttribute("viewBox");

    rerender(
      <ShipMapPanel state={createTestState({ roomId: "LevelThreeStairAccess" })} />,
    );

    await waitFor(() => {
      expect(svg?.getAttribute("viewBox")).not.toBe(initialViewBox);
    });
  });

  it("keeps upper level six and seven stair landings below the compass area", () => {
    const { rerender } = render(
      <ShipMapPanel state={createTestState({ roomId: "StairSix" })} />,
    );
    const minimap = screen.getByRole("button", { name: /open ship map/i });
    const svg = minimap.querySelector("svg");
    const levelSixBounds = getShipMapBounds(
      getShipMapNodesForLevel("level-six"),
      140,
      getShipMapShapesForLevel("level-six"),
    );
    const stairSix = getPrimaryShipMapNodeForRoom("StairSix", "level-six");
    const [, levelSixViewMinY, , levelSixViewHeight] = getViewBoxNumbers(svg);
    const levelSixCurrentY =
      (getNodeCenter(stairSix!).y - levelSixViewMinY) / levelSixViewHeight;

    expect(levelSixBounds).toBeDefined();
    expect(stairSix).toBeDefined();
    expect(levelSixViewMinY).toBeLessThan(levelSixBounds!.minY);
    expect(levelSixCurrentY).toBeGreaterThan(0.4);
    expect(levelSixCurrentY).toBeLessThan(0.6);

    rerender(<ShipMapPanel state={createTestState({ roomId: "StairSeven" })} />);

    const levelSevenBounds = getShipMapBounds(
      getShipMapNodesForLevel("level-seven"),
      140,
      getShipMapShapesForLevel("level-seven"),
    );
    const stairSeven = getPrimaryShipMapNodeForRoom("StairSeven", "level-seven");
    const [, levelSevenViewMinY, , levelSevenViewHeight] = getViewBoxNumbers(svg);
    const levelSevenCurrentY =
      (getNodeCenter(stairSeven!).y - levelSevenViewMinY) / levelSevenViewHeight;

    expect(levelSevenBounds).toBeDefined();
    expect(stairSeven).toBeDefined();
    expect(levelSevenViewMinY).toBeLessThan(levelSevenBounds!.minY);
    expect(levelSevenCurrentY).toBeGreaterThan(0.4);
    expect(levelSevenCurrentY).toBeLessThan(0.6);
  });

  it("centers single-label circular room labels without moving quadrant labels", () => {
    const hydroponicsNode = getPrimaryShipMapNodeForRoom("HydroponicsPlatform");
    const hydroponicsEllipse = getShipMapShapesForLevel("level-six").find(
      (shape) =>
        hydroponicsNode &&
        shape.type === "ellipse" &&
        isPointInsideEllipse(getNodeCenter(hydroponicsNode), shape),
    );
    const movieTheaterNode = getPrimaryShipMapNodeForRoom("MovieTheaterA");

    expect(hydroponicsNode).toBeDefined();
    expect(hydroponicsEllipse).toBeDefined();
    expect(movieTheaterNode).toBeDefined();

    const { rerender } = render(
      <ShipMapPanel state={createTestState({ roomId: "HydroponicsPlatform" })} />,
    );

    const minimap = screen.getByRole("button", { name: /open ship map/i });
    const hydroponicsLabel = minimap.querySelector(
      '.ship-map-node[data-status="current"] .ship-map-node-label',
    );
    const hydroponicsCenter = getEllipseCenter(hydroponicsEllipse!);

    expect(Number(hydroponicsLabel?.getAttribute("x"))).toBe(hydroponicsCenter.x);
    expect(Number(hydroponicsLabel?.getAttribute("y"))).toBeCloseTo(
      hydroponicsCenter.y,
    );

    rerender(<ShipMapPanel state={createTestState({ roomId: "MovieTheaterA" })} />);

    const movieTheaterLabel = minimap.querySelector(
      '.ship-map-node[data-status="current"] .ship-map-node-label',
    );
    const movieTheaterCenter = getNodeCenter(movieTheaterNode!);

    expect(Number(movieTheaterLabel?.getAttribute("x"))).toBe(movieTheaterCenter.x);
  });

  it("renders explicit map label line breaks", () => {
    render(<ShipMapPanel state={createTestState({ roomId: "ParkEntrance" })} />);

    const minimap = screen.getByRole("button", { name: /open ship map/i });
    const labelLines = Array.from(
      minimap.querySelectorAll(
        '.ship-map-node[data-status="current"] .ship-map-node-label tspan',
      ),
    ).map((line) => line.textContent);

    expect(labelLines).toEqual(["Park", "Gate"]);
  });

  it("keeps circular map sections gray until their rooms are visited", () => {
    const { rerender } = render(
      <ShipMapPanel state={createTestState({ roomId: "ParkCenter" })} />,
    );

    const minimap = screen.getByRole("button", { name: /open ship map/i });
    const movieTheaterCircle = minimap.querySelector(".ship-map-shape");

    expect(movieTheaterCircle).toHaveAttribute("data-state", "unknown");

    rerender(
      <ShipMapPanel
        state={createTestState({
          roomId: "MovieTheaterLobby",
          visitedRooms: ["MovieTheaterLobby", "MovieTheaterA"],
        })}
      />,
    );

    expect(movieTheaterCircle).toHaveAttribute("data-state", "visited");

    rerender(<ShipMapPanel state={createTestState({ roomId: "MovieTheaterA" })} />);

    expect(movieTheaterCircle).toHaveAttribute("data-state", "current");
  });

  it("lights the shuttle outline only from the shuttle interior rooms", () => {
    const { rerender } = render(
      <ShipMapPanel state={createTestState({ roomId: "EngCorridorOne" })} />,
    );

    const minimap = screen.getByRole("button", { name: /open ship map/i });
    const shuttleOutline = minimap.querySelector(
      '.ship-map-shape[data-shape-type="path"]',
    );

    expect(shuttleOutline).toHaveAttribute("data-state", "unknown");

    rerender(<ShipMapPanel state={createTestState({ roomId: "ShuttleBay" })} />);

    expect(shuttleOutline).toHaveAttribute("data-state", "unknown");

    rerender(
      <ShipMapPanel
        state={createTestState({
          roomId: "EngCorridorOne",
          visitedRooms: ["EngCorridorOne", "InsideShuttle", "ShuttleCockpit"],
        })}
      />,
    );

    expect(shuttleOutline).toHaveAttribute("data-state", "visited");

    rerender(<ShipMapPanel state={createTestState({ roomId: "InsideShuttle" })} />);

    expect(shuttleOutline).toHaveAttribute("data-state", "current");

    rerender(<ShipMapPanel state={createTestState({ roomId: "ShuttleCockpit" })} />);

    expect(shuttleOutline).toHaveAttribute("data-state", "current");
  });
});

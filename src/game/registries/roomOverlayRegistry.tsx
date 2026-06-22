import type { GameState } from "@game/types/gameTypes";
import { Fragment, type ReactNode } from "react";
import { ReactorBigBoard } from "src/world/maps/levelFive/ReactorBigBoard";
import { isReactorBigBoardVisible } from "src/world/maps/levelFive/reactorConsensus";

type RoomOverlayRegistration = {
  id: string;
  isVisible: (state: GameState, roomId: string) => boolean;
  render: (state: GameState) => ReactNode;
};

const ROOM_OVERLAYS: RoomOverlayRegistration[] = [
  {
    id: "reactor-big-board",
    isVisible: (_state, roomId) => isReactorBigBoardVisible(roomId),
    render: (state) => <ReactorBigBoard state={state} />,
  },
];

export function renderRegisteredRoomOverlays(
  state: GameState,
  roomId: string,
): ReactNode[] {
  return ROOM_OVERLAYS.filter((overlay) => overlay.isVisible(state, roomId)).map(
    (overlay) => <Fragment key={overlay.id}>{overlay.render(state)}</Fragment>,
  );
}

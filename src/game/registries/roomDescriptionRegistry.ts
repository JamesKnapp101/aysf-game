import { getVisiblePreserveAnimalDescription } from "@game/preserve/preserveAwareness";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import {
  GAME_PRESERVE_ANIMAL_PROFILES,
  getVisibleHydroponicsSpider,
  HYDROPONICS_SPIDER_ITEM_ID,
  isHydroponicsCocoonRoom,
} from "src/world/zoneRegistrations";

type SceneryDescriptionEntry = {
  item: Item;
  text: string;
};

export function getRegisteredAttachedRoomDescription(
  state: GameState,
  roomId: string,
): string | undefined {
  if (
    roomId === state.player.roomId &&
    state.itemState.attachedTo.badger === "PLAYER"
  ) {
    return (
      GAME_PRESERVE_ANIMAL_PROFILES.badger.attachmentAttack
        ?.attachedRoomDescription ?? "All you can see is angry, snapping badger!"
    );
  }

  return undefined;
}

export function getRegisteredAdditionalRoomItems(
  state: GameState,
  roomId: string,
): Item[] {
  const visibleSpider = getVisibleHydroponicsSpider(state, roomId);
  return visibleSpider ? [visibleSpider] : [];
}

export function arrangeRegisteredSceneryText(
  roomId: string,
  entries: SceneryDescriptionEntry[],
  defaultText: string,
): string {
  if (!isHydroponicsCocoonRoom(roomId)) {
    return defaultText;
  }

  const cocoonText = entries
    .filter((entry) => entry.item.id !== HYDROPONICS_SPIDER_ITEM_ID)
    .map((entry) => entry.text)
    .join(" ");
  const spiderText =
    entries.find((entry) => entry.item.id === HYDROPONICS_SPIDER_ITEM_ID)
      ?.text ?? "";

  return cocoonText && spiderText
    ? `${cocoonText}\n\n${spiderText}`
    : defaultText;
}

export function getRegisteredRoomDescriptionAdditions(
  state: GameState,
  roomId: string,
): string[] {
  const additions: string[] = [];
  const visiblePreserveAnimal = getVisiblePreserveAnimalDescription(
    state,
    roomId,
  );

  if (visiblePreserveAnimal) {
    additions.push(visiblePreserveAnimal);
  }

  return additions;
}

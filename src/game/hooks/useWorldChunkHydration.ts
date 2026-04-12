import { useCallback, useEffect, useRef, type MutableRefObject } from "react";
import {
  DEFERRED_WORLD_CHUNK_IDS,
  getPriorityWorldChunkIdsForRoom,
  loadWorldChunk,
  type WorldChunkId,
} from "../../world/World";
import { mergeWorldChunkIntoState } from "../gameInit";
import type { GameState } from "../types/gameTypes";

type UseWorldChunkHydrationOptions = {
  enabled?: boolean;
  gs: GameState;
  stateRef: MutableRefObject<GameState>;
  updateState: (updater: (prev: GameState) => GameState) => GameState;
};

function waitForBackgroundTurn(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }

    const idleWindow = window as Window & {
      requestIdleCallback?: (cb: () => void) => number;
    };

    if (idleWindow.requestIdleCallback) {
      idleWindow.requestIdleCallback(() => resolve());
      return;
    }

    window.setTimeout(resolve, 0);
  });
}

export function useWorldChunkHydration({
  enabled = true,
  gs,
  stateRef,
  updateState,
}: UseWorldChunkHydrationOptions) {
  const isMountedRef = useRef(true);
  const loadingWorldChunksRef = useRef<Map<WorldChunkId, Promise<void>>>(
    new Map(),
  );

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      // Clear any pending chunk loads on unmount
      loadingWorldChunksRef.current.clear();
    };
  }, []);

  const requestWorldChunk = useCallback(
    (
      chunkId: WorldChunkId,
      priority: "high" | "low" = "low",
    ): Promise<void> => {
      // Already loaded
      if (
        Array.isArray(stateRef.current.world.meta?.loadedChunkIds) &&
        stateRef.current.world.meta.loadedChunkIds.includes(chunkId)
      ) {
        return Promise.resolve();
      }

      // Already loading
      const existing = loadingWorldChunksRef.current.get(chunkId);
      if (existing) {
        return existing;
      }

      const pending = loadWorldChunk(chunkId)
        .then((chunk) => {
          if (!isMountedRef.current) return;

          // Validate state before merging
          if (!stateRef.current) {
            console.warn(`State ref invalid when loading chunk "${chunkId}"`);
            return;
          }

          updateState((prev) => mergeWorldChunkIntoState(prev, chunkId, chunk));
        })
        .catch((error) => {
          console.error(
            `Failed to load world chunk "${chunkId}" (priority: ${priority})`,
            error,
          );
          // Don't rethrow - allow other chunks to continue loading
        })
        .finally(() => {
          loadingWorldChunksRef.current.delete(chunkId);
        });

      loadingWorldChunksRef.current.set(chunkId, pending);
      return pending;
    },
    [stateRef, updateState],
  );

  useEffect(() => {
    if (!enabled) return;

    const hydrateDeferredWorld = async () => {
      for (const chunkId of DEFERRED_WORLD_CHUNK_IDS) {
        if (!isMountedRef.current) return;
        await requestWorldChunk(chunkId);
        if (!isMountedRef.current) return;
        await waitForBackgroundTurn();
      }
    };

    void hydrateDeferredWorld();
  }, [enabled, requestWorldChunk]);

  useEffect(() => {
    if (!enabled) return;

    for (const chunkId of getPriorityWorldChunkIdsForRoom(gs.player.roomId)) {
      void requestWorldChunk(chunkId);
    }
  }, [enabled, gs.player.roomId, requestWorldChunk]);

  useEffect(() => {
    if (!enabled) return;

    if (gs.world.rooms.some((room) => room.id === gs.player.roomId)) {
      return;
    }

    let cancelled = false;

    const hydrateCurrentRoom = async () => {
      for (const chunkId of DEFERRED_WORLD_CHUNK_IDS) {
        if (cancelled || !isMountedRef.current) return;

        if (
          stateRef.current.world.rooms.some(
            (room) => room.id === stateRef.current.player.roomId,
          )
        ) {
          return;
        }

        await requestWorldChunk(chunkId);
        if (cancelled || !isMountedRef.current) return;
        await waitForBackgroundTurn();
      }
    };

    void hydrateCurrentRoom();

    return () => {
      cancelled = true;
    };
  }, [enabled, gs.player.roomId, gs.world.rooms, requestWorldChunk, stateRef]);

  useEffect(() => {
    if (!enabled) return;

    const requestedChunkIds = Array.isArray(gs.world.meta?.requestedChunkIds)
      ? (gs.world.meta.requestedChunkIds as WorldChunkId[])
      : [];

    for (const chunkId of requestedChunkIds) {
      void requestWorldChunk(chunkId);
    }
  }, [enabled, gs.world.meta?.requestedChunkIds, requestWorldChunk]);
}

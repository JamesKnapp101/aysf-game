import { doPush } from "@game/actions/push/push";
import { doTurn } from "@game/actions/turn/turn";
import { doStand } from "../actions/stand/stand";
import type { ActionHandler } from "../types/actionsTypes";
import { doClose } from "./close";
import { doDrink } from "./drink";
import { doDrop } from "./drop";
import { doEmpty } from "./empty";
import { doExamine } from "./examine";
import { doFill } from "./fill";
import { doInject } from "./inject";
import { doLoad } from "./load";
import { doOpen } from "./open";
import { doPour } from "./pour";
import { doPut } from "./put";
import { doRead } from "./read";
import { doRemove } from "./remove";
import { doSearch } from "./search";
import { doSet } from "./set";
import { doShoot } from "./shoot";
import { doSwitch } from "./switch";
import { doTake } from "./take";
import { doWait } from "./wait";
import { doWear } from "./wear";

export const ACTION_HANDLERS: Record<string, ActionHandler> = {
  open: doOpen,
  close: doClose,
  take: doTake,
  drop: doDrop,
  put: doPut,
  read: doRead,
  examine: doExamine,
  inject: doInject,
  drink: doDrink,
  set: doSet,
  empty: doEmpty,
  fill: doFill,
  pour: doPour,
  wear: doWear,
  remove: doRemove,
  switch: doSwitch,
  wait: doWait,
  shoot: doShoot,
  load: doLoad,
  search: doSearch,
  stand: doStand,
  turn: doTurn,
  push: doPush,
};

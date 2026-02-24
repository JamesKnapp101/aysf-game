import { doAsk } from "@game/actions/ask/ask";
import { doEat } from "@game/actions/eat/eat";
import { doListen } from "@game/actions/listen/listen";
import { doPush } from "@game/actions/push/push";
import { doTell } from "@game/actions/tell/tell";
import { doTurn } from "@game/actions/turn/turn";
import { doUse } from "@game/actions/use/use";
import { doStand } from "../actions/stand/stand";
import type { ActionHandler } from "../types/actionsTypes";
import { doClose } from "./close/close";
import { doDrink } from "./drink/drink";
import { doDrop } from "./drop/drop";
import { doEmpty } from "./empty/empty";
import { doExamine } from "./examine/examine";
import { doFill } from "./fill/fill";
import { doInject } from "./inject/inject";
import { doLoad } from "./load/load";
import { doOpen } from "./open/open";
import { doPour } from "./pour/pour";
import { doPut } from "./put/put";
import { doRead } from "./read/read";
import { doRemove } from "./remove/remove";
import { doSearch } from "./search/search";
import { doSet } from "./set/set";
import { doShoot } from "./shoot/shoot";
import { doSwitch } from "./switch/switch";
import { doTake } from "./take/take";
import { doWait } from "./wait/wait";
import { doWear } from "./wear/wear";

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
  eat: doEat,
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
  ask: doAsk,
  tell: doTell,
  listen: doListen,
  use: doUse,
};

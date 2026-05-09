import { doAbort } from "@game/actions/abort/abort";
import { doAsk } from "@game/actions/ask/ask";
import { doAttack } from "@game/actions/attack/attack";
import { doBlow } from "@game/actions/blow/blow";
import { doBounce } from "@game/actions/bounce/bounce";
import { doCall } from "@game/actions/call/call";
import { doEat } from "@game/actions/eat/eat";
import { doListen } from "@game/actions/listen/listen";
import { doLook } from "@game/actions/look/look";
import { doPet } from "@game/actions/pet/pet";
import { doPlay } from "@game/actions/play/play";
import { doPush } from "@game/actions/push/push";
import { doRide } from "@game/actions/ride/ride";
import { doTell } from "@game/actions/tell/tell";
import { doTouch } from "@game/actions/touch/touch";
import { doTurn } from "@game/actions/turn/turn";
import { doUse } from "@game/actions/use/use";
import { doStand } from "../actions/stand/stand";
import { doSubmerge } from "@game/actions/submerge/submerge";
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
import { doSit } from "./sit/sit";
import { doShoot } from "./shoot/shoot";
import { doStick } from "./stick/stick";
import { doSwitch } from "./switch/switch";
import { doTake } from "./take/take";
import { doWait } from "./wait/wait";
import { doWear } from "./wear/wear";

export const ACTION_HANDLERS: Record<string, ActionHandler> = {
  abort: doAbort,
  open: doOpen,
  close: doClose,
  take: doTake,
  get: doTake,
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
  pet: doPet,
  play: doPlay,
  call: doCall,
  stick: doStick,
  ask: doAsk,
  tell: doTell,
  listen: doListen,
  look: doLook,
  use: doUse,
  ride: doRide,
  touch: doTouch,
  blow: doBlow,
  bounce: doBounce,
  hit: doAttack,
  punch: doAttack,
  sit: doSit,
  dive: doSubmerge,
  submerge: doSubmerge,
  drown: doSubmerge,
};

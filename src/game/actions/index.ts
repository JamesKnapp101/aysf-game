import { doAbort } from "@game/actions/abort/abort";
import { doAsk } from "@game/actions/ask/ask";
import { doAttack } from "@game/actions/attack/attack";
import { doBlow } from "@game/actions/blow/blow";
import { doBounce } from "@game/actions/bounce/bounce";
import { doCall } from "@game/actions/call/call";
import { doEat } from "@game/actions/eat/eat";
import { doApply } from "@game/actions/apply/apply";
import { doGive } from "@game/actions/give/give";
import { doListen } from "@game/actions/listen/listen";
import { doLook } from "@game/actions/look/look";
import { doPet } from "@game/actions/pet/pet";
import { doPlay } from "@game/actions/play/play";
import { doPush } from "@game/actions/push/push";
import { doRide } from "@game/actions/ride/ride";
import { doTell } from "@game/actions/tell/tell";
import { doTouch } from "@game/actions/touch/touch";
import { doThrow } from "@game/actions/throw/throw";
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
import { doLift, doMoveItem } from "./manipulate/manipulate";
import { doOpen } from "./open/open";
import { doOrder } from "./order/order";
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
  order: doOrder,
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
  apply: doApply,
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
  lift: doLift,
  move: doMoveItem,
  search: doSearch,
  stand: doStand,
  turn: doTurn,
  push: doPush,
  pet: doPet,
  play: doPlay,
  call: doCall,
  stick: doStick,
  ask: doAsk,
  give: doGive,
  tell: doTell,
  listen: doListen,
  look: doLook,
  use: doUse,
  ride: doRide,
  touch: doTouch,
  throw: doThrow,
  blow: doBlow,
  bounce: doBounce,
  hit: doAttack,
  punch: doAttack,
  sit: doSit,
  dive: doSubmerge,
  submerge: doSubmerge,
  drown: doSubmerge,
};

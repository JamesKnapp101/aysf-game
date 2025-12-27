import type { ActionHandler } from "../types/actionsTypes";
import { doOpen } from "./open";
import { doClose } from "./close";
import { doTake } from "./take";
import { doDrop } from "./drop";
import { doPut } from "./put";
import { doRead } from "./read";
import { doExamine } from "./examine";
import { doInject } from "./inject";
import { doDrink } from "./drink";
import { doSet } from "./set";
import { doEmpty } from "./empty";
import { doFill } from "./fill";
import { doPour } from "./pour";
import { doWear } from "./wear";
import { doRemove } from "./remove";
import { doSwitch } from "./switch";

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
};

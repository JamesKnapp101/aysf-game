import { YOU_FIRST_CONTACT_ID } from "@game/npcRegistry";
import type { NpcDialog } from "@game/types/npcTypes";
import { youFirstContactDialog } from "./you_1st_contact";
import { rangerBotDialog } from "./ranger_bot";
import { lonelyBotDialog } from "./lonely_bot";
import { barBotDialog } from "./bar_bot";
import { nailBotDialog } from "./nail_bot";
import { spotBotDialog } from "./spot_bot";
import { trashBotDialog } from "./trash_bot";
import { usherBotDialog } from "./usher_bot";
import { doomedChefDialog } from "./doomed_chef";
import { moxStairBottomDialog } from "./mox_stair_bottom";
import { lilCorridorThreeDialog } from "./lil_corridor_three";
import { spinInstructorSpinStageDialog } from "./spin_instructor_spin_stage";
import { crushedWeightlifterGymDialog } from "./crushed_weightlifter_gym";
import { disembodiedHeadBarBathroomDialog } from "./disembodied_head_bar_bathroom";
import { disembodiedHeadBarBasementDialog } from "./disembodied_head_bar_basement";
import { masterOfDrinkDialog } from "./master_of_drink";
import { moxMovieTheaterDialog } from "./mox_movie_theater";
import { coreyDialog } from "./corey";
import { lemsterDialog, virtualManagerDialog } from "./virtual_office";

export const NPC_DIALOG: NpcDialog = {
  [YOU_FIRST_CONTACT_ID]: youFirstContactDialog,
  RangerBot: rangerBotDialog,
  LonelyBot: lonelyBotDialog,
  BarBot: barBotDialog,
  NailBot: nailBotDialog,
  SpotBot: spotBotDialog,
  TrashBot: trashBotDialog,
  UsherBot: usherBotDialog,
  DoomedChef: doomedChefDialog,
  MoxStairBottom: moxStairBottomDialog,
  LilLillyCorridorThree: lilCorridorThreeDialog,
  SpinInstructorSpinStage: spinInstructorSpinStageDialog,
  CrushedWeightlifterGym: crushedWeightlifterGymDialog,
  DisembodiedHeadBarBathroom: disembodiedHeadBarBathroomDialog,
  DisembodiedHeadBarBasement: disembodiedHeadBarBasementDialog,
  MasterOfDrink: masterOfDrinkDialog,
  MoxTheater: moxMovieTheaterDialog,
  Corey: coreyDialog,
  LemsterKrolmborg: lemsterDialog,
  VirtualManager: virtualManagerDialog,
};

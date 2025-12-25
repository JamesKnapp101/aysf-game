import type { Item } from "../../game/types/itemTypes";
import type { Direction, Room } from "../../game/types/roomTypes";

function normalize(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

function idJoin(...parts: string[]) {
  return parts.join("");
}

export function createLivingQuarterRooms(args: {
  prefix: string;
  designator: string;
  livingRoomId: string;
  bedRoomId: string;
  bathRoomId: string;

  corridorRoomId: string;
  corridorDoorId: string;

  bathDoorId: string;

  livingDescription: string;
  bathDescription: string;
  bedDescription: string;

  livingToCorridorDir?: Direction;
  livingToBathDir?: Direction;
  livingToBedDir?: Direction;
  bathToLivingDir?: Direction;
  bedToLivingDir?: Direction;
}): { living: Room; bath: Room; bed: Room } {
  const {
    livingRoomId,
    bedRoomId,
    bathRoomId,
    designator,
    corridorDoorId,
    bathDoorId,
    livingDescription,
    bathDescription,
    bedDescription,
    livingToCorridorDir = "west",
    livingToBathDir = "south",
    livingToBedDir = "east",
    bathToLivingDir = "north",
    bedToLivingDir = "west",
  } = args;

  return {
    living: {
      id: livingRoomId,
      name: `Living Room ${designator}`,
      description: normalize(livingDescription),
      exits: [
        { direction: livingToCorridorDir, doorId: corridorDoorId },
        { direction: livingToBathDir, doorId: bathDoorId },
        { direction: livingToBedDir, toRoomId: bedRoomId },
      ],
    },
    bath: {
      id: bathRoomId,
      name: `Bathroom ${designator}`,
      description: normalize(bathDescription),
      exits: [{ direction: bathToLivingDir, doorId: bathDoorId }],
    },
    bed: {
      id: bedRoomId,
      name: `Bedroom ${designator}`,
      description: normalize(bedDescription),
      exits: [{ direction: bedToLivingDir, toRoomId: livingRoomId }],
    },
  };
}

export function createEndTable(args: {
  id: string;
  location: string;
  sceneryDescription: string;
  description: string;
  vocab?: string[];
  capacity?: number;
  capacityOn?: number;
}): Item {
  return {
    id: args.id,
    name: "end table",
    description: normalize(args.description),
    sceneryDescription: normalize(args.sceneryDescription),
    location: args.location,
    vocab: args.vocab ?? ["end", "table"],
    itemClass: "solid",
    itemCategory: "scenery",
    isContainer: true,
    isOpenable: true,
    capacity: args.capacity ?? 4,
    isSurface: true,
    capacityOn: args.capacityOn ?? 2,
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
  };
}

export function createSofa(args: {
  id: string;
  location: string;
  sceneryDescription: string;
  description: string;
  vocab?: string[];
  capacityOn?: number;
}): Item {
  return {
    id: args.id,
    name: "sofa",
    description: normalize(args.description),
    sceneryDescription: normalize(args.sceneryDescription),
    location: args.location,
    vocab: args.vocab ?? ["sofa", "couch"],
    itemClass: "solid",
    itemCategory: "scenery",
    isSurface: true,
    capacityOn: args.capacityOn ?? 4,
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  };
}

export function createLoveseat(args: {
  id: string;
  location: string;
  sceneryDescription: string;
  description: string;
  vocab?: string[];
  capacityOn?: number;
}): Item {
  return {
    id: args.id,
    name: "loveseat",
    description: normalize(args.description),
    sceneryDescription: normalize(args.sceneryDescription),
    location: args.location,
    vocab: args.vocab ?? ["loveseat", "love", "seat"],
    itemClass: "solid",
    itemCategory: "scenery",
    isSurface: true,
    capacityOn: args.capacityOn ?? 2,
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  };
}

export function createEntertainmentCenter(args: {
  id: string;
  location: string;
  sceneryDescription: string;
  description: string;
  vocab?: string[];
}): Item {
  return {
    id: args.id,
    name: "entertainment center",
    description: normalize(args.description),
    sceneryDescription: normalize(args.sceneryDescription),
    location: args.location,
    vocab: args.vocab ?? [
      "entertainment",
      "center",
      "stereo",
      "tv",
      "television",
      "set",
      "video",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    isUseable: true,
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  };
}

export function createBed(args: {
  id: string;
  location: string;
  sceneryDescription: string;
  description: string;
  vocab?: string[];
  capacityOn?: number;
}): Item {
  return {
    id: args.id,
    name: "bed",
    description: normalize(args.description),
    sceneryDescription: normalize(args.sceneryDescription),
    location: args.location,
    vocab: args.vocab ?? ["bed", "bedding", "sheets"],
    itemClass: "solid",
    itemCategory: "scenery",
    isSurface: true,
    capacityOn: args.capacityOn ?? 4,
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: true,
  };
}

export function createDresser(args: {
  id: string;
  location: string;
  sceneryDescription: string;
  description: string;
  vocab?: string[];
  capacity?: number;
  capacityOn?: number;
}): Item {
  return {
    id: args.id,
    name: "dresser",
    description: normalize(args.description),
    sceneryDescription: normalize(args.sceneryDescription),
    location: args.location,
    vocab: args.vocab ?? ["dresser", "drawers", "bureau"],
    itemClass: "solid",
    itemCategory: "scenery",
    isContainer: true,
    isOpenable: true,
    capacity: args.capacity ?? 8,
    isSurface: true,
    capacityOn: args.capacityOn ?? 2,
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
  };
}

export function createCloset(args: {
  id: string;
  location: string;
  sceneryDescription: string;
  description: string;
  vocab?: string[];
  capacity?: number;
}): Item {
  return {
    id: args.id,
    name: "closet",
    description: normalize(args.description),
    sceneryDescription: normalize(args.sceneryDescription),
    location: args.location,
    vocab: args.vocab ?? ["closet", "door"],
    itemClass: "solid",
    itemCategory: "scenery",
    isContainer: true,
    isOpenable: true,
    capacity: args.capacity ?? 10,
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
  };
}

export function createSink(args: {
  id: string;
  location: string;
  sceneryDescription: string;
  description: string;
  vocab?: string[];
}): Item {
  return {
    id: args.id,
    name: "sink",
    description: normalize(args.description),
    sceneryDescription: normalize(args.sceneryDescription),
    location: args.location,
    vocab: args.vocab ?? ["sink", "basin", "faucet"],
    itemClass: "solid",
    itemCategory: "scenery",
    isUseable: true,
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  };
}

export function createMirror(args: {
  id: string;
  location: string;
  sceneryDescription: string;
  description: string;
  vocab?: string[];
}): Item {
  return {
    id: args.id,
    name: "mirror",
    description: normalize(args.description),
    sceneryDescription: normalize(args.sceneryDescription),
    location: args.location,
    vocab: args.vocab ?? ["mirror", "glass"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  };
}

export function createShower(args: {
  id: string;
  location: string;
  sceneryDescription: string;
  description: string;
  vocab?: string[];
}): Item {
  return {
    id: args.id,
    name: "shower",
    description: normalize(args.description),
    sceneryDescription: normalize(args.sceneryDescription),
    location: args.location,
    vocab: args.vocab ?? ["shower", "stall"],
    itemClass: "solid",
    itemCategory: "scenery",
    isUseable: true,
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: true,
  };
}

export function createWashlet(args: {
  id: string;
  location: string;
  sceneryDescription: string;
  description: string;
  vocab?: string[];
}): Item {
  return {
    id: args.id,
    name: "washlet",
    description: normalize(args.description),
    sceneryDescription: normalize(args.sceneryDescription),
    location: args.location,
    vocab: args.vocab ?? ["washlet", "toilet", "bidet"],
    itemClass: "solid",
    itemCategory: "scenery",
    isUseable: true,
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    meta: {
      watersource: {
        onTake: "You scoop some of the stagnant water from the washlet bowl",
      },
    },
  };
}

export function createMedicineChest(args: {
  id: string;
  location: string;
  sceneryDescription: string;
  description: string;
  vocab?: string[];
  capacity?: number;
}): Item {
  return {
    id: args.id,
    name: "medicine chest",
    description: normalize(args.description),
    sceneryDescription: normalize(args.sceneryDescription),
    location: args.location,
    vocab: args.vocab ?? ["medicine", "chest"],
    itemClass: "solid",
    itemCategory: "scenery",
    isContainer: true,
    isOpenable: true,
    capacity: args.capacity ?? 10,
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
  };
}

export type PhoneMessage = {
  id: string;
  title?: string;
  transcript: string;
};

export function createPhone(args: {
  id: string;
  location: string;
  sceneryDescription: string;
  description: string;
  vocab?: string[];
  messages?: PhoneMessage[];
}): Item {
  const messages = args.messages ?? [];
  return {
    id: args.id,
    name: "phone",
    description: normalize(args.description),
    sceneryDescription: normalize(args.sceneryDescription),
    location: args.location,
    vocab: args.vocab ?? ["phone", "handset", "headset"],
    itemClass: "solid",
    itemCategory: "scenery",
    isUseable: true,
    meta: {
      kind: "phone",
      messages,
      unreadCount: messages.length,
      redFlashCount: messages.length,
    },
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  };
}

export type LivingQuarterConfig = {
  prefix: string;
  designator: string;
  livingRoomId: string;
  bedRoomId: string;
  bathRoomId: string;
  corridorRoomId: string;
  corridorDoorId: string;
  bathDoorId: string;
  livingDescription: string;
  bathDescription: string;
  bedDescription: string;
  dirs?: Partial<{
    livingToCorridorDir: Direction;
    livingToBathDir: Direction;
    livingToBedDir: Direction;
    bathToLivingDir: Direction;
    bedToLivingDir: Direction;
  }>;
  customItems?: Item[];
  fixtureIds?: Partial<{
    endTableLiving: string;
    sofaLiving: string;
    loveseatLiving: string;
    entertainmentLiving: string;
    bed: string;
    dresser: string;
    closet: string;
    phone: string;

    sink: string;
    mirror: string;
    shower: string;
    washlet: string;
    medicineChest: string;
  }>;
  fixtureText: {
    endTableLiving: { description: string; sceneryDescription: string };
    sofaLiving: { description: string; sceneryDescription: string };
    loveseatLiving: { description: string; sceneryDescription: string };
    entertainmentLiving: { description: string; sceneryDescription: string };
    bed: { description: string; sceneryDescription: string };
    dresser: { description: string; sceneryDescription: string };
    closet: { description: string; sceneryDescription: string };
    phone: {
      description: string;
      sceneryDescription: string;
      messages?: PhoneMessage[];
    };
    sink: { description: string; sceneryDescription: string };
    mirror: { description: string; sceneryDescription: string };
    shower: { description: string; sceneryDescription: string };
    washlet: { description: string; sceneryDescription: string };
    medicineChest: {
      description: string;
      sceneryDescription: string;
    };
  };
};

export function createLivingQuarter(cfg: LivingQuarterConfig): {
  rooms: Room[];
  items: Item[];
} {
  const ids = {
    endTableLiving:
      cfg.fixtureIds?.endTableLiving ?? idJoin(cfg.prefix, "Endtable"),
    sofaLiving: cfg.fixtureIds?.sofaLiving ?? idJoin(cfg.prefix, "Sofa"),
    loveseatLiving:
      cfg.fixtureIds?.loveseatLiving ?? idJoin(cfg.prefix, "Loveseat"),
    entertainmentLiving:
      cfg.fixtureIds?.entertainmentLiving ??
      idJoin(cfg.prefix, "Entertainment"),

    bed: cfg.fixtureIds?.bed ?? idJoin(cfg.prefix, "BedItem"),
    dresser: cfg.fixtureIds?.dresser ?? idJoin(cfg.prefix, "Dresser"),
    closet: cfg.fixtureIds?.closet ?? idJoin(cfg.prefix, "Closet"),
    phone: cfg.fixtureIds?.phone ?? idJoin("PHONE", cfg.prefix, "Bed"),

    sink: cfg.fixtureIds?.sink ?? idJoin(cfg.prefix, "Sink"),
    mirror: cfg.fixtureIds?.mirror ?? idJoin(cfg.prefix, "Mirror"),
    shower: cfg.fixtureIds?.shower ?? idJoin(cfg.prefix, "Shower"),
    washlet: cfg.fixtureIds?.washlet ?? idJoin(cfg.prefix, "Washlet"),
    medicineChest:
      cfg.fixtureIds?.medicineChest ?? idJoin(cfg.prefix, "MedicineChest"),
  };

  const roomsObj = createLivingQuarterRooms({
    prefix: cfg.prefix,
    designator: cfg.designator,
    livingRoomId: cfg.livingRoomId,
    bedRoomId: cfg.bedRoomId,
    bathRoomId: cfg.bathRoomId,
    corridorRoomId: cfg.corridorRoomId,
    corridorDoorId: cfg.corridorDoorId,
    bathDoorId: cfg.bathDoorId,
    livingDescription: cfg.livingDescription,
    bathDescription: cfg.bathDescription,
    bedDescription: cfg.bedDescription,
    livingToCorridorDir: cfg.dirs?.livingToCorridorDir,
    livingToBathDir: cfg.dirs?.livingToBathDir,
    livingToBedDir: cfg.dirs?.livingToBedDir,
    bathToLivingDir: cfg.dirs?.bathToLivingDir,
    bedToLivingDir: cfg.dirs?.bedToLivingDir,
  });

  const fixtures: Item[] = [
    createEndTable({
      id: ids.endTableLiving,
      location: cfg.livingRoomId,
      description: cfg.fixtureText.endTableLiving.description,
      sceneryDescription: cfg.fixtureText.endTableLiving.sceneryDescription,
    }),
    createSofa({
      id: ids.sofaLiving,
      location: cfg.livingRoomId,
      description: cfg.fixtureText.sofaLiving.description,
      sceneryDescription: cfg.fixtureText.sofaLiving.sceneryDescription,
    }),
    createLoveseat({
      id: ids.loveseatLiving,
      location: cfg.livingRoomId,
      description: cfg.fixtureText.loveseatLiving.description,
      sceneryDescription: cfg.fixtureText.loveseatLiving.sceneryDescription,
    }),
    createEntertainmentCenter({
      id: ids.entertainmentLiving,
      location: cfg.livingRoomId,
      description: cfg.fixtureText.entertainmentLiving.description,
      sceneryDescription:
        cfg.fixtureText.entertainmentLiving.sceneryDescription,
    }),
    createBed({
      id: ids.bed,
      location: cfg.bedRoomId,
      description: cfg.fixtureText.bed.description,
      sceneryDescription: cfg.fixtureText.bed.sceneryDescription,
    }),
    createDresser({
      id: ids.dresser,
      location: cfg.bedRoomId,
      description: cfg.fixtureText.dresser.description,
      sceneryDescription: cfg.fixtureText.dresser.sceneryDescription,
    }),
    createCloset({
      id: ids.closet,
      location: cfg.bedRoomId,
      description: cfg.fixtureText.closet.description,
      sceneryDescription: cfg.fixtureText.closet.sceneryDescription,
    }),
    createPhone({
      id: ids.phone,
      location: cfg.bedRoomId,
      description: cfg.fixtureText.phone.description,
      sceneryDescription: cfg.fixtureText.phone.sceneryDescription,
      messages: cfg.fixtureText.phone.messages,
    }),
    createSink({
      id: ids.sink,
      location: cfg.bathRoomId,
      description: cfg.fixtureText.sink.description,
      sceneryDescription: cfg.fixtureText.sink.sceneryDescription,
    }),
    createMirror({
      id: ids.mirror,
      location: cfg.bathRoomId,
      description: cfg.fixtureText.mirror.description,
      sceneryDescription: cfg.fixtureText.mirror.sceneryDescription,
    }),
    createShower({
      id: ids.shower,
      location: cfg.bathRoomId,
      description: cfg.fixtureText.shower.description,
      sceneryDescription: cfg.fixtureText.shower.sceneryDescription,
    }),
    createWashlet({
      id: ids.washlet,
      location: cfg.bathRoomId,
      description: cfg.fixtureText.washlet.description,
      sceneryDescription: cfg.fixtureText.washlet.sceneryDescription,
    }),
    createMedicineChest({
      id: ids.medicineChest,
      location: cfg.bathRoomId,
      description: cfg.fixtureText.medicineChest.description,
      sceneryDescription: cfg.fixtureText.medicineChest.sceneryDescription,
    }),
  ];

  const customItems = cfg.customItems ?? [];

  return {
    rooms: [roomsObj.living, roomsObj.bath, roomsObj.bed],
    items: [...customItems, ...fixtures],
  };
}

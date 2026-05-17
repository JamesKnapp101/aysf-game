import type { Item } from "@game/types/itemTypes";

export const restaurantBathroomItems: Item[] = [
  {
    id: "PHONENUMBERS",
    name: "plastic plaque",
    description:
      "A small plastic plaque mounted near the sink lists a series of important phone numbers in tiny, utilitarian print.",
    sceneryDescription:
      "The plaque is slightly yellowed around the edges, its printed lines protected under a thin layer of clear laminate. The numbers themselves are arranged in neat rows, padded with dots to keep them aligned, like someone thought order would make emergencies easier to navigate.",
    location: "BathroomEntrance",
    vocab: ["plaque", "numbers", "phone", "sink"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: true,
    isContainer: false,
    isLoggable: true,
    readableTitle: `Phone Numbers Found in Restaurant`,
    readableText:
      "Police..............9111\n" +
      "Poison Control......0000\n" +
      "Emergency...........8111\n",
  },
  {
    id: "CRAPPERBOOTS",
    name: "combat boots",
    description:
      "From where you’re standing, all you can see of the stall’s occupant is a pair of black leather combat boots planted on the floor.",
    sceneryDescription:
      "The boots are scuffed and creased, the laces tucked in rather than tied, as if their owner expected to get in and out quickly. They haven’t moved in a while. That’s either very good or very bad, and you already know which way to bet.",
    location: "MensRoom",
    vocab: ["combat", "boots", "occupant", "feet"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 4,
    itemSize: 2,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      examine:
        "You stare at the boots a little too long, waiting for the slightest twitch. Nothing. That might be the worst answer.",
    },
  },
  {
    id: "MSTALLDOOR",
    name: "stall door",
    description:
      "A standard metal bathroom stall door, mounted on squeaky hinges and secured by an indifferent latch.",
    sceneryDescription:
      "The paint is chipped around the edges and near the lock, revealing dull metal beneath. Graffiti blooms across the inside surface in a mix of marker, etching, and sheer boredom, most of it now unreadable under layers of half-hearted scrubbing.",
    location: "MensRoom",
    vocab: ["stall", "door"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 5,
    itemSize: 2,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      knock:
        "You give the door a tentative knock. The boots inside don’t react. That’s not comforting.",
      open: "You could open it, sure. The real question is whether you’re ready for what’s on the other side.",
    },
  },
  {
    id: "URINAL",
    name: "urinal",
    description: "A porcelain wall-mounted urinal, clinically utilitarian.",
    sceneryDescription:
      "The fixture is as anonymous as plumbing gets: clean white porcelain, a chrome flush valve, and a faint smell of disinfectant that never quite erases what happens here. Hairline scratches and tiny chips along the rim suggest it’s seen better decades.",
    location: "MensRoom",
    vocab: ["urinal", "pisser"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 20,
    itemSize: 3,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      smell:
        "It smells like every public restroom you’ve ever regretted visiting, plus a hint of industrial cleaner doing its best.",
    },
  },
  {
    id: "TIRLET",
    name: "washlet",
    description:
      "A standard washlet-style toilet. A man’s corpse is currently seated on it, head bowed, as if he simply never bothered to stand up again.",
    sceneryDescription:
      "The washlet’s smooth curves and control panel look almost luxurious, which doesn’t help the overall impression. The man slumped on it is dressed, boots planted solidly on the floor, posture suggesting he was interrupted mid-thought and never got a chance to finish it.",
    location: "UNKNOWN",
    vocab: ["washlet", "toilet", "can", "shitter", "head"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 30,
    itemSize: 4,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      smell:
        "You get about half a breath in before deciding you’ve learned everything you need to know about the situation.",
    },
  },
  {
    id: "MSTALL",
    name: "bathroom stall",
    description:
      "A single-occupant bathroom stall, clean enough and clearly well-used. From the gap at the bottom, you can see a pair of black combat boots planted inside. You might be able to look underneath for a better view.",
    sceneryDescription:
      "Partitions form a narrow, private box around the toilet, the gap at the bottom offering just enough visibility to be unsettling. The floor inside looks clean, but there’s a subtle scuff pattern near the door where people have turned in place a thousand times before settling in.",
    location: "MensRoom",
    vocab: ["bathroom", "stall"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 20,
    itemSize: 4,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: false,
    capacity: 1,

    overrides: {
      lookunder:
        "You lean down and peer under the stall. The boots are attached to a body that is very much done with this whole experience.",
    },
  },
  {
    id: "WSTALL",
    name: "bathroom stall",
    description:
      "A closed bathroom stall, the door drawn shut. The air around it feels still in a way that has nothing to do with ventilation.",
    sceneryDescription:
      "The stall partitions are the same dull, off-white as the rest of the restroom, but there’s a certain tension in how the door hangs closed. Scratches around the latch hint at nervous hands and second thoughts. You can’t see much from here, but you can feel that the story on the other side is not a happy one.",
    location: "WomensRoom",
    vocab: ["bathroom", "stall"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 20,
    itemSize: 4,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: false,
    capacity: 1,

    overrides: {
      open: "You could force the stall open if you wanted. The real question is whether you want the mental image that comes with it.",
    },
  },
  {
    id: "WSTALLDOOR",
    name: "stall door",
    description: "A standard bathroom stall door, closed and latched.",
    sceneryDescription:
      "The door’s paint is a little more intact than in the men’s room, but there are still the telltale shoe scuffs near the bottom and the faint outline of old stickers and notes long since peeled away. The latch is turned fully to the locked position and shows no sign of moving on its own.",
    location: "WomensRoom",
    vocab: ["stall", "door"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 5,
    itemSize: 2,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      knock:
        "You rap gently on the stall door. Nothing answers, which somehow manages to be worse than a response.",
    },
  },
];

# Autonomous Playtest Punchlist — Organized

Original item wording retained. Items are grouped by their primary workstream; nested notes remain with their parent items.

## Sections

1. [Interaction and parser repairs](#interaction-and-parser-repairs) — 18 items
2. [Existing puzzle correctness](#existing-puzzle-correctness) — 6 items
3. [Progression chains](#progression-chains) — 12 items
4. [Unfinished game systems](#unfinished-game-systems) — 3 items
5. [World consistency and narrative](#world-consistency-and-narrative) — 21 items
6. [Focused AI playtests](#focused-ai-playtests) — 2 items

## Interaction and parser repairs

- [x] Add a response at the start room for 'examine bodies', in part because the AI keeps trying it and in part because it would be an opportunity to draw differences between the two bodies; they do not appear to have been together. The bald guy looks like he fell from the top of the stairwell, while the old man appears to have been hiding down there.

- [x] I think I accidentally added 'robe' to the vocab of the jumpsuit corpse

- [x] Give the old man robe responses for examine, take, etc.

- [ ] At the CorridorEnd on Level Six the green disk is visible through the gap, but when the agent examined the disk the response was 'you don't see that here' so some scope issue

- [x] At the CorridorEnd the headless corpse is described as wearing a robe but when the agent tried to search the robe the response was 'you don't see that here'

- [x] In the L3 Warehouse the command 'examine crates' returns 'you don't see that here' when they are clearly referenced in the description

- [x] Same goes for 'racks' / 'rack'

- [ ] Right now the Level Four Stair Access (and perhaps other floors) elevators are not well plugged in, where the agent couldn't press the elevator button despite it being described, etc.

- [ ] In Stairs Level Seven, attempting to examine the badge reader failed 'examine badge reader' resulted in 'you don't see that here'

- [ ] In Onche's quarters, 'examine painting' worked but 'look behind painting' responded with 'you don't see that here'

- [ ] In the Sanyi quarters 'take t-shirt' from one of the corpses responds 'You can't take that' make that something more interesting like it's fused to the remains

- [ ] The agent usually tries to 'give pass to robot' once they have the park pass, and right now it responds 'Ranger Rick does not seem interested in the laminated pass' which doesn't track. Use an override to have Rick tell the player they should keep the pass, and it will scan it as they enter

- [ ] In the Movie Theater the agent attempted to 'push button' but it got interpreted as pushing the radio call button

- [ ] In the Gym showers (men and women) the agent tried the very reasonable 'examine shower' and 'examine benches' and both return 'You don't see that here'

- [ ] In the weight room, consider more things a player might try, the agent tried to 'pull badge' and 'push man' for example which are both reasonable so have responses ready

- [ ] In the weight room it also later tried 'remove plates from barbell' and 'take plates' so work something out for that. It can use the same mechanism the smart dumbells use where the weight is settable, but it's stuck for some reason, maybe it got damaged when it fell

- [ ] It references a massage table in the nail salon but 'sit on massage table' returns 'You don't see that here'

- [ ] In the park after the trashbot enters the maintenance depot through the 'hidden panel' using 'examine panel' returns 'you don't see that here'

## Existing puzzle correctness

- [ ] I forgot and left all the teleport rings active while testing, set those back to inactive until the player reactivates them in the power station terminal

- [ ] Debug the trashbot/key puzzle, in each run the agent thinks to drop an item to see if trashbot sweeps it up, one even noting that doing so might make it go empty the bin, so the logic seems fine. When it dropped things though the trashbot never swept them up. They always ended up solving the puzzle by using 'put \<item> in bin' which shouldn't work, but does (it does correctly trigger the emptying sequence)

- [ ] In the Cardio Room, the agent tried different variations of 'put ball on treadmill', 'throw ball on treadmill', 'throw ball west', 'roll ball west' etc. with a stated reason of 'Experiment', and this is a reasonable thing a person might try, to see if it makes the ball go shooting off. It's a good idea to add support for that because it can also provide clues by shooting the ball off at different angles depending on the treadmill angle, and shooting it in the direction of the wire bin. Though bear in mind that the agent solved this puzzle on its own even without the clues.

- [ ] In the Bar, the agent asked the bartender about the trivia question and the bartender told it. The agent then (naturally) asked the bartender about Bufo Clutch A, and the bartender responded by giving it the answer to the trivia question so look into that. It might end up being tricky, because in order for the barbot to know the player answered the trivia question correctly it needs to know what the answer is, but it can never TELL the player what the answer is

- [ ] I don't think the nailbot is plugged in correctly, right now even when the other NPCs respond via AI it still gives responses like 'the robot nail-tech has nothing to say about that', and when the agent tried (understandably) to 'give voucher to robot' it returned 'The robot nail-tech does not seem interested in the nail salon voucher' and 'use voucher' responds 'There's nothing to use', both should work. When the agent used 'tell robot I'd like a mani-pedi' it got back an AI response, so it might just be ask that's not plugged in, I might have only done the tell bit to test the gossip mechanic

- [ ] The nailbot gossip thing isn't quite working either, there's a message meant to play when the player hits the gossip criteria and hands over the whistle, and that never appears in any of the agent logs so it never successfully triggered that, BUT, after telling a bunch of gossip without using the specific gossip id the nailbot responded well, and eventually on its own told the player about the hiding robot but since the event was never triggered it never gave over the whistle

## Progression chains

- [ ] In the Onche residence, instead of just background flavor, make the whiteboard, notes, and model all clues that together sketch out a way to reroute the Ozone generator from the water treatment plant to flood the ship's ventilation systems in order to eradicate the organism. Make at least some of the clues loggable. Onche of course died before she could ever implement any of it.

- [ ] Add an NPC memory for Jolson Dend on Stair Six. Since he works in the 3D printing facility, have him carrying a cartridge of atums, and give the memory some connection where maybe he considers returning to the printing facility to print a tool that might help, but decides that to do that he'd need to get a space suit from [location] since it's above the cargo bay which has been depressurized due to a breach. Have him also reference that the elevators in the cargo bay have no power, but the gravity is out as well, so the facility is still accessible. Have him give a clue as to where he could find a space suit.

- [ ] The space suit currently isn't placed anywhere, so this is a good time to decide where it will go

- [ ] In at least one run, the agent realized the rag might be worth hydrating and attempted to use a bathroom sink to wet it, so add the fishbowl and water in before the next run.
  - [ ] This will mean dealing with water
  - [ ] This would be a good time to place Onche's corpse
  - [ ] This would also be a good time to hammer out the slug puzzle to gain access to the Water Treatment Plant
  - [ ] Since accessing the plant is approaching the endgame, add a wrinkle where plain water won't revive the slug, they need to fill the fishbowl using water from the aquarium. This can be explained in the Xenobiology Lab

- [ ] Either find a use for the jar of acid or remove it

- [ ] To ensure the player solves the sauna puzzle before reaching the power station, put Feeny Salk in the sauna, carrying his locker key, which contains the insta-roids needed the get the yellow badge.

- [ ] In the gym, add him to the signup sheet, and have him also with a reserved spot in the sauna as a hint to the player

- [ ] The agent found locker keys and immediately attempted to try them upon finding the gym, so it's time to populate them with items. Most of them will just be flavor or gimmick/fun items, but the insta-roids are a solution to a puzzle

- [ ] In this hedonistic 'anything goes' culture steroids probably wouldn't be an illicit thing anymore, so rather than make it a down-low thing put it out front where maybe they even sell them at the juice bar, but it's closed and everybody is dead. That will alert the player to the fact that they exist, then they can make the connection that they might be able to lift the barbell with them, which then becomes 'where do I find some?' In that scenario it would be natural for the player to ask the robot about them specifically, and the robot can then indicate who might have some. The player can then get the locker number from the signup sheet once they get the name
  - [ ] Also, come up with an actual list of names for the different locker numbers, so the items relate to specific people

- [ ] Once the agent knew Salk might have insta-roids it started looking for his key everywhere, the key will be moved to the sauna (along with Salk himself)

- [ ] At the minute, solving the treadmill puzzle doesn't buy anything except turning off the treadmill, which doesn't buy anything. There needs to be something here that helps the player progress
  - [ ]

- [ ] Now that the player doesn't start with any flashlight, how can they get into the Bar Basement, and what is down there that they need?

## Unfinished game systems

- [ ] Right now the Spa/Steam Room/Sauna aren't fleshed out, so do that now; add the light switch, the mechanics, the organism, everything until it works end-to-end
  - [ ] This will mean deciding how the frozen sample / Cooler puzzle works, and implementing those mechanics as well

- [ ] The Walk In needs work. Some of it is plugged in but need to close the loop on the following:
  - [ ] Plug in the whole 'getting a sample from the doomed chef' mechanic
    - [ ] Add a carving knife to the kitchen the player can use to carve off small slices, when they do the chef murmurs 'take all you need...'
    - [ ] Decide what the actual sample rules are and implement them
    - [ ] Make sure the cooler works correctly with the samples
  - [ ] There's no way to turn off the freezer but rather than add it, add a menu option in the Power Station terminal to shut it off

- [ ] The phone needs to be plugged in too, it could be used for other things as well, and the same calling ability needs to be added to all the living quarters phones

## World consistency and narrative

- [ ] In the airlock there's a panel, and when examined it gives an obviously AI written description

- [ ] Rename the 'Level Six Corridor' to 'Airlock' or 'Airlock Corridor' since that's what it is. Originally I think it was meant to be a trick but just say what it is, the player isn't meant to have amnesia anymore

- [ ] In the Eegler bedroom for the command 'examine picture' change the description so that the player knows who they are, it's Mox and Volonope in happier times

- [ ] Do we really need Mox's ID card? Right now it's a total red herring it doesn't do anything or serve any purpose now that the amnesia gimmick is dropped

- [ ] Put something in Eegler's dresser, even if it's just flavor. Maybe a specific outfit for Mox that fits perfectly

- [ ] For the Eegler living area sheet music instead of just referencing different projects try and come up with humorous titles that suggest in addition to science, Mox also has an interest in pretentious rock operas

- [ ] For Umboltz residence, the living quarters door has a reference to '3ew' that is stale

- [ ] There's a body up on Stair One that is wearing a uniform, either get rid of it entirely, or else add maybe a body with a blowtorch who'd been trying to cut through the door with no success. Give them a DNA profile, and a memory to watch as they frantically attempt to reason with the 'Mayor' to let them in, which the AI refuses to do as not to expose the AI's workings to the foreign organism

- [ ] Give the old man at the Stairwell Bottom a dna profile, and also an NPC profile memory that plays out as he scrambles down the stairwell to hide at the bottom. As this happens, his memories give clues along the lines of 'can't get caught', 'humanity's only chance', 'history will vindicate me'

- [ ] Right now on the clones message machine, Umboltz leaves a message about the warehouse between their units, but I've since moved all the units around. For this to match, the message should be left on Onche's machine, from Mox himself.

- [ ] Stairs Level Three has a reference to 'sooty footprints' that when examined returns 'You don't see that here' but I think there used to be a burned body I got rid of, so just remove the footprints reference altogether

- [ ] Put some clothes in Onche's bedroom closet, even if it's just one

- [ ] In the Level Three Corridor Three, 'examine doorway' indicated nothing can be made out inside and they can hear something moving, so this is why they never want to go in. That's stale, the room is now dimly lit, so encourage them to enter by indicating the room beyond does have some light

- [ ] The three clone corpses need DNA profiles, but not NPC profiles since none have heads

- [ ] In the Movie Theater bathroom the agent consistently tried to look in the stalls, so make them searchable and maybe put the e-cigar in one of the stalls perched on the toilet paper dispenser with a melted body but intact head sitting in the bowl. Add a DNA profile and an NPC profile that plays out a memory of him smoking while the usherbot yells from outside that it 'can detect smoke from out here' and that it will 'go in there if I have to' to give clues
  - [ ] This is another pro for the idea that not just any water will rehydrate the slug, as otherwise any stray toilet bowl could activate it

- [ ] The Restaurant needs fleshing out. It mentions a tablecloth but 'examine tablecloth' returns 'You don't see that here'. It's basically a placeholder with a revamped description, but I think even that can go further.
  - [ ] Lean into the opulence, with a sumptuous (though now getting stinky) bordering on vulgar buffet on display of all the most controversial shit you can think of
  - [ ] For the buffet basically describe a mish mash of the menu items without naming anything, make anything described examine-able but it can be one general description for all, to signal the buffet itself isn't part of any puzzle, save for maybe some named items among the display
  - [ ] For the menu: Elephant tenderloin, baby sea turtle soup, great ape stew (containing gorilla, chimpanzee, and orangutan), bald eagle foie gras, shark fin tip soup, baby seal paillard (pounded thin), pouring stew (containing both cat and dog), three whale sashimi, suckling dolphin, and long pig

- [ ] In the Restaurant, there are men's and women's bathrooms but they're just pretty much blank. Do they need to be there? If these people are so over the top hedoninstic might they have a comical shared bathroom space? What about something like a 'polyopticon' where there are no urinals, no stalls, and the toilets are arranged in a circle around a large circular room all facing in with no explanation, and in the center is a ring-shaped sink everybody uses, with some hoity toity phrase about having nothing to hide

- [ ] In the Kitchen the description mentions a 'large padlocked steel door' which was meant to be the walk in freezer, but I decided to leave it unlocked and it has a scenery description of its own so remove the reference in the room description

- [ ] Add the old woman corpse to the park bench, give her a dna profile, and an NPC profile

- [ ] In the Bar the window is described as being covered in fliers, but 'examine fliers' just gives the window description again, which isn't the end of the world, but it's an opportunity to come up with some funny flier events

- [ ] The Bar voucher calls the nail salon 'Keratin Kindness' but I think I changed it so doublecheck

## Focused AI playtests

- [ ] Need to do some isolated testing of the spider/hydroponics door puzzle, maybe stick the agent in that room and see if it can sort it out when it's forced to focus on it. So far in every run the agent has looked through the hole then abandoned the door so I might need to have the windup and spray take 1 turn instead of 3 so there's more immediate feedback that it's worth exploring, but would a human player be so quick to abandon it? I'm not sure.

- [ ] I'll need to do some focused testing with the agent armed with known gossip and see if it can navigate the puzzle with Nail Bot, the run was a wash there because the backend server must have been down but in another run I remember it did start dishing, so the basic logic / mechanic is there, though while it did trigger Nail Bot telling the agent about the Lonely Bot, it never gave over the robot whistle

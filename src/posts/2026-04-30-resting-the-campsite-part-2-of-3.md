---
title: "Resting: the campsite (Part 2 of 3)"
description: "Part 1 was about why rests deserve more than a button click. This time I want to just show you the thing. So here you go - party resting in a dungeon from start to finish."
date: 2026-04-30
layout: post.njk
permalink: "/blog/resting-the-campsite-part-2-of-3/"
tier: Public
type: devlog
patreonId: "156969604"
patreonContentHash: "sha256:1c261f72011e1c13"
patreonUrl: "/posts/resting-campsite-156969604"
patreonLabel: "Ionrift on Patreon"
---

Part 1 was about why rests deserve more than a button click. This time I want to just show you the thing. So here you go - party resting in a dungeon from start to finish.

Here's what's happening in it.

### **Light the fire**

Minimal clicks. That was the priority. Nobody wants to parse information and click through setup screens just to get the rest underway. You want quick and snappy. I just want to rest.

![](https://c10.patreonusercontent.com/4/patreon-media/p/post/156969604/cc6984d9cdba4157814a43094c283ea6/eyJhIjoxLCJwIjoxfQ%3D%3D/1.gif?token-hash=VnDqpZwtC0i_yrCQNaqZTT3cF75dj0qKJYDiQOiRaEU%3D&token-time=1779062400)

The GM places the campfire on the map, and the rest is live. Everything else happens at the campsite itself. No setup wizard, no configuration screen. Place the fire, the camp exists.

### **Eat**

The party eats from their rations. No cook in this group, no cooking utensils, so it's cold food and no bonuses. That's fine. It's a dungeon, they're tired, they eat what they've got. Cooking opens up a whole other layer (more on that in Part 3), but the baseline is simple: got rations? You eat.

### **Pick activities**

Instead of opening a list of things you could do, the party walks up to workstations at the camp. A workbench, a study table, a cooking fire. Walk up to it with a character and interact. The UI that opens is scoped to that station.

No tabs full of unrelated options. No parsing a wall of choices. You're at the workbench, so you see crafting. You're at the study table, so you see research. The context manages itself because you can only see what's relevant to where you are.

### **Identify**

If you're running Quartermaster, loot drops as unidentified. The party picks up a sword and all they know is that it's a sword. Properties, attunement, magical effects: all hidden until someone takes the time to examine it.

![](https://c10.patreonusercontent.com/4/patreon-media/p/post/156969604/7a0c3f02ed394eee9c397a0416143cc9/eyJhIjoxLCJwIjoxfQ%3D%3D/1.png?token-hash=V8zdxkLQG7OytPfWER9JPWrGb5fQ_h_A9lt_APFW9pU%3D&token-time=1779062400)

That's where the identification station comes in. It's a workstation at the camp. Walk up, interact, and the UI shows what the character is carrying and what they can examine. In the video the party identifies a magic item and some potions they've been hauling around. Quartermaster strips the information. Respite gives it back. The two modules close the loop.

The workflow that used to be "pick from a dropdown" is now "walk to the table and examine the sword." Same outcome, different texture.

### What's different

The satisfying part is that it pulls everyone back into the game. You're looking at the campsite, you can see the characters walking up to stations. The map becomes the navigation. Walk to a thing, interact with it. No tutorial needed (maybe?).

Part 3 covers the new cooking, foraging and hunting.

This one's taken longer than usual. The workstation model touched nearly everything, and the refactor underneath it has been a chunky task to say the least. There will be bugs I can't see and edge cases I haven't hit yet. If you run into something odd, let me know. That kind of feedback is what gets it solid.

\-- Ionrift

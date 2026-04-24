---
title: "Dev Log: Building a Starter Sound Pack for Resonance"
description: "The most common feedback I get about Resonance: it works well, but I have to find all the sounds myself."
date: 2026-02-24
layout: post.njk
permalink: "/blog/dev-log-building-a-starter-sound-pack-for-resonance/"
tier: Public
type: devlog
patreonId: "151573597"
patreonContentHash: "sha256:8cac04d44e8e7594"
patreonUrl: "/posts/dev-log-building-151573597"
patreonLabel: "Ionrift on Patreon"
---

The most common feedback I get about Resonance: _it works well, but I have to find all the sounds myself._

Fair enough. That changes with the next update.

### **What's Coming**

Resonance 2.1 will ship with **nearly 300 built-in sounds** — no Syrinscape, no setup.

Every combat sound key in Resonance will have default audio out of the box:

![](https://c10.patreonusercontent.com/4/patreon-media/p/post/151573597/14fbed2380a3432ca77b3aadede61bd3/eyJhIjoxLCJ3Ijo4MjB9/1.png?token-hash=vcX24AlKWi3LlfcoEGGuQTJMGiPzQOONQo_TIG_AB-0%3D&token-time=1778284800)

Every sound key has multiple variants. Resonance picks randomly so combat doesn't repeat itself.

### **How It Sounds**

Death screams are my favourite example of what's under the hood. Each one is a three-layer composite:

1.  **Vocal scream** — the raw performance
    
2.  **Horror chord** — a dissonant musical stab
    
3.  **Bell toll** — the finality
    

They play as a single sound, but the layering gives them weight.

Critical hits work similarly — the base impact stacks with a crowd cheer and sparkle effects.

### **The Architecture**

Resonance uses a **proposal → conclusion** model for weapon sounds:

-   **Proposal** (ATTACK\_SWORD\_SLASH): fires as the attack roll happens. _"The sword swings..."_
    
-   **Conclusion** (CORE\_HIT / CORE\_MISS): fires as the result lands. _"...and connects."_
    
-   **Stinger** (CORE\_CRIT): overlays on a natural 20.
    

GM and players hear the swing as they see the outcome — no spoilers on the roll.

### **What's Still Ahead**

A handful of weapon conclusion sounds are still in progress, plus Daggerheart mechanics (Hope, Fear, Stress tokens) and ambient SFX. These will round out the pack before it ships.

The update will also re-tune the setup wizard so local sounds are the obvious default path — not a secondary option behind Syrinscape.

### **No Configuration Required**

You install the module, it detects your system, and combat sounds are wired up automatically. The sound picker is still there if you want to customise, but you shouldn't have to touch it.

Samples coming in the next update so you can hear the pack before it ships.

— Ionrift

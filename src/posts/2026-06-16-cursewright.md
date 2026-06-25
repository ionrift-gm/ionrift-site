---
title: "Cursewright"
description: "For those who haven't seen it: Cursewright is a cursed item system for Foundry VTT. Mechanical curses that use what the platform can actually do. The inventory system, item sheets, combat hooks, rest "
date: 2026-06-16
layout: post.njk
permalink: "/blog/cursewright/"
tier: Public
type: devlog
patreonId: "161227392"
patreonContentHash: "sha256:51ba577b254c49f9"
patreonUrl: "/Ionrift/posts/cursewright-161227392"
patreonLabel: "Ionrift on Patreon"
ogImage: "/img/blog/2026/cursewright/cover.png"
---

For those who haven't seen it: Cursewright is a cursed item system for Foundry VTT. Mechanical curses that use what the platform can actually do. The inventory system, item sheets, combat hooks, rest cycles. The goal is to capture the intent behind each curse in a way that pen-and-paper never could.

The starting point is the classic SRD cursed items, rebuilt from the ground up. Original curses are coming after that foundation is in place.

### How you get it.

![](https://c10.patreonusercontent.com/4/patreon-media/p/post/161227392/038a0169cc254cdea4f3ec8467603010/eyJhIjoxLCJwIjoxfQ%3D%3D/1.png?token-hash=ChlELUpgL6Xye3muF6Io4f6moaI6F6NeIAMKSFqPaLE%3D&token-time=1783641600)

Cursewright is a **Patreon module**, not a Foundry browser listing. The engine, the Curse Author, the reference curses, and the compendiums ship together as one product at **Acolyte** and above.

Install path: connect your Patreon account in **Ionrift Library**, enable the module in Foundry. Cloud Relay handles the download. Requires Ionrift Library; Quartermaster is recommended for identification and loot integration.

Early Access is the current window while the library and tooling settle. When it hits GA, the delivery channel stays the same: stable release on Patreon, not a public Foundry store drop.

### The archetype system.

v1.1.0 changes how everything works under the hood. Every cursed item is now modelled as a pluggable behaviour archetype rather than hardcoded logic. Oathcleaver, Gauntlets, Potions, Dusts - have all been retrofitted onto archetypes internally. Nothing changes at the table, but the engine is consistent across the library now.

### Homebrew cursed items.

![](https://c10.patreonusercontent.com/4/patreon-media/p/post/161227392/d7b68e252f4046348d7d875a59d35c76/eyJhIjoxLCJ3Ijo4MjB9/1.png?token-hash=-CTs1bgRDcNC7HfOkCAsCXoexEdFsZgz6lm8ThRj37g%3D&token-time=1783641600)

The community pointed out, correctly, that people need agency to forge their own take on curses. Making the curses their own through homebrew was what the module concept was missing. Grateful for that push.

The Curse Author is open. Build from one of four behaviour templates (more in time):

-   **Slow-Burn Equipment.** Exposure-driven gear curses with phase snapshot progression.
    
-   **Deceptive Consumable.** Items that present a lure benefit on use before the curse loads.
    
-   **Combat Trigger.** Curses that activate or escalate on combat events.
    
-   **Devouring Container.** Predator-type container items with per-rest raiding and stub mechanics.
    

Retrofitting the core systems for archetypes took a long time. But the payoff is that I can mint a suggested item for each archetype and from there it can be tuned to the table. Existing homebrew curses using weight-based escalation carry forward automatically under Slow-Burn Equipment. No rebuilding required.

**What's next.** I'm working through the traditional SRD curses first, recasting each one onto the Foundry platform before introducing anything original. The remaining base curses are all drafted and moving through implementation and testing. After those land, the first original tier 4 item drops.

Cursewright is in Early Access. Acolyte and above.

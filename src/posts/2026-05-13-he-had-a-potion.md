---
title: "He had a potion"
description: "There's a moment from a campaign I ran years back that's been sitting in my head for a while. End of OotA's final act. Two elite drow, poison weapons. The barbarian was getting wrecked but holding on."
date: 2026-05-13
layout: post.njk
permalink: "/blog/he-had-a-potion/"
tier: Public
type: devlog
patreonId: "158196713"
patreonContentHash: "sha256:698f611b8e9519be"
patreonUrl: "/posts/he-had-potion-158196713"
patreonLabel: "Ionrift on Patreon"
ogImage: "/img/blog/2026/he-had-a-potion/cover.png"
---

There's a moment from a campaign I ran years back that's been sitting in my head for a while. End of OotA's final act. Two elite drow, poison weapons. The barbarian was getting wrecked but holding on. Damage resistance doing a lot of work, a handful of hit points left. Panic starting to set in at the table.

"Don't heal me," the player said. "I've got a potion."

They'd found it weeks back. Tucked into a cache with other loot. It had looked a little off at the time, honestly. Didn't stack with the others. A small outlier. But that was long ago and since then it had just... sat there. Innocent. A greater healing potion, as far as anyone could tell.

The barbarian drank it on their turn.

Automation resolved. They went unconscious.

The player screamed. "It's poisoned!?"

_(It was. I'd planted it that way. They'd carried it through most of the campaign. The signs were there at the start, in the cache where they found it, but those were long forgotten by the final act.)_

That moment is basically the design spec for what's now in Cursewright.

![](https://c10.patreonusercontent.com/4/patreon-media/p/post/158196713/f2bf7ab9e16348958ce4353f53c8b0fa/eyJhIjoxLCJ3Ijo4MjB9/1.png?token-hash=F85VvgfcJjMz3LddDBW6RNSw7eKk8pfRmqV-1ZzNXDE%3D&token-time=1780444800)

* * *

GMs can mark potions in a loot cache as poisoned when building a loot cache. From that point the disguise holds. The item takes the name, icon, weight, and price of whatever healing potion it's mimicking. It merges into the party's stack when they pick it up. It sits on their sheet looking exactly like the real thing.

A small droplet badge shows up in the GM's loot preview so you know which ones are live. Players see nothing.

![](https://c10.patreonusercontent.com/4/patreon-media/p/post/158196713/bf9dc82c39704e0bb9d13c39e6f5ce2f/eyJhIjoxLCJ3Ijo4MjB9/1.png?token-hash=8IxWRdLSqX0dF3ER5dQBGOSi1SAO_mcKCb8g3oMFZeQ%3D&token-time=1780444800)

The poison resolves at the moment of use, not at pickup. There's a probability model behind it: every poisoned batch carries a rate you set at authoring time. Anything from a low chance (a batch that's mostly safe, occasional consequence) up to guaranteed. The engine rolls privately when the cork comes off. The player finds out then.

That's the part that matters. The deception isn't just visual. It lives in the bag. It travels through sessions. It waits.

Battles can start to feel answered before they're over, especially as a party gets capable and confident. They know their resources, they know their outs. A poisoned batch sitting quietly in someone's pack is a variable the GM holds, invisibly, until the moment it matters. It doesn't change the odds. It changes who's holding them.

* * *

Early access patrons are getting this first. And there's more to say about Cursewright broadly: the curse system has been quietly outgrowing its original home for a while now. Poisoned potions are part of what made that obvious. I'll say more about where the module is heading soon.

Updates to Quartermaster are looming and it's companion module 'Cursewright'

---
title: "Curses: are broken (Part 1 of 3)"
description: "The first cursed item I dropped into a session was the Berserker Axe. SRD, straight out of the book. Thought it'd be fun."
date: 2026-04-22
layout: post.njk
permalink: "/blog/curses-are-broken-part-1-of-3/"
tier: Public
type: devlog
patreonId: "156247065"
patreonContentHash: "sha256:127ee7fcf65cdf39"
patreonUrl: "/posts/curses-are-part-156247065"
patreonLabel: "Ionrift on Patreon"
ogImage: "/img/blog/2026/curses-are-broken-part-1-of-3/cover.png"
---

### **Curses are broken**

The first cursed item I dropped into a session was the Berserker Axe. SRD, straight out of the book. Thought it'd be fun.

A player found it, unidentified. Top image. Looks fine. "Unidentified Weapon," no name, no description. So far so good.

They cast Identify. Bottom image. The full description appears, curse paragraph and all. "You gain a +1 bonus... while you are attuned, you have disadvantage... whenever a hostile creature damages you, you must succeed on a DC 15 Wisdom saving throw or go berserk." The player read it and said "so it's a cursed axe." Not a question.

![](https://c10.patreonusercontent.com/4/patreon-media/p/post/156247065/382234793380488cba89efe26dc48899/eyJhIjoxLCJwIjoxfQ%3D%3D/1.png?token-hash=El2obwS7ZJNwdYJSC8hZOQLiKBhAVwE2SvTWpehY07w%3D&token-time=1778284800)

![](https://c10.patreonusercontent.com/4/patreon-media/p/post/156247065/e17bfa3a82714146a4658f28fd6f234d/eyJhIjoxLCJwIjoxfQ%3D%3D/1.png?token-hash=F3agZU5nhfIQSR6zk7g0_ipX3dmE7joN6sc-Vf8ODlY%3D&token-time=1778284800)

RAW, Identify doesn't reveal curses. DMG page 139: "most methods of identifying items, including the identify spell, fail to reveal such a curse." But Foundry doesn't know that. It shows the full item entry, curse included. The basic tools betrayed the rule, and the surprise was gone before the axe left the loot pile.

For the curse to work at all, our cleric had to knowingly volunteer. He played into it, which was generous. In combat they would mutter or shout "what's that boy? I should kill them instead of healing them?" and roll a dice to decide what he did. Fun japes, we like.

But the system wasn't creating that moment, the player was. The axe's mechanical contribution was "combat takes longer now" because the party had to subdue the cleric at the end of most fights.

It lasted about four or five sessions. They found a Remove Curse scroll and the cleric was free. Nobody debated it. Nobody hesitated. The scroll arrived and everyone was relieved.

### **The workaround**

To run it correctly, I would have needed to manually redact the curse text before the player saw the item. That means creating a second copy with the curse paragraph stripped, swapping it in at identification, and keeping the real version somewhere the player can't access.

That's not a workflow. That's a chore.

### **The Javelin problem**

Curses aside, this isn't even a curse-specific problem. Foundry's identification system has the same issue with every magic item.

Take a Javelin of Lightning. Set it to unidentified. Foundry swaps the name to "Unidentified Javelin" and hides the description. That's all it does.

![](https://c10.patreonusercontent.com/4/patreon-media/p/post/156247065/c19eb0a4cb1447918bfe21b3765cd0ed/eyJhIjoxLCJ3Ijo4MjB9/1.png?token-hash=cPVXkCzDsoqc99VfETI3V-DvJ3dvKKbeppiRWpFmYYs%3D&token-time=1778284800)

Look at the screenshot. +5 to hit. 1d6+4 Lightning damage. Right there on the sheet. The name says "unidentified" but the stats don't care. The gold value is technically hidden behind a lock icon, but compare it to the Chain Mail below it: different tab count, different layout, different density. The "unidentified" item looks nothing like a mundane one. And even if none of that were rendered, a player who opens browser dev tools can read the full item data.

The identification system is beyond busted.

Put a masked +1 Longsword next to a regular Longsword in the same loot pile and the sheets render differently. Different tabs, one has gold one dost etc... The magical item stands out without the player doing anything to earn that information.

### **What I was doing instead**

For a while I used a mod (GM Notes, I think) to leave notes on items, mapping which mundane item was which magic item. The concept made sense but execution was impossible unless I scripted it to happen that specific session. Magic items would get forgotten in bags, discarded, traded to NPCs.

Later in the campaign I started creating multiple items to fake a lifecycle. A vague, appealing armor as the "found" version. A class-adaptive legendary piece as the "identified" version. A third item as the curse reveal. Three separate item documents, two manual swaps, all tracked by memory. It worked exactly once, for one item, and only because I was paying close attention that session.

That's what running curses in Foundry actually looks like. Not an engine, not a system. Just a GM juggling item documents and hoping the seams don't show.

### **The real question**

I thought the problem was curses. But the more I dug into it, the more I realised curses are just the sharpest edge of a bigger issue: Foundry's item model assumes the player and the GM see the same thing. There's no layer where the GM's knowledge of an item splits from the player's. No way to say "this item has a secret."

Part 2 is about how I'm fixing that in Quartermaster, starting with something I noticed about the identification rules that changes the whole approach.

\-- Ionrift

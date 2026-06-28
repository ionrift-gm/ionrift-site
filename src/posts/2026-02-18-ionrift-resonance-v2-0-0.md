---
title: "Ionrift Resonance v2.0.0 "
description: "Automated combat sounds for Foundry with Ionrift Resonance - now live on the Foundry package registry. Both MIT licensed."
date: 2026-02-18
layout: post.njk
permalink: "/blog/ionrift-resonance-v2-0-0/"
tier: Public
type: devlog
patreonId: "151020056"
patreonContentHash: "sha256:37a9a6777be5eddb"
patreonUrl: "/posts/ionrift-v2-0-0-151020056"
patreonLabel: "Ionrift on Patreon"
ogImage: "/img/blog/2026/ionrift-resonance-v2-0-0/cover.gif"
---

Automated combat sounds for Foundry with Ionrift Resonance - now live on the Foundry package registry. Both MIT licensed.  

![](https://c10.patreonusercontent.com/4/patreon-media/p/post/151020056/921a2ecf768d4c72a8ad820baf03bcfc/eyJhIjoxLCJwIjoxfQ%3D%3D/1.gif?token-hash=vO9MPP7Bcg3Sv_zDxR6sLVFdjfjs3Tv_Dqz_ggcKN10%3D&token-time=1778284800)

  
Automated combat sounds for Foundry. Now when your characters swing swords, cast spells, take damage - sounds play automatically depending on who hit what, with what.  
I spent too long fiddling with sound configs, which distracted me from working on the story and content of my campaigns. But I did enjoy making this module - reactive combat sounds (attack impacts, spell stingers, pain vocals) really add so much to the virtual table. Hope you get as much out of the system as I do and it frees you up to focus on content instead of clicking around config UIs.

  
When combat happens it checks a few things in order - custom sounds on specific actors/items first (that 🎵 button on sheets), then sounds for named NPCs or legendary weapons, then creature types (automatically tagged - dragon\_fire, undead\_skeleton, etc), finally keyword matching as fallback. Walks through that list, finds a match, plays the sound, done.

![](https://c10.patreonusercontent.com/4/patreon-media/p/post/151020056/62cb98efafce4ad28cb5d3168b5be2a1/eyJhIjoxLCJwIjoxfQ%3D%3D/1.gif?token-hash=CWdtNODKL2phDbQRp1Zp2719Py4k-8foGediclOVaW4%3D&token-time=1778284800)

  
It's been sitting in my Foundry folders for ages but I've finally tidied it up and formalized it for others 🫣

![](https://c10.patreonusercontent.com/4/patreon-media/p/post/151020056/e3eee8af0cc94c2b9edb3b205233b164/eyJhIjoxLCJwIjoxfQ%3D%3D/1.gif?token-hash=5xakL_sJba7jnldPqdHEPTzuV065sJBGnjrAK6ijEaw%3D&token-time=1778284800)

  
For Daggerheart players - it's wired for Fear Tracker intensity (Low/Med/High), Duality Dice (Hope/Fear stingers), Domain-aware casting (Splendor ≠ Bone obviously), and all the Stress/Armor/Hope stuff.

  
I've tested this a lot - across DnD5e and Daggerheart, plus years of actual table use. But I've probably missed something while formalizing it and giving it a UI. If you hit bugs or weird behavior, GitHub issues are helpful (logs + screenshots appreciated).

  
_**Links:**_

-   [Install from Foundry](https://foundryvtt.com/packages/ionrift-resonance)
    
-   [Resonance (GitHub)](https://github.com/ionrift-gm/ionrift-resonance)
    
-   [Library (GitHub)](https://github.com/ionrift-gm/ionrift-library)
    

  
Give it a try and let me know what you think!

Thanks for supporting the workshop. More tools soon. 🧡

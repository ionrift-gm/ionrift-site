---
title: "Homebrew Recipe Editor"
description: "Up till now, the cooking system in Respite has been fairly vestigial. Enough to prove the concept worked, make sure the crafting loop held together, but not really something you could make your own."
date: 2026-06-21
layout: post.njk
permalink: "/blog/homebrew-recipe-editor/"
tier: Public
type: devlog
patreonId: "161678002"
patreonContentHash: "sha256:7088db784066165a"
patreonUrl: "/Ionrift/posts/homebrew-recipe-161678002"
patreonLabel: "Ionrift on Patreon"
---

Up till now, the cooking system in Respite has been fairly vestigial. Enough to prove the concept worked, make sure the crafting loop held together, but not really something you could make your own.

With the core systems more stable now, I've been able to spend some time opening it up. v3.3.1 adds a homebrew recipe editor. GMs can author their own recipes, define ingredients and foraging results, set DCs, and shape the cooking system around their game where it makes sense.

![](https://c10.patreonusercontent.com/4/patreon-media/p/post/161678002/e302f6f0c0e94d068f604047c7f0a949/eyJhIjoxLCJ3Ijo4MjB9/1.png?token-hash=RDj39GAmfoFi8wcyQBQKfSDmbPz1l_P0BvrwnDES9H0%3D&token-time=1783641600)

The idea is simple: you shouldn't need a content pack to add a recipe for camp bread, or whatever your party's ranger keeps insisting they can make out of three mushrooms and a stick. If your table has a running bit about someone's terrible stew, that can be a real recipe now.

![](https://c10.patreonusercontent.com/4/patreon-media/p/post/161678002/78ad6fd0bfb8426cae20e1740136f7c7/eyJhIjoxLCJ3Ijo4MjB9/1.png?token-hash=yfAZVApsBYE-ToaN6Speww0ee6AXM5qaHgFvgb_wD0A%3D&token-time=1783641600)

Custom recipes merge with any installed content packs. Nothing gets replaced, you're layering on top. If you want to override a pack recipe you can match the id. And if you'd rather strip pack recipes entirely and run pure homebrew, there's a setting for that too.

![](https://c10.patreonusercontent.com/4/patreon-media/p/post/161678002/b4b45fee4aba4a6dbf0bfcaae171fb96/eyJhIjoxLCJwIjoxfQ%3D%3D/1.png?token-hash=VJEtNkya5SOgY2VHG80XPxne_MAAQfExFLdULukwXWs%3D&token-time=1783641600)

Crafted results sync into a world compendium so they resolve to real items your players can pick up and use. No phantom entries, no broken links.

Right now the editor is open for cooking. More professions will follow in time.

(Free module. Update from the Foundry package manager.)

[https://foundryvtt.com/packages/ionrift-respite](https://foundryvtt.com/packages/ionrift-respite)

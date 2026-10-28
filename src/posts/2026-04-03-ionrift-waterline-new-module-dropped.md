---
title: "Ionrift Waterline - New module dropped!"
description: "Ionrift Waterline does two things - animated water overlays and procedural border walls. Both for Foundry VTT v12/v13."
date: 2026-04-03
layout: post.njk
permalink: "/blog/ionrift-waterline-new-module-dropped/"
tier: Public
type: devlog
patreonId: "154674788"
patreonContentHash: "sha256:4ef042f8a4900804"
patreonUrl: "/posts/ionrift-new-154674788"
patreonLabel: "Ionrift on Patreon"
coverVideo: "https://www.youtube.com/embed/-Fzm7DXkcFI"
ogImage: "https://img.youtube.com/vi/-Fzm7DXkcFI/maxresdefault.jpg"
---

**I**_**onrift Waterline**_ does two things - animated water overlays and procedural border walls. Both for Foundry VTT v12/v13.

_**How the water works**_

I have spent literal days of my life tracing water polygons on top of maps by hand. Every river, every lake, every puddle - click, click, click, adjusting vertices for hours. Across hundreds of maps this becomes genuinely soul-destroying prep work. So the whole point of this module was to make that go away.

Click on water in the map. Waterline traces the shape using flood-fill (same idea as the paint bucket tool) and drops an animated overlay on top - Voronoi caustics, background distortion, edge fade. The effect runs as a PIXI shader directly on the canvas.

Everything is tunable in real time. Speed, intensity, opacity, distortion strength, scale, flow direction. There are built-in presets for rivers, lakes, puddles, coastlines, and deep ocean. You can also save custom profiles per-world.

Shift+click adds more water. Ctrl+click removes it. Ctrl+Z undoes. Its additive, so you can build up complex bodies from multiple clicks.

_**Install**_

Free module. Requires Ionrift Library.

[https://github.com/ionrift-gm/ionrift-waterline](https://github.com/ionrift-gm/ionrift-waterline)

If anything breaks or looks off, come find us on Discord - still early days for this one.

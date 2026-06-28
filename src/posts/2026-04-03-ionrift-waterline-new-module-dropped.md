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
coverVideo: "https://www.youtube.com/embed/USmx-8CmQGk"
ogImage: "https://img.youtube.com/vi/USmx-8CmQGk/maxresdefault.jpg"
---

**I**_**onrift Waterline**_ does two things - animated water overlays and procedural border walls. Both for Foundry VTT v12/v13.

_**How the water works**_

I have spent literal days of my life tracing water polygons on top of maps by hand. Every river, every lake, every puddle - click, click, click, adjusting vertices for hours. Across hundreds of maps this becomes genuinely soul-destroying prep work. So the whole point of this module was to make that go away.

Click on water in the map. Waterline traces the shape using flood-fill (same idea as the paint bucket tool) and drops an animated overlay on top - Voronoi caustics, background distortion, edge fade. The effect runs as a PIXI shader directly on the canvas.

Everything is tunable in real time. Speed, intensity, opacity, distortion strength, scale, flow direction. There are built-in presets for rivers, lakes, puddles, coastlines, and deep ocean. You can also save custom profiles per-world.

Shift+click adds more water. Ctrl+click removes it. Ctrl+Z undoes. Its additive, so you can build up complex bodies from multiple clicks.

_**Border walls**_

This one came from a thing that always bugged me as a player - when you can see the exact edges of the map, you know the whole space. Theres nothing beyond. Your curiosity just switches off because the boundaries are right there, clean straight lines showing you exactly where the world ends. Even hiding those edges by a few pixels keeps that part of your brain active - the part that wonders whats around the corner or past the treeline.

So the border wall tool generates noise-displaced walls along the canvas edge. They bite into the map image just enough to make the boundaries feel organic instead of mechanical. You dont know exactly where the map stops and thats the point. Vertex count, amplitude, jitter, and inset are all configurable so you can dial in how much it eats into the edges. Theres a straight-wall mode too if you just need clean boundaries for indoor maps.

_**Install**_

Free module. Requires Ionrift Library.

[https://github.com/ionrift-gm/ionrift-waterline](https://github.com/ionrift-gm/ionrift-waterline)

If anything breaks or looks off, come find us on Discord - still early days for this one.

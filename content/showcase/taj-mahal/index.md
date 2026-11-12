---
title: "Taj Mahal"
description: "An interactive ink-and-wash axonometric cutaway of the Taj Mahal on the banks of the Yamuna River: marble mausoleum, four outward-leaning minarets, red-sandstone Mosque and Jawab, formal Charbagh garden axis, and Agra alluvial strata."
contenttype: article
tool: taj-mahal
topics:
  - design
tags:
  - svg
  - isometric
  - creative-coding
  - architecture
created: 2026-11-11
updated: 2026-11-12
---

## What it is

The tomb Shah Jahan built for Mumtaz Mahal along the southern bend of the Yamuna River in Agra: white Makrana marble plinth and mausoleum rising above the red sandstone *chameli farsh* waterfront terrace, backed by the broad river channel and approached through the symmetrical four-part *Charbagh* garden.

## What was drawn

- **Yamuna Riverfront & Agra alluvial cutaway**: sandstone retaining embankment along the north terrace edge dropping to the curving Yamuna River channel, sandy river shoals, sliced waterlines on the section faces, opposite *Mehtab Bagh* riverbank hint, perimeter cypress orchards, and Indo-Gangetic sedimentary strata skirts.

- The mausoleum block with chamfered corners: a large central iwan on each face — a framed arch bay with a teal jali screen set into the recess — flanked by two-storey niche bays that wrap around the chamfers, with slender guldasta pinnacles standing along the roofline.
- The great dome as a bulbous profile lofted on its ringed drum: swelling past the drum, an inverted lotus collar at the neck, and a tall finial. Four chhatris sit at the roof corners, each a miniature of the same drum-and-dome idea.
- Four freestanding minarets at the plinth corners, built as stacked drums with balcony rings and chhatri caps on octagonal bases — each tilted 1.4° outward, as built, so that a falling minaret would fall clear of the tomb. The tilt runs through every course and ring, not just the silhouette.
- The charbagh: the raised reflecting channel on the axis with its fountain ticks, the central marble tank, double-bordered parterre beds, and a cypress avenue. At the terrace's flanks, the mosque and its mirror jawab modelled in red sandstone — pishtaq toward the tomb, three white marble domes each — where the first build of this plate left blank blocks.

## How it works

A single HTML file; the only library is the site's vendored Three.js, so the piece makes no network calls of its own. Surfaces are flat vertex-coloured quads shaded by one light direction; the linework is six separate ink weights drawn as depth-tested segments, so the drawing keeps its hierarchy when you orbit. Drag to orbit, scroll to zoom, double-click to reset.

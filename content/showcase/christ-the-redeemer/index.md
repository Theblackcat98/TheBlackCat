---
title: "Christ the Redeemer"
description: "Christ the Redeemer drawn atop Mount Corcovado: the Art Deco soapstone statue and stepped sanctuary belvedere rising out of Rio's steep augen-gneiss granite dome and surrounding Tijuca Atlantic rainforest slopes."
contenttype: article
tool: christ-the-redeemer
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

Cristo Redentor above Rio de Janeiro, grounded atop the steep granite exfoliation dome of Mount Corcovado (`710 m`): a reinforced-concrete Art Deco monument skinned in soapstone above an octagonal sanctuary chapel, descending sharply into the forested ridges of Tijuca National Park.

## What was drawn

- **Mount Corcovado granite massif**: continuous elevation field falling sharply away from the octagonal summit terrace, showing exposed gray gneiss cliff shoulders, forested Tijuca canopy slopes, the rack-railway / stair ridge approach from the saddle, topographic contours, and stratified bedrock cutaway skirts.

- The Corcovado sanctuary: an octagonal terrace deck on a granite peak platform, its parapet left open on two faces for the monumental staircases, each flanked by pylons with terracotta caps.
- The eight-metre pedestal in three parts — stepped plinth, the chapel level with its entrance portal and teal relief panels, and a tapered upper shaft — separated by terracotta cornice bands.
- The robe as a fluted column: twenty-four-point cross-sections with alternating pleats, swelling from hem to chest, with the mantle swept diagonally across it from shoulder to hip and hanging in a cascade down one flank.
- The arms as tapering sleeve sections, pleats and all, ending in sculpted hands with the stigmata marked in terracotta; the head tilted forward over it all, hair locks framing the face, lightning-rod points along the crown.
- The drafting furniture around it: faint Vitruvian proportion circles behind the figure, construction rays, a dashed site grid, and the ghost outlines of the elevator annexes at the terrace edge.

## How it works

A single HTML file; the only library is the site's vendored Three.js, so the piece makes no network calls of its own. Surfaces are flat vertex-coloured quads shaded by one light direction; the linework is six separate ink weights drawn as depth-tested segments, so the drawing keeps its hierarchy when you orbit. Drag to orbit, scroll to zoom, double-click to reset.

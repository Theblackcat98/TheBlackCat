Three.js r128 + OrbitControls (examples/js, three@0.128.0)
==========================================================

Vendored for the Showcase artifacts (colosseum, pisa, hanging gardens,
hoogbouw). The site makes no third-party requests at runtime; these were
downloaded once from the official CDN URLs and are served from here.

Upstream: https://threejs.org   https://github.com/mrdoob/three.js
Licence: MIT (see the @license header in three.min.js)

  three.min.js      r128 release build, sha256 of the CDN artefact as downloaded
  OrbitControls.js  three@0.128.0/examples/js/controls/OrbitControls.js

Do not upgrade casually: the artifact pages are written against the r128 API
(THREE.BufferGeometry.setAttribute, the pre-module examples/js globals).

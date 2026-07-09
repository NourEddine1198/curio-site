# GSAP for Curio — local install (v3.15.0)

The full GSAP toolkit, downloaded locally so our pages **own the files** (no outside link, works offline, loads fast). GSAP is 100% free since 2025 — including all the plugins below, even for our paid store.

**Downloaded:** 2026-06-21 · from `cdn.jsdelivr.net/npm/gsap@3.15.0/dist` · verified loading 18/18 (`../gsap-test.html`).

## How to use it on a page in `concepts/`

Put these at the **bottom** of the page, just before `</body>`. Load `gsap.min.js` FIRST, then only the plugins that page needs, then register them.

```html
<!-- Curio motion: GSAP 3.15 (local, free) -->
<script src="lib/gsap/gsap.min.js"></script>          <!-- always first -->
<script src="lib/gsap/ScrollTrigger.min.js"></script>
<script src="lib/gsap/DrawSVGPlugin.min.js"></script>
<script src="lib/gsap/SplitText.min.js"></script>
<script src="lib/gsap/Physics2DPlugin.min.js"></script>
<script>
  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, SplitText, Physics2DPlugin);
  // ...animations here
</script>
```

> Path note: pages in `concepts/` use `lib/gsap/...`. The check page in `concepts/lib/` uses `gsap/...`. Adjust the relative path to where your HTML file sits.

> Always keep the reduced-motion guard: `if (!matchMedia('(prefers-reduced-motion: reduce)').matches) { ...animate... }`.

## What each file does (plain English)

| File | What it's for | Curio use |
|---|---|---|
| `gsap.min.js` | The engine. Required for everything. | always |
| `DrawSVGPlugin.min.js` | Draws SVG lines on, like a pen. | **self-drawing borders, marker scribbles** (our signature) |
| `SplitText.min.js` | Breaks text into letters/words to animate. | **bouncy Darija headlines** |
| `Physics2DPlugin.min.js` | Gravity / velocity on bits. | **confetti on order**, scatter |
| `ScrollTrigger.min.js` | Run/scrub animations on scroll. | **loud-vs-quiet hero**, reveals |
| `MorphSVGPlugin.min.js` | Morph one shape into another. | **paper folds into an animal** (origami) |
| `MotionPathPlugin.min.js` | Move things along a curved path. | **flying paper plane**, goods into basket |
| `Draggable.min.js` + `InertiaPlugin.min.js` | Drag & throw with real momentum. | **grab-and-throw card deck** toy |
| `Flip.min.js` | Smoothly animate layout/state changes. | add-to-cart fly to button |
| `CustomEase / CustomBounce / CustomWiggle` | Custom playful easing. | the bounce/wiggle personality |
| `ScrollToPlugin.min.js` | Smooth scroll to an element. | CTA → checkout |
| `ScrollSmoother.min.js` | Smooth-scroll the whole page (needs ScrollTrigger). | optional homepage polish |
| `Observer.min.js` | Unified wheel/touch/pointer input. | advanced gestures |
| `ScrambleTextPlugin.min.js` | Text scramble effect. | optional accent |
| `EasePack.min.js` | RoughEase / SlowMo / ExpoScaleEase. | extra easings |

## Taste rule
Motion is salt, not soup. **One** hero moment per page; everything else subtle.

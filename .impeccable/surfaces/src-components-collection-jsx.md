---
version: 1
slug: "src-components-collection-jsx"
primary_target: "src/components/Collection.jsx"
related_targets: ["src/components/useCollectionMotion.js", "src/styles/storefront.css"]
---

# Continuous product collection

Visitor mode: Persuade. Preserve the owner's selected, shuffled collection, product cards, labels, prices, two equal looping groups and existing light surfaces. No pause button or pause-on-hover. The requested authored interaction is a phone swipe that transfers its release velocity to the moving collection, then settles back to the ordinary leftward speed.

Keep the CSS loop and its phase. Scrub its animation time during a horizontal drag, normalize phase by whole periods at the seam, and ease playback rate back to 1 over about two seconds. Cap extreme velocity to keep cards readable. Track gestures and animate inertia outside React renders; normal playback stays on the compositor. Both directions, interrupted flicks and slow releases work without snapping back.

Preserve native vertical page scrolling and pinch zoom. An ordinary tap opens the product; a horizontal drag suppresses its follow-up click. Keyboard focus cancels inertia and exposes the focused primary card. Suspend work when the strip is offscreen or the document is hidden. Reduced motion keeps the existing native horizontal list with no autoplay or custom inertia.

Validation covers Chrome and WebKit menu/gesture behavior, actual Chromium touch input in both directions, vertical touch scrolling, product taps, return to the default rate, repeated flicks, offscreen suspension and reduced-motion preference changes. Existing hover and navigation regressions remain in place. Captures live in .impeccable/review/mobile-interactions/.

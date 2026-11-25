---
version: 1
slug: "src-components-collection-jsx"
primary_target: "src/components/Collection.jsx"
related_targets: ["src/components/useCollectionMotion.js", "src/styles/storefront.css"]
---

# Continuous product collection

Visitor mode: Persuade. Preserve the owner's selected, shuffled collection, product cards, labels, prices, two equal looping groups and existing light surfaces. No pause button or pause-on-hover. The requested authored interaction is a phone swipe that transfers its release velocity to the moving collection, then settles back to the ordinary leftward speed.

Use one position controller for autoplay, dragging and inertia. The user reported intermittent glitches with the previous animation-time scrubbing. Contact now takes over immediately, including during momentum; horizontal movement follows the finger directly without easing, snapping or travel limits. Normalize only the rendered position at the seam, retaining unrestricted logical travel. Integrate release velocity with frame-rate-independent friction back to the ordinary 34px/second leftward speed. Only a GPU transform changes per frame, outside React renders. Both directions, repeated reversals and regrabs preserve the current position.

Preserve native vertical page scrolling and pinch zoom. An ordinary tap opens the product; a horizontal drag suppresses its follow-up click. Keyboard focus cancels inertia and exposes the focused primary card. Suspend work when the strip is offscreen or the document is hidden. Reduced motion keeps the existing native horizontal list with no autoplay or custom inertia.

The whole product window accepts dragging, including photos, labels, prices and gaps. Disable native image dragging, iOS long-press callouts and touch hover zoom inside this strip. Price refreshes preserve the shuffled order and do not replace an active gesture controller.

Validation covers Chrome and WebKit direct tracking across multiple loop periods, real Chromium touch input on all four surfaces, immediate takeover during an existing flick, vertical touch scrolling, product taps, return to the default speed, offscreen suspension, price refreshes while held and reduced-motion preference changes. The pre-fix contact regression reproduced over 6px of unwanted travel while held; it now stays within half a pixel. Existing hover and navigation regressions remain in place. Captures live in .impeccable/review/mobile-interactions/.

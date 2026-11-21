---
version: 1
slug: "src-pages-homepage-jsx"
primary_target: "src/pages/HomePage.jsx"
related_targets: ["src/components/ServicesSection.jsx","src/components/ServicesSection.module.css"]
---

# Home services section

Scope: extend the existing home page directly after the featured product, before the shop visit. Visitor mode: Persuade. Owner-confirmed content: sales across all categories, display and battery replacement, delivery. Do not invent regions, prices, turnaround times, warranties or authorization status.

## Direction contract

THESIS: One layered service story connects buying a device, caring for it and receiving it. The section earns its movement through that sequence.

OWN-WORLD: Preserve Instrument Sans, white and faint blue surfaces, black type, restrained 16px corners and the established product photography. No new visual identity.

STORY: Three visible service panels explain products, repairs and delivery, each with a useful catalog or WhatsApp action. Tabs offer direct navigation through the same story.

FIRST VIEWPORT: A plain section heading above a compact sticky three-part navigation. A large split panel pairs a confident headline and short copy on the left with a device composition on the right. Incoming repair and parcel panels slide over and gently compress the preceding layer. Mobile uses vertical compositions.

FORM: Extend the accepted homepage: “add a new section maybe below the favorite product”, within the earlier request for “white-ish color to be dominant on the website and clean”. Native scrolling with a sticky panel deck; seed: none (pinned), from “like tabs on top of each other or like scroll animations”.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Motion plan and quality bar

Focal moment: the incoming service panel covers its predecessor while the navigation tracks progress. Continuity: the preceding layer compresses gently, preserving a visible edge. Feedback: a sliding tab indicator and ordinary button feedback. Budget: native sticky layout, a passive scroll listener with one animation frame, transform-only updates, no new dependency and no scroll interception. Hidden/offscreen work stops. Reduced motion and short viewports show a regular readable sequence. Native touch scrolling, direct tab navigation, keyboard, reverse scroll, fast jumps and resizing must remain useful. Verify Chrome and WebKit at mobile and desktop, plus an intermediate width. Capture every panel and a mid-transition state after images decode. No invisible content or duplicate scroll reveals.

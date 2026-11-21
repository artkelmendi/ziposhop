---
version: 1
slug: "src-pages-homepage-jsx"
primary_target: "src/pages/HomePage.jsx"
related_targets: ["src/components/ServicesSection.jsx","src/components/ServicesSection.module.css"]
---

# Home services section

Scope: extend the existing home page directly after the featured product, before the shop visit. Visitor mode: Persuade. Current owner direction: separate electronics, electric motorbikes/scooters, and display/battery repair. The owner corrected the delivery suggestion; remove that panel and its assets. Do not invent prices, turnaround times, warranties or authorization status.

## Direction contract

THESIS: One layered story introduces electronics, electric mobility and repair. The section earns its movement by separating these three areas clearly.

OWN-WORLD: Preserve Instrument Sans, white and faint blue surfaces, black type, restrained 16px corners and the established product photography. All three panels use light colors, with no dark blue panel. Keep factual headings and short descriptions, as requested; no promotional metaphors.

STORY: Three visible panels explain electronics, motorbikes/scooters and repairs, with useful catalog category or WhatsApp actions. Tabs offer direct navigation through the same story.

FIRST VIEWPORT: “Çfarë ofrojmë” above a compact sticky three-part navigation. The panel headings are simply “Elektronikë”, “Transport elektrik” and “Servisim”, each with a short factual description. A light split panel pairs copy on the left with product imagery on the right. Incoming mobility and repair panels slide over and gently compress the preceding layer. Mobility has a motorbike/scooter composition and a direct link to each category. Mobile uses vertical compositions.

FORM: Extend the accepted homepage: “add a new section maybe below the favorite product”, within the earlier request for “white-ish color to be dominant on the website and clean”. Native scrolling with a sticky panel deck; seed: none (pinned), from “like tabs on top of each other or like scroll animations”.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Motion plan and quality bar

Focal moment: the incoming service panel covers its predecessor while the navigation tracks progress. Continuity: the preceding layer compresses gently, preserving a visible edge. Feedback: a sliding tab indicator and ordinary button feedback. Budget: native sticky layout, a passive scroll listener with one animation frame, transform-only updates, no new dependency and no scroll interception. Hidden/offscreen work stops. Reduced motion and short viewports show a regular readable sequence. Native touch scrolling, direct tab navigation, keyboard, reverse scroll, fast jumps and resizing must remain useful. Verify Chrome and WebKit at mobile and desktop, plus an intermediate width. Capture every panel and a mid-transition state after images decode. No invisible content or duplicate scroll reveals.

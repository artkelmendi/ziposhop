---
version: 1
slug: "src-components-categorynav-jsx"
primary_target: "src/components/CategoryNav.jsx"
related_targets: ["src/components/CategoryNav.module.css", "src/components/Header.jsx", "src/components/Header.module.css"]
---

# Secondary category navigation

Visitor mode: Operate. The user requested a small black navigation bar below the existing white header. Preserve the Instrument Sans identity, main navigation, hero and pale-blue storefront.

The primary row holds the brand, page navigation and search. The secondary row provides direct category shortcuts: Të gjitha and the categories managed by the owner. Use a solid #151719 surface, readable cool-white text, a 44px row, and a small pale underline for the selected category. Keep both rows sticky as a single header. No new icon system or decorative imagery.

Center the links when they fit; preserve one line and allow native horizontal scrolling when they do not. Keyboard focus remains visible within the rail. When a route selects an offscreen category, move only the horizontal rail, preserving the page entrance. Respect reduced motion. Product details retain the corresponding category selection.

Use the initial categories while catalog data loads, without a skeleton or changing row height. Successful data replaces them with the owner's current categories. Keep new or unusually long names within the rail. The mobile menu opens below both rows and closes on navigation. Anchor offsets and layered service panels account for both rows.

Mobile menu motion: a short clipped reveal and small ordered link entrances explain opening; a faster exit explains dismissal. The two strokes morph into a close mark. CSS transitions reverse from their current position on repeated taps. Inert and aria-hidden update immediately on closing, with visibility hidden after the exit. Reduced motion presents the state immediately. Outside click, Escape, route changes and desktop resizing dismiss it as before.

Validation: Chrome and WebKit at 320, 440, 768 and 1440px; category/product/search navigation; keyboard access to offscreen categories; slow category data and a custom category; persistent header and mobile menu; layered services and iPhone 13 Pro Max portrait/landscape. Screenshots under .impeccable/review/category-nav/ document the rendered result.

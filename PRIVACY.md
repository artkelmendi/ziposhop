# Privacy implementation

The storefront currently loads no analytics, advertising pixels or third-party embeds. WhatsApp, Instagram and Google Maps are outbound links. The public catalog uses unauthenticated Supabase reads; customer accounts and checkout are not present.

## Storage and choice

- `zipo:privacy-choice` in localStorage is necessary to remember the user's choice. Version 1 stores the display-preference boolean, choice date and an expiry 180 days later. Expired or malformed choices are treated as no consent.
- `zipo:intro-seen` in sessionStorage is optional display storage. It is read and written only after display consent. Rejecting or withdrawing consent removes it. Without consent, only application memory suppresses repeat intros during React navigation.
- Existing Supabase Auth storage remains necessary for administrators' requested login session, independently of storefront display consent. No authentication tokens are read by the consent component.
- Image/font/script HTTP caching is left to the browser and hosting cache headers. Images are not stored in cookies, localStorage or a custom service worker. Product data is not persisted as a cache, so owner edits and deletions retain their existing behavior.

The first-visit notice has equally prominent “Vetëm të nevojshmet” and “Prano preferencat” actions. Optional storage defaults off. Footer settings and the privacy page let users change their choice; withdrawal clears optional state. Storage errors degrade to an in-memory choice without blocking browsing. Changes made in another tab update the current tab through the storage event.

The interface follows the consent principles of specific purpose, prior opt-in and equally easy withdrawal in the [ICO consent guidance](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/how-do-we-manage-consent-in-practice/). This implementation documents current behavior; it is not a certification of legal compliance in every jurisdiction. The shop should keep its business details and privacy disclosures accurate.

If analytics, marketing, embeds or another optional purpose are introduced, add separate controls, gate actual initialization behind the appropriate consent, update the public policy and increment the consent version to request a new decision. Do not initialize tracking and merely hide its banner until consent.

## Public policy

`/privatesia/` describes actual storage, ordinary browser caching, GitHub Pages hosting, Supabase catalog/auth services and third-party outbound links. It links to the providers' current privacy statements and uses the verified shop telephone/address from `src/data/store.js`.

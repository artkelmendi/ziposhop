import AppLink from "../components/AppLink";
import { usePrivacy } from "../components/PrivacyConsent";
import { store } from "../data/store";
import styles from "./PrivacyPage.module.css";

export default function PrivacyPage() {
  const { choice, showSettings } = usePrivacy();
  return (
    <article className={`wrap ${styles.page}`}>
      <nav className="breadcrumb" aria-label="Vendndodhja"><AppLink to="/">Ballina</AppLink><span>/</span>Privatësia</nav>
      <div className={styles.copy}>
        <h1>Privatësia dhe cookies</h1>
        <p className={styles.lead}>Të dhënat tuaja dhe zgjedhjet që kontrolloni në faqen e ZIPO Mobil Shop.</p>
        <section>
          <h2>Çfarë ruajmë në pajisjen tuaj</h2>
          <p>Katalogu mund të shfletohet pa llogari. Aktualisht nuk përdorim cookies për reklama, analiza të vizitave ose ndjekje në faqe të tjera. Ruajtja lokale në shfletues përdoret për këto qëllime:</p>
          <dl className={styles.storage}>
            <div><dt>Zgjedhja e privatësisë</dt><dd>E nevojshme. Ruajmë pranimin ose refuzimin tuaj, datën dhe versionin e njoftimit për 180 ditë, që të mos ju pyesim në çdo faqe.</dd></div>
            <div><dt>Preferencat e shfaqjes</dt><dd>Vetëm me pëlqimin tuaj. Mbajmë mend që hyrja me logon ZIPO është shfaqur, që të mos përsëritet kur ringarkoni faqen. Kjo e dhënë hiqet kur mbyllet sesioni i skedës.</dd></div>
            <div><dt>Hyrja e administratorit</dt><dd>Vetëm për administratorët që identifikohen. Supabase ruan sesionin e sigurt të hyrjes dhe e rinovon kur është e nevojshme. Dalja nga llogaria e mbyll këtë sesion.</dd></div>
          </dl>
          <p>Shfletuesi mund të ruajë përkohësisht fotografi, fonte dhe skedarë të faqes në memorien e tij të zakonshme (cache), për ngarkim më të shpejtë. Fotot nuk ruhen në cookies dhe nuk përdoren për identifikim apo ndjekje.</p>
        </section>
        <section>
          <h2>Zgjedhja juaj</h2>
          <p role="status">{choice ? choice.preferences ? "Preferencat e shfaqjes janë të lejuara." : "Janë të lejuara vetëm të dhënat e nevojshme." : "Ende nuk keni zgjedhur. Preferencat opsionale janë të çaktivizuara."} Mund ta ndryshoni zgjedhjen ose ta tërhiqni pëlqimin në çdo kohë. Katalogu funksionon me të dyja zgjedhjet.</p>
          <button className="btn btn-outline" type="button" onClick={showSettings}>Ndrysho cilësimet e cookies</button>
        </section>
        <section>
          <h2>Shërbimet që përdor faqja</h2>
          <p>Faqja publikohet në GitHub Pages. Produktet, kategoritë dhe fotografitë e ngarkuara nga administratori ofrohen nga Supabase. Gjatë kërkesave, këto shërbime mund të marrin të dhëna teknike si adresa IP, lloji i shfletuesit dhe regjistrat e sigurisë sipas politikave të tyre.</p>
          <p><a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">Privatësia e GitHub</a><span> · </span><a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Privatësia e Supabase</a></p>
          <p>WhatsApp, Instagram dhe Google Maps hapen vetëm kur klikoni lidhjet përkatëse. Nuk vendosim përmbajtje të integruar prej tyre në faqe. Të dhënat që ndani atje trajtohen sipas politikave të atyre shërbimeve.</p>
        </section>
        <section>
          <h2>Na kontaktoni</h2>
          <p>Për pyetje rreth privatësisë ose të dhënave që ndani gjatë komunikimit me dyqanin, kontaktoni ZIPO Mobil Shop në <a href={store.phoneHref}>{store.phone}</a>, ose na vizitoni në {store.address}, {store.city}.</p>
        </section>
      </div>
    </article>
  );
}

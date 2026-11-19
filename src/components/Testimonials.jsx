import { customerFeedback } from "../data/homeContent";
import { store } from "../data/store";
import styles from "./HomeHighlights.module.css";

export default function Testimonials() {
  if (!customerFeedback.reviews.length) return null;
  return (
    <section
      className={"wrap " + styles.testimonials}
      aria-labelledby="reviews-title"
      id="vleresimet"
    >
      <div className={styles.reviewHeader}>
        <div className={styles.reviewHeading}>
          <h2 id="reviews-title">Çfarë thonë klientët tanë</h2>
          {customerFeedback.isDemo && (
            <p>
              Tekste shembull për këtë prezantim. Vlerësimet reale do të shtohen
              nga dyqani.
            </p>
          )}
        </div>
        <a
          className={"btn btn-outline " + styles.instagramLink}
          href={store.instagram}
          target="_blank"
          rel="noopener"
        >
          Vizito Instagramin tonë
        </a>
      </div>
      <div className={styles.reviewGrid}>
        {customerFeedback.reviews.map((review) => (
          <figure key={review.id} className={styles.review}>
            <blockquote>
              <p>“{review.quote}”</p>
            </blockquote>
            {(review.author || customerFeedback.isDemo) && (
              <figcaption>
                {customerFeedback.isDemo ? "Shembull vlerësimi" : review.author}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}

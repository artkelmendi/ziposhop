import { customerFeedback } from "../data/homeContent";
import styles from "./HomeHighlights.module.css";

export default function Testimonials() {
  if (!customerFeedback.reviews.length) return null;
  return (
    <section
      className={"wrap " + styles.testimonials}
      aria-labelledby="reviews-title"
      id="vleresimet"
    >
      <div className={styles.reviewHeading}>
        <h2 id="reviews-title">Çfarë thonë klientët tanë</h2>
        {customerFeedback.isDemo && (
          <p>
            Tekste shembull për këtë prezantim. Vlerësimet reale do të shtohen
            nga dyqani.
          </p>
        )}
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

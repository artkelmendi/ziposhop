import Icon from "./Icon";
import { store } from "../data/store";
import styles from "./InstagramSection.module.css";

export default function InstagramSection() {
  return (
    <section
      className={"wrap " + styles.section}
      id="instagram"
      aria-labelledby="instagram-title"
    >
      <div className={styles.content}>
        <span className={styles.icon}>
          <Icon name="instagram" />
        </span>
        <div className={styles.copy}>
          <h2 id="instagram-title">Na ndiq në Instagram</h2>
          <p>Shiko më shumë produkte dhe na ndiq te @mobilshopzipo.</p>
        </div>
        <a
          className={"btn btn-dark " + styles.link}
          href={store.instagram}
          target="_blank"
          rel="noopener"
        >
          Vizito Instagramin tonë
        </a>
      </div>
    </section>
  );
}

import { useId, useState } from "react";
import Icon from "./Icon";
import styles from "./Accordion.module.css";

export default function Accordion({ items }) {
  const [selected, setSelected] = useState(null);
  const prefix = useId();
  return (
    <div className={styles.list}>
      {items.map(item => {
        const open = selected === item.id;
        const buttonId = `${prefix}-${item.id}-button`;
        const answerId = `${prefix}-${item.id}-answer`;
        return (
          <section className={styles.item} key={item.id} data-open={open}>
            <h2>
              <button
                id={buttonId}
                type="button"
                aria-expanded={open}
                aria-controls={answerId}
                onClick={() => setSelected(open ? null : item.id)}
              >
                <span>{item.question}</span>
                <span className={styles.icon}><Icon name="plus" /></span>
              </button>
            </h2>
            <div
              id={answerId}
              className={styles.answer}
              role="region"
              aria-labelledby={buttonId}
              aria-hidden={!open}
              inert={!open}
            >
              <div className={styles.inner}><p>{item.answer}</p></div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

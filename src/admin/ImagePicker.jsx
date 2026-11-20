import { useEffect, useRef, useState } from "react";
import { imageUrl } from "../lib/backend";
import Icon from "../components/Icon";
import styles from "./Admin.module.css";

export default function ImagePicker({ images, onChange, max = 6, disabled }) {
  const [error, setError] = useState("");
  const urls = useRef([]);
  const input = useRef(null);
  useEffect(() => () => urls.current.forEach(URL.revokeObjectURL), []);
  async function choose(files) {
    setError("");
    if (images.length + files.length > max) {
      setError(`Mund të shtosh deri në ${max} foto.`);
      return;
    }
    if (files.some((file) => file.size > 10 * 1024 * 1024)) {
      setError("Përdor foto JPEG, PNG ose WebP, deri në 10 MB secila.");
      return;
    }
    try {
      const valid = await Promise.all(
        files.map(async (file) => {
          const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
          const ascii = (start, end) =>
            String.fromCharCode(...bytes.slice(start, end));
          return (
            (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) ||
            (bytes[0] === 137 &&
              ascii(1, 4) === "PNG" &&
              bytes[4] === 13 &&
              bytes[5] === 10) ||
            (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP")
          );
        }),
      );
      if (valid.some((value) => !value)) {
        setError("Përdor foto JPEG, PNG ose WebP.");
        return;
      }
    } catch {
      setError("Fotografia nuk u lexua. Provo përsëri.");
      return;
    }
    const added = files.map((file) => {
      const url = URL.createObjectURL(file);
      urls.current.push(url);
      return { url, file };
    });
    onChange([...images, ...added]);
  }
  return (
    <div className={styles.imagePicker}>
      <div className={styles.imageGrid}>
        {images.map((image, index) => (
          <div className={styles.imageTile} key={image.url}>
            <img src={imageUrl(image.url)} alt={`Foto ${index + 1}`} />
            {index === 0 && <span className={styles.mainPhoto}>Kryesore</span>}
            <div className={styles.imageTools}>
              {index > 0 && (
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={`Bëje foton ${index + 1} kryesore`}
                  onClick={() =>
                    onChange([image, ...images.filter((_, i) => i !== index)])
                  }
                >
                  <Icon name="star" />
                </button>
              )}
              <button
                type="button"
                disabled={disabled}
                aria-label={`Hiqe foton ${index + 1}`}
                onClick={() => onChange(images.filter((_, i) => i !== index))}
              >
                <Icon name="close" />
              </button>
            </div>
          </div>
        ))}
        {images.length < max && (
          <button
            type="button"
            className={styles.uploadTile}
            disabled={disabled}
            onClick={() => input.current.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              if (!disabled) choose([...event.dataTransfer.files]);
            }}
          >
            <Icon name="upload" />
            <span>Shto foto</span>
            <small>ose tërhiqi këtu</small>
          </button>
        )}
      </div>
      <input
        className="sr-only"
        type="file"
        ref={input}
        accept="image/jpeg,image/png,image/webp"
        multiple={max > 1}
        disabled={disabled}
        tabIndex={-1}
        onChange={(event) => {
          choose([...event.target.files]);
          event.target.value = "";
        }}
      />
      <p className={styles.hint}>
        Fotoja e parë shfaqet në katalog. Fotot optimizohen kur ruan.
      </p>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

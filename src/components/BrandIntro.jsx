import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import Icon from "./Icon";
import styles from "./BrandIntro.module.css";
import { displayPreferencesAllowed, introKey } from "../lib/privacy";

const IntroCovered = createContext(false);
let seenInVisit = false;

export function useIntroCovered() {
  return useContext(IntroCovered);
}

function shouldPlay() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (new URLSearchParams(window.location.search).get("intro") === "1")
    return true;
  if (seenInVisit) return false;
  if (!displayPreferencesAllowed()) return true;
  try {
    return sessionStorage.getItem(introKey) !== "1";
  } catch {
    return true;
  }
}

// The page loads behind the intro. Its entrance starts when the aperture opens.
export default function BrandIntro({ children }) {
  const [phase, setPhase] = useState(() =>
    shouldPlay() ? "covered" : "complete",
  );
  return (
    <IntroCovered.Provider value={phase === "covered"}>
      {phase !== "complete" && (
        <IntroOverlay phase={phase} onPhaseChange={setPhase} />
      )}
      <div
        className={styles.shell}
        data-intro-covered={phase === "covered" || undefined}
        inert={phase !== "complete"}
        aria-busy={phase !== "complete" || undefined}
      >
        {children}
      </div>
    </IntroCovered.Provider>
  );
}

// Instrument Sans 700, with construction overlaps removed for clean tracing.
const letters = [
  [0, "M40 0V104L397.124 602H54V720H595V616L238.766 118H599V0Z"],
  [595, "M50 0V720H204V0Z"],
  [
    809,
    "M50 0V720H392Q472 720 529.5 692Q587 664 618.5 614Q650 564 650 497Q650 430 618 379Q586 328 528.5 299.5Q471 271 392 271H204V0ZM204 389H384Q437 389 466.5 418.5Q496 448 496 496Q496 544 466.5 573Q437 602 384 602H204Z",
  ],
  [
    1441,
    "M399 -10Q319 -10 251.5 17Q184 44 134.5 93.5Q85 143 57.5 211.5Q30 280 30 363Q30 473 77 555.5Q124 638 207.5 684Q291 730 398 730Q507 730 590 684Q673 638 720.5 555Q768 472 768 362Q768 280 740.5 211.5Q713 143 663.5 93.5Q614 44 546.5 17Q479 -10 399 -10ZM398 112Q461 112 509 144Q557 176 584.5 232.5Q612 289 612 364Q612 438 585 493Q558 548 510 578Q462 608 398 608Q335 608 287 578Q239 548 212.5 493.5Q186 439 186 364Q186 288 213 231.5Q240 175 288 143.5Q336 112 398 112Z",
  ],
];

function IntroOverlay({ phase, onPhaseChange }) {
  const overlay = useRef(null);
  const origin = useRef(null);
  const aperture = useRef(null);
  const maskId = useId();
  const [geometry, setGeometry] = useState({ x: 0, y: 0, radius: 1 });
  const finish = useCallback(() => {
    const restoreFocus = overlay.current?.contains(document.activeElement);
    onPhaseChange("complete");
    if (restoreFocus)
      requestAnimationFrame(() =>
        document.getElementById("kryesore")?.focus({ preventScroll: true }),
      );
  }, [onPhaseChange]);

  useEffect(() => {
    seenInVisit = true;
    try {
      if (displayPreferencesAllowed()) sessionStorage.setItem(introKey, "1");
    } catch {
      // Storage may be unavailable in private browser contexts.
    }
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    const measure = () => {
      const bounds = origin.current.getBoundingClientRect();
      setGeometry({
        x: bounds.left + bounds.width / 2,
        y: bounds.top + bounds.height / 2,
        radius: Math.hypot(innerWidth, innerHeight),
      });
    };
    measure();
    window.addEventListener("resize", measure);
    const reveal = setTimeout(() => onPhaseChange("opening"), 1250);
    // Always release the storefront, even if an animation event is interrupted.
    const fallback = setTimeout(finish, 2400);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const preference = () => {
      if (reduced.matches) finish();
    };
    const escape = (event) => {
      if (event.key === "Escape") finish();
    };
    reduced.addEventListener("change", preference);
    window.addEventListener("keydown", escape);
    return () => {
      clearTimeout(reveal);
      clearTimeout(fallback);
      root.style.overflow = previousOverflow;
      window.removeEventListener("resize", measure);
      window.removeEventListener("keydown", escape);
      reduced.removeEventListener("change", preference);
    };
  }, [finish, onPhaseChange]);

  return (
    <div
      ref={overlay}
      className={styles.overlay}
      data-brand-intro
      data-phase={phase}
      role="region"
      aria-label="Hyrja ZIPO"
    >
      <span className="sr-only" role="status">
        Po hapet ZIPO Mobil Shop.
      </span>
      <svg className={styles.curtain} aria-hidden="true">
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse">
            <rect width="100%" height="100%" fill="white" />
            <circle
              ref={aperture}
              className={styles.aperture}
              cx={geometry.x}
              cy={geometry.y}
              r="1"
              fill="black"
              style={{
                transformOrigin: `${geometry.x}px ${geometry.y}px`,
                "--aperture-radius": geometry.radius,
              }}
              onAnimationEnd={(event) => {
                if (event.target === aperture.current) finish();
              }}
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="white"
          mask={`url(#${maskId})`}
        />
      </svg>
      <div className={styles.identity} aria-hidden="true">
        <svg className={styles.logo} viewBox="0 0 2330 760">
          <g transform="translate(0 740) skewX(-9) scale(1 -1)">
            {letters.map(([offset, path], order) => (
              <path
                className={styles.letter}
                d={path}
                transform={`translate(${offset} 0)`}
                pathLength="1"
                style={{ "--letter-order": order }}
                key={offset}
              />
            ))}
            <circle ref={origin} cx="1839" cy="363" r="1" opacity="0" />
          </g>
        </svg>
        <p className={styles.caption}>MOBIL SHOP</p>
      </div>
      <div className={styles.bottom}>
        <span>PEJË, KOSOVË</span>
        <button className={styles.skip} onClick={finish}>
          Kalo hyrjen <Icon name="arrow" />
        </button>
      </div>
    </div>
  );
}

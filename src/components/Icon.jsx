export default function Icon({ name }) {
  const paths = {
    instagram: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    pin: (
      <>
        <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
        <circle cx="12" cy="10" r="2.3" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.4" />
        <rect x="14" y="3" width="7" height="7" rx="1.4" />
        <rect x="3" y="14" width="7" height="7" rx="1.4" />
        <rect x="14" y="14" width="7" height="7" rx="1.4" />
      </>
    ),
    menu: <path d="M3 8h18M3 16h18" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    prev: <path d="m14.5 5.5-6 6.5 6 6.5" />,
    next: <path d="m9.5 5.5 6 6.5-6 6.5" />,
    pause: <path d="M8 5v14M16 5v14" strokeWidth="2.5" />,
    play: <path d="m8 5 10 7-10 7z" />,
    message: (
      <>
        <path d="M20.5 11.5A8.5 8.5 0 0 1 8.2 19l-4.7 1.5L5 15.8a8.5 8.5 0 1 1 15.5-4.3Z" />
        <path d="M8.8 8.2c.9 3.5 2.7 5.4 6.4 6.8" />
      </>
    ),
  };
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}

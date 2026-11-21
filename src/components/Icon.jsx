export default function Icon({ name }) {
  const paths = {
    plus: <path d="M12 5v14M5 12h14" />,
    check: <path d="m5 12 4 4L19 6" />,
    home: (
      <>
        <path d="m3 10 9-7 9 7v11H3Z" />
        <path d="M9 21v-8h6v8" />
      </>
    ),
    box: (
      <>
        <path d="m3 7 9-4 9 4v10l-9 4-9-4Z" />
        <path d="m3 7 9 4 9-4M12 11v10M7.5 5 17 9" />
      </>
    ),
    edit: (
      <>
        <path d="m15 4 5 5M4 20l5-1L21 7a2.1 2.1 0 0 0-5-5L4 14Z" />
        <path d="M13 20h8" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" />
      </>
    ),
    logout: (
      <>
        <path d="M9 3H4v18h5M9 12h12m-5-5 5 5-5 5" />
      </>
    ),
    upload: (
      <>
        <path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5" />
      </>
    ),
    image: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8" cy="8" r="1.5" />
        <path d="m3 17 6-6 5 5 3-3 4 4" />
      </>
    ),
    star: (
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z" />
    ),
    eye: (
      <>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    eyeOff: (
      <>
        <path d="m3 3 18 18M10 5a11 11 0 0 1 12 7 16 16 0 0 1-4 4M6 6a16 16 0 0 0-4 6s4 7 10 7a12 12 0 0 0 5-1" />
        <path d="M10 10a3 3 0 0 0 4 4" />
      </>
    ),
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
    chevronDown: <path d="m6 9 6 6 6-6" />,
    sliders: (
      <>
        <path d="M3 7h6m4 0h8M3 17h10m4 0h4" />
        <circle cx="11" cy="7" r="2" />
        <circle cx="15" cy="17" r="2" />
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
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
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

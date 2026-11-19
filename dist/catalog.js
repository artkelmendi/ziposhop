"use strict";

// The owner can replace this illustrative assortment with a live catalog later.
const categories = [
  { id: "telefona", name: "Telefona", image: "phone-17-pro-orange.webp" },
  { id: "motore", name: "Motorë elektrikë", image: "moto-niu.webp" },
  {
    id: "trotineta",
    name: "Trotineta elektrikë",
    image: "scooter-g2-side.webp",
  },
  { id: "tableta", name: "Tableta", image: "tablet-air-blue.webp" },
  { id: "aksesore", name: "Aksesorë", image: "audio-airpods-pro-3.webp" },
];

const products = [
  {
    id: "kukirin-g2",
    name: "KuKirin G2",
    category: "trotineta",
    image: "scooter-g2.webp",
    description:
      "Trotinet elektrik me motor 800 W, goma 10 inç dhe platformë të gjerë për këmbët.",
    specs: [
      ["Marka", "KuKirin"],
      ["Fuqia e motorit", "800 W"],
      ["Gomat", "10 inç"],
    ],
    views: [
      ["Pamje nga këndi", "scooter-g2.webp"],
      ["Pamje anësore", "scooter-g2-side.webp"],
    ],
  },
  {
    id: "iphone-17-pro",
    name: "iPhone 17 Pro",
    category: "telefona",
    image: "phone-17-pro-orange.webp",
    description:
      "iPhone me ekran 6,3 inç, çip A19 Pro dhe kasë alumini në ngjyrën Cosmic Orange.",
    specs: [
      ["Marka", "Apple"],
      ["Ekrani", "6,3 inç"],
      ["Çipi", "A19 Pro"],
    ],
  },
  {
    id: "ipad-air",
    name: "iPad Air 11″",
    category: "tableta",
    image: "tablet-air-blue.webp",
    description:
      "Tablet 11 inç me lidhje Wi-Fi për lexim, shënime dhe punë në lëvizje.",
    specs: [
      ["Marka", "Apple"],
      ["Ekrani", "11 inç"],
      ["Lidhja", "Wi-Fi"],
    ],
    finishes: [
      ["Blu", "#a6c0ce", "tablet-air-blue.webp"],
      ["Vjollcë", "#b7a9c7", "tablet-air-purple.webp"],
    ],
  },
  {
    id: "airpods-pro-3",
    name: "AirPods Pro 3",
    category: "aksesore",
    image: "audio-airpods-pro-3.webp",
    description:
      "Kufje pa kabllo me anulim aktiv të zhurmës dhe kuti karikimi MagSafe me portë USB-C.",
    specs: [
      ["Marka", "Apple"],
      ["Lloji", "Kufje pa kabllo"],
      ["Kutia e karikimit", "MagSafe, USB-C"],
    ],
  },
  {
    id: "niu-nqi-sport",
    name: "NIU NQi Sport",
    category: "motore",
    image: "moto-niu.webp",
    description:
      "Motor elektrik me ulëse për lëvizje në qytet. Prodhuesi deklaron shpejtësi maksimale 45 km/h.",
    specs: [
      ["Marka", "NIU"],
      ["Shpejtësia maksimale", "45 km/h"],
      ["Fuqia maksimale", "1 800 W"],
    ],
  },
  {
    id: "iphone-15-pro",
    name: "iPhone 15 Pro",
    category: "telefona",
    image: "phone-15-pro-titanium.webp",
    description:
      "iPhone me kornizë titani, ekran 6,1 inç dhe çip A17 Pro. Shiko dy përfundimet e titanit.",
    specs: [
      ["Marka", "Apple"],
      ["Ekrani", "6,1 inç"],
      ["Çipi", "A17 Pro"],
    ],
    finishes: [
      ["Titan natyral", "#aaa496", "phone-15-pro-titanium.webp"],
      ["Titan blu", "#566377", "phone-15-pro-blue.webp"],
    ],
  },
  {
    id: "watch-se-3",
    name: "Apple Watch SE 3",
    category: "aksesore",
    image: "watch-se-3.webp",
    description:
      "Orë inteligjente me kasë alumini në ngjyrën Starlight për të ndjekur aktivitetin e përditshëm.",
    specs: [
      ["Marka", "Apple"],
      ["Lloji", "Orë inteligjente"],
      ["Ngjyra", "Starlight"],
    ],
  },
];

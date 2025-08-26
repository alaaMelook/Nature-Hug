// lib/fonts.ts
import localFont from "next/font/local";

// Arabic font - Muslimah (OTF format)
export const muslimah = localFont({
  src: [
    {
      path: "../public/fonts/Muslimah-Thin.woff2",
      weight: "200",
      style: "thin",
    },
    {
      path: "../public/fonts/Muslimah-Light.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-muslimah",
});

// English font - Fontspring Gerlach Sans (OTF format)
export const gerlachSans = localFont({
  src: [
    {
      path: "../public/fonts/Gerlach Sans 600 Bold.woff2",
      weight: "600",
      style: "bold",
    },

    {
      path: "../public/fonts/Gerlach Sans 400 Regular.woff2",
      weight: "400",
      style: "regular",
    },

    {
      path: "../public/fonts/Gerlach Sans 100 Hairline.woff2",
      weight: "100",
      style: "thin",
    },
    {
      path: "../public/fonts/Gerlach Sans 200 Thin.woff2",
      weight: "200",
      style: "extra-light",
    },
    {
      path: "../public/fonts/Gerlach Sans 300 Light.woff2",
      weight: "300",
      style: "light",
    },
    {
      path: "../public/fonts/Gerlach Sans 500 Medium.woff2",
      weight: "500",
      style: "medium",
    },
    {
      path: "../public/fonts/Gerlach Sans 700 Heavy.woff2",
      weight: "700",
      style: "bold",
    },
    {
      path: "../public/fonts/Gerlach Sans 800 Black.woff2",
      weight: "800",
      style: "extra-bold",
    },
  ],
  variable: "--font-gerlach-sans",
});

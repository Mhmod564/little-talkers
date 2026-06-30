import type { Metadata } from "next";
import { Rubik, Cairo } from "next/font/google";
import "./globals.css";

import { AppProviders } from "@/providers/AppProviders";
import { BackToTop } from "@/components/layout/BackToTop";

// Set theme + language before paint to avoid a flash (mirrors the prototype boot).
const NO_FLASH = `(function(){try{
  if(localStorage.getItem("littletalkers.theme")==="1")document.documentElement.classList.add("dark");
  var l=parseInt(localStorage.getItem("littletalkers.lang"),10);
  var codes=["he","ar","en"];
  if(!isNaN(l)&&codes[l]){document.documentElement.lang=codes[l];document.documentElement.dir=codes[l]==="en"?"ltr":"rtl";}
}catch(e){}})();`;

// Prototype fonts: Rubik (he/en) + Cairo (ar fallback glyphs).
const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-rubik",
  display: "swap",
});
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Little Talkers — מדברים קטנים",
  description:
    "מערכת מעקב אחר טיפולי שפה ודיבור — לוח המטפל ופורטל ההורים.",
};

// Default locale = Hebrew / RTL (the prototype default). The locale switcher
// updates <html lang/dir> at runtime via the I18nProvider (added next).
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${rubik.variable} ${cairo.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH }} />
      </head>
      <body>
        <AppProviders>
          {children}
          <BackToTop />
        </AppProviders>
      </body>
    </html>
  );
}

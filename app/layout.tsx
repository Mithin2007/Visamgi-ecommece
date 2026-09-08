import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: { default: "VISAMGI | Heritage, considered", template: "%s | VISAMGI" },
  description: "A considered collection of Indian heritage objects for contemporary living.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

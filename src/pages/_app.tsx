import "@/src/styles/globals.css";
import type { AppProps } from "next/app";

import Navbar from "@/components/navbar";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="bg-black">
      <Navbar />
      <Component {...pageProps} />
    </div>
  );
}

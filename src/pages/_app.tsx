import "@/src/styles/globals.css";
import type { AppProps } from "next/app";

import * as React from "react";

import Web3 from "web3";

import Navbar from "@/components/navbar";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="bg-black">
      <Navbar />
      <Component {...pageProps} />
    </div>
  );
}

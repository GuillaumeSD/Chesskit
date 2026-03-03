import { Head, Html, Main, NextScript } from "next/document";

const DEFAULT_PIECE_SET = "maestro";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />

        <link
          rel="preload"
          href={`/piece/${DEFAULT_PIECE_SET}/wP.svg`}
          as="image"
        />
        <link
          rel="preload"
          href={`/piece/${DEFAULT_PIECE_SET}/bP.svg`}
          as="image"
        />
        <link
          rel="preload"
          href={`/piece/${DEFAULT_PIECE_SET}/wK.svg`}
          as="image"
        />
        <link
          rel="preload"
          href={`/piece/${DEFAULT_PIECE_SET}/bK.svg`}
          as="image"
        />

        <meta
          name="description"
          content="Analyze your chess games for free on any device with Stockfish!"
        />

        {/* OG (Social networks) */}
        <meta property="og:title" content="chesskit.org" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="chesskit.org" />
        <meta property="og:url" content="https://chesskit.org/" />
        <meta
          property="og:image"
          content="https://chesskit.org/social-networks-1200x630.png"
        />
        <meta
          property="og:description"
          content="Analyze your chess games for free on any device with Stockfish!"
        />

        {/* Twitter */}
        <meta name="twitter:title" content="chesskit.org" />
        <meta name="twitter:domain" content="chesskit.org" />
        <meta name="twitter:url" content="https://chesskit.org/" />
        <meta
          name="twitter:description"
          content="Analyze your chess games for free on any device with Stockfish!"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:image"
          content="https://chesskit.org/social-networks-1200x630.png"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

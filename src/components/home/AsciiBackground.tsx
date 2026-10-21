import { HOME_ASCII_ART } from "./asciiArt";

export function AsciiBackground() {
  return (
    <pre className="home-ascii-art" aria-hidden="true">
      {HOME_ASCII_ART}
    </pre>
  );
}

import Image from "next/image";

export function Footer() {
  return (
    <footer className="site-footer">
      <Image
        className="site-footer__grass"
        src="/paper/footer-grass@2x.webp"
        alt=""
        width={1425}
        height={725}
        sizes="100vw"
      />
      <Image
        className="site-footer__paper"
        src="/paper/footer-paper@2x.webp"
        alt=""
        width={1713}
        height={835}
        sizes="100vw"
      />
      <div className="site-footer__content">
        <p className="site-footer__logo font-logo-display">ShenNatsu</p>
        <p className="site-footer__role">Developer &amp; Designer</p>
      </div>
    </footer>
  );
}

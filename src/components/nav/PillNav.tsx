"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

type Script = "hiragana" | "katakana";

type MenuItem = {
  href: string;
  label: string;
};

const menuItems: Record<Script, readonly MenuItem[]> = {
  hiragana: [
    { href: "/hiragana/characters", label: "Hiragana Characters" },
    { href: "/hiragana/words", label: "Hiragana Words" },
  ],
  katakana: [
    { href: "/katakana/characters", label: "Katakana Characters" },
    { href: "/katakana/words", label: "Katakana Words" },
  ],
};

const menuIds: Record<Script, string> = {
  hiragana: "pill-nav-menu-hiragana",
  katakana: "pill-nav-menu-katakana",
};

const displayNames: Record<Script, string> = {
  hiragana: "Hiragana",
  katakana: "Katakana",
};

export function PillNav() {
  const pathname = usePathname();
  const [openScript, setOpenScript] = useState<Script | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const buttonRefs = useRef<Record<Script, HTMLButtonElement | null>>({
    hiragana: null,
    katakana: null,
  });

  useEffect(() => {
    if (openScript === null) {
      return;
    }

    const firstItem = navRef.current?.querySelector<HTMLAnchorElement>(
      `#${menuIds[openScript]} a`,
    );
    firstItem?.focus();
  }, [openScript]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && !navRef.current?.contains(target)) {
        setOpenScript(null);
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (openScript === null) {
        return;
      }

      const target = event.target;
      const menu = document.getElementById(menuIds[openScript]);
      const trigger = buttonRefs.current[openScript];
      if (
        !(target instanceof Node) ||
        menu?.contains(target) ||
        trigger?.contains(target)
      ) {
        return;
      }

      setOpenScript(null);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("focusin", handleFocusIn);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("focusin", handleFocusIn);
    };
  }, [openScript]);

  const closeMenu = (scriptToFocus?: Script) => {
    setOpenScript(null);
    if (scriptToFocus !== undefined) {
      buttonRefs.current[scriptToFocus]?.focus();
    }
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>, script: Script) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpenScript(script);
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu(script);
    }
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLUListElement>, script: Script) => {
    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLAnchorElement>("[role=menuitem]"),
    );
    const currentIndex = items.indexOf(document.activeElement as HTMLAnchorElement);

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = (currentIndex + direction + items.length) % items.length;
      items[nextIndex]?.focus();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu(script);
    }
  };

  const isScriptActive = (script: Script) =>
    pathname.startsWith(`/${script}/`) || pathname === `/${script}`;
  const isResourcesActive = pathname === "/resources" || pathname === "/resources/";

  return (
    <header className="site-header">
      <nav ref={navRef} className="pill-nav" aria-label="Primary navigation">
        <ul className="pill-nav__list">
          {(Object.keys(menuItems) as Script[]).map((script) => {
            const isOpen = openScript === script;
            const isActive = isOpen || isScriptActive(script);

            return (
              <li key={script} className="pill-nav__item">
                <button
                  ref={(element) => {
                    buttonRefs.current[script] = element;
                  }}
                  type="button"
                  className={`pill-nav__trigger${isActive ? " pill-nav__trigger--active" : ""}`}
                  aria-controls={menuIds[script]}
                  aria-expanded={isOpen}
                  aria-haspopup="menu"
                  aria-current={isScriptActive(script) ? "page" : undefined}
                  onClick={() => setOpenScript(isOpen ? null : script)}
                  onKeyDown={(event) => handleTriggerKeyDown(event, script)}
                >
                  {displayNames[script]}
                </button>
                <div
                  className="pill-nav__dropdown"
                  role="presentation"
                  onBlur={(event) => {
                    const nextTarget = event.relatedTarget;
                    if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
                      setOpenScript(null);
                    }
                  }}
                >
                  <ul
                    id={menuIds[script]}
                    className="pill-nav__menu"
                    role="menu"
                    aria-label={`${script} destinations`}
                    hidden={!isOpen}
                    onKeyDown={(event) => handleMenuKeyDown(event, script)}
                  >
                    {menuItems[script].map((item) => (
                      <li key={item.href} className="pill-nav__menu-item" role="none">
                        <Link
                          className="pill-nav__menu-link"
                          href={item.href}
                          role="menuitem"
                          onClick={() => setOpenScript(null)}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
          <li className="pill-nav__item">
            <Link
              className={`pill-nav__link${isResourcesActive ? " pill-nav__link--active" : ""}`}
              href="/resources"
              aria-current={isResourcesActive ? "page" : undefined}
            >
              Resources
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

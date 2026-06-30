"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function SiteHeader({
  links,
  onCta,
  ctaLabel = 'Nhận tư vấn',
  solid = false,
  brandHref = '/',
  brandLabel = 'StayBridge',
  brandTagline = 'Home away from home'
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > (solid ? 12 : 18));
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [solid]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => window.lucide?.createIcons());
    return () => window.cancelAnimationFrame(frame);
  }, [menuOpen, scrolled, solid]);

  const isHeaderSolid = solid || scrolled;
  const headerClassName = ['site-header', isHeaderSolid ? (solid ? 'header-solid' : 'scrolled') : '']
    .filter(Boolean)
    .join(' ');

  return (
    <header className={headerClassName} id="siteHeader">
      <div className="container header-inner">
        <Link className="brand" href={brandHref} aria-label={`${brandLabel} - Trang chủ`}>
          <span className="brand-mark">
            <i data-lucide="home" />
          </span>
          <span className="brand-copy">
            <strong>{brandLabel}</strong>
            <small>{brandTagline}</small>
          </span>
        </Link>

        <button
          className="icon-button mobile-menu-button"
          id="mobileMenuButton"
          type="button"
          aria-label="Mở menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(value => !value)}
        >
          <i data-lucide={menuOpen ? 'x' : 'menu'} />
        </button>

        <nav className={`main-nav${menuOpen ? ' open' : ''}`} id="mainNav" aria-label="Điều hướng chính">
          {links.map(link => (
            <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </a>
          ))}
        </nav>

        <button className="button button-primary header-cta" type="button" onClick={onCta}>
          {ctaLabel}
        </button>
      </div>
    </header>
  );
}

"use client";

import { Drawer } from 'vaul';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const sampleRequest = {
  modeLabel: 'Đặt phòng',
  roomName: 'Sea Breeze Apartment',
  checkIn: '30/06/2026',
  checkOut: '01/07/2026',
  guests: '2 khách'
};

const drawerVariants = [
  {
    id: 'calm',
    label: 'Mẫu 01',
    name: 'Calm Drawer',
    tagline: 'Mềm, êm, ít che nền',
    summary: 'Phù hợp khi bạn muốn drawer xuất hiện nhẹ nhàng, không gây cảm giác nặng màn hình.',
    chips: ['Không blur', 'Bo lớn', 'Ease-out'],
    metrics: [
      { label: 'Overlay', value: 'Dim nhẹ' },
      { label: 'Motion', value: 'Trượt êm' },
      { label: 'Cảm giác', value: 'Thư giãn' }
    ],
    overlayClass: 'drawer-lab-overlay--calm',
    panelClass: 'drawer-lab-panel--calm'
  },
  {
    id: 'clean',
    label: 'Mẫu 02',
    name: 'Clean Drawer',
    tagline: 'Gọn, rõ, không làm mờ nhiều',
    summary: 'Thiết kế tối giản hơn, ít lớp nền hơn, phù hợp nếu bạn muốn giữ màn hình chính thật rõ.',
    chips: ['Không blur', 'Ít che nền', 'Rõ ràng'],
    metrics: [
      { label: 'Overlay', value: 'Rất nhẹ' },
      { label: 'Motion', value: 'Nhanh gọn' },
      { label: 'Cảm giác', value: 'Sạch' }
    ],
    overlayClass: 'drawer-lab-overlay--clean',
    panelClass: 'drawer-lab-panel--clean'
  },
  {
    id: 'premium',
    label: 'Mẫu 03',
    name: 'Premium Drawer',
    tagline: 'Nổi bật, mềm và sang hơn',
    summary: 'Có chiều sâu hơn một chút, shadow dày hơn và chuyển động mượt kiểu premium.',
    chips: ['Blur nhẹ', 'Shadow sâu', 'Bo mềm'],
    metrics: [
      { label: 'Overlay', value: 'Mờ nhẹ' },
      { label: 'Motion', value: 'Nảy êm' },
      { label: 'Cảm giác', value: 'Sang' }
    ],
    overlayClass: 'drawer-lab-overlay--premium',
    panelClass: 'drawer-lab-panel--premium'
  }
];

function VariantCard({ variant, active, onOpen }) {
  return (
    <button
      className={`drawer-lab-card${active ? ' is-active' : ''}`}
      type="button"
      onClick={() => onOpen(variant)}
    >
      <div className="drawer-lab-card-head">
        <span className="drawer-lab-card-index">{variant.label}</span>
        <span className="drawer-lab-card-badge">{variant.tagline}</span>
      </div>

      <h2>{variant.name}</h2>
      <p>{variant.summary}</p>

      <div className="drawer-lab-card-chips" aria-label="Đặc điểm mẫu">
        {variant.chips.map(chip => (
          <span className="drawer-lab-chip" key={chip}>
            {chip}
          </span>
        ))}
      </div>

      <div className="drawer-lab-card-actions" aria-hidden="true">
        <span className="drawer-lab-card-cta">Mở mẫu</span>
        <i data-lucide="arrow-right" />
      </div>
    </button>
  );
}

function DrawerPanel({ variant, open, onClose, onNext }) {
  return (
    <Drawer.Root open={open} onOpenChange={nextOpen => (!nextOpen ? onClose() : null)} direction="right" shouldScaleBackground={false}>
      <Drawer.Portal forceMount>
        <Drawer.Overlay className={`drawer-lab-overlay ${variant.overlayClass}`} forceMount />
        <Drawer.Content className={`drawer-lab-panel ${variant.panelClass}`} forceMount>
          <header className="drawer-lab-panel-header">
            <div className="drawer-lab-panel-copy">
              <span className="drawer-lab-panel-kicker">{variant.label}</span>
              <Drawer.Title asChild>
                <h2>{variant.name}</h2>
              </Drawer.Title>
              <Drawer.Description className="drawer-lab-panel-subtitle">
                {variant.tagline}
              </Drawer.Description>
            </div>

            <Drawer.Close asChild>
              <button className="icon-button drawer-lab-close" type="button" aria-label="Đóng mẫu">
                <i data-lucide="x" />
              </button>
            </Drawer.Close>
          </header>

          <div className="drawer-lab-panel-body">
            <p className="drawer-lab-hero-copy">
              Xin chào quý khách, chúng tôi đã nhận được <strong>{sampleRequest.modeLabel}</strong> cho{' '}
              <mark>{sampleRequest.roomName}</mark>, ngày nhận <strong>{sampleRequest.checkIn}</strong>, ngày trả{' '}
              <strong>{sampleRequest.checkOut}</strong>, số lượng <strong>{sampleRequest.guests}</strong>.
            </p>

            <ul className="drawer-lab-facts" aria-label="Thông tin chính">
              {variant.metrics.map(item => (
                <li className="drawer-lab-fact" key={item.label}>
                  <span className="drawer-lab-fact-label">{item.label}</span>
                  <strong className="drawer-lab-fact-value">{item.value}</strong>
                </li>
              ))}
            </ul>

            <div className="drawer-lab-callout">
              <strong>Gợi ý:</strong> {variant.summary}
            </div>

            <ul className="drawer-lab-notes">
              <li>Panel trượt từ phải sang với cảm giác khác nhau để bạn so sánh trực tiếp.</li>
              <li>Mẫu 02 giữ màn hình chính sạch hơn, hạn chế blur để không che nền.</li>
              <li>Mẫu 03 có chiều sâu mạnh hơn nếu bạn muốn kiểu sang và nổi bật.</li>
            </ul>
          </div>

          <footer className="drawer-lab-panel-footer">
            <Drawer.Close asChild>
              <button className="button button-primary" type="button">
                Đóng mẫu
              </button>
            </Drawer.Close>
            <button className="button button-secondary" type="button" onClick={onNext}>
              Mẫu tiếp theo
            </button>
          </footer>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export default function DrawerLabShowcase() {
  const [open, setOpen] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [activeVariant, setActiveVariant] = useState(drawerVariants[0]);

  useEffect(() => {
    if (open) {
      setRendered(true);
      return;
    }

    if (!rendered) return undefined;

    const timer = window.setTimeout(() => setRendered(false), 560);
    return () => window.clearTimeout(timer);
  }, [open, rendered]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => window.lucide?.createIcons());
    return () => window.cancelAnimationFrame(frame);
  });

  function openVariant(variant) {
    setActiveVariant(variant);
    setOpen(true);
  }

  function cycleVariant() {
    const currentIndex = drawerVariants.findIndex(item => item.id === activeVariant.id);
    const nextIndex = (currentIndex + 1) % drawerVariants.length;
    setActiveVariant(drawerVariants[nextIndex]);
    setOpen(true);
  }

  function closeDrawer() {
    setOpen(false);
  }

  return (
    <main className="drawer-lab-page">
      <span className="drawer-lab-orb drawer-lab-orb-1" aria-hidden="true" />
      <span className="drawer-lab-orb drawer-lab-orb-2" aria-hidden="true" />

      <section className="container drawer-lab-shell">
        <div className="drawer-lab-topbar">
          <div className="drawer-lab-topbar-copy">
            <span className="eyebrow">Drawer Lab</span>
            <h1>3 mẫu drawer trượt từ phải sang</h1>
            <p>
              Bấm vào từng mẫu để so sánh cảm giác chuyển động, độ mờ nền và độ “nặng” của panel.
              Mẫu 02 được làm sạch nền hơn để tránh hiệu ứng blur quá mạnh.
            </p>
          </div>

          <Link className="button button-secondary drawer-lab-back" href="/">
            Quay lại trang chính
          </Link>
        </div>

        <div className="drawer-lab-grid">
          {drawerVariants.map(variant => (
            <VariantCard key={variant.id} variant={variant} active={open && activeVariant.id === variant.id} onOpen={openVariant} />
          ))}
        </div>

        <div className="drawer-lab-footer-note">
          <span>
            <i data-lucide="mouse-pointer-click" />
            Bấm từng card để mở drawer từ bên phải.
          </span>
          <span>
            <i data-lucide="sparkles" />
            Dùng mẫu này để chốt nhanh phong cách bạn thích.
          </span>
        </div>
      </section>

      {rendered ? <DrawerPanel variant={activeVariant} open={open} onClose={closeDrawer} onNext={cycleVariant} /> : null}
    </main>
  );
}

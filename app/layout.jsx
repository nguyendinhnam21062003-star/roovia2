import Script from 'next/script';
import '../css/style.css';
import '../css/responsive.css';

export const metadata = {
  title: {
    default: 'StayBridge',
    template: '%s — StayBridge'
  },
  description: 'StayBridge giúp bạn tìm homestay, căn hộ, nhà nghỉ và khách sạn phù hợp tại các điểm đến nổi bật ở Việt Nam.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <Script id="scrub-extension-attrs" strategy="beforeInteractive">
          {`
            (() => {
              const scrub = () => {
                document.querySelectorAll('*').forEach((element) => {
                  for (const attribute of Array.from(element.attributes)) {
                    if (attribute.name.startsWith('bis_') || attribute.name.startsWith('data-bis-')) {
                      element.removeAttribute(attribute.name);
                    }
                  }
                });
              };

              scrub();

              const timer = window.setInterval(scrub, 100);
              window.setTimeout(() => window.clearInterval(timer), 2000);
            })();
          `}
        </Script>
      </head>
      <body suppressHydrationWarning>
        <div id="app-root" suppressHydrationWarning>
          {children}
        </div>
        <Script
          src="https://unpkg.com/lucide@0.468.0/dist/umd/lucide.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

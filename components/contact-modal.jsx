"use client";

import { useEffect, useState } from 'react';
import { getGeneralServices } from '../lib/contact-requests';

const PHONE_NUMBER = '0901 234 567';
const PHONE_LINK = 'tel:0901234567';
const ZALO_LINK = 'https://zalo.me/0901234567';
const FANPAGE_LINK = 'https://facebook.com/roovia';
const SUPPORT_EMAIL = 'hello@staybridge.vn';

const generalServices = getGeneralServices();
const serviceIconMap = {
  'Giải đáp thắc mắc': 'circle-help',
  'Hỗ trợ tìm kiếm và đặt phòng': 'bed-double',
  'Đặt vé máy bay': 'plane',
  'Tư vấn tour du lịch': 'map',
  'Trở thành đối tác': 'handshake'
};
const quickContacts = [
  {
    title: 'Số điện thoại',
    description: PHONE_NUMBER,
    icon: 'phone',
    href: PHONE_LINK
  },
  {
    title: 'Zalo',
    description: 'Mở Zalo Roovia',
    logoSrc: '/assets/contact-logos/zalo.png',
    logoAlt: 'Zalo',
    href: ZALO_LINK,
    external: true
  },
  {
    title: 'Fanpage',
    description: 'Mở Facebook Page',
    logoSrc: '/assets/contact-logos/facebook.png',
    logoAlt: 'Facebook',
    href: FANPAGE_LINK,
    external: true
  }
];

function toggleValue(list, value) {
  return list.includes(value) ? list.filter(item => item !== value) : [...list, value];
}

function copyText(value) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(value);
  }

  return new Promise((resolve, reject) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

export default function ContactModal({ open, request, onClose, onSubmit, onToast }) {
  const [fullName, setFullName] = useState('');
  const [contactValue, setContactValue] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.classList.toggle('modal-open', open);
    return () => document.body.classList.remove('modal-open');
  }, [open]);

  useEffect(() => {
    if (!open || !request) return;
    setFullName('');
    setContactValue('');
    setSelectedServices(request.servicePreset ? [request.servicePreset] : []);
    setError('');
  }, [open, request]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = event => {
      if (event.key === 'Escape') onClose?.();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!request) return null;

  function handleSubmit(event) {
    event.preventDefault();

    if (fullName.trim().length < 2) {
      setError('Vui lòng nhập họ và tên hợp lệ.');
      return;
    }

    if (contactValue.trim().length < 3) {
      setError('Vui lòng nhập số điện thoại, Zalo hoặc email để liên hệ.');
      return;
    }

    if (request.showServicePicker && selectedServices.length === 0) {
      setError('Vui lòng chọn ít nhất một dịch vụ cần tư vấn.');
      return;
    }

    setError('');
    onSubmit?.({
      fullName: fullName.trim(),
      contactValue: contactValue.trim(),
      selectedServices
    });
  }

  function handleEmailCopy() {
    copyText(SUPPORT_EMAIL)
      .then(() => onToast?.('Đã sao chép email liên hệ.'))
      .catch(() => onToast?.('Không thể sao chép email lúc này.'));
  }

  return (
    <div className={`modal${open ? ' open' : ''}`} aria-hidden={!open} role="dialog" aria-modal="true" aria-labelledby="contactModalTitle">
      <div className="modal-backdrop" onClick={onClose} />

      <div className="modal-dialog contact-modal">
        <button className="icon-button modal-close" type="button" aria-label="Đóng biểu mẫu" onClick={onClose}>
          <i data-lucide="x" />
        </button>

        <h2 id="contactModalTitle">{request.title}</h2>
        <p>
          Quý khách vui lòng để lại thông tin cá nhân dưới đây, bộ phận nhân viên kinh doanh/chăm sóc khách hàng sẽ chủ động liên hệ tới quý
          khách:
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <label className="form-full">
              <span>Họ và tên</span>
              <input type="text" value={fullName} onChange={event => setFullName(event.target.value)} placeholder="Nguyễn Văn A" />
            </label>

            <label className="form-full">
              <span>Thông tin liên hệ</span>
              <input
                type="text"
                value={contactValue}
                onChange={event => setContactValue(event.target.value)}
                placeholder="Có thể để lại Số điện thoại/ Zalo/Email"
              />
            </label>
          </div>

          <div className="contact-modal-section">
            <h3>Dịch vụ cần tư vấn</h3>
            {request.showServicePicker ? (
              <div className="option-grid option-grid-services">
                {generalServices.map(service => (
                  <label className="option-card" key={service}>
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service)}
                      onChange={() => setSelectedServices(previous => toggleValue(previous, service))}
                    />
                    <span className="option-card-icon">
                      <i data-lucide={serviceIconMap[service] || 'badge-check'} />
                    </span>
                    <span className="option-card-label">{service}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="preset-service-chip">
                <i data-lucide="badge-check" />
                <span>{request.servicePreset}</span>
              </div>
            )}
          </div>

          <p className="form-error" role="alert">
            {error}
          </p>

          <button className="button button-primary full-width" type="submit">
            {request.submitLabel}
          </button>
        </form>

        <div className="contact-modal-support">
          <h3>Ngoài ra quý khách có thể liên hệ ngay với Roovia thông qua các hình thức dưới đây:</h3>
          <div className="quick-contact-grid">
            {quickContacts.map(item => (
              <a
                key={item.title}
                className="quick-contact-card"
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
              >
                <span className="quick-contact-icon">
                  {item.logoSrc ? <img src={item.logoSrc} alt={item.logoAlt} /> : <i data-lucide={item.icon} />}
                </span>
                <div className="quick-contact-copy">
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                </div>
              </a>
            ))}
            <button className="quick-contact-card quick-contact-button" type="button" onClick={handleEmailCopy}>
              <span className="quick-contact-icon">
                <img src="/assets/contact-logos/gmail.png" alt="Gmail" />
              </span>
              <div className="quick-contact-copy">
                <strong>Email</strong>
                <span>{SUPPORT_EMAIL}</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { addDaysISO, todayISO } from '../lib/date-utils';
import ChatBubble from './chat-bubble';
import RoomCard from './room-card';
import SiteHeader from './site-header';

const formatter = new Intl.NumberFormat('vi-VN');

function formatCurrency(value) {
  return `${formatter.format(value)}đ`;
}

function nextDayISO(value) {
  return addDaysISO(value, 1);
}

function handleImageError(event) {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied) return;
  image.dataset.fallbackApplied = 'true';
  image.src = '/assets/images/fallback.svg';
}

const amenityIconMap = {
  'Wi-Fi miễn phí': 'wifi',
  'Máy lạnh': 'snowflake',
  'Bếp': 'cooking-pot',
  'Hồ bơi': 'waves',
  'Ban công': 'sun',
  'Cho phép thú cưng': 'paw-print',
  'Chỗ đỗ xe': 'car-front'
};

const amenityGroups = [
  { name: 'Phòng tắm', icon: 'bath', items: ['Vòi sen nước nóng', 'Máy sấy tóc', 'Khăn tắm sạch', 'Đồ vệ sinh cá nhân'] },
  { name: 'Phòng ngủ', icon: 'bed-double', items: ['Ga trải giường', 'Tủ quần áo', 'Rèm cản sáng', 'Ổ cắm cạnh giường'] },
  {
    name: 'Nhà bếp',
    icon: 'cooking-pot',
    items: ['Ấm đun nước', 'Tủ lạnh', 'Bộ dụng cụ ăn uống', 'Bếp nấu riêng']
  },
  { name: 'Kết nối', icon: 'wifi', items: ['Wi-Fi tốc độ cao', 'Smart TV', 'Bàn làm việc', 'Ổ cắm đa năng'] },
  { name: 'An toàn', icon: 'shield-check', items: ['Khóa cửa an toàn', 'Bình chữa cháy', 'Camera khu vực chung', 'Hướng dẫn khẩn cấp'] },
  {
    name: 'Ngoài trời',
    icon: 'trees',
    items: ['Ban công riêng', 'Không gian xanh', 'Khu vực ngồi nghỉ', 'Điểm đón xe thuận tiện']
  }
];

export default function RoomDetailClient({ room, similarRooms, reviews, initialToday: initialTodayProp }) {
  const initialToday = initialTodayProp || todayISO();
  const initialTomorrow = addDaysISO(initialToday, 1);
  const [favorites, setFavorites] = useState([]);
  const [favoritesReady, setFavoritesReady] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const [descriptionCollapsed, setDescriptionCollapsed] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [contactMode, setContactMode] = useState('consultation');
  const [contactRoomName, setContactRoomName] = useState(room.name);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [contactCheckIn, setContactCheckIn] = useState(initialToday);
  const [contactGuests, setContactGuests] = useState('');
  const [customerMessage, setCustomerMessage] = useState('');
  const [contactError, setContactError] = useState('');
  const [toast, setToast] = useState('');
  const [detailCheckIn, setDetailCheckIn] = useState(initialToday);
  const [detailCheckOut, setDetailCheckOut] = useState(initialTomorrow);
  const [detailGuests, setDetailGuests] = useState('2');
  const toastTimerRef = useRef(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('staybridge-favorites'));
      if (Array.isArray(stored)) setFavorites(stored);
    } catch {
      setFavorites([]);
    }
    setFavoritesReady(true);
  }, []);

  useEffect(() => {
    if (!favoritesReady) return;
    localStorage.setItem('staybridge-favorites', JSON.stringify(favorites));
  }, [favorites, favoritesReady]);

  useEffect(() => {
    document.body.classList.toggle('lightbox-open', lightboxOpen);
    return () => {
      document.body.classList.remove('lightbox-open');
    };
  }, [lightboxOpen]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => window.lucide?.createIcons());
    return () => window.cancelAnimationFrame(frame);
  });

  useEffect(() => {
    if (!toast) return undefined;
    toastTimerRef.current = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(toastTimerRef.current);
  }, [toast]);

  useEffect(() => {
    const onKeyDown = event => {
      if (event.key === 'Escape') {
        setModalOpen(false);
        setLightboxOpen(false);
      }
      if (lightboxOpen && event.key === 'ArrowLeft') {
        setGalleryIndex(index => (index - 1 + room.images.length) % room.images.length);
      }
      if (lightboxOpen && event.key === 'ArrowRight') {
        setGalleryIndex(index => (index + 1) % room.images.length);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxOpen, room.images.length]);

  const favoritesSet = new Set(favorites);
  const currentImage = room.images[galleryIndex] || room.images[0];
  const visibleReviews = reviewsExpanded
    ? [...reviews, ...reviews.map((review, index) => ({ ...review, name: `${review.name} ${index + 2}`, date: '15/02/2026' }))]
    : reviews;

  function setFavorite(roomId) {
    setFavorites(prev => (prev.includes(roomId) ? prev.filter(item => item !== roomId) : [...prev, roomId]));
  }

  function toggleFavorite() {
    setFavorite(room.id);
  }

  function scrollToFirstImage(index) {
    setGalleryIndex(index);
  }

  function openLightbox(index = galleryIndex) {
    setGalleryIndex((index + room.images.length) % room.images.length);
    setLightboxOpen(true);
  }

  function closeLightbox() {
    setLightboxOpen(false);
  }

  function openContact(mode = 'consultation', roomName = room.name) {
    setContactMode(mode);
    setContactRoomName(roomName);
    setContactCheckIn(detailCheckIn);
    setContactGuests(detailGuests);
    setContactError('');
    setModalOpen(true);
  }

  function closeContact() {
    setModalOpen(false);
  }

  function validateContact() {
    const phone = customerPhone.replace(/\s+/g, '');
    const phonePattern = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
    if (customerName.trim().length < 2) return 'Vui lòng nhập họ và tên hợp lệ.';
    if (!phonePattern.test(phone)) return 'Vui lòng nhập số điện thoại Việt Nam hợp lệ.';
    if (!contactCheckIn) return 'Vui lòng chọn ngày nhận phòng.';
    if (!contactGuests) return 'Vui lòng chọn số khách.';
    return '';
  }

  function submitContact(event) {
    event.preventDefault();
    const error = validateContact();
    setContactError(error);
    if (error) return;

    setCustomerName('');
    setCustomerPhone('');
    setCustomerMessage('');
    setContactCheckIn(initialToday);
    setContactGuests('');
    setModalOpen(false);
    setToast('Gửi yêu cầu thành công. StayBridge sẽ sớm liên hệ với bạn.');
  }

  function shareRoom() {
    const shareData = {
      title: room.name,
      text: `Xem ${room.name} trên StayBridge`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData).catch(error => {
        if (error?.name !== 'AbortError') setToast('Không thể chia sẻ liên kết lúc này.');
      });
      return;
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(window.location.href).then(() => setToast('Đã sao chép liên kết phòng.'));
      return;
    }

    const temp = document.createElement('textarea');
    temp.value = window.location.href;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    temp.remove();
    setToast('Đã sao chép liên kết phòng.');
  }

  function renderStars(rating, prefix = 'star') {
    return Array.from({ length: 5 }, (_, index) => (
      <i key={`${prefix}-${index}`} data-lucide="star" style={{ opacity: index < rating ? 1 : 0.24 }} />
    ));
  }

  return (
    <>
      <SiteHeader
        solid
        links={[
          { href: '/', label: 'Trang chủ' },
          { href: '/#rooms', label: 'Tìm phòng' },
          { href: '/#destinations', label: 'Khu vực' },
          { href: '/#partners', label: 'Đối tác' },
          { href: '#contact', label: 'Liên hệ' }
        ]}
        onCta={() => openContact('consultation')}
      />

      <main className="detail-main">
        <div className="container breadcrumb" aria-label="Đường dẫn">
          <Link href="/">Trang chủ</Link>
          <i data-lucide="chevron-right" />
          <Link href="/#rooms">Tìm phòng</Link>
          <i data-lucide="chevron-right" />
          <span id="breadcrumbRoom">{room.name}</span>
        </div>

        <section className="detail-gallery-layout" aria-label="Hình ảnh và thông tin đặt phòng">
          <div className="container detail-gallery-grid">
            <div className="gallery-panel">
              <div className="gallery-main-wrap">
                <button
                  className="gallery-image-button gallery-main"
                  id="galleryMainButton"
                  type="button"
                  aria-label="Mở ảnh chính"
                  onClick={() => openLightbox(galleryIndex)}
                >
                  <img id="galleryMainImage" src={currentImage} alt={`Ảnh chính của ${room.name}`} onError={handleImageError} />
                  <span className="gallery-counter" id="galleryCounter">
                    {galleryIndex + 1} / {room.images.length}
                  </span>
                </button>
                <button className="button button-light gallery-view-all" id="viewAllPhotos" type="button" onClick={() => openLightbox(0)}>
                  <i data-lucide="images" />
                  Xem tất cả ảnh
                </button>
              </div>
              <div className="gallery-thumbs" id="galleryThumbs">
                {room.images.slice(1, 4).map((image, index) => (
                  <button
                    className={`gallery-thumb${galleryIndex === index + 1 ? ' active' : ''}`}
                    key={`${room.id}-thumb-${index}`}
                    type="button"
                    data-gallery-index={index + 1}
                    aria-label={`Xem ảnh ${index + 2}`}
                    onClick={() => scrollToFirstImage(index + 1)}
                  >
                    <img src={image} alt={`${room.name} - ảnh ${index + 2}`} loading="lazy" onError={handleImageError} />
                  </button>
                ))}
              </div>
            </div>

            <aside className="booking-card" aria-labelledby="bookingTitle">
              <span className="booking-kicker">Giá tham khảo</span>
              <div className="booking-price" id="bookingTitle">
                <strong id="bookingPrice">{formatCurrency(room.price)}</strong>
                <span>/đêm</span>
              </div>
              <form
                id="bookingForm"
                onSubmit={event => {
                  event.preventDefault();
                  openContact('booking');
                }}
              >
                <label>
                  <span>Ngày nhận phòng</span>
                  <input
                    id="detailCheckIn"
                    type="date"
                    required
                    min={initialToday}
                    value={detailCheckIn}
                    onChange={event => {
                      const value = event.target.value;
                      setDetailCheckIn(value);
                      const nextDay = nextDayISO(value);
                      setDetailCheckOut(previous => (!previous || previous <= value ? nextDay : previous));
                    }}
                  />
                </label>
                <label>
                  <span>Ngày trả phòng</span>
                  <input
                    id="detailCheckOut"
                    type="date"
                    required
                    min={nextDayISO(detailCheckIn)}
                    value={detailCheckOut}
                    onChange={event => setDetailCheckOut(event.target.value)}
                  />
                </label>
                <label>
                  <span>Số khách</span>
                  <select id="detailGuests" value={detailGuests} onChange={event => setDetailGuests(event.target.value)}>
                    <option value="1">1 khách</option>
                    <option value="2">2 khách</option>
                    <option value="3">3 khách</option>
                    <option value="4">4 khách</option>
                    <option value="6">6 khách</option>
                    <option value="8">8 khách</option>
                  </select>
                </label>
                <button className="button button-primary full-width open-contact" type="submit">
                  Đặt phòng
                </button>
                <button className="button button-secondary full-width open-contact" type="button" onClick={() => openContact('consultation')}>
                  Liên hệ ngay
                </button>
              </form>
              <div className="booking-assurance">
                <span>
                  <i data-lucide="shield-check" />
                  Không cần thanh toán trước
                </span>
                <span>
                  <i data-lucide="zap" />
                  Xác nhận ngay
                </span>
                <span>
                  <i data-lucide="headphones" />
                  Hỗ trợ 24/7
                </span>
              </div>
            </aside>
          </div>
        </section>

        <section className="section detail-content-section">
          <div className="container detail-content-grid">
            <div className="detail-primary">
              <div className="room-title-block">
                <div>
                  <div className="room-title-meta">
                    <span className="rating-badge">
                      <i data-lucide="star" />
                      <strong id="detailRating">{room.rating.toFixed(1)}</strong>
                    </span>
                    <span id="detailReviews">{room.reviewCount} đánh giá</span>
                    <span className="dot-separator" />
                    <span id="detailType">{room.type}</span>
                  </div>
                  <h1 id="detailName">{room.name}</h1>
                  <p className="detail-address" id="detailAddress">
                    <i data-lucide="map-pin" />
                    <span>{room.address}</span>
                  </p>
                </div>
                <div className="room-title-actions">
                  <button className="button button-secondary" id="shareButton" type="button" onClick={shareRoom}>
                    <i data-lucide="share-2" />
                    Chia sẻ
                  </button>
                  <button
                    className={`button button-secondary${favoritesSet.has(room.id) ? ' active' : ''}`}
                    id="detailFavorite"
                    type="button"
                    aria-pressed={favoritesSet.has(room.id)}
                    onClick={toggleFavorite}
                  >
                    <i data-lucide="heart" />
                    {favoritesSet.has(room.id) ? 'Đã yêu thích' : 'Yêu thích'}
                  </button>
                </div>
              </div>

              <div className="detail-facts" id="detailFacts">
                <div className="detail-fact">
                  <span>
                    <i data-lucide="users" />
                  </span>
                  <div>
                    <strong>{room.guests} khách</strong>
                    <small>Sức chứa tối đa</small>
                  </div>
                </div>
                <div className="detail-fact">
                  <span>
                    <i data-lucide="door-open" />
                  </span>
                  <div>
                    <strong>{room.bedrooms} phòng ngủ</strong>
                    <small>Không gian riêng</small>
                  </div>
                </div>
                <div className="detail-fact">
                  <span>
                    <i data-lucide="bed-double" />
                  </span>
                  <div>
                    <strong>{room.beds} giường</strong>
                    <small>Bố trí linh hoạt</small>
                  </div>
                </div>
                <div className="detail-fact">
                  <span>
                    <i data-lucide="bath" />
                  </span>
                  <div>
                    <strong>{room.bathrooms} phòng tắm</strong>
                    <small>Tiện nghi riêng</small>
                  </div>
                </div>
                <div className="detail-fact">
                  <span>
                    <i data-lucide="maximize" />
                  </span>
                  <div>
                    <strong>{room.area} m²</strong>
                    <small>Diện tích sử dụng</small>
                  </div>
                </div>
                <div className="detail-fact">
                  <span>
                    <i data-lucide="building-2" />
                  </span>
                  <div>
                    <strong>{room.type}</strong>
                    <small>Loại hình lưu trú</small>
                  </div>
                </div>
              </div>

              <div className="detail-info-cards">
                <article className="detail-card description-card">
                  <div className="detail-card-icon">
                    <i data-lucide="align-left" />
                  </div>
                  <h2>Mô tả phòng</h2>
                  <div className={`description-copy${descriptionCollapsed ? ' collapsed' : ''}`} id="descriptionCopy">
                    <p>
                      {room.description} Không gian được chuẩn bị trước mỗi lượt khách, đồng thời đội ngũ StayBridge có thể hỗ trợ
                      thêm thông tin về di chuyển, nhận phòng và các yêu cầu lưu trú phù hợp.
                    </p>
                  </div>
                  <button className="text-button" id="toggleDescription" type="button" onClick={() => setDescriptionCollapsed(value => !value)}>
                    {descriptionCollapsed ? 'Xem thêm' : 'Thu gọn'}
                    <i data-lucide={descriptionCollapsed ? 'chevron-down' : 'chevron-up'} />
                  </button>
                </article>

                <article className="detail-card">
                  <div className="detail-card-icon">
                    <i data-lucide="sparkles" />
                  </div>
                  <h2>Tiện nghi nổi bật</h2>
                  <ul className="icon-list" id="highlightAmenities">
                    {[...room.amenities, 'Bàn làm việc', 'Ấm đun nước', 'Máy sấy tóc', 'Đồ vệ sinh cá nhân']
                      .slice(0, 6)
                      .map(item => (
                        <li key={item}>
                          <i data-lucide={amenityIconMap[item] || 'check'} />
                          {item}
                        </li>
                      ))}
                  </ul>
                </article>

                <article className="detail-card">
                  <div className="detail-card-icon">
                    <i data-lucide="clipboard-check" />
                  </div>
                  <h2>Chính sách lưu trú</h2>
                  <dl className="detail-definition" id="roomPolicies">
                    <div>
                      <dt>Nhận phòng</dt>
                      <dd>Từ {room.policies.checkIn}</dd>
                    </div>
                    <div>
                      <dt>Trả phòng</dt>
                      <dd>Trước {room.policies.checkOut}</dd>
                    </div>
                    <div>
                      <dt>Hủy phòng</dt>
                      <dd>{room.policies.cancellation}</dd>
                    </div>
                    <div>
                      <dt>Hút thuốc</dt>
                      <dd>{room.policies.smoking ? 'Cho phép' : 'Không cho phép'}</dd>
                    </div>
                    <div>
                      <dt>Thú cưng</dt>
                      <dd>{room.policies.pets ? 'Cho phép' : 'Không cho phép'}</dd>
                    </div>
                  </dl>
                </article>
              </div>

              <section className="detail-section-block" aria-labelledby="allAmenitiesTitle">
                <div className="section-heading compact-heading">
                  <span className="eyebrow">Đầy đủ và tiện lợi</span>
                  <h2 id="allAmenitiesTitle">Tất cả tiện nghi</h2>
                </div>
                <div className="amenity-groups" id="amenityGroups">
                  {amenityGroups.map(group => (
                    <article className="amenity-group" key={group.name}>
                      <div className="amenity-group-head">
                        <span>
                          <i data-lucide={group.icon} />
                        </span>
                        <h3>{group.name}</h3>
                      </div>
                      <ul>
                        {group.items.map(item => (
                          <li key={item}>
                            <i data-lucide="check" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </section>

              <section className="detail-section-block" aria-labelledby="locationTitle">
                <div className="section-heading compact-heading">
                  <span className="eyebrow">Vị trí lưu trú</span>
                  <h2 id="locationTitle">Khu vực xung quanh</h2>
                  <p id="mapAddress">{room.address}</p>
                </div>
                <div className="map-mock">
                  <iframe
                    id="mapFrame"
                    title="Bản đồ vị trí phòng"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(room.address)}&output=embed`}
                  />
                  <div className="map-fallback">
                    <span>
                      <i data-lucide="map-pinned" />
                    </span>
                    <strong id="mapCity">{room.city}</strong>
                  </div>
                  <a
                    className="button button-light map-button"
                    id="mapExternalLink"
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(room.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i data-lucide="external-link" />
                    Xem trên bản đồ
                  </a>
                </div>
              </section>

              <section className="detail-section-block reviews-section" aria-labelledby="reviewsTitle">
                <div className="review-overview">
                  <div className="review-score">
                    <span id="reviewScore">{room.rating.toFixed(1)}</span>
                    <div>
                      <strong>Tuyệt vời</strong>
                      <small id="reviewCountLabel">Dựa trên {room.reviewCount} đánh giá</small>
                    </div>
                  </div>
                  <div className="review-metrics" id="reviewMetrics">
                    {[
                      ['Sạch sẽ', Math.min(5, room.rating + 0.1)],
                      ['Vị trí', Math.min(5, room.rating)],
                      ['Tiện nghi', Math.max(4.3, room.rating - 0.1)],
                      ['Phục vụ', Math.min(5, room.rating + 0.1)],
                      ['Giá trị', Math.max(4.3, room.rating - 0.2)]
                    ].map(([name, score]) => (
                      <div className="metric-row" key={name}>
                        <span>{name}</span>
                        <span className="metric-track">
                          <span className="metric-fill" style={{ width: `${(score / 5) * 100}%` }} />
                        </span>
                        <strong>{score.toFixed(1)}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="section-heading compact-heading">
                  <span className="eyebrow">Trải nghiệm thực tế</span>
                  <h2 id="reviewsTitle">Đánh giá của khách hàng</h2>
                </div>
                <div className="review-list" id="reviewList">
                  {visibleReviews.map(review => (
                    <article className="review-card" key={`${review.name}-${review.date}`}>
                      <div className="review-card-head">
                        <span className="review-avatar">{review.avatar}</span>
                        <div>
                          <strong>{review.name}</strong>
                          <small>{review.date}</small>
                        </div>
                        <span className="review-stars" aria-label={`${review.rating} sao`}>
                          {renderStars(review.rating, review.name)}
                        </span>
                      </div>
                      <p>{review.text}</p>
                    </article>
                  ))}
                </div>
                <button className="button button-secondary" id="showAllReviews" type="button" onClick={() => setReviewsExpanded(value => !value)}>
                  {reviewsExpanded ? 'Thu gọn đánh giá' : 'Xem tất cả đánh giá'}
                </button>
              </section>
            </div>
          </div>
        </section>

        <section className="section similar-section" aria-labelledby="similarTitle">
          <div className="container">
            <div className="section-heading heading-with-actions">
              <div>
                <span className="eyebrow">Có thể bạn quan tâm</span>
                <h2 id="similarTitle">Phòng tương tự</h2>
                <p>Các lựa chọn cùng khu vực hoặc cùng loại hình lưu trú.</p>
              </div>
              <Link className="button button-secondary" href="/#rooms">
                Xem tất cả
              </Link>
            </div>
            <div className="similar-grid" id="similarGrid">
              {similarRooms.map(item => {
                const favorite = favoritesSet.has(item.id);
                return (
                  <RoomCard
                    key={item.id}
                    room={item}
                    favorite={favorite}
                    onToggleFavorite={() => setFavorite(item.id)}
                    onContact={() => openContact('booking', item.name)}
                  />
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer" id="contact">
        <div className="container footer-grid">
          <div className="footer-brand">
            <a className="brand brand-light" href="/">
              <span className="brand-mark">
                <i data-lucide="home" />
              </span>
              <span className="brand-copy">
                <strong>StayBridge</strong>
                <small>Home away from home</small>
              </span>
            </a>
            <p>Nền tảng giới thiệu chỗ ở và kết nối khách hàng với đội ngũ tư vấn.</p>
          </div>
          <div>
            <h3>Liên kết</h3>
            <a href="/">Trang chủ</a>
            <a href="/#rooms">Tìm phòng</a>
            <a href="/#destinations">Khu vực</a>
          </div>
          <div>
            <h3>Hỗ trợ</h3>
            <a href="#">Câu hỏi thường gặp</a>
            <a href="#">Quy trình liên hệ</a>
            <a href="#">Chính sách bảo mật</a>
          </div>
          <div>
            <h3>Liên hệ</h3>
            <p className="footer-contact">
              <i data-lucide="phone" />
              0901 234 567
            </p>
            <p className="footer-contact">
              <i data-lucide="mail" />
              hello@staybridge.vn
            </p>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© 2026 StayBridge. Giao diện frontend demo.</span>
          <span>Home away from home.</span>
        </div>
      </footer>

      <div className={`lightbox${lightboxOpen ? ' open' : ''}`} id="lightbox" aria-hidden={!lightboxOpen} role="dialog" aria-modal="true" aria-label="Thư viện ảnh">
        <div className="lightbox-backdrop" data-close-lightbox onClick={closeLightbox} />
        <button className="icon-button lightbox-close" type="button" data-close-lightbox aria-label="Đóng thư viện" onClick={closeLightbox}>
          <i data-lucide="x" />
        </button>
        <button className="icon-button lightbox-nav lightbox-prev" id="lightboxPrev" type="button" aria-label="Ảnh trước" onClick={() => setGalleryIndex(index => (index - 1 + room.images.length) % room.images.length)}>
          <i data-lucide="chevron-left" />
        </button>
        <figure>
          <img id="lightboxImage" src={currentImage} alt={`Ảnh phòng ${galleryIndex + 1}`} onError={handleImageError} />
          <figcaption id="lightboxCaption">
            {galleryIndex + 1} / {room.images.length}
          </figcaption>
        </figure>
        <button className="icon-button lightbox-nav lightbox-next" id="lightboxNext" type="button" aria-label="Ảnh tiếp theo" onClick={() => setGalleryIndex(index => (index + 1) % room.images.length)}>
          <i data-lucide="chevron-right" />
        </button>
      </div>

      <ChatBubble
        open={modalOpen}
        mode={contactMode}
        roomName={contactRoomName}
        checkIn={contactCheckIn}
        checkOut={detailCheckOut}
        guests={contactGuests}
        onOpen={() => setModalOpen(true)}
        onClose={closeContact}
      />

      <div className={`toast${toast ? ' show' : ''}`} id="toast" role="status" aria-live="polite">
        <i data-lucide="circle-check" />
        <span>{toast || 'Gửi yêu cầu thành công.'}</span>
      </div>
    </>
  );
}

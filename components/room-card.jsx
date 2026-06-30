"use client";

import Link from 'next/link';

const formatter = new Intl.NumberFormat('vi-VN');

function formatCurrency(value) {
  return `${formatter.format(value)}đ`;
}

function handleImageError(event) {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied) return;
  image.dataset.fallbackApplied = 'true';
  image.src = '/assets/images/fallback.svg';
}

export default function RoomCard({ room, favorite = false, onToggleFavorite, onContact, contactLabel = 'Liên hệ đặt phòng' }) {
  return (
    <article className="room-card">
      <div className="room-card-image">
        <Link href={`/room/${room.id}`} aria-label={`Xem ${room.name}`}>
          <img src={room.images[0]} alt={room.name} loading="lazy" onError={handleImageError} />
        </Link>
        <div className="room-labels">
          {room.featured ? <span className="room-label">Nổi bật</span> : null}
          {room.discount ? <span className="room-label discount">Giảm {room.discount}%</span> : null}
        </div>
        <button
          className={`favorite-button${favorite ? ' active' : ''}`}
          type="button"
          aria-label={favorite ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
          aria-pressed={favorite}
          onClick={onToggleFavorite}
        >
          <i data-lucide="heart" />
        </button>
      </div>

      <div className="room-card-body">
        <div className="room-card-top">
          <h3>
            <Link href={`/room/${room.id}`}>{room.name}</Link>
          </h3>
          <span className="rating-badge">
            <i data-lucide="star" />
            <strong>{room.rating}</strong>
          </span>
        </div>

        <p className="room-address">
          <i data-lucide="map-pin" />
          <span>{room.address}</span>
        </p>

        <div className="room-facts">
          <span>
            <i data-lucide="users" />
            {room.guests} khách
          </span>
          <span>
            <i data-lucide="door-open" />
            {room.bedrooms} phòng ngủ
          </span>
          <span>
            <i data-lucide="bed-double" />
            {room.beds} giường
          </span>
          <span>
            <i data-lucide="message-square-text" />
            {room.reviewCount} đánh giá
          </span>
        </div>

        <div className="room-card-bottom">
          <div className="room-price">
            <small>Giá mỗi đêm</small>
            <strong>{formatCurrency(room.price)}</strong>
            {room.oldPrice ? <del>{formatCurrency(room.oldPrice)}</del> : null}
          </div>
          {onContact ? (
            <button className="button button-primary open-contact" type="button" onClick={() => onContact(room)}>
              {contactLabel}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

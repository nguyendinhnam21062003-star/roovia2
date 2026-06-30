"use client";

import { useEffect, useRef, useState } from 'react';
import { addDaysISO, todayISO } from '../lib/date-utils';
import { useRooviaChat } from '../lib/use-roovia-chat';
import ChatWidget from './chat-widget';
import RoomCard from './room-card';
import SiteHeader from './site-header';

const formatter = new Intl.NumberFormat('vi-VN');
const allTypes = ['Homestay', 'Căn hộ', 'Nhà nguyên căn', 'Phòng riêng', 'Khách sạn', 'Nhà nghỉ'];
const allCities = ['Hà Nội', 'Đà Nẵng', 'Đà Lạt', 'Hội An', 'Nha Trang', 'TP. Hồ Chí Minh', 'Hạ Long'];
const allAmenities = ['Wi-Fi miễn phí', 'Máy lạnh', 'Bếp', 'Hồ bơi', 'Ban công', 'Cho phép thú cưng', 'Chỗ đỗ xe'];

function formatCurrency(value) {
  return `${formatter.format(value)}đ`;
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

function slugify(value) {
  return normalizeText(value).replace(/\s+/g, '-');
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

function countBy(rooms, field, value) {
  return rooms.filter(room => (field === 'amenities' ? room.amenities.includes(value) : room[field] === value)).length;
}

export default function HomeClient({ rooms, destinations, initialToday: initialTodayProp }) {
  const initialToday = initialTodayProp || todayISO();
  const initialTomorrow = addDaysISO(initialToday, 1);
  const [query, setQuery] = useState('');
  const [destination, setDestination] = useState('');
  const [guests, setGuests] = useState(1);
  const [maxPrice, setMaxPrice] = useState(2000000);
  const [types, setTypes] = useState([]);
  const [cities, setCities] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [sort, setSort] = useState('popular');
  const [heroDestination, setHeroDestination] = useState('');
  const [heroCheckIn, setHeroCheckIn] = useState(initialToday);
  const [heroCheckOut, setHeroCheckOut] = useState(initialTomorrow);
  const [heroGuests, setHeroGuests] = useState('2');
  const [favorites, setFavorites] = useState([]);
  const [favoritesReady, setFavoritesReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const sliderRef = useRef(null);
  const chat = useRooviaChat({
    destinations: destinations.map(item => item.name),
    getRoomCountByCity: city => rooms.filter(room => room.city === city).length,
    onRevealCity: applyDestination
  });

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
    document.body.classList.toggle('drawer-open', drawerOpen);
    return () => {
      document.body.classList.remove('drawer-open');
    };
  }, [drawerOpen]);

  useEffect(() => {
    try {
      const pendingCity = sessionStorage.getItem('staybridge-chat-city');
      if (!pendingCity) return;
      sessionStorage.removeItem('staybridge-chat-city');
      applyDestination(pendingCity);
    } catch {}
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => window.lucide?.createIcons());
    return () => window.cancelAnimationFrame(frame);
  });

  useEffect(() => {
    const onKeyDown = event => {
      if (event.key === 'Escape') {
        setDrawerOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const favoritesSet = new Set(favorites);
  const queryTokens = normalizeText(`${query} ${destination}`).split(/\s+/).filter(Boolean);

  const filteredRooms = [...rooms]
    .filter(room => {
      const searchable = normalizeText(`${room.name} ${room.city} ${room.address} ${room.type}`);
      const queryMatch = queryTokens.length === 0 || queryTokens.every(token => searchable.includes(token));
      const guestMatch = room.guests >= Number(guests || 1);
      const priceMatch = room.price <= Number(maxPrice);
      const typeMatch = types.length === 0 || types.includes(room.type);
      const cityMatch = cities.length === 0 || cities.includes(room.city);
      const amenityMatch = amenities.length === 0 || amenities.every(item => room.amenities.includes(item));
      return queryMatch && guestMatch && priceMatch && typeMatch && cityMatch && amenityMatch;
    })
    .sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'rating') return b.rating - a.rating || b.reviewCount - a.reviewCount;
      return Number(b.featured) - Number(a.featured) || b.reviewCount - a.reviewCount;
    });

  const activeChips = [];
  if (destination) activeChips.push({ group: 'destination', label: destination, value: destination });
  if (Number(guests) > 1) activeChips.push({ group: 'guests', label: `${guests} khách`, value: String(guests) });
  if (Number(maxPrice) < 2000000) activeChips.push({ group: 'price', label: `Tối đa ${formatCurrency(maxPrice)}`, value: String(maxPrice) });
  types.forEach(value => activeChips.push({ group: 'type', label: value, value }));
  cities.forEach(value => activeChips.push({ group: 'city', label: value, value }));
  amenities.forEach(value => activeChips.push({ group: 'amenity', label: value, value }));

  function toggleListItem(setter, value) {
    setter(prev => (prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]));
  }

  function toggleFavorite(roomId) {
    setFavorites(prev => (prev.includes(roomId) ? prev.filter(item => item !== roomId) : [...prev, roomId]));
  }

  function clearAllFilters() {
    setQuery('');
    setDestination('');
    setGuests(1);
    setMaxPrice(2000000);
    setTypes([]);
    setCities([]);
    setAmenities([]);
    setSort('popular');
    setHeroDestination('');
    setHeroGuests('2');
    setHeroCheckIn(initialToday);
    setHeroCheckOut(initialTomorrow);
  }

  function removeChip(group, value) {
    if (group === 'destination') {
      setDestination('');
      setHeroDestination('');
    } else if (group === 'guests') {
      setGuests(1);
    } else if (group === 'price') {
      setMaxPrice(2000000);
    } else if (group === 'type') {
      setTypes(prev => prev.filter(item => item !== value));
    } else if (group === 'city') {
      setCities(prev => prev.filter(item => item !== value));
    } else if (group === 'amenity') {
      setAmenities(prev => prev.filter(item => item !== value));
    }
  }

  function applyDestination(city) {
    setDestination('');
    setCities([city]);
    setDrawerOpen(false);
    document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function scrollFavorites(offset) {
    sliderRef.current?.scrollBy({ left: offset, behavior: 'smooth' });
  }

  const featuredRooms = rooms.filter(room => room.featured).slice(0, 6);

  return (
    <>
      <SiteHeader
        links={[
          { href: '#top', label: 'Trang chủ' },
          { href: '#rooms', label: 'Tìm phòng' },
          { href: '#destinations', label: 'Khu vực' },
          { href: '#partners', label: 'Đối tác' },
          { href: '#contact', label: 'Liên hệ' }
        ]}
        onCta={chat.openAdviceChat}
      />

      <main id="top">
        <section className="hero" aria-labelledby="heroTitle">
          <div className="hero-overlay" />
          <div className="container hero-content">
            <span className="eyebrow hero-eyebrow">Chỗ ở được chọn lọc</span>
            <h1 id="heroTitle">
              Tìm chỗ ở lý tưởng
              <br />
              <span>Như ở nhà, dù bạn ở đâu</span>
            </h1>
            <p>Hàng ngàn phòng đẹp - chủ nhà thân thiện - giá tốt mỗi ngày</p>
          </div>

          <div className="container hero-search-wrap">
            <form
              className="hero-search"
              onSubmit={event => {
                event.preventDefault();
                setDestination(heroDestination.trim());
                setGuests(Number(heroGuests || 1));
                document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              <label className="search-field">
                <span className="field-icon">
                  <i data-lucide="map-pin" />
                </span>
                <span className="field-copy">
                  <small>Điểm đến</small>
                  <input
                    type="text"
                    placeholder="Bạn muốn đi đâu?"
                    autoComplete="off"
                    value={heroDestination}
                    onChange={event => setHeroDestination(event.target.value)}
                  />
                </span>
              </label>
              <label className="search-field">
                <span className="field-icon">
                  <i data-lucide="calendar-days" />
                </span>
                <span className="field-copy">
                  <small>Nhận phòng</small>
                  <input
                    type="date"
                    value={heroCheckIn}
                    min={initialToday}
                    onChange={event => {
                      const value = event.target.value;
                      setHeroCheckIn(value);
                      const nextDay = nextDayISO(value);
                      setHeroCheckOut(previous => (!previous || previous <= value ? nextDay : previous));
                    }}
                  />
                </span>
              </label>
              <label className="search-field">
                <span className="field-icon">
                  <i data-lucide="calendar-check" />
                </span>
                <span className="field-copy">
                  <small>Trả phòng</small>
                  <input
                    type="date"
                    value={heroCheckOut}
                    min={nextDayISO(heroCheckIn)}
                    onChange={event => setHeroCheckOut(event.target.value)}
                  />
                </span>
              </label>
              <label className="search-field">
                <span className="field-icon">
                  <i data-lucide="users" />
                </span>
                <span className="field-copy">
                  <small>Số khách</small>
                  <select value={heroGuests} onChange={event => setHeroGuests(event.target.value)}>
                    <option value="1">1 khách</option>
                    <option value="2">2 khách</option>
                    <option value="3">3 khách</option>
                    <option value="4">4 khách</option>
                    <option value="6">6 khách</option>
                    <option value="8">8 khách</option>
                  </select>
                </span>
              </label>
              <button className="button button-primary hero-search-button" type="submit">
                <i data-lucide="search" />
                Tìm phòng
              </button>
            </form>
          </div>
        </section>

        <section className="section destinations-section" id="destinations" aria-labelledby="destinationTitle">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">Khám phá Việt Nam</span>
              <h2 id="destinationTitle">Điểm đến phổ biến</h2>
              <p>Chọn một khu vực để xem nhanh các chỗ ở đang có.</p>
            </div>
            <div className="destination-grid" id="destinationGrid">
              {destinations.map(destinationItem => {
                const count = rooms.filter(room => room.city === destinationItem.name).length;
                return (
                  <button
                    className="destination-card destination-trigger"
                    type="button"
                    key={destinationItem.name}
                    onClick={() => applyDestination(destinationItem.name)}
                  >
                    <img src={destinationItem.image} alt={`Chỗ ở tại ${destinationItem.name}`} loading="lazy" onError={handleImageError} />
                    <span className="destination-count">{count} chỗ ở</span>
                    <span className="destination-copy">
                      <h3>{destinationItem.name}</h3>
                      <p>{destinationItem.subtitle}</p>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section favorites-section" aria-labelledby="favoriteTitle">
          <div className="container">
            <div className="section-heading heading-with-actions">
              <div>
                <span className="eyebrow">Gợi ý nổi bật</span>
                <h2 id="favoriteTitle">Chỗ ở được yêu thích</h2>
                <p>Những lựa chọn có đánh giá tốt và được khách hàng quan tâm nhiều.</p>
              </div>
              <div className="slider-actions" aria-label="Điều khiển danh sách nổi bật">
                <button className="icon-button" id="favoritePrev" type="button" aria-label="Xem mục trước" onClick={() => scrollFavorites(-320)}>
                  <i data-lucide="arrow-left" />
                </button>
                <button className="icon-button" id="favoriteNext" type="button" aria-label="Xem mục tiếp theo" onClick={() => scrollFavorites(320)}>
                  <i data-lucide="arrow-right" />
                </button>
              </div>
            </div>

            <div className="favorite-slider" id="favoriteSlider" ref={sliderRef}>
              {featuredRooms.map(room => {
                const favorite = favoritesSet.has(room.id);
                return (
                  <RoomCard
                    key={room.id}
                    room={room}
                    favorite={favorite}
                    onToggleFavorite={() => toggleFavorite(room.id)}
                  />
                );
              })}
            </div>
          </div>
        </section>

        <section className="section rooms-section" id="rooms" aria-labelledby="roomsTitle">
          <div className="container">
            <div className="section-heading rooms-heading">
              <div>
                <span className="eyebrow">Tìm theo nhu cầu</span>
                <h2 id="roomsTitle">Chọn phòng phù hợp với bạn</h2>
                <p>Lọc nhanh theo loại hình, khu vực, giá và tiện nghi.</p>
              </div>
              <button className="button button-secondary mobile-filter-button" id="mobileFilterButton" type="button" onClick={() => setDrawerOpen(true)}>
                <i data-lucide="sliders-horizontal" />
                Bộ lọc
              </button>
            </div>

            <div className="listing-layout">
              <aside className={`filter-sidebar${drawerOpen ? ' open' : ''}`} id="filterSidebar" aria-label="Bộ lọc phòng">
                <div className="filter-drawer-head">
                  <div>
                    <span className="eyebrow">Tùy chọn</span>
                    <h3>Bộ lọc</h3>
                  </div>
                  <button className="icon-button close-filter-button" id="closeFilterButton" type="button" aria-label="Đóng bộ lọc" onClick={() => setDrawerOpen(false)}>
                    <i data-lucide="x" />
                  </button>
                </div>

                <div className="filter-group">
                  <h4>Loại hình</h4>
                  <div id="typeFilters" className="check-list">
                    {allTypes.map(type => (
                      <label className="check-item" key={type} htmlFor={`type-${slugify(type)}`}>
                        <input
                          id={`type-${slugify(type)}`}
                          type="checkbox"
                          checked={types.includes(type)}
                          onChange={() => toggleListItem(setTypes, type)}
                        />
                        <span>{type}</span>
                        <small>{countBy(rooms, 'type', type)}</small>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="filter-group">
                  <div className="filter-title-row">
                    <h4>Mức giá mỗi đêm</h4>
                    <span id="priceValue">{formatCurrency(maxPrice)}</span>
                  </div>
                  <input
                    className="price-range"
                    id="priceRange"
                    type="range"
                    min="200000"
                    max="2000000"
                    step="50000"
                    value={maxPrice}
                    onChange={event => setMaxPrice(Number(event.target.value))}
                    aria-label="Giá tối đa mỗi đêm"
                  />
                  <div className="range-labels">
                    <span>200.000đ</span>
                    <span>2.000.000đ</span>
                  </div>
                </div>

                <div className="filter-group">
                  <h4>Khu vực</h4>
                  <div id="cityFilters" className="check-list">
                    {allCities.map(city => (
                      <label className="check-item" key={city} htmlFor={`city-${slugify(city)}`}>
                        <input
                          id={`city-${slugify(city)}`}
                          type="checkbox"
                          checked={cities.includes(city)}
                          onChange={() => toggleListItem(setCities, city)}
                        />
                        <span>{city}</span>
                        <small>{countBy(rooms, 'city', city)}</small>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="filter-group">
                  <h4>Tiện nghi</h4>
                  <div id="amenityFilters" className="check-list">
                    {allAmenities.map(amenity => (
                      <label className="check-item" key={amenity} htmlFor={`amenity-${slugify(amenity)}`}>
                        <input
                          id={`amenity-${slugify(amenity)}`}
                          type="checkbox"
                          checked={amenities.includes(amenity)}
                          onChange={() => toggleListItem(setAmenities, amenity)}
                        />
                        <span>{amenity}</span>
                        <small>{countBy(rooms, 'amenities', amenity)}</small>
                      </label>
                    ))}
                  </div>
                </div>

                <button className="button button-ghost full-width" id="clearFilters" type="button" onClick={clearAllFilters}>
                  <i data-lucide="rotate-ccw" />
                  Xóa bộ lọc
                </button>
              </aside>

              <div className={`filter-backdrop${drawerOpen ? ' show' : ''}`} id="filterBackdrop" onClick={() => setDrawerOpen(false)} />

              <div className="listing-main">
                <div className="listing-toolbar">
                  <label className="toolbar-search">
                    <i data-lucide="search" />
                    <input
                      id="roomSearch"
                      type="search"
                      placeholder="Tìm theo tên phòng hoặc địa điểm"
                      value={query}
                      onChange={event => setQuery(event.target.value)}
                    />
                  </label>
                  <div className="result-meta">
                    <strong id="resultCount">{filteredRooms.length} kết quả</strong>
                    <label className="sort-label">
                      <span>Sắp xếp</span>
                      <select id="sortRooms" value={sort} onChange={event => setSort(event.target.value)}>
                        <option value="popular">Phổ biến nhất</option>
                        <option value="price-asc">Giá thấp đến cao</option>
                        <option value="price-desc">Giá cao đến thấp</option>
                        <option value="rating">Đánh giá cao nhất</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div className="active-filters" id="activeFilters" aria-live="polite">
                  {activeChips.map(chip => (
                    <button className="filter-chip" type="button" key={`${chip.group}-${chip.value}`} onClick={() => removeChip(chip.group, chip.value)}>
                      {chip.label}
                      <i data-lucide="x" />
                    </button>
                  ))}
                </div>

                <div className="room-grid" id="roomGrid" hidden={filteredRooms.length === 0}>
                  {filteredRooms.map(room => {
                    const favorite = favoritesSet.has(room.id);
                return (
                    <RoomCard
                      key={room.id}
                      room={room}
                      favorite={favorite}
                      onToggleFavorite={() => toggleFavorite(room.id)}
                      onContact={chat.openRoomContactChat}
                    />
                  );
                })}
                </div>

                {filteredRooms.length === 0 ? (
                  <div className="empty-state" id="emptyState">
                    <span className="empty-icon">
                      <i data-lucide="search-x" />
                    </span>
                    <h3>Không tìm thấy phòng phù hợp</h3>
                    <p>Thử thay đổi khu vực, mức giá hoặc bỏ bớt tiện nghi đang chọn.</p>
                    <button className="button button-primary" id="emptyClearButton" type="button" onClick={clearAllFilters}>
                      Xóa bộ lọc
                    </button>
                  </div>
                ) : null}
              </div>

              <aside className="promo-sidebar" aria-label="Ưu đãi và lợi ích">
                <div className="promo-card">
                  <span className="promo-kicker">Ưu đãi dành riêng cho bạn</span>
                  <strong>Giảm đến 20%</strong>
                  <p>Khi đặt phòng đối tác StayBridge</p>
                  <button className="button button-light destination-trigger" type="button" onClick={() => applyDestination('Đà Lạt')}>
                    Khám phá ngay
                  </button>
                  <span className="promo-shape promo-shape-one" />
                  <span className="promo-shape promo-shape-two" />
                </div>

                <div className="benefits-card">
                  <div className="benefit-item">
                    <span>
                      <i data-lucide="badge-check" />
                    </span>
                    <div>
                      <strong>Chủ nhà xác thực</strong>
                      <small>Thông tin được kiểm tra</small>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <span>
                      <i data-lucide="headphones" />
                    </span>
                    <div>
                      <strong>Hỗ trợ 24/7</strong>
                      <small>Tư vấn trước và trong chuyến đi</small>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <span>
                      <i data-lucide="wallet-cards" />
                    </span>
                    <div>
                      <strong>Thanh toán linh hoạt</strong>
                      <small>Thỏa thuận trực tiếp khi liên hệ</small>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="section partner-section" id="partners" aria-labelledby="partnerTitle">
          <div className="container partner-panel">
            <div>
              <span className="eyebrow">Dành cho chủ chỗ ở</span>
              <h2 id="partnerTitle">Kết nối căn phòng của bạn với nhiều khách hàng hơn</h2>
              <p>
                StayBridge hỗ trợ giới thiệu chỗ ở, tiếp nhận nhu cầu và kết nối khách hàng tiềm năng mà không yêu cầu hệ
                thống vận hành phức tạp.
              </p>
            </div>
            <button className="button button-primary" type="button" onClick={chat.openPartnerChat}>
              Trở thành đối tác
            </button>
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
            <p>Nền tảng giới thiệu chỗ ở và kết nối khách hàng với đội ngũ tư vấn tại các điểm đến nổi bật.</p>
            <div className="social-links">
              <a href="#" aria-label="Facebook">
                <i data-lucide="thumbs-up" />
              </a>
              <a href="#" aria-label="TikTok">
                <i data-lucide="music-2" />
              </a>
              <a href="#" aria-label="Zalo">
                <i data-lucide="message-circle" />
              </a>
            </div>
          </div>
          <div>
            <h3>Liên kết nhanh</h3>
            <a href="#top">Trang chủ</a>
            <a href="#rooms">Tìm phòng</a>
            <a href="#destinations">Khu vực</a>
            <a href="#partners">Đối tác</a>
          </div>
          <div>
            <h3>Khu vực nổi bật</h3>
            <a href="#rooms" className="destination-trigger" onClick={() => applyDestination('Đà Lạt')}>
              Đà Lạt
            </a>
            <a href="#rooms" className="destination-trigger" onClick={() => applyDestination('Đà Nẵng')}>
              Đà Nẵng
            </a>
            <a href="#rooms" className="destination-trigger" onClick={() => applyDestination('Hội An')}>
              Hội An
            </a>
            <a href="#rooms" className="destination-trigger" onClick={() => applyDestination('Hạ Long')}>
              Hạ Long
            </a>
          </div>
          <div>
            <h3>Chính sách</h3>
            <a href="#">Điều khoản sử dụng</a>
            <a href="#">Chính sách bảo mật</a>
            <a href="#">Quy trình liên hệ</a>
            <a href="#">Câu hỏi thường gặp</a>
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
            <p className="footer-contact">
              <i data-lucide="map-pin" />
              Việt Nam
            </p>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© 2026 StayBridge. Giao diện frontend demo.</span>
          <span>Thiết kế cho trải nghiệm tìm phòng thuận tiện.</span>
        </div>
      </footer>

      <ChatWidget
        open={chat.open}
        typing={chat.typing}
        messages={chat.messages}
        hasConversation={chat.hasConversation}
        onOpen={chat.openChat}
        onClose={chat.closeChat}
        onQuickAction={chat.handleQuickAction}
        onSendMessage={chat.sendManualMessage}
      />

    </>
  );
}

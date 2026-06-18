(() => {
  'use strict';

  document.addEventListener('error', event => {
    const image = event.target;
    if (image instanceof HTMLImageElement && !image.dataset.fallbackApplied) {
      image.dataset.fallbackApplied = 'true';
      image.src = 'assets/images/fallback.svg';
    }
  }, true);

  const data = window.STAYBRIDGE_DATA;
  if (!data) {
    console.error('Không tìm thấy dữ liệu StayBridge.');
    return;
  }

  const { rooms, destinations } = data;
  const formatPrice = new Intl.NumberFormat('vi-VN');
  const allTypes = ['Homestay', 'Căn hộ', 'Nhà nguyên căn', 'Phòng riêng', 'Khách sạn', 'Nhà nghỉ'];
  const allCities = ['Hà Nội', 'Đà Nẵng', 'Đà Lạt', 'Hội An', 'Nha Trang', 'TP. Hồ Chí Minh', 'Hạ Long'];
  const allAmenities = ['Wi-Fi miễn phí', 'Máy lạnh', 'Bếp', 'Hồ bơi', 'Ban công', 'Cho phép thú cưng', 'Chỗ đỗ xe'];

  const state = {
    query: '',
    destination: '',
    guests: 1,
    maxPrice: 2000000,
    types: new Set(),
    cities: new Set(),
    amenities: new Set(),
    sort: 'popular'
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const els = {
    header: $('#siteHeader'),
    menuButton: $('#mobileMenuButton'),
    mainNav: $('#mainNav'),
    heroForm: $('#heroSearchForm'),
    heroDestination: $('#heroDestination'),
    heroGuests: $('#heroGuests'),
    heroCheckIn: $('#heroCheckIn'),
    heroCheckOut: $('#heroCheckOut'),
    favoriteSlider: $('#favoriteSlider'),
    favoritePrev: $('#favoritePrev'),
    favoriteNext: $('#favoriteNext'),
    typeFilters: $('#typeFilters'),
    cityFilters: $('#cityFilters'),
    amenityFilters: $('#amenityFilters'),
    priceRange: $('#priceRange'),
    priceValue: $('#priceValue'),
    clearFilters: $('#clearFilters'),
    roomSearch: $('#roomSearch'),
    sortRooms: $('#sortRooms'),
    resultCount: $('#resultCount'),
    activeFilters: $('#activeFilters'),
    roomGrid: $('#roomGrid'),
    emptyState: $('#emptyState'),
    emptyClearButton: $('#emptyClearButton'),
    destinationGrid: $('#destinationGrid'),
    mobileFilterButton: $('#mobileFilterButton'),
    closeFilterButton: $('#closeFilterButton'),
    filterSidebar: $('#filterSidebar'),
    filterBackdrop: $('#filterBackdrop'),
    modal: $('#contactModal'),
    contactForm: $('#contactForm'),
    contactRoomName: $('#contactRoomName'),
    contactRoomInput: $('#contactRoomInput'),
    customerName: $('#customerName'),
    customerPhone: $('#customerPhone'),
    contactCheckIn: $('#contactCheckIn'),
    contactGuests: $('#contactGuests'),
    contactError: $('#contactError'),
    toast: $('#toast')
  };

  function init() {
    setDateMinimums();
    renderFilterOptions();
    renderFavorites();
    renderDestinations();
    renderRooms();
    bindEvents();
    refreshIcons();
  }

  function refreshIcons() {
    if (window.lucide) window.lucide.createIcons();
  }

  function formatCurrency(value) {
    return `${formatPrice.format(value)}đ`;
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

  function getFavorites() {
    try {
      return JSON.parse(localStorage.getItem('staybridge-favorites')) || [];
    } catch (error) {
      return [];
    }
  }

  function saveFavorites(ids) {
    try {
      localStorage.setItem('staybridge-favorites', JSON.stringify(ids));
    } catch (error) {
      console.warn('Không thể lưu danh sách yêu thích.', error);
    }
  }

  function isFavorite(id) {
    return getFavorites().includes(id);
  }

  function toggleFavorite(id) {
    const favorites = getFavorites();
    const next = favorites.includes(id) ? favorites.filter(item => item !== id) : [...favorites, id];
    saveFavorites(next);
    updateFavoriteButtons(id, next.includes(id));
  }

  function updateFavoriteButtons(id, active) {
    $$(`[data-favorite-id="${id}"]`).forEach(button => {
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
      button.setAttribute('aria-label', active ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích');
    });
  }

  function setDateMinimums() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const toISO = date => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const todayISO = toISO(today);
    const tomorrowISO = toISO(tomorrow);

    if (els.heroCheckIn) {
      els.heroCheckIn.min = todayISO;
      els.heroCheckIn.value = todayISO;
    }
    if (els.heroCheckOut) {
      els.heroCheckOut.min = tomorrowISO;
      els.heroCheckOut.value = tomorrowISO;
    }
    if (els.contactCheckIn) {
      els.contactCheckIn.min = todayISO;
      els.contactCheckIn.value = todayISO;
    }
  }

  function countBy(field, value) {
    return rooms.filter(room => field === 'amenities' ? room.amenities.includes(value) : room[field] === value).length;
  }

  function renderFilterOptions() {
    els.typeFilters.innerHTML = allTypes.map(type => filterOption('type', type, countBy('type', type))).join('');
    els.cityFilters.innerHTML = allCities.map(city => filterOption('city', city, countBy('city', city))).join('');
    els.amenityFilters.innerHTML = allAmenities.map(amenity => filterOption('amenity', amenity, countBy('amenities', amenity))).join('');
  }

  function filterOption(group, value, count) {
    const id = `${group}-${normalizeText(value).replace(/\s+/g, '-')}`;
    return `
      <label class="check-item" for="${id}">
        <input id="${id}" type="checkbox" data-filter-group="${group}" value="${escapeHtml(value)}">
        <span>${escapeHtml(value)}</span>
        <small>${count}</small>
      </label>`;
  }

  function renderFavorites() {
    const featuredRooms = rooms.filter(room => room.featured).slice(0, 6);
    els.favoriteSlider.innerHTML = featuredRooms.map(room => `
      <article class="favorite-card">
        <a class="favorite-image" href="room-detail.html?id=${encodeURIComponent(room.id)}">
          <img src="${room.images[0]}" alt="${escapeHtml(room.name)}" loading="lazy">
          <span class="favorite-tag">Được yêu thích</span>
        </a>
        <div class="favorite-body">
          <h3><a href="room-detail.html?id=${encodeURIComponent(room.id)}">${escapeHtml(room.name)}</a></h3>
          <span class="favorite-location">${escapeHtml(room.city)}</span>
          <div class="favorite-bottom">
            <span class="favorite-rating"><i data-lucide="star"></i><strong>${room.rating}</strong> (${room.reviewCount})</span>
            <span class="favorite-price"><strong>${formatCurrency(room.price)}</strong><small>mỗi đêm</small></span>
          </div>
        </div>
      </article>`).join('');
  }

  function renderDestinations() {
    els.destinationGrid.innerHTML = destinations.map(destination => {
      const count = rooms.filter(room => room.city === destination.name).length;
      return `
        <button class="destination-card destination-trigger" type="button" data-city="${escapeHtml(destination.name)}">
          <img src="${destination.image}" alt="Chỗ ở tại ${escapeHtml(destination.name)}" loading="lazy">
          <span class="destination-count">${count} chỗ ở</span>
          <span class="destination-copy"><h3>${escapeHtml(destination.name)}</h3><p>${escapeHtml(destination.subtitle)}</p></span>
        </button>`;
    }).join('');
  }

  function getFilteredRooms() {
    const combinedQuery = normalizeText(`${state.query} ${state.destination}`);
    let result = rooms.filter(room => {
      const searchable = normalizeText(`${room.name} ${room.city} ${room.address} ${room.type}`);
      const queryMatch = !combinedQuery || combinedQuery.split(/\s+/).every(token => searchable.includes(token));
      const guestMatch = room.guests >= Number(state.guests || 1);
      const priceMatch = room.price <= Number(state.maxPrice);
      const typeMatch = state.types.size === 0 || state.types.has(room.type);
      const cityMatch = state.cities.size === 0 || state.cities.has(room.city);
      const amenityMatch = state.amenities.size === 0 || [...state.amenities].every(item => room.amenities.includes(item));
      return queryMatch && guestMatch && priceMatch && typeMatch && cityMatch && amenityMatch;
    });

    result = [...result].sort((a, b) => {
      if (state.sort === 'price-asc') return a.price - b.price;
      if (state.sort === 'price-desc') return b.price - a.price;
      if (state.sort === 'rating') return b.rating - a.rating || b.reviewCount - a.reviewCount;
      return Number(b.featured) - Number(a.featured) || b.reviewCount - a.reviewCount;
    });

    return result;
  }

  function renderRooms() {
    const result = getFilteredRooms();
    els.resultCount.textContent = `${result.length} kết quả`;
    els.roomGrid.innerHTML = result.map(roomCardTemplate).join('');
    els.emptyState.hidden = result.length !== 0;
    els.roomGrid.hidden = result.length === 0;
    renderActiveFilters();
    refreshIcons();
  }

  function roomCardTemplate(room) {
    const favorite = isFavorite(room.id);
    return `
      <article class="room-card">
        <div class="room-card-image">
          <a href="room-detail.html?id=${encodeURIComponent(room.id)}" aria-label="Xem ${escapeHtml(room.name)}">
            <img src="${room.images[0]}" alt="${escapeHtml(room.name)}" loading="lazy">
          </a>
          <div class="room-labels">
            ${room.featured ? '<span class="room-label">Nổi bật</span>' : ''}
            ${room.discount ? `<span class="room-label discount">Giảm ${room.discount}%</span>` : ''}
          </div>
          <button class="favorite-button ${favorite ? 'active' : ''}" type="button" data-favorite-id="${room.id}" aria-label="${favorite ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}" aria-pressed="${favorite}">
            <i data-lucide="heart"></i>
          </button>
        </div>
        <div class="room-card-body">
          <div class="room-card-top">
            <h3><a href="room-detail.html?id=${encodeURIComponent(room.id)}">${escapeHtml(room.name)}</a></h3>
            <span class="rating-badge"><i data-lucide="star"></i><strong>${room.rating}</strong></span>
          </div>
          <p class="room-address"><i data-lucide="map-pin"></i><span>${escapeHtml(room.address)}</span></p>
          <div class="room-facts">
            <span><i data-lucide="users"></i>${room.guests} khách</span>
            <span><i data-lucide="door-open"></i>${room.bedrooms} phòng ngủ</span>
            <span><i data-lucide="bed-double"></i>${room.beds} giường</span>
            <span><i data-lucide="message-square-text"></i>${room.reviewCount} đánh giá</span>
          </div>
          <div class="room-card-bottom">
            <div class="room-price"><small>Giá mỗi đêm</small><strong>${formatCurrency(room.price)}</strong>${room.oldPrice ? `<del>${formatCurrency(room.oldPrice)}</del>` : ''}</div>
            <button class="button button-primary open-contact" type="button" data-room-id="${room.id}" data-room-name="${escapeHtml(room.name)}">Liên hệ đặt phòng</button>
          </div>
        </div>
      </article>`;
  }

  function renderActiveFilters() {
    const chips = [];
    if (state.destination) chips.push(chip('destination', state.destination));
    if (Number(state.guests) > 1) chips.push(chip('guests', `${state.guests} khách`));
    if (Number(state.maxPrice) < 2000000) chips.push(chip('price', `Tối đa ${formatCurrency(state.maxPrice)}`));
    state.types.forEach(value => chips.push(chip('type', value)));
    state.cities.forEach(value => chips.push(chip('city', value)));
    state.amenities.forEach(value => chips.push(chip('amenity', value)));
    els.activeFilters.innerHTML = chips.join('');
  }

  function chip(group, label) {
    return `<button class="filter-chip" type="button" data-chip-group="${group}" data-chip-value="${escapeHtml(label)}">${escapeHtml(label)}<i data-lucide="x"></i></button>`;
  }

  function clearAllFilters() {
    state.query = '';
    state.destination = '';
    state.guests = 1;
    state.maxPrice = 2000000;
    state.types.clear();
    state.cities.clear();
    state.amenities.clear();
    state.sort = 'popular';

    els.roomSearch.value = '';
    els.heroDestination.value = '';
    els.heroGuests.value = '2';
    els.priceRange.value = '2000000';
    els.priceValue.textContent = formatCurrency(2000000);
    els.sortRooms.value = 'popular';
    $$('[data-filter-group]').forEach(input => { input.checked = false; });
    renderRooms();
  }

  function removeChip(group, label) {
    if (group === 'destination') {
      state.destination = '';
      els.heroDestination.value = '';
    } else if (group === 'guests') {
      state.guests = 1;
    } else if (group === 'price') {
      state.maxPrice = 2000000;
      els.priceRange.value = '2000000';
      els.priceValue.textContent = formatCurrency(2000000);
    } else {
      const rawValue = label;
      const targetSet = group === 'type' ? state.types : group === 'city' ? state.cities : state.amenities;
      targetSet.delete(rawValue);
      const input = $$(`[data-filter-group="${group}"]`).find(item => item.value === rawValue);
      if (input) input.checked = false;
    }
    renderRooms();
  }

  function applyDestination(city) {
    state.destination = '';
    state.cities.clear();
    state.cities.add(city);
    $$('[data-filter-group="city"]').forEach(input => { input.checked = input.value === city; });
    renderRooms();
    closeFilterDrawer();
    $('#rooms').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function openFilterDrawer() {
    els.filterSidebar.classList.add('open');
    els.filterBackdrop.classList.add('show');
    document.body.classList.add('drawer-open');
  }

  function closeFilterDrawer() {
    els.filterSidebar.classList.remove('open');
    els.filterBackdrop.classList.remove('show');
    document.body.classList.remove('drawer-open');
  }

  function openModal(roomName = 'Tư vấn chỗ ở', roomId = '') {
    els.contactRoomName.textContent = `Yêu cầu cho: ${roomName}. Đội ngũ tư vấn sẽ liên hệ lại để xác nhận thông tin.`;
    els.contactRoomInput.value = roomId;
    els.contactError.textContent = '';
    els.modal.classList.add('open');
    els.modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    setTimeout(() => els.customerName.focus(), 50);
  }

  function closeModal() {
    els.modal.classList.remove('open');
    els.modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  function validateContactForm() {
    const name = els.customerName.value.trim();
    const phone = els.customerPhone.value.replace(/\s+/g, '');
    const phonePattern = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
    if (name.length < 2) return 'Vui lòng nhập họ và tên hợp lệ.';
    if (!phonePattern.test(phone)) return 'Vui lòng nhập số điện thoại Việt Nam hợp lệ.';
    if (!els.contactCheckIn.value) return 'Vui lòng chọn ngày nhận phòng.';
    if (!els.contactGuests.value) return 'Vui lòng chọn số khách.';
    return '';
  }

  function showToast(message) {
    const span = $('span', els.toast);
    if (span) span.textContent = message;
    els.toast.classList.add('show');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => els.toast.classList.remove('show'), 3200);
  }

  function bindEvents() {
    window.addEventListener('scroll', () => els.header.classList.toggle('scrolled', window.scrollY > 18), { passive: true });

    els.menuButton.addEventListener('click', () => {
      const open = els.mainNav.classList.toggle('open');
      els.menuButton.setAttribute('aria-expanded', String(open));
      els.menuButton.innerHTML = `<i data-lucide="${open ? 'x' : 'menu'}"></i>`;
      refreshIcons();
    });

    $$('a', els.mainNav).forEach(link => link.addEventListener('click', () => {
      els.mainNav.classList.remove('open');
      els.menuButton.setAttribute('aria-expanded', 'false');
    }));

    els.heroCheckIn.addEventListener('change', () => {
      if (!els.heroCheckIn.value) return;
      const nextDay = new Date(`${els.heroCheckIn.value}T12:00:00`);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayISO = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`;
      els.heroCheckOut.min = nextDayISO;
      if (!els.heroCheckOut.value || els.heroCheckOut.value <= els.heroCheckIn.value) els.heroCheckOut.value = nextDayISO;
    });

    els.heroForm.addEventListener('submit', event => {
      event.preventDefault();
      state.destination = els.heroDestination.value.trim();
      state.guests = Number(els.heroGuests.value || 1);
      renderRooms();
      $('#rooms').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    els.favoritePrev.addEventListener('click', () => els.favoriteSlider.scrollBy({ left: -320, behavior: 'smooth' }));
    els.favoriteNext.addEventListener('click', () => els.favoriteSlider.scrollBy({ left: 320, behavior: 'smooth' }));

    document.addEventListener('change', event => {
      const input = event.target.closest('[data-filter-group]');
      if (!input) return;
      const group = input.dataset.filterGroup;
      const targetSet = group === 'type' ? state.types : group === 'city' ? state.cities : state.amenities;
      input.checked ? targetSet.add(input.value) : targetSet.delete(input.value);
      renderRooms();
    });

    els.priceRange.addEventListener('input', () => {
      state.maxPrice = Number(els.priceRange.value);
      els.priceValue.textContent = formatCurrency(state.maxPrice);
      renderRooms();
    });

    els.roomSearch.addEventListener('input', () => {
      state.query = els.roomSearch.value.trim();
      renderRooms();
    });

    els.sortRooms.addEventListener('change', () => {
      state.sort = els.sortRooms.value;
      renderRooms();
    });

    els.clearFilters.addEventListener('click', clearAllFilters);
    els.emptyClearButton.addEventListener('click', clearAllFilters);
    els.mobileFilterButton.addEventListener('click', openFilterDrawer);
    els.closeFilterButton.addEventListener('click', closeFilterDrawer);
    els.filterBackdrop.addEventListener('click', closeFilterDrawer);

    document.addEventListener('click', event => {
      const favoriteButton = event.target.closest('[data-favorite-id]');
      if (favoriteButton) {
        event.preventDefault();
        toggleFavorite(favoriteButton.dataset.favoriteId);
        return;
      }

      const destinationButton = event.target.closest('.destination-trigger');
      if (destinationButton?.dataset.city) {
        event.preventDefault();
        applyDestination(destinationButton.dataset.city);
        return;
      }

      const chipButton = event.target.closest('[data-chip-group]');
      if (chipButton) {
        removeChip(chipButton.dataset.chipGroup, chipButton.dataset.chipValue);
        return;
      }

      const contactButton = event.target.closest('.open-contact');
      if (contactButton) {
        event.preventDefault();
        openModal(contactButton.dataset.roomName || 'Tư vấn chỗ ở', contactButton.dataset.roomId || '');
      }
    });

    $$('[data-close-modal]').forEach(element => element.addEventListener('click', closeModal));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        closeModal();
        closeFilterDrawer();
        els.mainNav.classList.remove('open');
      }
    });

    els.contactForm.addEventListener('submit', event => {
      event.preventDefault();
      const error = validateContactForm();
      els.contactError.textContent = error;
      if (error) return;
      els.contactForm.reset();
      setDateMinimums();
      closeModal();
      showToast('Gửi yêu cầu thành công. StayBridge sẽ sớm liên hệ với bạn.');
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  document.addEventListener('DOMContentLoaded', init);
})();

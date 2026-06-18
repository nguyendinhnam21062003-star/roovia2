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

  const { rooms, reviews } = data;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const formatPrice = new Intl.NumberFormat('vi-VN');
  const params = new URLSearchParams(window.location.search);
  const roomId = params.get('id');
  const room = rooms.find(item => item.id === roomId) || rooms[0];
  let currentImageIndex = 0;
  let reviewsExpanded = false;

  const els = {
    header: $('#siteHeader'),
    menuButton: $('#mobileMenuButton'),
    mainNav: $('#mainNav'),
    breadcrumbRoom: $('#breadcrumbRoom'),
    mainImage: $('#galleryMainImage'),
    mainImageButton: $('#galleryMainButton'),
    galleryCounter: $('#galleryCounter'),
    galleryThumbs: $('#galleryThumbs'),
    viewAllPhotos: $('#viewAllPhotos'),
    bookingPrice: $('#bookingPrice'),
    bookingForm: $('#bookingForm'),
    detailCheckIn: $('#detailCheckIn'),
    detailCheckOut: $('#detailCheckOut'),
    detailGuests: $('#detailGuests'),
    detailName: $('#detailName'),
    detailRating: $('#detailRating'),
    detailReviews: $('#detailReviews'),
    detailType: $('#detailType'),
    detailAddress: $('#detailAddress'),
    detailFavorite: $('#detailFavorite'),
    shareButton: $('#shareButton'),
    detailFacts: $('#detailFacts'),
    descriptionCopy: $('#descriptionCopy'),
    toggleDescription: $('#toggleDescription'),
    highlightAmenities: $('#highlightAmenities'),
    roomInformation: $('#roomInformation'),
    roomPolicies: $('#roomPolicies'),
    amenityGroups: $('#amenityGroups'),
    mapAddress: $('#mapAddress'),
    mapCity: $('#mapCity'),
    mapFrame: $('#mapFrame'),
    mapExternalLink: $('#mapExternalLink'),
    reviewScore: $('#reviewScore'),
    reviewCountLabel: $('#reviewCountLabel'),
    reviewMetrics: $('#reviewMetrics'),
    reviewList: $('#reviewList'),
    showAllReviews: $('#showAllReviews'),
    similarGrid: $('#similarGrid'),
    lightbox: $('#lightbox'),
    lightboxImage: $('#lightboxImage'),
    lightboxCaption: $('#lightboxCaption'),
    lightboxPrev: $('#lightboxPrev'),
    lightboxNext: $('#lightboxNext'),
    modal: $('#contactModal'),
    contactForm: $('#contactForm'),
    contactRoomName: $('#contactRoomName'),
    customerName: $('#customerName'),
    customerPhone: $('#customerPhone'),
    contactCheckIn: $('#contactCheckIn'),
    contactGuests: $('#contactGuests'),
    contactError: $('#contactError'),
    toast: $('#toast')
  };

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
    { name: 'Nhà bếp', icon: 'cooking-pot', items: ['Ấm đun nước', 'Tủ lạnh', 'Bộ dụng cụ ăn uống', room.amenities.includes('Bếp') ? 'Bếp nấu riêng' : 'Khu pha đồ uống'] },
    { name: 'Kết nối', icon: 'wifi', items: ['Wi-Fi tốc độ cao', 'Smart TV', 'Bàn làm việc', 'Ổ cắm đa năng'] },
    { name: 'An toàn', icon: 'shield-check', items: ['Khóa cửa an toàn', 'Bình chữa cháy', 'Camera khu vực chung', 'Hướng dẫn khẩn cấp'] },
    { name: 'Ngoài trời', icon: 'trees', items: [room.amenities.includes('Ban công') ? 'Ban công riêng' : 'Khu vực chung', 'Không gian xanh', 'Khu vực ngồi nghỉ', room.amenities.includes('Chỗ đỗ xe') ? 'Chỗ đỗ xe' : 'Điểm đón xe thuận tiện'] }
  ];

  function init() {
    setDateMinimums();
    renderRoom();
    bindEvents();
    refreshIcons();
  }

  function refreshIcons() {
    if (window.lucide) window.lucide.createIcons();
  }

  function formatCurrency(value) {
    return `${formatPrice.format(value)}đ`;
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

  function setFavoriteState(active) {
    els.detailFavorite.classList.toggle('active', active);
    els.detailFavorite.setAttribute('aria-pressed', String(active));
    els.detailFavorite.innerHTML = `<i data-lucide="heart"></i>${active ? 'Đã yêu thích' : 'Yêu thích'}`;
    $$(`[data-favorite-id="${room.id}"]`).forEach(button => {
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    refreshIcons();
  }

  function toggleFavorite() {
    const favorites = getFavorites();
    const active = favorites.includes(room.id);
    const next = active ? favorites.filter(id => id !== room.id) : [...favorites, room.id];
    saveFavorites(next);
    setFavoriteState(!active);
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

    els.detailCheckIn.min = todayISO;
    els.detailCheckIn.value = todayISO;
    els.detailCheckOut.min = tomorrowISO;
    els.detailCheckOut.value = tomorrowISO;
    els.contactCheckIn.min = todayISO;
    els.contactCheckIn.value = todayISO;
  }

  function renderRoom() {
    document.title = `${room.name} — StayBridge`;
    els.breadcrumbRoom.textContent = room.name;
    els.bookingPrice.textContent = formatCurrency(room.price);
    els.detailName.textContent = room.name;
    els.detailRating.textContent = room.rating.toFixed(1);
    els.detailReviews.textContent = `${room.reviewCount} đánh giá`;
    els.detailType.textContent = room.type;
    els.detailAddress.textContent = room.address;
    els.descriptionCopy.innerHTML = `<p>${escapeHtml(room.description)} Không gian được chuẩn bị trước mỗi lượt khách, đồng thời đội ngũ StayBridge có thể hỗ trợ thêm thông tin về di chuyển, nhận phòng và các yêu cầu lưu trú phù hợp.</p>`;
    els.mapAddress.textContent = room.address;
    els.mapCity.textContent = room.city;
    els.reviewScore.textContent = room.rating.toFixed(1);
    els.reviewCountLabel.textContent = `Dựa trên ${room.reviewCount} đánh giá`;

    renderGallery();
    renderFacts();
    renderHighlights();
    renderInformation();
    renderPolicies();
    renderAmenityGroups();
    renderMap();
    renderReviewMetrics();
    renderReviews();
    renderSimilarRooms();
    setFavoriteState(isFavorite(room.id));
  }

  function renderGallery() {
    updateGalleryImage(0);
    els.galleryThumbs.innerHTML = room.images.slice(1, 4).map((image, index) => `
      <button class="gallery-thumb" type="button" data-gallery-index="${index + 1}" aria-label="Xem ảnh ${index + 2}">
        <img src="${image}" alt="${escapeHtml(room.name)} - ảnh ${index + 2}" loading="lazy">
      </button>`).join('');
  }

  function updateGalleryImage(index) {
    currentImageIndex = (index + room.images.length) % room.images.length;
    els.mainImage.src = room.images[currentImageIndex];
    els.mainImage.alt = `${room.name} - ảnh ${currentImageIndex + 1}`;
    els.galleryCounter.textContent = `${currentImageIndex + 1} / ${room.images.length}`;
    $$('[data-gallery-index]').forEach(button => button.classList.toggle('active', Number(button.dataset.galleryIndex) === currentImageIndex));
  }

  function renderFacts() {
    const facts = [
      ['users', `${room.guests} khách`, 'Sức chứa tối đa'],
      ['door-open', `${room.bedrooms} phòng ngủ`, 'Không gian riêng'],
      ['bed-double', `${room.beds} giường`, 'Bố trí linh hoạt'],
      ['bath', `${room.bathrooms} phòng tắm`, 'Tiện nghi riêng'],
      ['maximize', `${room.area} m²`, 'Diện tích sử dụng'],
      ['building-2', room.type, 'Loại hình lưu trú']
    ];
    els.detailFacts.innerHTML = facts.map(([icon, value, label]) => `
      <div class="detail-fact"><span><i data-lucide="${icon}"></i></span><div><strong>${escapeHtml(value)}</strong><small>${escapeHtml(label)}</small></div></div>`).join('');
  }

  function renderHighlights() {
    const items = [...room.amenities, 'Bàn làm việc', 'Ấm đun nước', 'Máy sấy tóc', 'Đồ vệ sinh cá nhân'].slice(0, 6);
    els.highlightAmenities.innerHTML = items.map(item => `<li><i data-lucide="${amenityIconMap[item] || 'check'}"></i>${escapeHtml(item)}</li>`).join('');
  }

  function renderInformation() {
    const rows = [
      ['Số khách', `${room.guests} người`],
      ['Phòng ngủ', room.bedrooms],
      ['Giường', room.beds],
      ['Phòng tắm', room.bathrooms],
      ['Diện tích', `${room.area} m²`],
      ['Loại phòng', room.type]
    ];
    els.roomInformation.innerHTML = rows.map(([term, value]) => `<div><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('');
  }

  function renderPolicies() {
    const rows = [
      ['Nhận phòng', `Từ ${room.policies.checkIn}`],
      ['Trả phòng', `Trước ${room.policies.checkOut}`],
      ['Hủy phòng', room.policies.cancellation],
      ['Hút thuốc', room.policies.smoking ? 'Cho phép' : 'Không cho phép'],
      ['Thú cưng', room.policies.pets ? 'Cho phép' : 'Không cho phép']
    ];
    els.roomPolicies.innerHTML = rows.map(([term, value]) => `<div><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('');
  }

  function renderAmenityGroups() {
    els.amenityGroups.innerHTML = amenityGroups.map(group => `
      <article class="amenity-group">
        <div class="amenity-group-head"><span><i data-lucide="${group.icon}"></i></span><h3>${escapeHtml(group.name)}</h3></div>
        <ul>${group.items.map(item => `<li><i data-lucide="check"></i>${escapeHtml(item)}</li>`).join('')}</ul>
      </article>`).join('');
  }

  function renderMap() {
    const encodedAddress = encodeURIComponent(room.address);
    els.mapFrame.src = `https://www.google.com/maps?q=${encodedAddress}&output=embed`;
    els.mapExternalLink.href = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  }

  function renderReviewMetrics() {
    const metrics = [
      ['Sạch sẽ', Math.min(5, room.rating + 0.1)],
      ['Vị trí', Math.min(5, room.rating)],
      ['Tiện nghi', Math.max(4.3, room.rating - 0.1)],
      ['Phục vụ', Math.min(5, room.rating + 0.1)],
      ['Giá trị', Math.max(4.3, room.rating - 0.2)]
    ];
    els.reviewMetrics.innerHTML = metrics.map(([name, score]) => `
      <div class="metric-row"><span>${escapeHtml(name)}</span><span class="metric-track"><span class="metric-fill" style="width:${score / 5 * 100}%"></span></span><strong>${score.toFixed(1)}</strong></div>`).join('');
  }

  function renderReviews() {
    const visibleReviews = reviewsExpanded ? [...reviews, ...reviews.map((review, index) => ({ ...review, name: `${review.name} ${index + 2}`, date: '15/02/2026' }))] : reviews;
    els.reviewList.innerHTML = visibleReviews.map(review => `
      <article class="review-card">
        <div class="review-card-head">
          <span class="review-avatar">${escapeHtml(review.avatar)}</span>
          <div><strong>${escapeHtml(review.name)}</strong><small>${escapeHtml(review.date)}</small></div>
          <span class="review-stars" aria-label="${review.rating} sao">${Array.from({ length: 5 }, (_, index) => `<i data-lucide="star" style="opacity:${index < review.rating ? 1 : .24}"></i>`).join('')}</span>
        </div>
        <p>${escapeHtml(review.text)}</p>
      </article>`).join('');
    els.showAllReviews.textContent = reviewsExpanded ? 'Thu gọn đánh giá' : 'Xem tất cả đánh giá';
    refreshIcons();
  }

  function renderSimilarRooms() {
    const similar = rooms
      .filter(item => item.id !== room.id)
      .sort((a, b) => {
        const aScore = Number(a.city === room.city) * 2 + Number(a.type === room.type);
        const bScore = Number(b.city === room.city) * 2 + Number(b.type === room.type);
        return bScore - aScore || b.rating - a.rating;
      })
      .slice(0, 4);

    els.similarGrid.innerHTML = similar.map(item => `
      <article class="similar-card">
        <div class="similar-image">
          <a href="room-detail.html?id=${encodeURIComponent(item.id)}"><img src="${item.images[0]}" alt="${escapeHtml(item.name)}" loading="lazy"></a>
          <button class="favorite-button ${isFavorite(item.id) ? 'active' : ''}" type="button" data-favorite-id="${item.id}" aria-label="Thêm vào yêu thích" aria-pressed="${isFavorite(item.id)}"><i data-lucide="heart"></i></button>
        </div>
        <div class="similar-card-body">
          <div class="similar-meta"><span>${escapeHtml(item.type)}</span><span class="rating-badge"><i data-lucide="star"></i><strong>${item.rating}</strong></span></div>
          <h3><a href="room-detail.html?id=${encodeURIComponent(item.id)}">${escapeHtml(item.name)}</a></h3>
          <div class="similar-location">${escapeHtml(item.city)}</div>
          <div class="similar-price">${formatCurrency(item.price)} <small>/đêm</small></div>
        </div>
      </article>`).join('');
  }

  function openLightbox(index = currentImageIndex) {
    currentImageIndex = (index + room.images.length) % room.images.length;
    els.lightboxImage.src = room.images[currentImageIndex];
    els.lightboxImage.alt = `${room.name} - ảnh ${currentImageIndex + 1}`;
    els.lightboxCaption.textContent = `${currentImageIndex + 1} / ${room.images.length}`;
    els.lightbox.classList.add('open');
    els.lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
  }

  function closeLightbox() {
    els.lightbox.classList.remove('open');
    els.lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
  }

  function openModal() {
    els.contactRoomName.textContent = `Yêu cầu cho: ${room.name}. Đội ngũ tư vấn sẽ liên hệ lại để xác nhận thông tin.`;
    els.contactError.textContent = '';
    els.contactCheckIn.value = els.detailCheckIn.value || els.contactCheckIn.value;
    els.contactGuests.value = els.detailGuests.value || '';
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

  async function shareRoom() {
    const shareData = { title: room.name, text: `Xem ${room.name} trên StayBridge`, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Đã sao chép liên kết phòng.');
      } else {
        const temp = document.createElement('textarea');
        temp.value = window.location.href;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        temp.remove();
        showToast('Đã sao chép liên kết phòng.');
      }
    } catch (error) {
      if (error.name !== 'AbortError') showToast('Không thể chia sẻ liên kết lúc này.');
    }
  }

  function bindEvents() {
    window.addEventListener('scroll', () => els.header.classList.toggle('scrolled', window.scrollY > 12), { passive: true });

    els.menuButton.addEventListener('click', () => {
      const open = els.mainNav.classList.toggle('open');
      els.menuButton.setAttribute('aria-expanded', String(open));
      els.menuButton.innerHTML = `<i data-lucide="${open ? 'x' : 'menu'}"></i>`;
      refreshIcons();
    });

    $$('a', els.mainNav).forEach(link => link.addEventListener('click', () => els.mainNav.classList.remove('open')));

    els.detailCheckIn.addEventListener('change', () => {
      if (!els.detailCheckIn.value) return;
      const nextDay = new Date(`${els.detailCheckIn.value}T12:00:00`);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayISO = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`;
      els.detailCheckOut.min = nextDayISO;
      if (!els.detailCheckOut.value || els.detailCheckOut.value <= els.detailCheckIn.value) els.detailCheckOut.value = nextDayISO;
    });

    els.galleryThumbs.addEventListener('click', event => {
      const button = event.target.closest('[data-gallery-index]');
      if (!button) return;
      updateGalleryImage(Number(button.dataset.galleryIndex));
    });

    els.mainImageButton.addEventListener('click', () => openLightbox(currentImageIndex));
    els.viewAllPhotos.addEventListener('click', () => openLightbox(0));
    els.lightboxPrev.addEventListener('click', () => openLightbox(currentImageIndex - 1));
    els.lightboxNext.addEventListener('click', () => openLightbox(currentImageIndex + 1));
    $$('[data-close-lightbox]').forEach(element => element.addEventListener('click', closeLightbox));

    els.bookingForm.addEventListener('submit', event => {
      event.preventDefault();
      openModal();
    });

    document.addEventListener('click', event => {
      const contactButton = event.target.closest('.open-contact');
      if (contactButton && contactButton.type !== 'submit') {
        event.preventDefault();
        openModal();
        return;
      }

      const favoriteButton = event.target.closest('[data-favorite-id]');
      if (favoriteButton) {
        event.preventDefault();
        const id = favoriteButton.dataset.favoriteId;
        const favorites = getFavorites();
        const next = favorites.includes(id) ? favorites.filter(item => item !== id) : [...favorites, id];
        saveFavorites(next);
        favoriteButton.classList.toggle('active', next.includes(id));
        favoriteButton.setAttribute('aria-pressed', String(next.includes(id)));
      }
    });

    els.detailFavorite.addEventListener('click', toggleFavorite);
    els.shareButton.addEventListener('click', shareRoom);

    els.toggleDescription.addEventListener('click', () => {
      const collapsed = els.descriptionCopy.classList.toggle('collapsed');
      els.toggleDescription.innerHTML = `${collapsed ? 'Xem thêm' : 'Thu gọn'} <i data-lucide="chevron-${collapsed ? 'down' : 'up'}"></i>`;
      refreshIcons();
    });

    els.showAllReviews.addEventListener('click', () => {
      reviewsExpanded = !reviewsExpanded;
      renderReviews();
    });

    $$('[data-close-modal]').forEach(element => element.addEventListener('click', closeModal));
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

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        closeModal();
        closeLightbox();
        els.mainNav.classList.remove('open');
      }
      if (els.lightbox.classList.contains('open') && event.key === 'ArrowLeft') openLightbox(currentImageIndex - 1);
      if (els.lightbox.classList.contains('open') && event.key === 'ArrowRight') openLightbox(currentImageIndex + 1);
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

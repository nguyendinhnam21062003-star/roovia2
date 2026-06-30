const SUPPORT_PHONE = '0901 234 567';
const SUPPORT_EMAIL = 'hello@staybridge.vn';
const CHATBOT_BRAND = 'Roovia';

function buildSupportFooter() {
  return `Cần hỗ trợ gấp? Hotline: ${SUPPORT_PHONE}\nEmail: ${SUPPORT_EMAIL}`;
}

function buildQuickAction(id, label, kind, extra = {}) {
  return {
    id,
    label,
    kind,
    ...extra
  };
}

export function formatDateLabel(value) {
  if (!value) return '';
  const [year, month, day] = String(value).split('-');
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

export function getChatbotBrand() {
  return CHATBOT_BRAND;
}

export function buildAdviceReply() {
  return {
    text: `Xin chào, ${CHATBOT_BRAND} có thể hỗ trợ bạn về:\n• Tìm phòng lưu trú\n• Đặt vé máy bay\n• Tìm tour du lịch\n• Trở thành đối tác ${CHATBOT_BRAND}`,
    actions: [
      buildQuickAction('topic-stay', 'Tìm phòng lưu trú', 'topic-stay'),
      buildQuickAction('topic-flight', 'Đặt vé máy bay', 'topic-flight'),
      buildQuickAction('topic-tour', 'Tìm tour du lịch', 'topic-tour'),
      buildQuickAction('topic-partner', 'Trở thành đối tác', 'topic-partner')
    ]
  };
}

export function buildStayAreaReply(destinations = []) {
  return {
    text: 'Bạn muốn tìm phòng tại khu vực nào? Vui lòng chọn địa điểm bên dưới:',
    actions: [
      ...destinations.map(city => buildQuickAction(`stay-city-${city}`, city, 'stay-city', { city })),
      buildQuickAction('stay-city-no-match', 'Không tìm thấy khu vực phù hợp', 'stay-no-match')
    ]
  };
}

export function buildStayFoundReply(city, count) {
  return {
    text: `${CHATBOT_BRAND} đã tìm thấy ${count} phòng tại ${city}. Bạn có thể xem nhanh các lựa chọn phù hợp ngay trên trang danh sách.`,
    actions: [buildQuickAction(`show-city-${city}`, `Xem thêm phòng tại ${city}`, 'show-city-rooms', { city, tone: 'primary' })]
  };
}

export function buildStayNotFoundReply() {
  return {
    text:
      `Hiện ${CHATBOT_BRAND} chưa có phòng phù hợp tại khu vực bạn chọn. Hãy để lại thông tin liên hệ, chúng tôi sẽ hỗ trợ kết nối với đơn vị lưu trú phù hợp.\n\n` +
      `${CHATBOT_BRAND} hỗ trợ:\n• Kiểm tra thông tin đơn vị lưu trú để giảm rủi ro khi giao dịch.\n• Tìm kiếm lựa chọn phù hợp, giúp bạn tiết kiệm thời gian liên hệ nhiều nơi.\n\n` +
      `Vui lòng để lại họ tên, số điện thoại hoặc Zalo để ${CHATBOT_BRAND} liên hệ hỗ trợ.\n\n` +
      buildSupportFooter()
  };
}

export function buildFlightReply() {
  return {
    text:
      'Bạn cần bay từ sân bay nào đến sân bay nào?\n\n' +
      'Vui lòng để lại các thông tin sau:\n' +
      '• Điểm đi và điểm đến\n' +
      '• Ngày bay dự kiến\n' +
      '• Số lượng hành khách\n' +
      '• Số điện thoại hoặc Zalo liên hệ\n\n' +
      `${CHATBOT_BRAND} sẽ liên hệ để hỗ trợ bạn trong thời gian sớm nhất.\n\n` +
      buildSupportFooter()
  };
}

export function buildTourReply() {
  return {
    text:
      `Hiện ${CHATBOT_BRAND} hỗ trợ tìm tour theo nhu cầu riêng của bạn.\n\n` +
      'Vui lòng để lại:\n' +
      '• Điểm đến mong muốn\n' +
      '• Thời gian dự kiến\n' +
      '• Ngân sách tham khảo\n' +
      '• Số điện thoại hoặc Zalo liên hệ\n\n' +
      `${CHATBOT_BRAND} sẽ kết nối đơn vị lữ hành phù hợp trong thời gian sớm nhất.\n\n` +
      buildSupportFooter()
  };
}

export function buildPartnerReply() {
  return {
    text:
      `${CHATBOT_BRAND} đã ghi nhận nhu cầu hợp tác của bạn.\n\n` +
      'Vui lòng để lại:\n' +
      '• Họ và tên\n' +
      '• Số điện thoại hoặc Zalo\n' +
      '• Loại hình hợp tác mong muốn\n' +
      '• Thông tin mô tả ngắn về dịch vụ hoặc sản phẩm của bạn\n\n' +
      'Bộ phận chăm sóc đối tác sẽ liên hệ trong thời gian sớm nhất.\n\n' +
      buildSupportFooter()
  };
}

export function buildRoomContactReply(room) {
  const roomLabel = room?.name ? ` cho ${room.name}` : '';
  const cityLabel = room?.city ? ` tại ${room.city}` : '';

  return {
    text:
      `${CHATBOT_BRAND} đã ghi nhận nhu cầu liên hệ đặt phòng${roomLabel}${cityLabel}.\n\n` +
      'Vui lòng để lại họ tên, số điện thoại hoặc Zalo để đội ngũ tư vấn liên hệ xác nhận và hỗ trợ nhanh cho bạn.\n\n' +
      buildSupportFooter()
  };
}

export function buildRoomBookingReply({ room, checkIn, checkOut, guests }) {
  const facts = [
    room?.name ? `Phòng: ${room.name}` : '',
    room?.city ? `Khu vực: ${room.city}` : '',
    checkIn ? `Nhận phòng: ${formatDateLabel(checkIn)}` : '',
    checkOut ? `Trả phòng: ${formatDateLabel(checkOut)}` : '',
    guests ? `Số khách: ${guests}` : ''
  ].filter(Boolean);

  return {
    text:
      `${CHATBOT_BRAND} đã ghi nhận yêu cầu đặt phòng của bạn.\n\n` +
      `${facts.join('\n')}\n\n` +
      'Vui lòng để lại họ tên, số điện thoại hoặc Zalo để đội ngũ xác nhận phòng và liên hệ hỗ trợ trong thời gian sớm nhất.\n\n' +
      buildSupportFooter()
  };
}

export function buildManualReply() {
  return {
    text:
      `${CHATBOT_BRAND} đã nhận được tin nhắn của bạn.\n\n` +
      'Vui lòng để lại họ tên, số điện thoại hoặc Zalo, đội ngũ tư vấn sẽ liên hệ hỗ trợ trong thời gian sớm nhất.\n\n' +
      buildSupportFooter()
  };
}

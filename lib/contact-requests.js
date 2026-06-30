const GENERAL_SERVICES = [
  'Giải đáp thắc mắc',
  'Hỗ trợ tìm kiếm và đặt phòng',
  'Đặt vé máy bay',
  'Tư vấn tour du lịch',
  'Trở thành đối tác'
];

export function getGeneralServices() {
  return GENERAL_SERVICES;
}

export function createGeneralContactRequest() {
  return {
    id: 'general',
    title: 'Nhận tư vấn',
    submitLabel: 'Gửi yêu cầu tư vấn',
    servicePreset: '',
    showServicePicker: true
  };
}

export function createPartnerContactRequest() {
  return {
    id: 'partner',
    title: 'Trở thành đối tác',
    submitLabel: 'Gửi thông tin hợp tác',
    servicePreset: 'Trở thành đối tác',
    showServicePicker: false
  };
}

export function createRoomContactRequest(roomName) {
  return {
    id: 'room-contact',
    title: 'Liên hệ đặt phòng',
    submitLabel: 'Gửi thông tin liên hệ',
    servicePreset: roomName ? `Tư vấn đặt phòng ${roomName}` : 'Tư vấn đặt phòng',
    showServicePicker: false
  };
}

export function createRoomBookingRequest(roomName) {
  return {
    id: 'room-booking',
    title: 'Đặt ngay',
    submitLabel: 'Gửi yêu cầu đặt phòng',
    servicePreset: roomName ? `Tư vấn đặt phòng ${roomName}` : 'Tư vấn đặt phòng',
    showServicePicker: false
  };
}

function formatDate(value) {
  if (!value) return '';
  const [year, month, day] = String(value).split('-');
  if (!year || !month || !day) return String(value);
  return `${day}/${month}/${year}`;
}

function formatGuestCount(value) {
  const text = String(value || '').trim();
  return text ? `${text} khách` : '';
}

function buildSubject(roomName) {
  return String(roomName || '').trim();
}

function buildRequestText({ mode = 'consultation', roomName = '', checkIn = '', checkOut = '', guests = '' }) {
  const subject = buildSubject(roomName);
  const subjectText = subject ? ` ${subject}` : '';

  if (mode === 'booking') {
    const segments = [`Tôi muốn đặt phòng${subjectText}`];
    const details = [checkIn ? `ngày nhận ${formatDate(checkIn)}` : '', checkOut ? `ngày trả ${formatDate(checkOut)}` : '', guests ? `số lượng ${formatGuestCount(guests)}` : '']
      .filter(Boolean)
      .join(', ');

    return details ? `${segments[0]}, ${details}.` : `${segments[0]}.`;
  }

  return `Tôi cần tư vấn đặt phòng${subjectText}.`;
}

function buildReplyModel({ mode = 'consultation', roomName = '', checkIn = '', checkOut = '', guests = '' }) {
  const isBooking = mode === 'booking';
  const subject = buildSubject(roomName);
  const subjectText = subject ? ` ${subject}` : '';
  const requestLabel = isBooking ? 'đặt phòng' : 'tư vấn đặt phòng';

  const intro = `Xin chào quý khách, chúng tôi đã nhận được yêu cầu ${requestLabel}${subjectText} của quý khách.`;
  const highlights = [
    { label: 'Loại yêu cầu', value: isBooking ? 'Đặt phòng' : 'Tư vấn' },
    subject ? { label: 'Phòng', value: subject } : null,
    checkIn ? { label: 'Ngày nhận', value: formatDate(checkIn) } : null,
    isBooking && checkOut ? { label: 'Ngày trả', value: formatDate(checkOut) } : null,
    guests ? { label: 'Số lượng', value: formatGuestCount(guests) } : null
  ].filter(Boolean);

  return {
    intro,
    requestLabel,
    subject,
    highlights,
    note: 'Vui lòng để lại số điện thoại hoặc Zalo cá nhân, nhân viên kinh doanh sẽ liên lạc để hỗ trợ quý khách.',
    emergency: 'Trong trường hợp quý khách cần hỗ trợ gấp, quý khách có thể gọi tới số điện thoại 0328495797. Hoặc ZALO, FANPAGE FB.',
    contacts: [
      { label: '0328495797', href: 'tel:0328495797', icon: 'phone', kind: 'link', tone: 'call' },
      { label: 'ZALO', icon: 'message-circle', kind: 'tag', tone: 'soft' },
      { label: 'FANPAGE FB', icon: 'facebook', kind: 'tag', tone: 'soft' }
    ]
  };
}

export function buildChatConversation(params) {
  return [
    {
      id: 'visitor',
      role: 'user',
      text: buildRequestText(params),
      timeLabel: 'Vừa xong'
    },
    {
      id: 'admin',
      role: 'assistant',
      ...buildReplyModel(params),
      timeLabel: 'Vừa xong'
    }
  ];
}

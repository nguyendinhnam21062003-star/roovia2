/* StayBridge mock data — edit this file to add or update rooms. */
window.STAYBRIDGE_DATA = (() => {
  const img = (id, width = 1400) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

  const sharedImages = {
    dalat: [
      img('photo-1600585154340-be6161a56a0c'),
      img('photo-1600566753086-00f18fb6b3ea'),
      img('photo-1600607687920-4e2a09cf159d'),
      img('photo-1613490493576-7fde63acd811')
    ],
    danang: [
      img('photo-1566073771259-6a8506099945'),
      img('photo-1564501049412-61c2a3083791'),
      img('photo-1520250497591-112f2f40a3f4'),
      img('photo-1611892440504-42a792e24d32')
    ],
    hoian: [
      img('photo-1590490360182-c33d57733427'),
      img('photo-1582719478250-c89cae4dc85b'),
      img('photo-1542314831-068cd1dbfeeb'),
      img('photo-1595576508898-0ad5c879a061')
    ],
    hanoi: [
      img('photo-1505693416388-ac5ce068fe85'),
      img('photo-1522708323590-d24dbb6b0267'),
      img('photo-1493809842364-78817add7ffb'),
      img('photo-1484154218962-a197022b5858')
    ],
    nhatrang: [
      img('photo-1560448204-e02f11c3d0e2'),
      img('photo-1564013799919-ab600027ffc6'),
      img('photo-1568605114967-8130f3a36994'),
      img('photo-1560185008-b033106af5c3')
    ],
    halong: [
      img('photo-1551882547-ff40c63fe5fa'),
      img('photo-1551882547-ff40c63fe5fa', 1000),
      img('photo-1566073771259-6a8506099945', 1000),
      img('photo-1520250497591-112f2f40a3f4', 1000)
    ],
    saigon: [
      img('photo-1505693416388-ac5ce068fe85', 1200),
      img('photo-1522708323590-d24dbb6b0267', 1200),
      img('photo-1560448204-e02f11c3d0e2', 1200),
      img('photo-1590490360182-c33d57733427', 1200)
    ]
  };

  const rooms = [
    {
      id: 'la-homestay-da-lat', name: 'Lá Homestay Đà Lạt', type: 'Homestay', city: 'Đà Lạt',
      address: 'Phường 3, Đà Lạt, Lâm Đồng', price: 450000, oldPrice: 500000, rating: 4.8, reviewCount: 128,
      guests: 2, bedrooms: 1, beds: 1, bathrooms: 1, area: 28, featured: true, discount: 10,
      amenities: ['Wi-Fi miễn phí', 'Ban công', 'Máy lạnh', 'Bếp', 'Chỗ đỗ xe'],
      description: 'Một căn phòng ấm cúng nằm trên triền đồi yên tĩnh, có ban công nhìn ra vườn thông và khu vực làm việc riêng. Không gian sử dụng vật liệu gỗ sáng màu, phù hợp cho cặp đôi hoặc khách đi nghỉ ngắn ngày. Từ homestay, khách có thể di chuyển nhanh tới chợ Đà Lạt và các quán cà phê nổi tiếng.',
      policies: { checkIn: '14:00', checkOut: '12:00', cancellation: 'Miễn phí trước 2 ngày', smoking: false, pets: false },
      images: sharedImages.dalat
    },
    {
      id: 'pine-hill-house-da-lat', name: 'Pine Hill House', type: 'Nhà nguyên căn', city: 'Đà Lạt',
      address: 'Phường 10, Đà Lạt, Lâm Đồng', price: 1350000, oldPrice: 1500000, rating: 4.9, reviewCount: 86,
      guests: 6, bedrooms: 3, beds: 4, bathrooms: 2, area: 110, featured: true, discount: 10,
      amenities: ['Wi-Fi miễn phí', 'Ban công', 'Bếp', 'Cho phép thú cưng', 'Chỗ đỗ xe'],
      description: 'Nhà nguyên căn dành cho gia đình và nhóm bạn, có phòng khách rộng, bếp đầy đủ dụng cụ và sân nhỏ tổ chức tiệc. Khu vực xung quanh yên tĩnh, nhiều cây xanh và có chỗ đỗ ô tô ngay trong khuôn viên.',
      policies: { checkIn: '14:00', checkOut: '11:30', cancellation: 'Miễn phí trước 3 ngày', smoking: false, pets: true },
      images: [...sharedImages.dalat].reverse()
    },
    {
      id: 'sea-breeze-apartment-da-nang', name: 'Sea Breeze Apartment', type: 'Căn hộ', city: 'Đà Nẵng',
      address: 'An Thượng, Ngũ Hành Sơn, Đà Nẵng', price: 780000, oldPrice: 850000, rating: 4.7, reviewCount: 214,
      guests: 4, bedrooms: 2, beds: 2, bathrooms: 2, area: 68, featured: true, discount: 8,
      amenities: ['Wi-Fi miễn phí', 'Máy lạnh', 'Bếp', 'Hồ bơi', 'Ban công', 'Chỗ đỗ xe'],
      description: 'Căn hộ hai phòng ngủ cách biển Mỹ Khê vài phút đi bộ, có ban công thoáng và hồ bơi chung. Nội thất hiện đại, bếp riêng và máy giặt giúp khách thuận tiện khi lưu trú dài ngày.',
      policies: { checkIn: '14:00', checkOut: '12:00', cancellation: 'Miễn phí trước 2 ngày', smoking: false, pets: false },
      images: sharedImages.danang
    },
    {
      id: 'my-khe-cozy-room', name: 'My Khe Cozy Room', type: 'Phòng riêng', city: 'Đà Nẵng',
      address: 'Phước Mỹ, Sơn Trà, Đà Nẵng', price: 390000, oldPrice: 430000, rating: 4.6, reviewCount: 92,
      guests: 2, bedrooms: 1, beds: 1, bathrooms: 1, area: 24, featured: false, discount: 9,
      amenities: ['Wi-Fi miễn phí', 'Máy lạnh', 'Ban công'],
      description: 'Phòng riêng gọn gàng gần biển, phù hợp với khách công tác hoặc cặp đôi. Tầng trệt có khu vực tiếp khách chung và quầy hỗ trợ thông tin du lịch.',
      policies: { checkIn: '13:30', checkOut: '11:30', cancellation: 'Miễn phí trước 1 ngày', smoking: false, pets: false },
      images: [...sharedImages.danang].slice(1).concat(sharedImages.danang[0])
    },
    {
      id: 'lantern-riverside-hoi-an', name: 'Lantern Riverside Villa', type: 'Homestay', city: 'Hội An',
      address: 'Cẩm Châu, Hội An, Quảng Nam', price: 620000, oldPrice: 700000, rating: 4.9, reviewCount: 176,
      guests: 3, bedrooms: 1, beds: 2, bathrooms: 1, area: 38, featured: true, discount: 11,
      amenities: ['Wi-Fi miễn phí', 'Máy lạnh', 'Hồ bơi', 'Ban công', 'Bếp'],
      description: 'Không gian nghỉ dưỡng mang cảm hứng Hội An, có hồ bơi nhỏ, khu vườn và xe đạp miễn phí. Vị trí thuận tiện để di chuyển tới phố cổ nhưng vẫn đủ yên tĩnh cho kỳ nghỉ thư giãn.',
      policies: { checkIn: '14:00', checkOut: '12:00', cancellation: 'Miễn phí trước 2 ngày', smoking: false, pets: false },
      images: sharedImages.hoian
    },
    {
      id: 'old-town-boutique-hotel', name: 'Old Town Boutique Hotel', type: 'Khách sạn', city: 'Hội An',
      address: 'Minh An, Hội An, Quảng Nam', price: 940000, oldPrice: 1050000, rating: 4.8, reviewCount: 305,
      guests: 2, bedrooms: 1, beds: 1, bathrooms: 1, area: 32, featured: true, discount: 10,
      amenities: ['Wi-Fi miễn phí', 'Máy lạnh', 'Hồ bơi', 'Ban công', 'Chỗ đỗ xe'],
      description: 'Khách sạn boutique gần phố cổ với thiết kế trang nhã, hồ bơi trong sân và quầy lễ tân hỗ trợ 24/7. Phòng có cách âm tốt và bữa sáng theo thực đơn địa phương.',
      policies: { checkIn: '14:00', checkOut: '12:00', cancellation: 'Miễn phí trước 3 ngày', smoking: false, pets: false },
      images: [...sharedImages.hoian].reverse()
    },
    {
      id: 'hanoi-lotus-studio', name: 'Hanoi Lotus Studio', type: 'Căn hộ', city: 'Hà Nội',
      address: 'Quận Hoàn Kiếm, Hà Nội', price: 690000, oldPrice: 760000, rating: 4.7, reviewCount: 148,
      guests: 2, bedrooms: 1, beds: 1, bathrooms: 1, area: 35, featured: false, discount: 9,
      amenities: ['Wi-Fi miễn phí', 'Máy lạnh', 'Bếp', 'Ban công'],
      description: 'Studio riêng tư trong khu phố trung tâm, có bếp nhỏ, bàn làm việc và ban công. Phù hợp cho khách muốn khám phá phố cổ bằng cách đi bộ và có nhu cầu lưu trú từ vài ngày đến vài tuần.',
      policies: { checkIn: '14:00', checkOut: '11:00', cancellation: 'Miễn phí trước 2 ngày', smoking: false, pets: false },
      images: sharedImages.hanoi
    },
    {
      id: 'west-lake-family-home', name: 'West Lake Family Home', type: 'Nhà nguyên căn', city: 'Hà Nội',
      address: 'Quận Tây Hồ, Hà Nội', price: 1580000, oldPrice: 1750000, rating: 4.8, reviewCount: 71,
      guests: 8, bedrooms: 4, beds: 5, bathrooms: 3, area: 145, featured: true, discount: 10,
      amenities: ['Wi-Fi miễn phí', 'Máy lạnh', 'Bếp', 'Ban công', 'Cho phép thú cưng', 'Chỗ đỗ xe'],
      description: 'Căn nhà nhiều tầng dành cho nhóm đông người, có khu sinh hoạt chung rộng và sân thượng nhìn về phía Hồ Tây. Khu vực có nhiều nhà hàng, siêu thị và quán cà phê.',
      policies: { checkIn: '15:00', checkOut: '11:00', cancellation: 'Miễn phí trước 4 ngày', smoking: false, pets: true },
      images: [...sharedImages.hanoi].reverse()
    },
    {
      id: 'coral-bay-nha-trang', name: 'Coral Bay Hotel Nha Trang', type: 'Khách sạn', city: 'Nha Trang',
      address: 'Lộc Thọ, Nha Trang, Khánh Hòa', price: 860000, oldPrice: 980000, rating: 4.7, reviewCount: 256,
      guests: 3, bedrooms: 1, beds: 2, bathrooms: 1, area: 36, featured: true, discount: 12,
      amenities: ['Wi-Fi miễn phí', 'Máy lạnh', 'Hồ bơi', 'Ban công', 'Chỗ đỗ xe'],
      description: 'Khách sạn gần biển Trần Phú, có hồ bơi trên cao và phòng nhìn ra thành phố. Dịch vụ lễ tân liên tục, phù hợp với gia đình nhỏ và khách nghỉ dưỡng cuối tuần.',
      policies: { checkIn: '14:00', checkOut: '12:00', cancellation: 'Miễn phí trước 2 ngày', smoking: false, pets: false },
      images: sharedImages.nhatrang
    },
    {
      id: 'ocean-view-serviced-apartment', name: 'Ocean View Serviced Apartment', type: 'Căn hộ', city: 'Nha Trang',
      address: 'Vĩnh Hải, Nha Trang, Khánh Hòa', price: 720000, oldPrice: 800000, rating: 4.6, reviewCount: 109,
      guests: 4, bedrooms: 2, beds: 2, bathrooms: 1, area: 62, featured: false, discount: 10,
      amenities: ['Wi-Fi miễn phí', 'Máy lạnh', 'Bếp', 'Hồ bơi', 'Ban công'],
      description: 'Căn hộ dịch vụ đầy đủ tiện nghi, có khu bếp và cửa sổ lớn nhìn ra biển. Không gian phù hợp với gia đình cần sự riêng tư và tiện lợi trong chuyến đi dài ngày.',
      policies: { checkIn: '14:00', checkOut: '12:00', cancellation: 'Miễn phí trước 2 ngày', smoking: false, pets: false },
      images: [...sharedImages.nhatrang].slice(1).concat(sharedImages.nhatrang[0])
    },
    {
      id: 'bay-view-halong-retreat', name: 'Bay View Hạ Long Retreat', type: 'Homestay', city: 'Hạ Long',
      address: 'Bãi Cháy, Hạ Long, Quảng Ninh', price: 650000, oldPrice: 720000, rating: 4.8, reviewCount: 134,
      guests: 4, bedrooms: 2, beds: 2, bathrooms: 1, area: 58, featured: true, discount: 10,
      amenities: ['Wi-Fi miễn phí', 'Máy lạnh', 'Bếp', 'Hồ bơi', 'Ban công', 'Chỗ đỗ xe'],
      description: 'Căn hộ nghỉ dưỡng có ban công nhìn về vịnh, khu bếp riêng và hồ bơi của tòa nhà. Vị trí thuận tiện tới khu vui chơi Bãi Cháy và bến tàu tham quan vịnh.',
      policies: { checkIn: '14:00', checkOut: '12:00', cancellation: 'Miễn phí trước 3 ngày', smoking: false, pets: false },
      images: sharedImages.halong
    },
    {
      id: 'sunrise-motel-halong', name: 'Sunrise Motel Hạ Long', type: 'Nhà nghỉ', city: 'Hạ Long',
      address: 'Hùng Thắng, Hạ Long, Quảng Ninh', price: 330000, oldPrice: 370000, rating: 4.4, reviewCount: 63,
      guests: 2, bedrooms: 1, beds: 1, bathrooms: 1, area: 22, featured: false, discount: 10,
      amenities: ['Wi-Fi miễn phí', 'Máy lạnh', 'Chỗ đỗ xe'],
      description: 'Nhà nghỉ sạch sẽ, giá hợp lý và có chỗ đỗ xe. Phòng được trang bị những tiện nghi cơ bản, thích hợp với khách đi công tác hoặc dừng chân ngắn ngày.',
      policies: { checkIn: '13:00', checkOut: '11:30', cancellation: 'Miễn phí trước 1 ngày', smoking: false, pets: false },
      images: [...sharedImages.halong].reverse()
    },
    {
      id: 'saigon-central-loft', name: 'Saigon Central Loft', type: 'Căn hộ', city: 'TP. Hồ Chí Minh',
      address: 'Quận 1, TP. Hồ Chí Minh', price: 980000, oldPrice: 1080000, rating: 4.8, reviewCount: 193,
      guests: 3, bedrooms: 1, beds: 2, bathrooms: 1, area: 44, featured: true, discount: 9,
      amenities: ['Wi-Fi miễn phí', 'Máy lạnh', 'Bếp', 'Hồ bơi', 'Chỗ đỗ xe'],
      description: 'Căn loft hiện đại trong khu trung tâm, có hồ bơi và phòng gym chung. Không gian làm việc thoải mái, phù hợp cho khách công tác và người muốn trải nghiệm nhịp sống thành phố.',
      policies: { checkIn: '14:00', checkOut: '12:00', cancellation: 'Miễn phí trước 2 ngày', smoking: false, pets: false },
      images: sharedImages.saigon
    },
    {
      id: 'garden-room-thao-dien', name: 'Garden Room Thảo Điền', type: 'Phòng riêng', city: 'TP. Hồ Chí Minh',
      address: 'Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh', price: 520000, oldPrice: 580000, rating: 4.7, reviewCount: 84,
      guests: 2, bedrooms: 1, beds: 1, bathrooms: 1, area: 30, featured: false, discount: 10,
      amenities: ['Wi-Fi miễn phí', 'Máy lạnh', 'Bếp', 'Ban công', 'Cho phép thú cưng'],
      description: 'Phòng riêng trong ngôi nhà có sân vườn, nằm gần nhiều quán cà phê và nhà hàng tại Thảo Điền. Không gian nhẹ nhàng, có khu bếp chung và cho phép mang theo thú cưng nhỏ.',
      policies: { checkIn: '14:00', checkOut: '12:00', cancellation: 'Miễn phí trước 2 ngày', smoking: false, pets: true },
      images: [...sharedImages.saigon].slice(1).concat(sharedImages.saigon[0])
    }
  ];

  const destinations = [
    { name: 'Đà Lạt', image: img('photo-1600585154340-be6161a56a0c', 900), subtitle: 'Thành phố ngàn hoa' },
    { name: 'Đà Nẵng', image: img('photo-1566073771259-6a8506099945', 900), subtitle: 'Biển xanh và nhịp sống trẻ' },
    { name: 'Hội An', image: img('photo-1590490360182-c33d57733427', 900), subtitle: 'Phố cổ đầy cảm hứng' },
    { name: 'Nha Trang', image: img('photo-1560448204-e02f11c3d0e2', 900), subtitle: 'Kỳ nghỉ bên bờ biển' },
    { name: 'Hà Nội', image: img('photo-1505693416388-ac5ce068fe85', 900), subtitle: 'Trải nghiệm nét phố' },
    { name: 'Hạ Long', image: img('photo-1551882547-ff40c63fe5fa', 900), subtitle: 'Ngắm vịnh từ căn phòng' }
  ];

  const reviews = [
    { name: 'Nguyễn Minh Anh', date: '12/05/2026', rating: 5, text: 'Phòng sạch và đúng như hình. Nhân viên tư vấn phản hồi nhanh, hướng dẫn nhận phòng rất rõ ràng.', avatar: 'MA' },
    { name: 'Trần Quốc Huy', date: '28/04/2026', rating: 5, text: 'Vị trí thuận tiện, không gian yên tĩnh. Tôi đặc biệt thích khu ban công và cách bố trí phòng.', avatar: 'QH' },
    { name: 'Lê Hoàng Ngân', date: '09/04/2026', rating: 4, text: 'Mức giá hợp lý so với vị trí. Tiện nghi đầy đủ, phù hợp cho chuyến đi ngắn ngày.', avatar: 'HN' },
    { name: 'Phạm Gia Bảo', date: '22/03/2026', rating: 5, text: 'Quá trình liên hệ nhanh gọn, chủ nhà thân thiện. Tôi sẽ cân nhắc quay lại trong chuyến đi sau.', avatar: 'GB' }
  ];

  return { rooms, destinations, reviews };
})();

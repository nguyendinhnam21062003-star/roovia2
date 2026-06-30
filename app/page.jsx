import HomeClient from '../components/home-client';
import { todayISO } from '../lib/date-utils';
import { destinations, rooms } from '../lib/staybridge-data';

export const metadata = {
  title: 'StayBridge',
  description: 'Tìm phòng, homestay, căn hộ và khách sạn phù hợp tại các điểm đến nổi bật ở Việt Nam.'
};

export default function Page() {
  return <HomeClient rooms={rooms} destinations={destinations} initialToday={todayISO()} />;
}

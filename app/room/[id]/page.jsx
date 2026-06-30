import { notFound } from 'next/navigation';
import RoomDetailClient from '../../../components/room-detail-client';
import { todayISO } from '../../../lib/date-utils';
import { reviews, rooms } from '../../../lib/staybridge-data';

export function generateStaticParams() {
  return rooms.map(room => ({ id: room.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const room = rooms.find(item => item.id === id);

  if (!room) {
    return {
      title: 'Không tìm thấy phòng',
      description: 'Phòng bạn yêu cầu không tồn tại.'
    };
  }

  return {
    title: room.name,
    description: room.description
  };
}

export default async function RoomPage({ params }) {
  const { id } = await params;
  const room = rooms.find(item => item.id === id);

  if (!room) {
    notFound();
  }

  const similarRooms = rooms
    .filter(item => item.id !== room.id)
    .sort((a, b) => {
      const aScore = Number(a.city === room.city) * 2 + Number(a.type === room.type);
      const bScore = Number(b.city === room.city) * 2 + Number(b.type === room.type);
      return bScore - aScore || b.rating - a.rating;
    })
    .slice(0, 4);

  return <RoomDetailClient room={room} similarRooms={similarRooms} reviews={reviews} initialToday={todayISO()} />;
}

export interface Booking {
  id: number;
  meetingRoomId: number;
  meetingRoom: { id: number; name: string };
  startTime: string;
  endTime: string;
  status: string;
  location: string;
  userId: string;
  user: { id: string; fullName: string };
}

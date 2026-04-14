export type BarberDTO = {
  id: string;
  userId: string;
  name: string;
  profileImageUrl: string | null;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: Date;
};

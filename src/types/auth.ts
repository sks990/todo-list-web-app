// 프론트엔드에서 사용할 인증 관련 타입 정의
export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  emailVerified?: Date | null;
  role: UserRole;
  createdAt: Date;
}

export interface AuthStatus {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}
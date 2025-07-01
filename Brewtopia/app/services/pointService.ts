import ApiService from '../utils/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type BonusType = 'daily' | 'event' | 'referral' | 'task';

export interface CreateBonusParams {
  type: BonusType;
  note?: string;
}

// Hàm lấy userId từ AsyncStorage
async function getUserId(): Promise<string | null> {
  let userId = await AsyncStorage.getItem('userId');
  if (!userId) {
    const userDataString = await AsyncStorage.getItem('user_data');
    if (userDataString) {
      try {
        const user = JSON.parse(userDataString);
        userId = user._id || user.id;
      } catch {}
    }
  }
  return userId;
}

// Tạo điểm thưởng
export async function createBonus(params: CreateBonusParams) {
  const userId = await getUserId();
  if (!userId) throw new Error('Không tìm thấy userId');
  return ApiService.fetch('/point-Bonus', {
    method: 'POST',
    body: JSON.stringify({ type: params.type, note: params.note }),
    headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
  });
}

// Lấy danh sách điểm thưởng
export async function getBonusList() {
  const userId = await getUserId();
  if (!userId) throw new Error('Không tìm thấy userId');
  return ApiService.fetch('/point-Bonus', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
  });
}

// Lấy danh sách điểm thưởng với phân trang
export async function getBonusListWithPagination(page: number = 1, limit: number = 10) {
  const userId = await getUserId();
  if (!userId) throw new Error('Không tìm thấy userId');
  return ApiService.fetch(`/point-Bonus?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
  });
}

// Hàm nhận điểm daily
export async function claimDailyBonus() {
  return createBonus({ type: 'daily' });
}

// Hàm nhận điểm event
export async function claimEventBonus(note?: string) {
  return createBonus({ type: 'event', note });
}

// Hàm nhận điểm referral
export async function claimReferralBonus(note?: string) {
  return createBonus({ type: 'referral', note });
}

// Hàm nhận điểm task
export async function claimTaskBonus(note?: string) {
  return createBonus({ type: 'task', note });
} 
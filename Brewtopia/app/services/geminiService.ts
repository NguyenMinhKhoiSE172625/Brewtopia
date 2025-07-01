import { API_KEY } from '../config/constants';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Timeout config - tăng timeout lên
const REQUEST_TIMEOUT = 30000; // 30 giây thay vì 10 giây
const MAX_RETRIES = 1; // Giảm retry để tránh chờ quá lâu

// System prompt to limit Gemini's responses
const SYSTEM_PROMPT = `Bạn là trợ lý AI cho ứng dụng Brewtopia. Bạn phải:
1. LUÔN trả lời bằng tiếng Việt
2. Chỉ trả lời các câu hỏi liên quan đến tìm kiếm quán cafe và các tính năng của ứng dụng Brewtopia
3. Nếu được hỏi về chủ đề ngoài phạm vi này, hãy từ chối lịch sự và hướng người dùng về các chủ đề liên quan đến ứng dụng
4. Cung cấp thông tin chính xác và hữu ích về các quán cafe, đặc điểm của quán và tính năng ứng dụng
5. Giữ câu trả lời ngắn gọn và liên quan đến câu hỏi của người dùng
6. Khi người dùng có thắc mắc hoặc câu hỏi về bất kỳ vấn đề gì, hãy trả lời: "Chúng tôi sẽ liên hệ với nhân viên sớm nhất để hỗ trợ bạn."`;

// App context information
const APP_CONTEXT = `Brewtopia là ứng dụng tìm kiếm quán cafe giúp người dùng:
- Tìm kiếm quán cafe lân cận với nhiều tiêu chí:
  + Có wifi miễn phí
  + Có bàn trống
  + Cảnh đẹp, không gian thoáng đãng
  + Menu đồ uống và thức ăn
  + Giá cả
  + Đánh giá từ người dùng
- Đặt bàn trước
- Đặt món trước khi đến quán
- Xem thông tin chi tiết về quán như:
  + Địa chỉ và bản đồ
  + Giờ mở cửa
  + Hình ảnh thực tế
  + Đánh giá và bình luận
  + Các tiện ích khác`;

// Fallback responses khi AI không hoạt động
const FALLBACK_RESPONSES = [
  "Xin chào! Tôi là BREWBOT - trợ lý AI của Brewtopia. Hiện tại tôi đang gặp một chút sự cố kỹ thuật. Bạn có thể liên hệ với đội ngũ hỗ trợ qua tab Chat để được giúp đỡ tốt nhất nhé!",
  "Chào bạn! Tôi là BREWBOT. Do hệ thống đang được bảo trì, tôi tạm thời không thể trả lời được. Bạn hãy thử lại sau ít phút hoặc liên hệ với nhân viên hỗ trợ nhé!",
  "Xin lỗi bạn! BREWBOT hiện đang gặp sự cố tạm thời. Để được hỗ trợ tốt nhất về việc tìm kiếm quán cafe, đặt bàn hay các tính năng khác, bạn vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi nhé!",
  "Chào bạn! Hiện tại BREWBOT đang được cập nhật để phục vụ bạn tốt hơn. Trong thời gian này, bạn có thể sử dụng các tính năng tìm kiếm quán cafe, đặt bàn, xem ưu đãi ngay trên app hoặc chat với nhân viên hỗ trợ!"
];

export interface GeminiResponse {
  text: string;
  error?: string;
}

// Hàm tạo timeout cho fetch request
const fetchWithTimeout = async (url: string, options: RequestInit, timeout: number) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - vui lòng thử lại');
    }
    throw error;
  }
};

// Hàm retry với exponential backoff
const retryWithBackoff = async (fn: () => Promise<any>, retries: number): Promise<any> => {
  try {
    return await fn();
  } catch (error: unknown) {
    if (retries > 0 && error instanceof Error && !error.message.includes('timeout')) {
      const delay = Math.pow(2, MAX_RETRIES - retries) * 2000; // 2s, 4s...
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1);
    }
    throw error;
  }
};

// Hàm lấy fallback response ngẫu nhiên
const getRandomFallbackResponse = (): string => {
  const randomIndex = Math.floor(Math.random() * FALLBACK_RESPONSES.length);
  return FALLBACK_RESPONSES[randomIndex];
};

export const sendMessageToGemini = async (message: string): Promise<GeminiResponse> => {
  const makeRequest = async () => {
    const fullPrompt = `${SYSTEM_PROMPT}\n\n${APP_CONTEXT}\n\nCâu hỏi của người dùng: ${message}`;
    
    const response = await fetchWithTimeout(
      `${GEMINI_API_URL}?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: fullPrompt }]
          }],
          generationConfig: {
            maxOutputTokens: 300, // Giảm xuống 300 để nhanh hơn
            temperature: 0.7,
            candidateCount: 1,
          }
        }),
      },
      REQUEST_TIMEOUT
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response format from Gemini API');
    }

    return {
      text: data.candidates[0].content.parts[0].text
    };
  };

  try {
    return await retryWithBackoff(makeRequest, MAX_RETRIES);
  } catch (error: unknown) {
    console.error('Error calling Gemini API:', error);
    
    // Luôn trả về fallback response thay vì báo lỗi
    return {
      text: getRandomFallbackResponse(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}; 
import { API_KEY } from '../config/constants';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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

export interface GeminiResponse {
  text: string;
  error?: string;
}

export const sendMessageToGemini = async (message: string): Promise<GeminiResponse> => {
  try {
    const fullPrompt = `${SYSTEM_PROMPT}\n\n${APP_CONTEXT}\n\nCâu hỏi của người dùng: ${message}`;
    
    const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: fullPrompt }]
        }]
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from Gemini');
    }

    const data = await response.json();
    return {
      text: data.candidates[0].content.parts[0].text
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return {
      text: 'Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại.',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}; 
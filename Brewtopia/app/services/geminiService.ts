// Offline AI Chat Service - Không cần API
export interface GeminiResponse {
  text: string;
  error?: string;
}

// Các pattern và response cho AI chat
const chatPatterns = {
  // Chào hỏi
  greetings: {
    patterns: ['xin chào', 'hello', 'hi', 'chào', 'hey', 'halo', 'chào bạn'],
    responses: [
      'Xin chào! Tôi là BREWBOT - trợ lý AI của Brewtopia. Tôi có thể giúp bạn tìm quán cafe, đặt bàn, xem ưu đãi! 😊',
      'Chào bạn! Tôi là BREWBOT. Bạn muốn tôi giúp gì về cafe hôm nay? ☕',
      'Hello! Tôi là BREWBOT của Brewtopia. Có gì tôi có thể hỗ trợ bạn không? 🤖'
    ]
  },

  // Tìm quán cafe
  findCafe: {
    patterns: ['tìm quán', 'quán cafe', 'cafe gần', 'quán gần', 'tìm cafe', 'quán nào', 'gợi ý quán'],
    responses: [
      'Để tìm quán cafe phù hợp, bạn có thể:\n• Dùng tính năng "Tìm kiếm" trên trang chủ\n• Xem tab "Gần đây" để tìm quán lân cận\n• Lọc theo tiêu chí: wifi, không gian, giá cả\n\nBạn muốn tìm loại quán nào? 🔍',
      'Brewtopia có rất nhiều quán cafe tuyệt vời! Bạn có thể:\n• Tìm theo địa điểm\n• Lọc theo đánh giá\n• Xem ưu đãi đặc biệt\n\nHãy thử tính năng tìm kiếm nhé! ☕'
    ]
  },

  // Đặt bàn
  booking: {
    patterns: ['đặt bàn', 'booking', 'đặt chỗ', 'reserve', 'đặt trước'],
    responses: [
      'Để đặt bàn, bạn làm theo các bước:\n1. Chọn quán cafe yêu thích\n2. Ấn "Đặt bàn"\n3. Chọn thời gian và số người\n4. Xác nhận đặt bàn\n\nRất đơn giản! 📅',
      'Tính năng đặt bàn rất tiện lợi:\n• Đặt trước để không phải chờ\n• Chọn bàn ưa thích\n• Nhận thông báo xác nhận\n\nBạn muốn đặt bàn quán nào? 🪑'
    ]
  },

  // Đặt món
  ordering: {
    patterns: ['đặt món', 'order', 'menu', 'thực đơn', 'đồ uống', 'món ăn'],
    responses: [
      'Bạn có thể đặt món trước khi đến quán:\n• Xem menu chi tiết\n• Chọn đồ uống và món ăn\n• Thanh toán online\n• Nhận món ngay khi đến\n\nTiết kiệm thời gian tuyệt vời! 🍰☕',
      'Menu đa dạng với:\n• Cà phê các loại\n• Trà sữa, sinh tố\n• Bánh ngọt, snack\n• Món ăn nhẹ\n\nHãy khám phá menu của từng quán nhé! 🥐'
    ]
  },

  // Ưu đãi
  promotion: {
    patterns: ['ưu đãi', 'khuyến mãi', 'giảm giá', 'voucher', 'coupon', 'sale'],
    responses: [
      'Brewtopia có nhiều ưu đãi hấp dẫn:\n• Giảm giá đặc biệt cuối tuần\n• Voucher cho thành viên mới\n• Tích điểm đổi quà\n• Flash sale hàng ngày\n\nHãy check tab "Ưu đãi" thường xuyên! 🎁',
      'Đừng bỏ lỡ các ưu đãi:\n• Mua 1 tặng 1 vào thứ 2\n• Giảm 20% cho đơn từ 100k\n• Điểm thưởng tích lũy\n\nTham gia ngay để nhận ưu đãi! 💰'
    ]
  },

  // Điểm thưởng
  points: {
    patterns: ['điểm thưởng', 'tích điểm', 'point', 'reward', 'phần thưởng'],
    responses: [
      'Hệ thống điểm thưởng Brewtopia:\n• Mỗi đơn hàng được tích điểm\n• Điểm có thể đổi voucher\n• Nhiệm vụ hàng ngày\n• Thưởng sinh nhật\n\nHãy tích điểm để nhận quà! 🎊',
      'Cách tích điểm:\n• Đặt món: +10 điểm\n• Check-in: +5 điểm\n• Chia sẻ: +3 điểm\n• Đánh giá: +5 điểm\n\nXem chi tiết trong tab "Phần thưởng"! ⭐'
    ]
  },

  // Thanh toán
  payment: {
    patterns: ['thanh toán', 'payment', 'pay', 'trả tiền', 'momo', 'zalopay'],
    responses: [
      'Brewtopia hỗ trợ nhiều hình thức thanh toán:\n• Tiền mặt tại quán\n• MoMo, ZaloPay\n• Thẻ tín dụng\n• Điểm thưởng\n\nAn toàn và tiện lợi! 💳',
      'Thanh toán dễ dàng:\n• Quét QR code\n• Thanh toán online\n• Chia bill với bạn bè\n• Lưu lịch sử giao dịch\n\nChọn cách phù hợp nhất! 📱'
    ]
  },

  // Hỗ trợ
  support: {
    patterns: ['hỗ trợ', 'help', 'giúp đỡ', 'support', 'liên hệ', 'báo lỗi'],
    responses: [
      'Tôi luôn sẵn sàng hỗ trợ bạn! Nếu cần thêm trợ giúp, bạn có thể:\n• Liên hệ hotline: 1900-xxxx\n• Email: support@brewtopia.com\n• Chat với nhân viên (sắp có)\n\nChúng tôi sẽ hỗ trợ bạn ngay! 🆘',
      'Cần hỗ trợ gì khác không? Tôi có thể giúp bạn:\n• Tìm hiểu tính năng\n• Hướng dẫn sử dụng\n• Giải đáp thắc mắc\n\nHãy hỏi tôi bất cứ lúc nào! 💬'
    ]
  },

  // Thông tin app
  appInfo: {
    patterns: ['brewtopia', 'app', 'ứng dụng', 'tính năng', 'về chúng tôi'],
    responses: [
      'Brewtopia - Ứng dụng tìm kiếm cafe #1 Việt Nam!\n• Hơn 1000+ quán cafe\n• Đặt bàn, đặt món online\n• Ưu đãi hấp dẫn\n• Cộng đồng yêu cafe\n\nTải ngay để khám phá! 📱',
      'Brewtopia mang đến:\n• Trải nghiệm cafe tuyệt vời\n• Kết nối cộng đồng\n• Tiện ích thông minh\n• Dịch vụ tận tâm\n\nHãy cùng khám phá thế giới cafe! 🌍'
    ]
  },

  // Cảm ơn
  thanks: {
    patterns: ['cảm ơn', 'thank you', 'thanks', 'cám ơn', 'tks'],
    responses: [
      'Không có gì! Tôi rất vui được giúp bạn. Nếu có câu hỏi nào khác về cafe, cứ hỏi tôi nhé! 😊',
      'Rất vui được hỗ trợ bạn! Chúc bạn có những trải nghiệm cafe tuyệt vời với Brewtopia! ☕',
      'Tôi luôn sẵn sàng giúp đỡ! Hãy khám phá thêm nhiều quán cafe thú vị nhé! 🤗'
    ]
  },

  // Tạm biệt
  goodbye: {
    patterns: ['tạm biệt', 'bye', 'goodbye', 'see you', 'chào'],
    responses: [
      'Tạm biệt và hẹn gặp lại! Chúc bạn có những ly cafe ngon! ☕👋',
      'Chào tạm biệt! Nhớ quay lại chat với tôi khi cần hỗ trợ nhé! 😊',
      'Bye bye! Chúc bạn có ngày tuyệt vời với Brewtopia! 🌟'
    ]
  },

  // Câu hỏi về tôi (AI)
  aboutBot: {
    patterns: ['bạn là ai', 'ai là bạn', 'giới thiệu', 'brewbot', 'bot'],
    responses: [
      'Tôi là BREWBOT - trợ lý AI thông minh của Brewtopia! 🤖\n• Giúp tìm quán cafe phù hợp\n• Hướng dẫn sử dụng app\n• Tư vấn đặt bàn, đặt món\n• Cập nhật ưu đãi mới nhất\n\nTôi luôn học hỏi để phục vụ bạn tốt hơn!',
      'Chào bạn! Tôi là BREWBOT - người bạn AI của mọi tín đồ cafe! ☕\nTôi biết rất nhiều về:\n• Các quán cafe hot nhất\n• Cách đặt bàn nhanh chóng\n• Ưu đãi và khuyến mãi\n• Tips chọn cafe ngon\n\nHãy coi tôi như người bạn cafe của bạn!'
    ]
  }
};

// Responses mặc định
const defaultResponses = [
  'Tôi hiểu bạn muốn hỏi về điều này. Tuy nhiên, tôi chuyên về cafe và các tính năng Brewtopia. Bạn có thể hỏi tôi về:\n• Tìm quán cafe\n• Đặt bàn, đặt món\n• Ưu đãi và điểm thưởng\n• Cách sử dụng app\n\nCó gì khác tôi có thể giúp không? 😊',
  'Hmm, câu hỏi này hơi khó với tôi. Tôi giỏi nhất về:\n• Gợi ý quán cafe\n• Hướng dẫn đặt bàn\n• Thông tin ưu đãi\n• Tính năng app\n\nBạn thử hỏi về những chủ đề này nhé! ☕',
  'Tôi là BREWBOT - chuyên gia về cafe! Tôi có thể giúp bạn:\n• Tìm quán cafe yêu thích\n• Đặt bàn nhanh chóng\n• Khám phá ưu đãi\n• Tích điểm thưởng\n\nHãy hỏi tôi về cafe nhé! 🤖'
];

// Hàm tìm pattern phù hợp
function findMatchingPattern(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  
  for (const [category, data] of Object.entries(chatPatterns)) {
    for (const pattern of data.patterns) {
      if (lowerMessage.includes(pattern)) {
        const responses = data.responses;
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }
  }
  
  return null;
}

// Hàm xử lý câu hỏi phức tạp
function handleComplexQuery(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Câu hỏi về giá cả
  if (lowerMessage.includes('giá') || lowerMessage.includes('bao nhiêu tiền')) {
    return 'Giá cả tại các quán cafe rất đa dạng:\n• Cà phê: 15,000 - 45,000đ\n• Trà sữa: 25,000 - 55,000đ\n• Bánh ngọt: 20,000 - 60,000đ\n• Món ăn: 30,000 - 80,000đ\n\nMỗi quán có mức giá khác nhau. Hãy xem menu chi tiết! 💰';
  }
  
  // Câu hỏi về thời gian
  if (lowerMessage.includes('giờ') || lowerMessage.includes('mở cửa') || lowerMessage.includes('đóng cửa')) {
    return 'Thời gian hoạt động của các quán:\n• Thường: 7:00 - 22:00\n• Cuối tuần: 6:30 - 23:00\n• Một số quán 24/7\n\nKiểm tra thời gian cụ thể của từng quán trong app nhé! ⏰';
  }
  
  // Câu hỏi về wifi
  if (lowerMessage.includes('wifi') || lowerMessage.includes('internet')) {
    return 'Hầu hết các quán đều có wifi miễn phí! 📶\n• Tốc độ ổn định\n• Mật khẩu được cung cấp\n• Phù hợp làm việc, học tập\n\nLọc theo tiêu chí "Có wifi" khi tìm kiếm nhé!';
  }
  
  // Câu hỏi về không gian
  if (lowerMessage.includes('không gian') || lowerMessage.includes('view') || lowerMessage.includes('cảnh')) {
    return 'Các quán có không gian đa dạng:\n• View đẹp, thoáng mát\n• Phong cách vintage, hiện đại\n• Khu vực riêng tư\n• Sân vườn, ban công\n\nXem hình ảnh thực tế trong app! 🌿';
  }

  // Câu hỏi về địa điểm
  if (lowerMessage.includes('địa chỉ') || lowerMessage.includes('ở đâu') || lowerMessage.includes('chỗ nào')) {
    return 'Brewtopia có quán cafe khắp mọi nơi:\n• Trung tâm thành phố\n• Khu dân cư\n• Gần trường học, văn phòng\n• Khu du lịch\n\nDùng GPS để tìm quán gần nhất! 📍';
  }

  // Câu hỏi về đánh giá
  if (lowerMessage.includes('đánh giá') || lowerMessage.includes('review') || lowerMessage.includes('rating')) {
    return 'Hệ thống đánh giá minh bạch:\n• 5 sao từ khách hàng thực\n• Bình luận chi tiết\n• Hình ảnh thật\n• Lọc theo điểm số\n\nXem đánh giá trước khi chọn quán! ⭐';
  }

  // Câu hỏi về giao hàng
  if (lowerMessage.includes('giao hàng') || lowerMessage.includes('delivery') || lowerMessage.includes('ship')) {
    return 'Dịch vụ giao hàng tiện lợi:\n• Giao trong 30 phút\n• Phí ship từ 10,000đ\n• Theo dõi đơn hàng realtime\n• Đóng gói cẩn thận\n\nĐặt món online và nhận tại nhà! 🚚';
  }

  // Câu hỏi về nhóm/bạn bè
  if (lowerMessage.includes('nhóm') || lowerMessage.includes('bạn bè') || lowerMessage.includes('đông người')) {
    return 'Quán cafe phù hợp cho nhóm:\n• Không gian rộng rãi\n• Bàn lớn cho 6-8 người\n• Menu đa dạng\n• Giá cả hợp lý\n\nĐặt bàn trước để đảm bảo chỗ ngồi! 👥';
  }

  // Câu hỏi về làm việc/học tập
  if (lowerMessage.includes('làm việc') || lowerMessage.includes('học tập') || lowerMessage.includes('work') || lowerMessage.includes('study')) {
    return 'Quán cafe lý tưởng cho làm việc:\n• Wifi tốc độ cao\n• Không gian yên tĩnh\n• Ổ cắm điện nhiều\n• Đồ uống giá tốt\n\nLọc theo "Phù hợp làm việc" nhé! 💻';
  }

  // Câu hỏi về cà phê đặc biệt
  if (lowerMessage.includes('cà phê đặc biệt') || lowerMessage.includes('specialty') || lowerMessage.includes('origin')) {
    return 'Cà phê đặc sản tại Brewtopia:\n• Single origin từ Đà Lạt\n• Rang xay tươi hàng ngày\n• Pha chế bằng máy espresso\n• Latte art đẹp mắt\n\nThưởng thức cà phê chất lượng cao! ☕';
  }

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// Hàm chính xử lý chat
export const sendMessageToGemini = async (message: string): Promise<GeminiResponse> => {
  // Simulate thinking time
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
  
  try {
    // Tìm pattern phù hợp
    let response = findMatchingPattern(message);
    
    // Nếu không tìm thấy pattern, xử lý câu hỏi phức tạp
    if (!response) {
      response = handleComplexQuery(message);
    }
    
    return {
      text: response
    };
    
  } catch (error) {
    return {
      text: 'Xin lỗi, tôi đang gặp chút sự cố. Hãy thử lại sau nhé! 🛠️',
      error: 'Offline AI processing error'
    };
  }
}; 
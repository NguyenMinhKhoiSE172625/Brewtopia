// Offline AI Chat Service cho Brewtopia
// Không cần API key, hoạt động 100% offline

// Các pattern và response cho AI chat
const chatPatterns = {
  // Chào hỏi
  greetings: {
    patterns: ['xin chào', 'hello', 'hi', 'chào', 'hey', 'halo', 'chào bạn', 'good morning', 'good afternoon', 'good evening'],
    responses: [
      'Xin chào! Tôi là BREWBOT - trợ lý AI của Brewtopia. Tôi có thể giúp bạn tìm quán cafe, đặt bàn, xem ưu đãi và hướng dẫn sử dụng app! 😊',
      'Chào bạn! Tôi là BREWBOT. Bạn muốn tôi giúp gì về cafe hoặc app Brewtopia hôm nay? ☕',
      'Hello! Tôi là BREWBOT của Brewtopia. Có gì tôi có thể hỗ trợ bạn không? 🤖'
    ]
  },

  // Tìm quán cafe
  findCafe: {
    patterns: ['tìm quán', 'quán cafe', 'cafe gần', 'quán gần', 'tìm cafe', 'quán nào', 'gợi ý quán', 'search cafe', 'nearby cafe', 'tìm kiếm'],
    responses: [
      'Để tìm quán cafe, bạn có thể:\n\n🔍 **Tìm kiếm**: Ấn biểu tượng tìm kiếm trên trang chủ\n📍 **Gần đây**: Vào tab "Gần đây" để xem quán lân cận\n🗺️ **Bản đồ**: Xem vị trí chính xác trên bản đồ\n\n**Lọc theo**: Wifi, không gian, giá cả, đánh giá, đang mở cửa',
      'Brewtopia có hệ thống tìm kiếm thông minh:\n\n• **Tìm theo tên**: Nhập tên quán hoặc đồ uống\n• **Tìm theo vị trí**: "Ho Chi Minh", "Quận 1"...\n• **Lọc nâng cao**: Khoảng cách, giảm giá, đang mở cửa\n\nHãy thử tính năng tìm kiếm để khám phá! 🔍'
    ]
  },

  // Đặt bàn
  booking: {
    patterns: ['đặt bàn', 'booking', 'đặt chỗ', 'reserve', 'đặt trước', 'table booking', 'reservation'],
    responses: [
      'Hướng dẫn đặt bàn tại Brewtopia:\n\n1️⃣ **Chọn quán**: Tìm quán cafe yêu thích\n2️⃣ **Ấn "Đặt bàn"**: Trong trang chi tiết quán\n3️⃣ **Chọn thời gian**: Ngày, giờ và số người\n4️⃣ **Chọn bàn**: Xem sơ đồ bàn và chọn vị trí\n5️⃣ **Xác nhận**: Nhận thông báo đặt bàn thành công\n\n💡 **Lưu ý**: Đến muộn quá 5 phút có thể mất bàn!',
      'Tính năng đặt bàn Brewtopia:\n\n✅ **Đặt trước**: Không phải chờ khi đến quán\n🪑 **Chọn bàn**: Xem sơ đồ và chọn vị trí ưa thích\n⏰ **Linh hoạt**: Đặt từ 8:00 - 22:00 hàng ngày\n📱 **Thông báo**: Nhận xác nhận qua app\n\nBạn muốn đặt bàn quán nào? Tôi có thể hướng dẫn chi tiết!'
    ]
  },

  // Đặt món
  ordering: {
    patterns: ['đặt món', 'order', 'menu', 'thực đơn', 'đồ uống', 'món ăn', 'drink order', 'food order'],
    responses: [
      'Cách đặt món tại Brewtopia:\n\n1️⃣ **Xem menu**: Vào trang chi tiết quán\n2️⃣ **Chọn món**: Cà phê, trà, bánh, món ăn nhẹ\n3️⃣ **Chọn thời gian**: Nhận món khi nào\n4️⃣ **Thanh toán**: Online hoặc tại quán\n5️⃣ **Nhận món**: Đến quán và nhận ngay\n\n🎯 **Lợi ích**: Tiết kiệm thời gian, không phải chờ!',
      'Menu đa dạng tại Brewtopia:\n\n☕ **Cà phê**: Espresso, Cappuccino, Latte, Americano\n🧋 **Trà sữa**: Trà đài, trà xanh, trà ô long\n🥤 **Sinh tố**: Bơ, dâu, xoài, chuối\n🍰 **Bánh ngọt**: Croissant, muffin, cheesecake\n🥪 **Món ăn**: Sandwich, salad, pasta\n\nMỗi quán có menu riêng, hãy khám phá!'
    ]
  },

  // Ưu đãi và khuyến mãi
  promotion: {
    patterns: ['ưu đãi', 'khuyến mãi', 'giảm giá', 'voucher', 'coupon', 'sale', 'discount', 'promotion'],
    responses: [
      'Ưu đãi hấp dẫn tại Brewtopia:\n\n🎁 **Thành viên mới**: Giảm 20% đơn đầu tiên\n🔥 **Flash sale**: Giảm giá đặc biệt hàng ngày\n📅 **Cuối tuần**: Mua 1 tặng 1 thứ 7, chủ nhật\n🎂 **Sinh nhật**: Đồ uống miễn phí tháng sinh nhật\n⚡ **Happy hour**: Giảm 30% từ 14:00-16:00\n\nKiểm tra tab "Ưu đãi" để cập nhật mới nhất!',
      'Cách nhận ưu đãi:\n\n1️⃣ **Đăng ký**: Tạo tài khoản Brewtopia\n2️⃣ **Tích điểm**: Mua hàng để có điểm thưởng\n3️⃣ **Check-in**: Vào quán để nhận ưu đãi\n4️⃣ **Chia sẻ**: Share bài viết nhận voucher\n5️⃣ **Thông báo**: Bật thông báo để không bỏ lỡ\n\nHãy theo dõi thường xuyên! 💰'
    ]
  },

  // Điểm thưởng và rewards
  points: {
    patterns: ['điểm thưởng', 'tích điểm', 'point', 'reward', 'phần thưởng', 'loyalty', 'membership'],
    responses: [
      'Hệ thống điểm thưởng Brewtopia:\n\n⭐ **Cách tích điểm**:\n• Mua hàng: +10 điểm/đơn\n• Check-in: +5 điểm/lần\n• Chia sẻ: +3 điểm/bài\n• Đánh giá: +5 điểm/review\n• Điểm danh: +10 điểm/ngày\n\n🏆 **Cấp thành viên**:\n• Bronze (0-199 điểm)\n• Silver (200-499 điểm)\n• Gold (500-999 điểm)\n• Platinum (1000-1999 điểm)\n• Diamond (2000+ điểm)',
      'Quyền lợi theo cấp thành viên:\n\n🥉 **Bronze**: Tích điểm cơ bản\n🥈 **Silver**: Giảm 10%, 2x điểm cuối tuần\n🥇 **Gold**: Giảm 15%, ưu tiên đặt bàn\n💎 **Platinum**: Giảm 20%, phục vụ VIP\n💍 **Diamond**: Giảm 25%, concierge cá nhân\n\nVào tab "Phần thưởng" để xem chi tiết!'
    ]
  },

  // Thanh toán
  payment: {
    patterns: ['thanh toán', 'payment', 'pay', 'trả tiền', 'momo', 'zalopay', 'payos', 'thẻ tín dụng'],
    responses: [
      'Phương thức thanh toán tại Brewtopia:\n\n💳 **Thẻ tín dụng**: Visa, Mastercard, JCB\n📱 **Ví điện tử**: MoMo, ZaloPay\n🏦 **Ngân hàng**: Chuyển khoản, QR Banking\n💰 **Tiền mặt**: Thanh toán tại quán\n⭐ **Điểm thưởng**: Đổi điểm lấy đồ uống\n\nTất cả đều an toàn và bảo mật! 🔒',
      'Hướng dẫn thanh toán:\n\n1️⃣ **Chọn món**: Thêm vào giỏ hàng\n2️⃣ **Chọn phương thức**: Thẻ, ví, banking\n3️⃣ **Nhập thông tin**: Theo hướng dẫn\n4️⃣ **Xác nhận**: Kiểm tra và thanh toán\n5️⃣ **Nhận mã**: Mã đơn hàng để nhận món\n\nQuá trình chỉ mất vài phút! ⚡'
    ]
  },

  // Livestream và Video
  livestream: {
    patterns: ['livestream', 'live stream', 'phát trực tiếp', 'stream', 'video call', 'camera', 'BrewLive', 'xem live', 'phát sóng', 'streaming', 'acoustic', 'bartending', 'coffee art'],
    responses: [
      '🎥 **BrewLive - Tính năng độc quyền!**\n\n📱 **Cách sử dụng:**\n• Vào tab Stream từ bottom bar\n• Chọn quán cafe đang LIVE\n• Tham gia với vai trò Streamer hoặc Viewer\n• Nhập tên phòng và tên của bạn\n\n🎸 **Nội dung phổ biến:**\n• Acoustic sessions\n• Coffee art tutorials\n• Behind-the-counter tours\n• Bartending shows\n\n💡 **Lưu ý:** Nếu lỗi kết nối server, app sẽ tự động chuyển sang chế độ offline để bạn vẫn có thể sử dụng camera!',
      '🌟 **BrewLive - Trải nghiệm cafe trực tuyến!**\n\n🎭 **Hai vai trò:**\n• **Streamer:** Phát trực tiếp với camera\n• **Viewer:** Xem stream và chat\n\n🎯 **Tính năng nổi bật:**\n• Camera trước/sau linh hoạt\n• Chat real-time với viewers\n• Chế độ offline backup\n• UI đẹp như TikTok Live\n\n🔥 **Quán đang LIVE:**\n• COFFEE SHOP 1 - Acoustic Friday\n• COFFEE 22 - Thursday Sessions\n• StayAwayHouse - Coffee Art\n• QUESTO CAFÉ - Evening Jazz\n\nHãy thử ngay! 🚀',
      '🎬 **Hướng dẫn BrewLive chi tiết:**\n\n**BƯỚC 1:** Chọn Stream tab\n**BƯỚC 2:** Tap vào quán có dấu LIVE đỏ\n**BƯỚC 3:** Điền thông tin:\n   - Tên phòng (channel ID)\n   - Tên hiển thị\n   - Chọn Streamer/Viewer\n\n**BƯỚC 4:** Tham gia phòng\n\n🎥 **Nếu là Streamer:**\n• App sẽ xin quyền camera\n• Có thể flip camera trước/sau\n• Chat với viewers real-time\n\n👀 **Nếu là Viewer:**\n• Xem stream của streamer\n• Tham gia chat cùng mọi người\n\n🛡️ **Backup:** Nếu server lỗi, vẫn có thể dùng camera offline!'
    ]
  },

  // Tìm kiếm và nearby
  search: {
    patterns: ['tìm kiếm', 'search', 'gần đây', 'nearby', 'bản đồ', 'map', 'vị trí', 'location'],
    responses: [
      'Tính năng tìm kiếm thông minh:\n\n🔍 **Tìm kiếm**: Nhập tên quán, đồ uống, địa điểm\n📍 **Gần đây**: Hiển thị quán trong bán kính 5km\n🗺️ **Bản đồ**: Xem vị trí chính xác, chỉ đường\n🎯 **Lọc**: Theo khoảng cách, giá, đánh giá\n📱 **Thông minh**: Gợi ý dựa trên sở thích\n\nHãy thử tìm "cafe acoustic" hoặc "trà sữa"!',
      'Hướng dẫn sử dụng bản đồ:\n\n1️⃣ **Vào tab "Gần đây"**: Xem quán xung quanh\n2️⃣ **Zoom bản đồ**: Phóng to/thu nhỏ\n3️⃣ **Ấn marker**: Xem thông tin quán\n4️⃣ **Chỉ đường**: Ấn "Path" để dẫn đường\n5️⃣ **Gọi điện**: Liên hệ trực tiếp quán\n6️⃣ **Chia sẻ**: Share vị trí với bạn bè\n\nRất tiện lợi để khám phá! 🧭'
    ]
  },

  // Tin tức và social
  news: {
    patterns: ['tin tức', 'news', 'bài viết', 'post', 'social', 'chia sẻ', 'like', 'comment', 'brewnews'],
    responses: [
      'BrewNews - Mạng xã hội cafe:\n\n📝 **Đăng bài**: Chia sẻ trải nghiệm cafe\n📸 **Ảnh**: Upload hình đồ uống, không gian\n⭐ **Đánh giá**: Rate quán từ 1-5 sao\n❤️ **Tương tác**: Like, comment, share\n📍 **Check-in**: Tag vị trí quán\n🏆 **Thưởng**: Nhận điểm khi đăng bài\n\nKết nối với cộng đồng yêu cafe! 🤝',
      'Cách tạo bài viết hay:\n\n1️⃣ **Ấn nút "Post"**: Trên trang BrewNews\n2️⃣ **Viết caption**: Mô tả trải nghiệm\n3️⃣ **Thêm ảnh**: Tối đa 5 ảnh đẹp\n4️⃣ **Đánh giá**: Cho điểm quán (tuỳ chọn)\n5️⃣ **Check-in**: Thêm vị trí\n6️⃣ **Đăng**: Chia sẻ với cộng đồng\n\nMỗi bài viết được +20 điểm thưởng! 🎁'
    ]
  },

  // Thông báo
  notifications: {
    patterns: ['thông báo', 'notification', 'alert', 'tin nhắn', 'message'],
    responses: [
      'Hệ thống thông báo Brewtopia:\n\n🔔 **Ưu đãi**: Khuyến mãi mới, flash sale\n📅 **Đặt bàn**: Xác nhận, nhắc nhở\n🍽️ **Đặt món**: Trạng thái đơn hàng\n⭐ **Điểm thưởng**: Tích điểm, lên hạng\n📱 **Live**: Quán yêu thích phát trực tiếp\n💬 **Tương tác**: Like, comment bài viết\n\nVào "Notifications" để xem tất cả!',
      'Cài đặt thông báo:\n\n1️⃣ **Vào Profile**: Ấn avatar góc phải\n2️⃣ **Cài đặt**: Chọn "Cài đặt thông báo"\n3️⃣ **Bật/tắt**: Theo từng loại thông báo\n4️⃣ **Thời gian**: Chọn giờ nhận thông báo\n5️⃣ **Lưu**: Áp dụng cài đặt\n\nTuỳ chỉnh theo ý muốn! ⚙️'
    ]
  },

  // Hỗ trợ
  support: {
    patterns: ['hỗ trợ', 'help', 'giúp đỡ', 'support', 'liên hệ', 'báo lỗi', 'customer service'],
    responses: [
      'Hỗ trợ khách hàng 24/7:\n\n🤖 **Chat AI**: Tôi luôn sẵn sàng hỗ trợ\n📞 **Hotline**: 1900-xxxx (8:00-22:00)\n📧 **Email**: support@brewtopia.com\n💬 **Chat**: Với nhân viên (sắp có)\n🐛 **Báo lỗi**: Gửi feedback trong app\n❓ **FAQ**: Câu hỏi thường gặp\n\nChúng tôi luôn lắng nghe bạn! 👂',
      'Các vấn đề thường gặp:\n\n❌ **Không đăng nhập được**: Kiểm tra email/mật khẩu\n🔄 **Quên mật khẩu**: Dùng "Forgot Password"\n💳 **Thanh toán lỗi**: Thử lại hoặc đổi phương thức\n📱 **App chậm**: Khởi động lại app\n🍽️ **Đặt món sai**: Liên hệ quán trực tiếp\n\nTôi có thể hướng dẫn chi tiết từng bước! 📋'
    ]
  },

  // Thông tin app
  appInfo: {
    patterns: ['brewtopia', 'app', 'ứng dụng', 'tính năng', 'về chúng tôi', 'about', 'features'],
    responses: [
      'Brewtopia - Ứng dụng cafe #1 Việt Nam:\n\n🏪 **1000+ quán**: Cafe, trà sữa, bakery\n📱 **Đặt online**: Bàn, món, thanh toán\n🎁 **Ưu đãi**: Khuyến mãi hấp dẫn\n⭐ **Tích điểm**: Hệ thống membership\n🎥 **Livestream**: BrewLive độc quyền\n📰 **Mạng xã hội**: BrewNews community\n🗺️ **Bản đồ**: Tìm quán gần nhất\n\nTải ngay để khám phá! 📲',
      'Tính năng nổi bật:\n\n🎯 **Tìm kiếm thông minh**: AI gợi ý phù hợp\n⚡ **Đặt nhanh**: 3 bước đặt bàn/món\n🔐 **Bảo mật**: Thanh toán an toàn 100%\n🌟 **Cá nhân hoá**: Theo sở thích riêng\n🤝 **Cộng đồng**: Kết nối người yêu cafe\n🎊 **Sự kiện**: Acoustic, workshop, talkshow\n\nBrewtopia - Nơi cafe trở thành lifestyle! ☕'
    ]
  },

  // Cảm ơn
  thanks: {
    patterns: ['cảm ơn', 'thanks', 'thank you', 'cám ơn', 'tks', 'ty'],
    responses: [
      'Rất vui được giúp đỡ bạn! 😊\n\nNếu cần hỗ trợ thêm về Brewtopia, đừng ngần ngại hỏi tôi nhé. Chúc bạn có những trải nghiệm cafe tuyệt vời! ☕',
      'Không có gì! Tôi luôn sẵn sàng hỗ trợ bạn 24/7. Hãy khám phá thêm các tính năng thú vị của Brewtopia nhé! 🌟',
      'Cảm ơn bạn đã sử dụng Brewtopia! Hy vọng bạn tìm được những quán cafe tuyệt vời. Hẹn gặp lại! 👋'
    ]
  },

  // Tạm biệt
  goodbye: {
    patterns: ['tạm biệt', 'bye', 'goodbye', 'see you', 'chào nhé', 'hẹn gặp lại'],
    responses: [
      'Tạm biệt và hẹn gặp lại bạn! Chúc bạn có những trải nghiệm cafe tuyệt vời với Brewtopia! ☕👋',
      'Chào tạm biệt! Nhớ khám phá thêm các quán cafe mới và tích điểm thưởng nhé! 🌟',
      'Bye bye! Hẹn gặp lại bạn sớm. Đừng quên check-in để nhận điểm thưởng! 🎁'
    ]
  },

  // Về AI bot
  aboutBot: {
    patterns: ['bạn là ai', 'ai bot', 'brewbot', 'trợ lý', 'assistant', 'who are you'],
    responses: [
      'Tôi là BREWBOT - trợ lý AI thông minh của Brewtopia! 🤖\n\n✨ **Tôi có thể**:\n• Hướng dẫn sử dụng app\n• Tư vấn quán cafe phù hợp\n• Giải thích các tính năng\n• Hỗ trợ đặt bàn, đặt món\n• Trả lời mọi thắc mắc\n\n🚀 **Đặc biệt**: Hoạt động 24/7, không cần internet, phản hồi tức thì!',
      'Xin chào! Tôi là BREWBOT 🤖\n\nTôi được tạo ra để giúp bạn tận hưởng trải nghiệm cafe tốt nhất tại Brewtopia. Từ tìm quán, đặt bàn, đến tích điểm thưởng - tôi đều có thể hỗ trợ!\n\nHãy hỏi tôi bất cứ điều gì về cafe và app nhé! ☕'
    ]
  },

  // Câu hỏi phức tạp về giá cả, thời gian
  pricing: {
    patterns: ['giá', 'price', 'bao nhiêu tiền', 'cost', 'expensive', 'cheap', 'rẻ', 'đắt'],
    responses: [
      'Thông tin giá cả tại Brewtopia:\n\n☕ **Cà phê**: 25,000 - 65,000 VNĐ\n🧋 **Trà sữa**: 30,000 - 70,000 VNĐ\n🥤 **Sinh tố**: 35,000 - 80,000 VNĐ\n🍰 **Bánh ngọt**: 20,000 - 120,000 VNĐ\n🥪 **Món ăn**: 45,000 - 200,000 VNĐ\n\n💡 **Mẹo**: Dùng voucher giảm giá và điểm thưởng để tiết kiệm!',
      'Giá cả phù hợp mọi túi tiền:\n\n💰 **Sinh viên**: Combo từ 35,000 VNĐ\n👔 **Dân văn phòng**: Set lunch 65,000 VNĐ\n👨‍👩‍👧‍👦 **Gia đình**: Menu sharing 150,000 VNĐ\n🎂 **Đặc biệt**: Premium drink 80,000+ VNĐ\n\nMỗi quán có mức giá khác nhau, hãy xem menu chi tiết!'
    ]
  },

  // Thời gian hoạt động
  hours: {
    patterns: ['giờ mở cửa', 'thời gian', 'hours', 'open', 'close', 'mở cửa', 'đóng cửa'],
    responses: [
      'Thời gian hoạt động các quán:\n\n🌅 **Sáng sớm**: 6:00 - 10:00 (Cafe breakfast)\n☀️ **Cả ngày**: 8:00 - 22:00 (Phổ biến nhất)\n🌙 **Đêm muộn**: 18:00 - 02:00 (Cafe đêm)\n🕐 **24/7**: Một số quán mở cửa 24h\n\n📍 **Xem chi tiết**: Vào trang quán để biết giờ chính xác\n🔔 **Thông báo**: Bật alert khi quán sắp đóng cửa',
      'Mẹo chọn thời gian:\n\n🌅 **6:00-9:00**: Ít đông, yên tĩnh làm việc\n☕ **9:00-11:00**: Cafe buổi sáng, meeting\n🍽️ **11:00-14:00**: Brunch, ăn trưa\n😌 **14:00-17:00**: Thư giãn, học bài\n🌆 **17:00-20:00**: After work, hẹn hò\n🌃 **20:00-22:00**: Cafe đêm, acoustic\n\nMỗi khung giờ có vibe khác nhau!'
    ]
  },

  // Wifi và không gian
  wifi: {
    patterns: ['wifi', 'internet', 'làm việc', 'work', 'học', 'study', 'không gian', 'space'],
    responses: [
      'Không gian làm việc/học tập:\n\n📶 **Wifi**: Tốc độ cao, miễn phí\n🔌 **Ổ cắm**: Sạc laptop, điện thoại\n🪑 **Chỗ ngồi**: Thoải mái, yên tĩnh\n❄️ **Điều hoà**: Mát mẻ cả ngày\n☕ **Không giới hạn**: Ngồi lâu không bị gián đoạn\n\n🏷️ **Lọc**: Dùng filter "Wifi" khi tìm kiếm\n⭐ **Gợi ý**: Quán có tag "Work-friendly"',
      'Các loại không gian:\n\n📚 **Study cafe**: Yên tĩnh, ánh sáng tốt\n💼 **Co-working**: Bàn lớn, meeting room\n🎨 **Creative space**: Nghệ thuật, cảm hứng\n🌿 **Garden cafe**: Không gian xanh, thoáng mát\n🏢 **Rooftop**: View đẹp, không gian mở\n\nChọn theo nhu cầu cụ thể của bạn!'
    ]
  },

  // Địa điểm và đánh giá
  location: {
    patterns: ['địa điểm', 'location', 'đánh giá', 'rating', 'review', 'chất lượng', 'quality'],
    responses: [
      'Hệ thống đánh giá Brewtopia:\n\n⭐ **1-5 sao**: Đánh giá tổng thể\n📝 **Review**: Chia sẻ trải nghiệm\n📸 **Ảnh**: Upload hình thực tế\n👥 **Cộng đồng**: Đánh giá từ người dùng\n🏆 **Top rated**: Quán được yêu thích nhất\n\n🎯 **Lọc**: Chỉ xem quán 4+ sao\n💡 **Mẹo**: Đọc review mới nhất',
      'Tìm quán theo khu vực:\n\n🏙️ **Quận 1**: Trung tâm, nhiều lựa chọn\n🎓 **Quận 3**: Gần trường học, giá sinh viên\n🌆 **Quận 7**: Khu vực mới, không gian hiện đại\n🏘️ **Thủ Đức**: Gần đại học, cafe học tập\n🌊 **Quận 2**: View sông, không gian xanh\n\nMỗi khu vực có đặc trưng riêng!'
    ]
  },

  // Giao hàng và delivery
  delivery: {
    patterns: ['giao hàng', 'delivery', 'ship', 'đặt online', 'mang về', 'takeaway'],
    responses: [
      'Dịch vụ giao hàng Brewtopia:\n\n🚚 **Giao tận nơi**: Trong bán kính 3km\n⏰ **Thời gian**: 15-30 phút\n💰 **Phí ship**: 15,000 - 25,000 VNĐ\n📦 **Đóng gói**: Cẩn thận, giữ nhiệt\n🎁 **Miễn phí**: Đơn từ 150,000 VNĐ\n\n📱 **Đặt**: Chọn "Delivery" khi order\n📍 **Theo dõi**: Realtime tracking',
      'Lựa chọn nhận hàng:\n\n🏪 **Tại quán**: Đến lấy trực tiếp\n🚚 **Giao hàng**: Ship tận nơi\n🏃 **Takeaway**: Đặt trước, lấy nhanh\n👥 **Nhóm**: Gộp đơn cùng bạn bè\n⏰ **Đặt lịch**: Giao vào giờ cụ thể\n\nChọn theo sự tiện lợi của bạn!'
    ]
  },

  // Nhóm bạn bè
  friends: {
    patterns: ['bạn bè', 'friends', 'nhóm', 'group', 'cùng bạn', 'chia sẻ', 'share'],
    responses: [
      'Tính năng nhóm bạn bè:\n\n👥 **Chia sẻ quán**: Gửi vị trí cho bạn bè\n💬 **Chat**: Trò chuyện trong app (sắp có)\n📸 **Tag**: Gắn thẻ bạn bè trong bài viết\n🎉 **Sự kiện**: Tạo event nhóm\n💰 **Chia bill**: Thanh toán chung\n\n🔗 **Mời bạn**: Nhận thưởng khi giới thiệu\n🏆 **Thi đua**: Leaderboard tích điểm',
      'Hoạt động nhóm thú vị:\n\n☕ **Cafe tour**: Khám phá quán mới cùng nhau\n🎸 **Acoustic night**: Thưởng thức nhạc sống\n🎂 **Sinh nhật**: Tổ chức party tại quán\n📚 **Study group**: Học nhóm tại cafe\n🎨 **Workshop**: Tham gia lớp học\n\nTạo kỷ niệm đẹp cùng bạn bè!'
    ]
  },

  // Làm việc và học tập
  work: {
    patterns: ['làm việc', 'work', 'học', 'study', 'meeting', 'họp', 'presentation'],
    responses: [
      'Cafe cho công việc/học tập:\n\n💻 **Laptop-friendly**: Bàn rộng, ổ cắm\n🔇 **Yên tĩnh**: Không gian tập trung\n📶 **Wifi tốc độ cao**: Upload/download nhanh\n☕ **Đồ uống unlimited**: Refill miễn phí\n🪑 **Ghế ergonomic**: Ngồi lâu không mệt\n\n🎯 **Lọc**: Tìm theo tag "Work-friendly"\n⏰ **Khung giờ**: 9:00-17:00 ít đông nhất',
      'Không gian meeting:\n\n🏢 **Meeting room**: Phòng riêng, máy chiếu\n👥 **Bàn nhóm**: 4-8 người\n🔊 **Âm thanh**: Micro, loa\n📋 **Whiteboard**: Trình bày ý tưởng\n🍽️ **Catering**: Đồ ăn nhẹ cho team\n\n📞 **Đặt trước**: Gọi quán để book phòng\n💼 **Gói dịch vụ**: Ưu đãi cho doanh nghiệp'
    ]
  },

  // Cà phê đặc biệt
  specialty: {
    patterns: ['cà phê đặc biệt', 'specialty coffee', 'single origin', 'arabica', 'robusta', 'cold brew', 'espresso'],
    responses: [
      'Cà phê đặc biệt tại Brewtopia:\n\n🌍 **Single Origin**: Đà Lạt, Buôn Ma Thuột\n🔥 **Roasting**: Light, medium, dark\n☕ **Brewing**: V60, Chemex, French Press\n🧊 **Cold Brew**: Pha lạnh 12-24h\n🥛 **Specialty Latte**: Nghệ thuật latte art\n\n👨‍🍳 **Barista**: Chuyên nghiệp, tay nghề cao\n🏆 **Award**: Quán đoạt giải coffee competition',
      'Phương pháp pha chế:\n\n☕ **Espresso**: Áp suất cao, đậm đà\n🌊 **Pour Over**: Rót tay, hương vị tinh tế\n🥶 **Cold Drip**: Nhỏ giọt, vị ngọt tự nhiên\n🇻🇳 **Vietnamese**: Phin truyền thống\n🥛 **Milk Coffee**: Cappuccino, Latte, Flat White\n\nMỗi phương pháp cho vị khác nhau!'
    ]
  },

  // Vấn đề kỹ thuật
  technical: {
    patterns: ['lỗi', 'bug', 'error', 'không hoạt động', 'crash', 'chậm', 'lag'],
    responses: [
      'Khắc phục sự cố thường gặp:\n\n🔄 **Khởi động lại**: Tắt và mở lại app\n📱 **Cập nhật**: Kiểm tra version mới nhất\n📶 **Kiểm tra mạng**: Wifi/4G ổn định\n🧹 **Xóa cache**: Trong settings điện thoại\n🔄 **Đăng nhập lại**: Logout và login\n\n🆘 **Vẫn lỗi**: Liên hệ support@brewtopia.com\n📱 **Hotline**: 1900-xxxx',
      'Tối ưu hiệu suất app:\n\n📱 **RAM**: Đóng app khác đang chạy\n💾 **Bộ nhớ**: Xóa ảnh/video cũ\n🔋 **Pin**: Sạc đủ pin cho app hoạt động\n🌐 **Mạng**: Dùng wifi thay vì 4G\n⚡ **Tốc độ**: Chọn chất lượng ảnh thấp hơn\n\nApp sẽ chạy mượt mà hơn!'
    ]
  },

  // Bảo mật và privacy
  security: {
    patterns: ['bảo mật', 'security', 'privacy', 'an toàn', 'mật khẩu', 'password', 'tài khoản'],
    responses: [
      'Bảo mật tài khoản Brewtopia:\n\n🔐 **Mật khẩu mạnh**: Ít nhất 8 ký tự, có số và chữ\n📱 **2FA**: Xác thực 2 bước (sắp có)\n🔒 **Mã hoá**: Dữ liệu được bảo vệ SSL\n👤 **Quyền riêng tư**: Kiểm soát thông tin cá nhân\n🚫 **Không spam**: Không chia sẻ thông tin\n\n⚠️ **Lưu ý**: Không chia sẻ mật khẩu\n🔄 **Đổi mật khẩu**: Định kỳ 3 tháng/lần',
      'Bảo vệ thông tin cá nhân:\n\n✅ **Chính sách**: Đọc Privacy Policy\n🎯 **Mục đích**: Chỉ dùng cho trải nghiệm app\n🚫 **Không bán**: Không bán thông tin cho bên thứ 3\n🔒 **Mã hoá**: Thanh toán được bảo mật\n👥 **Chia sẻ**: Kiểm soát ai xem được profile\n\nDữ liệu của bạn luôn an toàn!'
    ]
  }
};

// Fallback responses khi không hiểu
const fallbackResponses = [
  'Xin lỗi, tôi chưa hiểu rõ câu hỏi của bạn. Bạn có thể hỏi tôi về:\n\n• Tìm quán cafe và đặt bàn\n• Đặt món và thanh toán\n• Điểm thưởng và ưu đãi\n• Livestream và tin tức\n• Cách sử dụng app\n\nHãy thử hỏi cụ thể hơn nhé! 😊',
  'Tôi có thể giúp bạn về:\n\n☕ **Cafe**: Tìm quán, đặt bàn, menu\n🎁 **Ưu đãi**: Khuyến mãi, điểm thưởng\n📱 **App**: Hướng dẫn sử dụng tính năng\n🎥 **Livestream**: Xem live, tương tác\n📰 **Tin tức**: Đăng bài, social\n\nBạn muốn biết về điều gì? 🤔',
  'Hmm, tôi cần thêm thông tin để hỗ trợ bạn tốt hơn. Hãy thử hỏi:\n\n• "Làm sao để đặt bàn?"\n• "Quán nào có wifi tốt?"\n• "Cách tích điểm thưởng?"\n• "Xem livestream ở đâu?"\n• "Thanh toán bằng gì?"\n\nTôi sẽ trả lời chi tiết! 💬'
];

// Hàm tìm response phù hợp
function findResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Tìm pattern phù hợp
  for (const [category, data] of Object.entries(chatPatterns)) {
    for (const pattern of data.patterns) {
      if (lowerMessage.includes(pattern)) {
        // Trả về response ngẫu nhiên
        const responses = data.responses;
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }
  }
  
  // Nếu không tìm thấy, trả về fallback response
  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}

// Hàm mô phỏng typing delay
function simulateTypingDelay(): Promise<void> {
  const delay = Math.random() * 1200 + 800; // 0.8-2 giây
  return new Promise(resolve => setTimeout(resolve, delay));
}

// Hàm chính để gửi tin nhắn
export async function sendMessageToGemini(message: string): Promise<string> {
  try {
    // Mô phỏng thời gian AI "suy nghĩ"
    await simulateTypingDelay();
    
    // Tìm và trả về response
    const response = findResponse(message);
    return response;
    
  } catch (error) {
    console.error('AI Chat Error:', error);
    return 'Xin lỗi, tôi đang gặp chút vấn đề. Hãy thử lại sau nhé! 😅\n\nTrong lúc chờ, bạn có thể:\n• Khám phá các quán cafe gần đây\n• Xem ưu đãi hấp dẫn\n• Tích điểm thưởng\n• Xem livestream\n\nTôi sẽ sớm trở lại hỗ trợ bạn! 🤖'
  }
} 
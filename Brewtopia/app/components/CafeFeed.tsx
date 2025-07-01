import { View, StyleSheet, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../utils/scaling';
import { MaterialIcons } from '@expo/vector-icons';

type FeedbackItem = {
  id: string;
  userName: string;
  userImage: any;
  rating: number;
  comment: string;
  date: string;
  likes: number;
};

export default function CafeFeed({ cafeId, menuid }: { cafeId: string; menuid?: string }) {
  // Feedback tiếng Việt code cứng
  const feedbacks: FeedbackItem[] = [
    {
      id: '1',
      userName: 'Nguyễn Văn A',
      userImage: require('../../assets/images/avatar1.png'),
      rating: 5,
      comment: 'Quán rất đẹp, cà phê ngon, nhân viên thân thiện. Sẽ quay lại!',
      date: '2 ngày trước',
      likes: 24,
    },
    {
      id: '2',
      userName: 'Trần Thị B',
      userImage: require('../../assets/images/avatar2.png'),
      rating: 4,
      comment: 'Không gian yên tĩnh, phù hợp làm việc. Đồ uống ổn.',
      date: '1 tuần trước',
      likes: 15,
    },
    {
      id: '3',
      userName: 'Lê Minh C',
      userImage: require('../../assets/images/avatar3.png'),
      rating: 5,
      comment: 'Món signature rất đáng thử, view đẹp!',
      date: '2 tuần trước',
      likes: 32,
    },
    {
      id: '4',
      userName: 'Phạm Thảo D',
      userImage: require('../../assets/images/avatar2.png'),
      rating: 3,
      comment: 'Giá hơi cao nhưng chất lượng tốt.',
      date: '3 tuần trước',
      likes: 8,
    },
  ];

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <MaterialIcons 
          key={i}
          name={i <= rating ? 'star' : 'star-border'} 
          size={16} 
          color={i <= rating ? '#FFD700' : '#CCCCCC'} 
          style={styles.starIcon}
        />
      );
    }
    return stars;
  };

  return (
    <ScrollView style={styles.feedContainer}>
      <View style={styles.ratingOverview}>
        <Text style={styles.sectionTitle}>Customer Reviews</Text>
        <View style={styles.overallRating}>
          <Text style={styles.ratingNumber}>4.5</Text>
          <View style={styles.starsRow}>
            {renderStars(4.5)}
          </View>
          <Text style={styles.ratingCount}>Based on {feedbacks.length} reviews</Text>
        </View>
      </View>
      
      <View style={styles.addReviewContainer}>
        <TouchableOpacity style={styles.addReviewButton}>
          <Text style={styles.addReviewText}>Write a Review</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.feedbackTitle}>Recent Feedback</Text>
      
      {feedbacks.map((feedback) => (
        <View key={feedback.id} style={styles.feedbackCard}>
          <View style={styles.feedbackHeader}>
            <Image source={feedback.userImage} style={styles.userImage} />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{feedback.userName}</Text>
              <View style={styles.starsRow}>
                {renderStars(feedback.rating)}
              </View>
              <Text style={styles.feedbackDate}>{feedback.date}</Text>
            </View>
          </View>
          
          <Text style={styles.feedbackComment}>{feedback.comment}</Text>
          
          <View style={styles.feedbackActions}>
            <TouchableOpacity style={styles.likeButton}>
              <MaterialIcons name="thumb-up-off-alt" size={16} color="#6E543C" />
              <Text style={styles.likeCount}>{feedback.likes}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.replyButton}>
              <MaterialIcons name="reply" size={16} color="#6E543C" />
              <Text style={styles.replyText}>Reply</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  feedContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: fontScale(18),
    fontWeight: '600',
    marginBottom: verticalScale(16),
    color: '#6E543C',
  },
  ratingOverview: {
    marginBottom: verticalScale(16),
  },
  overallRating: {
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  ratingNumber: {
    fontSize: fontScale(36),
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: verticalScale(8),
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: verticalScale(8),
  },
  starIcon: {
    marginHorizontal: horizontalScale(2),
  },
  ratingCount: {
    fontSize: fontScale(14),
    color: '#666666',
  },
  addReviewContainer: {
    marginBottom: verticalScale(24),
  },
  addReviewButton: {
    backgroundColor: '#6E543C',
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(20),
    borderRadius: moderateScale(8),
    alignSelf: 'center',
  },
  addReviewText: {
    color: '#FFFFFF',
    fontSize: fontScale(14),
    fontWeight: '600',
  },
  feedbackTitle: {
    fontSize: fontScale(16),
    fontWeight: '600',
    marginBottom: verticalScale(12),
    color: '#333333',
  },
  feedbackCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(16),
    padding: moderateScale(16),
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  feedbackHeader: {
    flexDirection: 'row',
    marginBottom: verticalScale(12),
  },
  userImage: {
    width: horizontalScale(40),
    height: verticalScale(40),
    borderRadius: moderateScale(20),
    marginRight: horizontalScale(12),
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: fontScale(16),
    fontWeight: '600',
    color: '#333333',
    marginBottom: verticalScale(4),
  },
  feedbackDate: {
    fontSize: fontScale(12),
    color: '#999999',
    marginTop: verticalScale(4),
  },
  feedbackComment: {
    fontSize: fontScale(14),
    color: '#333333',
    lineHeight: verticalScale(20),
    marginBottom: verticalScale(16),
  },
  feedbackActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: verticalScale(12),
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: horizontalScale(16),
  },
  likeCount: {
    fontSize: fontScale(14),
    color: '#6E543C',
    marginLeft: horizontalScale(4),
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyText: {
    fontSize: fontScale(14),
    color: '#6E543C',
    marginLeft: horizontalScale(4),
  },
}); 
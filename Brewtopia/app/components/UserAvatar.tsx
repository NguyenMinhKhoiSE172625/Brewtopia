import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { horizontalScale, verticalScale, fontScale } from '../utils/scaling';

interface UserAvatarProps {
  name?: string;
  size?: number;
  imageUri?: string;
  showBorder?: boolean;
  borderColor?: string;
  borderWidth?: number;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  name = 'User',
  size = 60,
  imageUri,
  showBorder = false,
  borderColor = '#FFD700',
  borderWidth = 2
}) => {
  // Generate initials from name
  const getInitials = (fullName: string): string => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate consistent color based on name
  const getAvatarColor = (fullName: string): string => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#A9DFBF'
    ];
    
    let hash = 0;
    for (let i = 0; i < fullName.length; i++) {
      hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const initials = getInitials(name);
  const backgroundColor = getAvatarColor(name);
  
  const avatarStyle = {
    width: horizontalScale(size),
    height: horizontalScale(size),
    borderRadius: horizontalScale(size / 2),
    ...(showBorder && {
      borderWidth: borderWidth,
      borderColor: borderColor,
    })
  };

  if (imageUri) {
    return (
      <Image 
        source={{ uri: imageUri }} 
        style={[styles.imageAvatar, avatarStyle]}
      />
    );
  }

  return (
    <View style={[styles.defaultAvatar, avatarStyle, { backgroundColor }]}>
      <Text style={[styles.initialsText, { fontSize: fontScale(size * 0.4) }]}>
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  imageAvatar: {
    // Image styles handled by avatarStyle
  },
  defaultAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default UserAvatar; 
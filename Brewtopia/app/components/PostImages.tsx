import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Modal, Text, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PostImagesProps {
  images: any[];
}

export default function PostImages({ images }: PostImagesProps) {
  const [imageViewVisible, setImageViewVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openImageViewer = (index: number = 0) => {
    setCurrentImageIndex(index);
    setImageViewVisible(true);
  };

  const closeImageViewer = () => {
    setImageViewVisible(false);
  };

  if (!images || images.length === 0 || !images[0]) return null;

  if (images.length === 1) {
    return (
      <>
        <TouchableOpacity activeOpacity={0.9} onPress={() => openImageViewer(0)}>
          <Image source={images[0]} style={{ width: '100%', height: 200, borderRadius: 8 }} resizeMode="cover" />
        </TouchableOpacity>
        <Modal visible={imageViewVisible} transparent animationType="fade" onRequestClose={closeImageViewer}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableWithoutFeedback onPress={closeImageViewer}>
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
            </TouchableWithoutFeedback>
            <TouchableOpacity style={{ position: 'absolute', top: 40, right: 20, zIndex: 10 }} onPress={closeImageViewer}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Image source={images[0]} style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH, resizeMode: 'contain' }} />
          </View>
        </Modal>
      </>
    );
  }

  // Nhiều ảnh
  return (
    <>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {images.slice(0, 3).map((img, idx) => (
          <TouchableOpacity key={idx} style={{ flex: 1 }} activeOpacity={0.9} onPress={() => openImageViewer(idx)}>
            <Image source={img} style={{ width: '100%', height: 120, borderRadius: 8 }} resizeMode="cover" />
          </TouchableOpacity>
        ))}
      </View>
      <Modal visible={imageViewVisible} transparent animationType="fade" onRequestClose={closeImageViewer}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableWithoutFeedback onPress={closeImageViewer}>
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
          </TouchableWithoutFeedback>
          <TouchableOpacity style={{ position: 'absolute', top: 40, right: 20, zIndex: 10 }} onPress={closeImageViewer}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Image source={images[currentImageIndex]} style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH, resizeMode: 'contain' }} />
          {images.length > 1 && (
            <View style={{ position: 'absolute', bottom: 40, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 16 }}>{currentImageIndex + 1} / {images.length}</Text>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
} 
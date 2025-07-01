import React, { useState } from 'react';
import { Redirect } from "expo-router";
import IntroSlider from './components/IntroSlider';

export default function Index() {
  const [showIntro, setShowIntro] = useState(true);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  // Hiển thị intro slides mỗi lần mở app
  if (showIntro) {
    return <IntroSlider onFinish={handleIntroComplete} />;
  }

  // Sau khi hoàn thành intro, chuyển đến role selection
  return <Redirect href="/pages/roles/role" />;
}

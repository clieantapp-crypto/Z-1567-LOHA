

export const playNotificationSound = () => {
    const audio=new Audio('/ding-126626.mp3')
    if (audio) {
      audio!.play().catch((error) => {
        console.error('Failed to play sound:', error);
      });
    }
  };



export const playNotificationSound = () => {
    const audio=new Audio('/scary_ghost.mp3')
    if (audio) {
      audio!.play().catch((error) => {
        console.error('Failed to play sound:', error);
      });
    }
  };

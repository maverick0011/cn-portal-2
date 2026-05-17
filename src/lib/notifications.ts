import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export type NotificationType = 'video' | 'reference' | 'assessment' | 'prep' | 'meeting' | 'general';

export const createNotification = async (title: string, message: string, type: NotificationType) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      title,
      message,
      type,
      createdAt: new Date().toISOString(),
      readBy: []
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
};

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export const createNotification = async (userId, message, type, link) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      message,
      type, // 'post' หรือ 'message'
      link,
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};
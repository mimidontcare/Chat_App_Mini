import { useState, useEffect, useCallback } from 'react';
import { getSocket } from '../services/socket';

export const useOnlineStatus = () => {
  const [onlineUserIds, setOnlineUserIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Yêu cầu danh sách user online từ server
    if (socket.connected) {
      socket.emit('get_online_users');
    }

    const handleConnect = () => {
      socket.emit('get_online_users');
    };

    const handleOnlineList = (ids: number[]) => {
      if (Array.isArray(ids)) {
        setOnlineUserIds(new Set(ids.map(Number)));
      }
    };

    const handleUserOnline = (data: { userId: number }) => {
      if (data?.userId) {
        setOnlineUserIds((prev) => new Set(prev).add(Number(data.userId)));
      }
    };

    const handleUserOffline = (data: { userId: number }) => {
      if (data?.userId) {
        setOnlineUserIds((prev) => {
          const next = new Set(prev);
          next.delete(Number(data.userId));
          return next;
        });
      }
    };

    socket.on('connect', handleConnect);
    socket.on('online_users_list', handleOnlineList);
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('online_users_list', handleOnlineList);
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
    };
  }, []);

  const isUserOnline = useCallback(
    (userId?: number | null): boolean => {
      if (!userId) return false;
      return onlineUserIds.has(Number(userId));
    },
    [onlineUserIds]
  );

  return { onlineUserIds, isUserOnline };
};

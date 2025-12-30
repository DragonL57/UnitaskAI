export function getVietnamTime(): string {
  return new Date().toLocaleString('en-US', { 
    timeZone: 'Asia/Ho_Chi_Minh',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

interface Session {
  id: string;
  title: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export function groupSessionsByDate(sessions: Session[]) {
  const groups: Record<string, Session[]> = {
    'Today': [],
    'Yesterday': [],
    'Previous 7 Days': [],
    'Previous 30 Days': [],
    'Older': []
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);

  sessions.forEach(session => {
    const date = new Date(session.updatedAt);
    
    if (date >= today) {
      groups['Today'].push(session);
    } else if (date >= yesterday) {
      groups['Yesterday'].push(session);
    } else if (date >= weekAgo) {
      groups['Previous 7 Days'].push(session);
    } else if (date >= monthAgo) {
      groups['Previous 30 Days'].push(session);
    } else {
      groups['Older'].push(session);
    }
  });

  return groups;
}

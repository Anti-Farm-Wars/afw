// Map CoC API roles to display-friendly names
export const mapCoCRole = (role: string): string => {
  const roleMap: Record<string, string> = {
    'leader': 'Leader',
    'coLeader': 'Co Leader',
    'admin': 'Elder',
    'member': 'Member'
  };
  
  return roleMap[role] || role;
};

// Role emoji mapping
export const getRoleEmoji = (role: string): string => {
  const emojiMap: Record<string, string> = {
    'leader': '👑',
    'coLeader': '⭐',
    'admin': '🛡️',
    'member': '👤'
  };
  
  return emojiMap[role] || '👤';
};

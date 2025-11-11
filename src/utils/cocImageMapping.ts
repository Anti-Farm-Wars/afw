// CoC Image CDN URLs - These are official Clash of Clans asset URLs
// Note: The actual image paths come from the API responses in iconUrls fields

export interface CoCImage {
  name: string;
  url: string;
}

// For heroes, troops, spells - the API provides iconUrls in the response
// We can use those directly. This file provides fallback emoji mappings
// and helpers to get the correct images from API responses

export const getHeroIcon = (heroName: string): string => {
  const heroIcons: Record<string, string> = {
    'Barbarian King': '🤴',
    'Archer Queen': '👸',
    'Grand Warden': '🧙',
    'Royal Champion': '⚡',
    'Battle Machine': '🤖',
  };
  return heroIcons[heroName] || '👤';
};

export const getTroopIcon = (troopName: string): string => {
  const troopIcons: Record<string, string> = {
    'Barbarian': '💪',
    'Archer': '🏹',
    'Giant': '🏔️',
    'Goblin': '👺',
    'Wall Breaker': '💣',
    'Balloon': '🎈',
    'Wizard': '🧙‍♂️',
    'Healer': '👼',
    'Dragon': '🐉',
    'P.E.K.K.A': '⚔️',
    'Minion': '👿',
    'Hog Rider': '🐗',
    'Valkyrie': '⚔️',
    'Golem': '🗿',
    'Witch': '🧙‍♀️',
    'Lava Hound': '🌋',
    'Bowler': '⚡',
    'Miner': '⛏️',
    'Baby Dragon': '🐲',
    'Electro Dragon': '⚡',
    'Yeti': '🦧',
    'Dragon Rider': '🐉',
    'Electro Titan': '⚡',
    'Root Rider': '🌳',
  };
  return troopIcons[troopName] || '⚔️';
};

export const getPetIcon = (petName: string): string => {
  const petIcons: Record<string, string> = {
    'L.A.S.S.I': '🐕',
    'Electro Owl': '🦉',
    'Mighty Yak': '🦬',
    'Unicorn': '🦄',
    'Frosty': '❄️',
    'Diggy': '🐹',
    'Poison Lizard': '🦎',
    'Phoenix': '🔥',
    'Spirit Fox': '🦊',
  };
  return petIcons[petName] || '🐾';
};

export const getSpellIcon = (spellName: string): string => {
  const spellIcons: Record<string, string> = {
    'Lightning Spell': '⚡',
    'Healing Spell': '💚',
    'Rage Spell': '😡',
    'Jump Spell': '🏃',
    'Freeze Spell': '❄️',
    'Clone Spell': '👥',
    'Invisibility Spell': '👻',
    'Recall Spell': '🔄',
    'Poison Spell': '☠️',
    'Earthquake Spell': '🌍',
    'Haste Spell': '💨',
    'Skeleton Spell': '💀',
    'Bat Spell': '🦇',
    'Overgrowth Spell': '🌿',
  };
  return spellIcons[spellName] || '✨';
};

// Helper to extract image URL from API response
export const getImageUrl = (item: any, size: 'small' | 'medium' | 'large' = 'medium'): string | null => {
  // Check if item has iconUrls (for leagues, leagues, etc.)
  if (item?.iconUrls && typeof item.iconUrls === 'object') {
    return item.iconUrls[size] || item.iconUrls.medium || item.iconUrls.small || null;
  }
  return null;
};

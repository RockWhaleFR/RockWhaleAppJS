// theme/index.js
const theme = {
  colors: {
    primary: '#2D6CDF',
    accent: '#00C2A8',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    bg: '#F8FAFC',
    card: '#FFFFFF',
    ink: '#1E293B',
    sub: '#64748B',
    disabled: '#CBD5E1',
    chipBg: '#F1F5F9',
    chipBorder: '#E2E8F0',
    primaryInk: '#FFFFFF',
  },
  
  wellness: {
    energy: '#F59E0B',
    focus: '#3B82F6',
    calm: '#10B981',
    rest: '#8B5CF6',
    balance: '#EC4899',
  },
  
  spacing: (n) => n * 8,
  
  radius: {
    s: 4,
    m: 8,
    l: 12,
    xl: 16,
    '2xl': 24,
  },
  
  psychology: {
    borderRadius: {
      gentle: 8,
      comfort: 16,
      infinite: 9999,
    },
    shadows: {
      soft: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
      },
      warm: {
        shadowColor: '#2D6CDF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 6,
      },
      intense: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 12,
      },
    },
  },
};

export default theme;
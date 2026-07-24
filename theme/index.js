// theme/index.js - VERSION "NEURO-OCEAN" (Dark Mode, High-Performance)

// 1. Définir les utilitaires de base
const spacing = (factor) => factor * 8; // Espace basé sur 8px

const radius = {
  s: 4,
  m: 8,
  l: 12,       // Standard pour les cartes et boutons
  xl: 20,
  whale: 30,   // Gardé pour la cohérence
};


// 2. Définir la palette de base (les "pots de peinture")
const palette = {
  // 🌌 NEUTRES - Deep Ocean
  ABYSS_BG: "#020617",       // Noir Abyssal (Fonds)
  ABYSS_CARD: "#0F172A",     // Carte/Surface (Slate 900)
  ABYSS_INK: "#F8FAFC",      // Texte Principal (Blanc cassé, lisibilité)
  ABYSS_SUB: "#94A3B8",      // Texte Secondaire (Gris bleuté)
  
  // ⚡️ COULEURS DE MARQUE - Bio-Luminescence & Performance
  // Le NÉON pour l'action, l'info et la clarté (Cyan)
  NEON: {
    primary: "#2DD4BF",
    glow: "#2DD4BF40", // Pour les ombres
  },
  // L'INDIGO pour la profondeur et le focus tech
  INDIGO: {
    primary: "#6366F1",
  },
  // L'AMBRE pour l'alerte/l'achievement
  AMBER: {
    primary: "#FBBF24",
  }
};

// 3. Créer les alias sémantiques (comment on utilise la peinture)
const colors = {
  // Fonds
  bg: palette.ABYSS_BG,
  card: palette.ABYSS_CARD,
  
  // Couleurs d'action et d'accentuation
  primary: palette.NEON.primary,       // Le Cyan NÉON pour l'action (CTA)
  primaryInk: palette.ABYSS_BG,        // Texte noir/sombre sur bouton primaire
  accent: palette.INDIGO.primary,      // L'Indigo pour les accents tech/graphiques
  accentInk: palette.ABYSS_INK,
  
  // Textes
  ink: palette.ABYSS_INK,              // Texte principal
  sub: palette.ABYSS_SUB,              // Texte secondaire
  
  // Sémantiques
  success: '#34D399',      // Vert Émeraude (croissance optimale)
  warning: palette.AMBER.primary, // Ambre (attention, achievement)
  error: '#F87171',        // Rouge discret (alerte sans anxiété)
  info: palette.NEON.primary, // Info = Primary
  
  // Couleurs spécifiques à la psychologie
  calm: palette.NEON.primary,
  focus: palette.INDIGO.primary,
  rest: palette.ABYSS_SUB,
  balance: palette.AMBER.primary,
  grounding: palette.NEON.primary,
  
  // UI
  border: '#1E293B', // Bordures discrètes sur fond sombre
  overlay: 'rgba(2, 6, 23, 0.85)', // Overlay foncé pour modales

};


// 4. Typographie
const typography = {
  h1: { fontSize: 32, fontWeight: '700', color: colors.ink, letterSpacing: -0.5 }, // Style "Engineered"
  h2: { fontSize: 24, fontWeight: '600', color: colors.ink },
  h3: { fontSize: 20, fontWeight: '500', color: colors.ink },
  h4: { fontSize: 18, fontWeight: '500', color: colors.ink },
  body: { fontSize: 16, color: colors.sub, lineHeight: 24 },
  caption: { fontSize: 12, color: colors.sub, lineHeight: 16 },
  link: { color: colors.primary, fontWeight: '600' },
};

// 5. Psychology (Ombres et UI professionnelle)
const psychology = {
  borderRadius: {
    gentle: radius.l,       
    comfort: radius.whale,  
    energy: radius.m,       
    organic: radius.xl,     
  },
  
  // 🔥 OMBRES - Neuro-Performance
  shadows: {
    // Ombre Premium/Profonde (effet 3D discret, utile sur fonds foncés)
    deep: {
      shadowColor: '#000000', // Noir pur pour l'effet de profondeur
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.8,
      shadowRadius: 20,
      elevation: 8,
    },
    // Ombre Bio-Luminescence (le "Neon Glow" pour les éléments d'action)
    neon: {
      shadowColor: palette.NEON.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 12,
      elevation: 6,
    },
    // Ombre Neutre pour cartes
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    }
  },
  
  // Styles d'alertes (ajustés pour le dark mode)
  alerts: {
    default: {
      backgroundColor: colors.card,
      borderLeftWidth: 4,
      borderLeftColor: colors.border,
      padding: spacing(2),
      borderRadius: radius.l
    },
    info: {
      backgroundColor: colors.info + '10',
      borderLeftWidth: 4,
      borderLeftColor: colors.info,
      padding: spacing(2),
      borderRadius: radius.l
    },
    warning: {
      backgroundColor: colors.warning + '10',
      borderLeftWidth: 4,
      borderLeftColor: colors.warning,
      padding: spacing(2),
      borderRadius: radius.l
    },
    error: {
      backgroundColor: colors.error + '10',
      borderLeftWidth: 4,
      borderLeftColor: colors.error,
      padding: spacing(2),
      borderRadius: radius.l
    },
    success: {
      backgroundColor: colors.success + '10',
      borderLeftWidth: 4,
      borderLeftColor: colors.success,
      padding: spacing(2),
      borderRadius: radius.l
    }
  }
};


// 6. Export Final
const theme = {
  palette,
  colors,
  radius,
  typography,
  spacing,
  psychology
};

export default theme;
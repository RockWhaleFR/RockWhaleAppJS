// data/habits.js
const habits = [
  // --------- ÉNERGIE ---------
  {
    id: 1,
    title: "Boire un grand verre d'eau",
    category: "Énergie",
    duration: "≤ 2 min",
    difficulty: "ultra-douce",
    done: false,
    scientificFact: "L'hydratation améliore la vigilance et les fonctions cognitives à court terme.",
    instructions: [
      "Prenez un verre d'eau à température ambiante",
      "Asseyez-vous confortablement le dos droit",
      "Prenez une première gorgée et gardez-la en bouche 2 secondes",
      "Avalez lentement en sentant l'eau descendre",
      "Répétez jusqu'à finir le verre (environ 8 gorgées)",
      "Respirez profondément après la dernière gorgée"
    ],
    tips: [
      "Tenez le verre avec les deux mains pour plus de conscience",
      "Fermez les yeux pour mieux sentir les sensations",
      "Imaginez l'énergie positive que l'eau vous apporte",
      "Préférez l'eau à température ambiante pour une meilleure absorption"
    ],
    commonMistakes: [
      "Boire trop vite sans attention",
      "Boire debout ou en marchant",
      "Boire glacé (peut choquer le système digestif)",
      "Regarder son téléphone en buvant"
    ],
    timer: null
  },
  {
    id: 2,
    title: "30 s de jumping jacks",
    category: "Énergie",
    duration: "≤ 2 min", 
    difficulty: "ultra-douce",
    done: false,
    scientificFact: "De brèves bouffées d'activité élèvent la fréquence cardiaque et l'énergie perçue.",
    instructions: [
      "Tenez-vous droit, pieds joints et bras le long du corps",
      "Sautez en écartant les jambes plus larges que les épaules",
      "Simultanément, levez les bras latéralement au-dessus de la tête",
      "Les mains peuvent se toucher au point culminant",
      "Revenez à la position initiale en un mouvement fluide",
      "Répétez continuellement pendant 30 secondes"
    ],
    tips: [
      "Gardez le dos droit et les abdos engagés",
      "Atterrissez doucement sur les plantes des pieds",
      "Respirez régulièrement - inspirez en sautant, expirez en revenant",
      "Commencez lentement et augmentez le rythme progressivement",
      "Souriez pour libérer des endorphines"
    ],
    commonMistakes: [
      "Arrondir le dos pendant le mouvement",
      "Bloquer la respiration",
      "Atterrir lourdement sur les talons",
      "Forcer l'amplitude au détriment de la fluidité"
    ],
    timer: null
  },
  {
    id: 3,
    title: "10 squats lents",
    category: "Énergie",
    duration: "≤ 2 min",
    difficulty: "ultra-douce",
    done: false,
    scientificFact: "Activer les grands groupes musculaires réveille le système neuromoteur.",
    instructions: [
      "Tenez-vous debout, pieds écartés largeur des épaules",
      "Pointes de pieds légèrement tournées vers l'extérieur",
      "Levez les bras devant vous pour l'équilibre",
      "Pliez les genoux et descendez comme pour vous asseoir",
      "Allez jusqu'à ce que les cuisses soient parallèles au sol",
      "Gardez le dos droit et le poids sur les talons",
      "Remontez lentement en engageant les fessiers",
      "Répétez 10 fois avec un rythme contrôlé"
    ],
    tips: [
      "Imaginez vous asseoir sur une chaise invisible",
      "Expirez en remontant, inspirez en descendant",
      "Gardez les genoux alignés avec les pieds",
      "Regardez droit devant pour garder le dos droit"
    ],
    commonMistakes: [
      "Les genoux qui rentrent vers l'intérieur",
      "Dos arrondi vers l'avant",
      "Talons qui décollent du sol",
      "Descendre trop vite sans contrôle"
    ],
    timer: null
  },
  {
    id: 4,
    title: "Respiration énergisante 3-2 (x6)",
    category: "Énergie",
    duration: "≤ 2 min",
    difficulty: "ultra-douce",
    done: false,
    scientificFact: "Les respirations rythmées modulent le tonus sympathique et la vigilance.",
    instructions: [
      "Asseyez-vous droit, mains sur les genoux",
      "Fermez les yeux et prenez une inspiration profonde par le nez (3 secondes)",
      "Retenez votre respiration (2 secondes)",
      "Expirez brusquement par la bouche en contractant les abdos",
      "L'expiration doit être audible et énergique",
      "Reprenez immédiatement sans pause",
      "Répétez 6 cycles complets"
    ],
    tips: [
      "Concentrez-vous sur la force de l'expiration",
      "Imaginez chasser la fatigue avec chaque expiration",
      "Gardez les épaules relâchées",
      "Après les 6 cycles, respirez normalement et sentez l'énergie"
    ],
    commonMistakes: [
      "Forcer sur les épaules au lieu des abdos",
      "Oublier de retenir la respiration",
      "Expirer trop doucement",
      "Se précipiter entre les cycles"
    ],
    timer: {
      inhale: 3,
      hold: 2,
      exhale: 1,
      cycles: 6
    }
  },

  // --------- HUMEUR ---------
  {
    id: 5,
    title: "Respiration 4-2-6 (1 min)",
    category: "Humeur",
    duration: "≤ 2 min",
    difficulty: "ultra-douce",
    done: false,
    scientificFact: "Allonger l'expiration stimule le nerf vague et apaise le stress.",
    instructions: [
      "Asseyez-vous confortablement, le dos droit mais détendu",
      "Fermez les yeux et posez une main sur votre ventre",
      "Inspirez profondément par le nez pendant 4 secondes",
      "Sentir votre ventre se gonfler légèrement",
      "Retenez votre respiration pendant 2 secondes",
      "Expirez lentement par la bouche pendant 6 secondes",
      "Sentir votre ventre se dégonfler complètement",
      "Répétez ce cycle 5 fois (1 minute totale)"
    ],
    tips: [
      "Faites le son 'whoosh' en expirant pour ralentir naturellement",
      "Imaginez souffler sur une bougie sans l'éteindre",
      "Concentrez-vous sur la sensation de l'air qui entre et sort",
      "Si 6 secondes est trop long, commencez par 4 secondes d'expiration"
    ],
    commonMistakes: [
      "Forcer la respiration au lieu de la laisser fluide",
      "Hausser les épaules vers les oreilles",
      "Oublier de respirer avec le diaphragme",
      "Se frustrer si le rythme n'est pas parfait"
    ],
    timer: {
      inhale: 4,
      hold: 2,
      exhale: 6,
      cycles: 5
    }
  },
  {
    id: 6,
    title: "3 respirations profondes",
    category: "Humeur",
    duration: "≤ 2 min",
    difficulty: "ultra-douce",
    done: false,
    scientificFact: "Une micro-pause respiratoire réduit la charge mentale et clarifie l'attention.",
    instructions: [
      "Arrêtez ce que vous êtes en train de faire",
      "Mettez une main sur la poitrine, l'autre sur le ventre",
      "Inspirez lentement par le nez en comptant jusqu'à 4",
      "Sentir le ventre se gonfler puis la poitrine",
      "Retenez l'air 2 secondes en souriant légèrement",
      "Expirez par la bouche en comptant jusqu'à 6",
      "Sentir la poitrine puis le ventre se vider",
      "Répétez 3 fois avec pleine conscience"
    ],
    tips: [
      "Fermez les yeux pour mieux vous concentrer",
      "Imaginez inspirer du calme et expirer le stress",
      "Après les 3 respirations, remarquez le changement",
      "Practicez cette technique plusieurs fois par jour"
    ],
    commonMistakes: [
      "Respirer seulement avec la poitrine",
      "Forcer l'amplitude au détriment du confort",
      "Penser à autre chose pendant l'exercice",
      "Négliger la pause après l'inspiration"
    ],
    timer: {
      inhale: 4,
      hold: 2,
      exhale: 6,
      cycles: 3
    }
  },
  {
    id: 7,
    title: "Écrire 1 gratitude",
    category: "Humeur",
    duration: "≤ 2 min",
    difficulty: "ultra-douce",
    done: false,
    scientificFact: "La reconnaissance augmente les affects positifs et l'optimisme.",
    instructions: [
      "Prenez un carnet ou ouvrez une note sur votre téléphone",
      "Fermez les yeux et respirez profondément une fois",
      "Demandez-vous : 'Pour quoi suis-je reconnaissant en ce moment ?'",
      "Notez la première chose qui vous vient à l'esprit",
      "Écrivez 1-2 phrases détaillant pourquoi vous êtes reconnaissant",
      "Relisez ce que vous avez écrit en souriant",
      "Prenez un moment pour ressentir la gratitude"
    ],
    tips: [
      "Soyez spécifique plutôt que général",
      "Les petites choses comptent autant que les grandes",
      "Variez les sujets de jour en jour",
      "Relisez vos gratitudes passées périodiquement"
    ],
    commonMistakes: [
      "Trop réfléchir - la première idée est souvent la meilleure",
      "Se limiter aux grandes réussites",
      "Écrire mécaniquement sans ressentir",
      "Oublier de relire et d'apprécier"
    ],
    timer: null
  },
  {
    id: 8,
    title: "Sourire 30 s",
    category: "Humeur",
    duration: "≤ 2 min",
    difficulty: "ultra-douce",
    done: false,
    scientificFact: "Le feedback facial peut influencer l'humeur via les voies neuro-viscérales.",
    instructions: [
      "Asseyez-vous ou restez debout confortablement",
      "Détendez votre mâchoire et votre front",
      "Commencez par un petit sourire intérieur",
      "Laissez le sourire grandir naturellement jusqu'aux yeux",
      "Maintenez le sourire authentique pendant 30 secondes",
      "Si besoin, pensez à quelque chose d'amusant ou joyeux",
      "Sentir les muscles du visage se détendre",
      "Remarquez comment votre humeur change"
    ],
    tips: [
      "Un sourire des yeux est plus efficace qu'un sourire forcé",
      "Pensez à une personne que vous aimez",
      "Imaginez une situation joyeuse",
      "Practicez devant un miroir pour trouver votre vrai sourire"
    ],
    commonMistakes: [
      "Forcer un sourire non authentique",
      "Crisper les autres muscles du visage",
      "Penser à des choses stressantes en souriant",
      "Arrêter trop tôt - 30 secondes est le minimum efficace"
    ],
    timer: null
  },

  // --------- STRESS ---------
  {
    id: 9,
    title: "Relâcher les épaules (60 s)",
    category: "Stress",
    duration: "≤ 2 min",
    difficulty: "ultra-douce",
    done: false,
    scientificFact: "Relâcher les trapèzes réduit la tension somatique liée au stress.",
    instructions: [
      "Prenez conscience de la tension dans vos épaules",
      "Inspirez profondément et haussez les épaules vers les oreilles",
      "Maintenez la tension 3 secondes en retenant votre respiration",
      "Expirez brusquement en laissant tomber les épaules",
      "Sentir la différence avant/après",
      "Répétez 3 fois avec attention",
      "Ensuite, faites de petits cercles avec les épaules",
      "5 rotations vers l'avant, 5 vers l'arrière"
    ],
    tips: [
      "Imaginez que vos épaules s'éloignent de vos oreilles",
      "Visualisez la tension qui s'écoule vers le sol",
      "Soufflez comme si vous chassiez le stress",
      "Practicez cet exercice toutes les heures devant l'ordinateur"
    ],
    commonMistakes: [
      "Forcer le mouvement au lieu de le sentir",
      "Oublier de respirer consciemment",
      "Se concentrer seulement sur une épaule",
      "Négliger la phase de tension avant le relâchement"
    ],
    timer: null
  },
  {
    id: 10,
    title: "Mini scan corporel (60 s)",
    category: "Stress",
    duration: "≤ 2 min",
    difficulty: "ultra-douce",
    done: false,
    scientificFact: "Ramener l'attention au corps diminue la rumination et ré-ancre le présent.",
    instructions: [
      "Fermez les yeux et prenez une respiration profonde",
      "Portez attention à vos pieds - sentez-ils le sol ?",
      "Remontez vers les chevilles, mollets, genoux",
      "Scannez les cuisses, hanches, bassin",
      "Remarquez le ventre, poitrine, dos",
      "Portez attention aux mains, avant-bras, coudes",
      "Scannez les épaules, cou, nuque",
      "Terminez par le visage - mâchoire, yeux, front"
    ],
    tips: [
      "Ne jugez pas, observez juste les sensations",
      "Respirez dans les zones tendues",
      "Imaginez une lumière chaude qui scanne votre corps",
      "Practicez cet exercice les yeux ouverts si besoin"
    ],
    commonMistakes: [
      "Essayer de relaxer activement au lieu d'observer",
      "Se précipiter dans le scan",
      "Oublier de respirer pendant l'exercice",
      "Juger les sensations comme bonnes ou mauvaises"
    ],
    timer: null
  },
  {
    id: 11,
    title: "Regard loin 20-20-20",
    category: "Stress",
    duration: "≤ 2 min",
    difficulty: "ultra-douce",
    done: false,
    scientificFact: "Détendre l'accommodation visuelle baisse la fatigue et la tension oculaire.",
    instructions: [
      "Trouvez un objet à au moins 6 mètres de distance",
      "Regardez cet objet pendant 20 secondes",
      "Clignez des yeux plusieurs fois consciemment",
      "Fermez les yeux 10 secondes en respirant profondément",
      "Ouvrez les yeux et faites de grands cercles avec les yeux",
      "Regardez à gauche, droite, haut, bas sans bouger la tête",
      "Terminez par un palming - frottez vos mains et couvrez vos yeux"
    ],
    tips: [
      "Choisissez un objet agréable à regarder",
      "Practicez cette technique toutes les 20 minutes d'écran",
      "Clignez régulièrement des yeux devant les écrans",
      "Ajustez la luminosité de vos écrans"
    ],
    commonMistakes: [
      "Regarder un objet trop proche",
      "Oublier de cligner des yeux",
      "Forcer la mise au point au lieu de détendre",
      "Négliger la phase les yeux fermés"
    ],
    timer: null
  },
  {
    id: 12,
    title: "Étirement de nuque (60 s)",
    category: "Stress",
    duration: "≤ 2 min",
    difficulty: "ultra-douce",
    done: false,
    scientificFact:
      "Micro-étirements réduisent la tension musculaire et améliorent le confort.",
  },

  // ——— SOMMEIL ———
  {
    id: 13,
    title: "Respiration 4-7-8 (x2)",
    category: "Sommeil",
    duration: "≤ 2 min",
    difficulty: "ultra-douce",
    done: false,
    scientificFact:
      "Ralentir la respiration facilite la transition vers un état parasympathique.",
  },
  {
    id: 14,
    title: "Poser le téléphone loin",
    category: "Sommeil",
    duration: "≤ 2 min",
    difficulty: "ultra-douce",
    done: false,
    scientificFact:
      "Réduire l’exposition tardive aux écrans améliore l’endormissement.",
  },
  {
    id: 15,
    title: "Préparer le réveil (1 geste)",
    category: "Sommeil",
    duration: "≤ 2 min",
    difficulty: "ultra-douce",
    done: false,
    scientificFact:
      "Des repères clairs stabilisent l’horloge circadienne.",
  },
  {
    id: 16,
    title: "Noter une pensée à déposer",
    category: "Sommeil",
    duration: "≤ 2 min",
    difficulty: "ultra-douce",
    done: false,
    scientificFact:
      "Externaliser les pensées diminue l’activation cognitive pré-sommeil.",
  },
];

export default habits;

// services/stressPredictionService.js
// Service IA pour prédiction proactive des pics de stress

class StressPredictionService {
  constructor() {
    this.MODEL_VERSION = '1.0.0';
    this.PREDICTION_WINDOW = 120; // 2 heures en minutes
    this.CONFIDENCE_THRESHOLD = 0.6;
  }

  /**
   * Prédit les pics de stress basés sur patterns historiques + contexte
   */
  async predictStressPeaks(user, currentContext) {
    const features = this.extractPredictiveFeatures(user, currentContext);
    
    // Analyse des patterns temporels
    const temporalRisk = this.analyzeTemporalPatterns(user.history, currentContext.currentTime);
    
    // Analyse contextuelle
    const contextualRisk = this.analyzeContextualRisks(currentContext);
    
    // Analyse physiologique (si disponible)
    const physiologicalRisk = this.analyzePhysiologicalSignals(currentContext.biometrics);
    
    // Score composite
    const riskScore = this.calculateCompositeRiskScore({
      temporal: temporalRisk,
      contextual: contextualRisk,
      physiological: physiologicalRisk
    });
    
    if (riskScore.probability > this.CONFIDENCE_THRESHOLD) {
      return {
        alert: true,
        probability: riskScore.probability,
        predictedTime: riskScore.estimatedTime,
        triggers: riskScore.identifiedTriggers,
        preventiveTechnique: this.selectPreventiveTechnique(riskScore, user),
        urgency: this.calculateUrgency(riskScore),
        explanation: this.generateExplanation(riskScore)
      };
    }
    
    return { alert: false };
  }

  /**
   * Extraction des features prédictives
   */
  extractPredictiveFeatures(user, context) {
    const now = new Date();
    
    return {
      // Temporels
      hourOfDay: now.getHours(),
      dayOfWeek: now.getDay(),
      isMonday: now.getDay() === 1, // Lundi = +risque
      isEndOfMonth: now.getDate() > 25, // Deadlines
      
      // Comportementaux
      timeSinceLastBreak: context.timeSinceLastBreak || 0,
      timeSinceLastTechnique: this.getTimeSinceLastTechnique(user),
      consecutiveWorkHours: context.consecutiveWorkHours || 0,
      screenTimeToday: context.screenTime || 0,
      
      // Calendrier
      meetingsToday: context.meetingsCount || 0,
      upcomingStressfulMeeting: context.hasStressfulMeetingSoon || false,
      hasBackToBackMeetings: context.hasBackToBackMeetings || false,
      meetingDensity: this.calculateMeetingDensity(context.calendarEvents),
      
      // Physiologiques
      hrvDelta: this.calculateHRVDelta(context.biometrics),
      restingHRIncrease: this.calculateHRIncrease(context.biometrics),
      sleepDebt: context.biometrics?.sleepDebt || 0,
      recoveryScore: context.biometrics?.recoveryScore || 100,
      
      // Historiques
      stressAtThisHourHistorical: this.getHistoricalStressPattern(user.history, now.getHours()),
      recentStressTrend: this.calculateRecentStressTrend(user.history),
      typicalPeakTime: this.identifyTypicalPeakTime(user.history)
    };
  }

  /**
   * Analyse des patterns temporels
   */
  analyzeTemporalPatterns(history, currentTime) {
    if (!history || history.length < 7) {
      return { risk: 0.3, confidence: 'low' };
    }
    
    const hour = currentTime.getHours();
    const dayOfWeek = currentTime.getDay();
    
    // Filtrer historique même heure ±1h, même jour semaine
    const relevantHistory = history.filter(entry => {
      const entryDate = new Date(entry.date);
      const hourDiff = Math.abs(entryDate.getHours() - hour);
      const sameDayType = (entryDate.getDay() === dayOfWeek);
      return hourDiff <= 1 && sameDayType;
    });
    
    if (relevantHistory.length < 3) {
      return { risk: 0.3, confidence: 'low' };
    }
    
    // Calculer % d'épisodes stressants à cette heure
    const stressfulEpisodes = relevantHistory.filter(entry => 
      entry.moodBefore === 'Pas top' || entry.moodBefore === 'Neutre'
    );
    
    const stressRate = stressfulEpisodes.length / relevantHistory.length;
    
    return {
      risk: stressRate,
      confidence: relevantHistory.length > 10 ? 'high' : 'medium',
      pattern: `${Math.round(stressRate * 100)}% de stress historique à cette heure`,
      sampleSize: relevantHistory.length
    };
  }

  /**
   * Analyse des risques contextuels (calendrier, tâches)
   */
  analyzeContextualRisks(context) {
    let riskScore = 0;
    const triggers = [];
    
    // Meetings
    if (context.hasBackToBackMeetings) {
      riskScore += 0.25;
      triggers.push('3+ réunions consécutives sans pause');
    }
    
    if (context.meetingsCount > 5) {
      riskScore += 0.15;
      triggers.push(`${context.meetingsCount} réunions aujourd'hui`);
    }
    
    // Temps sans pause
    if (context.timeSinceLastBreak > 120) { // >2h
      riskScore += 0.20;
      triggers.push('Pas de pause depuis 2h+');
    }
    
    // Mots-clés stressants dans calendrier
    if (context.hasStressfulMeetingSoon) {
      riskScore += 0.30;
      triggers.push('Réunion stressante dans <1h');
    }
    
    // Heure critique (14h-16h = creux circadien)
    const hour = new Date().getHours();
    if (hour >= 14 && hour <= 16) {
      riskScore += 0.10;
      triggers.push('Creux circadien naturel');
    }
    
    return {
      risk: Math.min(riskScore, 1.0),
      triggers,
      confidence: 'high'
    };
  }

  /**
   * Analyse des signaux physiologiques (Apple Watch, Oura, etc.)
   */
  analyzePhysiologicalSignals(biometrics) {
    if (!biometrics || !biometrics.hasData) {
      return { risk: 0, confidence: 'none', message: 'Connectez une montre pour prédictions avancées' };
    }
    
    let riskScore = 0;
    const signals = [];
    
    // HRV en baisse = stress accru
    if (biometrics.hrvTrend === 'declining') {
      const hrvDrop = biometrics.hrvDropPercent || 0;
      if (hrvDrop > 20) {
        riskScore += 0.35;
        signals.push(`HRV -${hrvDrop}% (récupération insuffisante)`);
      } else if (hrvDrop > 10) {
        riskScore += 0.20;
        signals.push(`HRV -${hrvDrop}% (vigilance requise)`);
      }
    }
    
    // Rythme cardiaque de repos élevé
    if (biometrics.restingHRIncrease > 10) {
      riskScore += 0.25;
      signals.push(`Fréquence cardiaque repos +${biometrics.restingHRIncrease}bpm`);
    }
    
    // Dette de sommeil
    if (biometrics.sleepDebt > 2) { // >2h de dette
      riskScore += 0.20;
      signals.push(`Dette sommeil: ${biometrics.sleepDebt}h`);
    }
    
    // Score de récupération faible
    if (biometrics.recoveryScore < 30) {
      riskScore += 0.30;
      signals.push(`Récupération critique: ${biometrics.recoveryScore}/100`);
    }
    
    return {
      risk: Math.min(riskScore, 1.0),
      signals,
      confidence: 'very-high', // Données physiologiques = plus fiables
      recommendation: riskScore > 0.5 ? 'REPOS OBLIGATOIRE' : 'Vigilance accrue'
    };
  }

  /**
   * Calcul du score composite avec pondération intelligente
   */
  calculateCompositeRiskScore(risks) {
    // Pondération adaptative selon qualité des données
    const weights = {
      physiological: risks.physiological.confidence === 'very-high' ? 0.5 : 0,
      contextual: 0.35,
      temporal: risks.temporal.confidence === 'high' ? 0.25 : 0.15
    };
    
    // Normaliser si pas de données physiologiques
    if (weights.physiological === 0) {
      weights.contextual = 0.6;
      weights.temporal = 0.4;
    }
    
    const compositeScore = 
      (risks.physiological.risk * weights.physiological) +
      (risks.contextual.risk * weights.contextual) +
      (risks.temporal.risk * weights.temporal);
    
    // Identifier triggers multiples
    const allTriggers = [
      ...(risks.contextual.triggers || []),
      ...(risks.physiological.signals || []),
      risks.temporal.pattern
    ].filter(Boolean);
    
    // Estimation du timing
    const estimatedTime = this.estimateStressPeakTiming(risks);
    
    return {
      probability: compositeScore,
      estimatedTime,
      identifiedTriggers: allTriggers,
      dataQuality: this.assessDataQuality(risks)
    };
  }

  /**
   * Sélection de la technique préventive optimale
   */
  selectPreventiveTechnique(riskScore, user) {
    const { probability, identifiedTriggers, estimatedTime } = riskScore;
    
    // Urgence critique = techniques d'urgence
    if (probability > 0.8) {
      return {
        id: 'physiological-sigh',
        reason: 'Intervention d\'urgence - stress imminent détecté',
        timing: 'MAINTENANT'
      };
    }
    
    // Stress physiologique détecté
    if (identifiedTriggers.some(t => t.includes('HRV') || t.includes('récupération'))) {
      return {
        id: 'nsdr-protocol',
        reason: 'Votre corps montre des signes de fatigue - récupération prioritaire',
        timing: estimatedTime
      };
    }
    
    // Meetings stressants à venir
    if (identifiedTriggers.some(t => t.includes('réunion'))) {
      return {
        id: 'box-breathing-seals',
        reason: 'Préparez-vous mentalement pour votre réunion',
        timing: '10 minutes avant la réunion'
      };
    }
    
    // Creux d'énergie circadien
    if (identifiedTriggers.some(t => t.includes('circadien'))) {
      return {
        id: 'nasa-nap-protocol',
        reason: 'Pic de performance garanti après 10min de récupération',
        timing: 'Dans les 30 prochaines minutes'
      };
    }
    
    // Défaut : respiration courte
    return {
      id: 'vision-tunneling',
      reason: 'Pause préventive rapide recommandée',
      timing: 'Dans l\'heure qui vient'
    };
  }

  /**
   * Calcul de l'urgence de l'intervention
   */
  calculateUrgency(riskScore) {
    if (riskScore.probability > 0.8) return 'CRITICAL';
    if (riskScore.probability > 0.65) return 'HIGH';
    if (riskScore.probability > 0.5) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Génération d'explication human-friendly
   */
  generateExplanation(riskScore) {
    const { probability, identifiedTriggers } = riskScore;
    const triggerText = identifiedTriggers.slice(0, 2).join(' + ');
    
    if (probability > 0.8) {
      return `🚨 Alerte stress critique (${Math.round(probability * 100)}%) : ${triggerText}. Intervention immédiate recommandée.`;
    }
    
    if (probability > 0.65) {
      return `⚠️ Risque élevé de stress (${Math.round(probability * 100)}%) détecté : ${triggerText}. Prenez une pause préventive.`;
    }
    
    return `ℹ️ Tension modérée prévue (${Math.round(probability * 100)}%) : ${triggerText}. Restez vigilant.`;
  }

  /**
   * Helpers
   */
  getTimeSinceLastTechnique(user) {
    if (!user.history || user.history.length === 0) return 999;
    const lastEntry = user.history[user.history.length - 1];
    const lastDate = new Date(lastEntry.date);
    return Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60));
  }

  calculateMeetingDensity(calendarEvents) {
    if (!calendarEvents || calendarEvents.length === 0) return 0;
    const totalMinutes = calendarEvents.reduce((sum, event) => sum + (event.duration || 30), 0);
    return totalMinutes / 480; // Ratio sur journée de 8h
  }

  calculateHRVDelta(biometrics) {
    if (!biometrics || !biometrics.currentHRV || !biometrics.baselineHRV) return 0;
    return ((biometrics.currentHRV - biometrics.baselineHRV) / biometrics.baselineHRV) * 100;
  }

  calculateHRIncrease(biometrics) {
    if (!biometrics || !biometrics.currentRestingHR || !biometrics.baselineRestingHR) return 0;
    return biometrics.currentRestingHR - biometrics.baselineRestingHR;
  }

  getHistoricalStressPattern(history, hour) {
    if (!history || history.length < 5) return 0;
    
    const relevantEntries = history.filter(entry => {
      const entryHour = new Date(entry.date).getHours();
      return Math.abs(entryHour - hour) <= 1;
    });
    
    if (relevantEntries.length === 0) return 0;
    
    const stressedCount = relevantEntries.filter(e => 
      e.moodBefore === 'Pas top' || e.moodBefore === 'Neutre'
    ).length;
    
    return stressedCount / relevantEntries.length;
  }

  calculateRecentStressTrend(history) {
    if (!history || history.length < 7) return 'insufficient-data';
    
    const recent = history.slice(-7);
    const older = history.slice(-14, -7);
    
    if (older.length === 0) return 'insufficient-data';
    
    const recentStress = recent.filter(e => e.moodBefore === 'Pas top').length / recent.length;
    const olderStress = older.filter(e => e.moodBefore === 'Pas top').length / older.length;
    
    if (recentStress > olderStress + 0.2) return 'increasing';
    if (recentStress < olderStress - 0.2) return 'decreasing';
    return 'stable';
  }

  identifyTypicalPeakTime(history) {
    if (!history || history.length < 10) return null;
    
    const hourCounts = {};
    history.forEach(entry => {
      if (entry.moodBefore === 'Pas top') {
        const hour = new Date(entry.date).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });
    
    const peakHour = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])[0];
    
    return peakHour ? parseInt(peakHour[0]) : null;
  }

  estimateStressPeakTiming(risks) {
    const now = new Date();
    
    // Si réunion stressante détectée, utiliser son timing
    if (risks.contextual.triggers?.some(t => t.includes('réunion'))) {
      return new Date(now.getTime() + 30 * 60000); // Dans 30 min
    }
    
    // Si creux circadien
    const hour = now.getHours();
    if (hour >= 13 && hour <= 15) {
      return new Date(now.getTime() + 15 * 60000); // Dans 15 min
    }
    
    // Défaut : 1h
    return new Date(now.getTime() + 60 * 60000);
  }

  assessDataQuality(risks) {
    let quality = 0;
    
    if (risks.physiological.confidence === 'very-high') quality += 40;
    if (risks.contextual.confidence === 'high') quality += 30;
    if (risks.temporal.confidence === 'high') quality += 30;
    else if (risks.temporal.confidence === 'medium') quality += 15;
    
    if (quality >= 70) return 'excellent';
    if (quality >= 40) return 'good';
    return 'limited';
  }

  /**
   * Analyse calendrier pour détecter patterns stressants
   */
  analyzeCalendarForStress(calendarEvents) {
    if (!calendarEvents || calendarEvents.length === 0) {
      return {
        hasStressfulMeetingSoon: false,
        hasBackToBackMeetings: false,
        meetingsCount: 0,
        stressKeywordsDetected: []
      };
    }
    
    const now = new Date();
    const stressKeywords = [
      'review', 'performance', 'evaluation', 'urgent', 'critique',
      'deadline', 'présentation', 'pitch', 'board', 'client difficile',
      'conflit', 'négociation', 'licenciement', 'restructuration'
    ];
    
    // Détecter réunions stressantes dans la prochaine heure
    const upcomingStressful = calendarEvents.filter(event => {
      const eventStart = new Date(event.start);
      const minutesUntil = (eventStart - now) / 60000;
      
      if (minutesUntil > 0 && minutesUntil < 60) {
        const title = (event.title || '').toLowerCase();
        return stressKeywords.some(keyword => title.includes(keyword));
      }
      return false;
    });
    
    // Détecter back-to-back (moins de 15 min entre meetings)
    let backToBackCount = 0;
    for (let i = 0; i < calendarEvents.length - 1; i++) {
      const current = new Date(calendarEvents[i].end);
      const next = new Date(calendarEvents[i + 1].start);
      const gapMinutes = (next - current) / 60000;
      
      if (gapMinutes < 15) backToBackCount++;
    }
    
    return {
      hasStressfulMeetingSoon: upcomingStressful.length > 0,
      hasBackToBackMeetings: backToBackCount >= 2,
      meetingsCount: calendarEvents.length,
      stressKeywordsDetected: upcomingStressful.map(e => e.title)
    };
  }
}

export default new StressPredictionService();
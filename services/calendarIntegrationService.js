// services/calendarIntegrationService.js
// Analyse prédictive du calendrier pour prévention proactive

import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

class CalendarIntegrationService {
  constructor() {
    this.STRESS_KEYWORDS = [
      // Réunions stressantes
      'review', 'performance', 'evaluation', 'appraisal',
      'deadline', 'urgent', 'critique', 'critical',
      
      // Présentation/pitch
      'présentation', 'presentation', 'pitch', 'demo',
      'board', 'investors', 'stakeholders',
      
      // Conflits potentiels
      'difficult', 'difficile', 'conflit', 'conflict',
      'négociation', 'negotiation', 'licenciement',
      
      // Pression temporelle
      'sprint', 'crunch', 'rush', 'asap',
      
      // Client/externe
      'client difficile', 'angry client', 'complaint',
      'escalation', 'crisis'
    ];
    
    this.RECOVERY_KEYWORDS = [
      'pause', 'break', 'lunch', 'déjeuner',
      'méditation', 'meditation', 'sport', 'gym',
      'coaching', 'formation', 'training'
    ];
  }

  /**
   * Demander permissions et récupérer événements
   */
  async requestCalendarAccess() {
    try {
      if (Platform.OS === 'web') {
        return { 
          granted: false, 
          message: 'Calendrier non disponible sur web (nécessite app native)' 
        };
      }

      const { status } = await Calendar.requestCalendarPermissionsAsync();
      
      if (status === 'granted') {
        return { granted: true };
      }
      
      return { 
        granted: false, 
        message: 'Permission calendrier refusée. Activez dans Réglages > Rockwhale.' 
      };
    } catch (error) {
      console.error('Erreur permission calendrier:', error);
      return { granted: false, message: error.message };
    }
  }

  /**
   * Récupérer événements du jour + analyse
   */
  async getTodayEventsWithAnalysis() {
    try {
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      
      if (!calendars || calendars.length === 0) {
        return { events: [], analysis: null };
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Récupérer événements d'aujourd'hui
      const events = await Calendar.getEventsAsync(
        calendars.map(cal => cal.id),
        today,
        tomorrow
      );

      // Analyse des événements
      const analysis = this.analyzeEvents(events);
      
      return { events, analysis };
    } catch (error) {
      console.error('Erreur récupération calendrier:', error);
      return { events: [], analysis: null, error: error.message };
    }
  }

  /**
   * Analyser événements pour détecter stress et optimiser pauses
   */
  analyzeEvents(events) {
    if (!events || events.length === 0) {
      return {
        totalMeetings: 0,
        totalDuration: 0,
        stressScore: 0,
        hasBackToBack: false,
        stressfulMeetings: [],
        optimalBreakTimes: [],
        recommendations: ['Journée libre - profitez-en pour une longue technique']
      };
    }

    // Trier par heure de début
    const sortedEvents = events.sort((a, b) => 
      new Date(a.startDate) - new Date(b.startDate)
    );

    // Calculer métriques
    let totalDuration = 0;
    let stressScore = 0;
    const stressfulMeetings = [];
    const backToBackPeriods = [];

    sortedEvents.forEach((event, index) => {
      const duration = (new Date(event.endDate) - new Date(event.startDate)) / 60000; // minutes
      totalDuration += duration;

      // Analyser contenu stressant
      const stressLevel = this.calculateEventStressLevel(event, duration);
      stressScore += stressLevel;

      if (stressLevel > 2) {
        stressfulMeetings.push({
          title: event.title,
          start: event.startDate,
          stressLevel,
          reason: this.identifyStressReason(event, duration)
        });
      }

      // Détecter back-to-back
      if (index < sortedEvents.length - 1) {
        const nextEvent = sortedEvents[index + 1];
        const gap = (new Date(nextEvent.startDate) - new Date(event.endDate)) / 60000;
        
        if (gap < 10) { // Moins de 10 min entre meetings
          backToBackPeriods.push({
            start: event.startDate,
            end: nextEvent.endDate,
            meetings: [event.title, nextEvent.title]
          });
        }
      }
    });

    // Identifier moments optimaux pour pauses
    const optimalBreakTimes = this.identifyOptimalBreakTimes(sortedEvents);

    // Générer recommandations
    const recommendations = this.generateSmartRecommendations(
      sortedEvents, 
      stressScore, 
      backToBackPeriods.length,
      optimalBreakTimes
    );

    return {
      totalMeetings: events.length,
      totalDuration,
      stressScore,
      stressLevel: this.categorizeStressScore(stressScore),
      hasBackToBack: backToBackPeriods.length > 0,
      backToBackCount: backToBackPeriods.length,
      backToBackPeriods,
      stressfulMeetings,
      optimalBreakTimes,
      recommendations,
      meetingDensity: totalDuration / 480 // Ratio sur 8h de travail
    };
  }

  /**
   * Calculer niveau de stress d'un événement
   */
  calculateEventStressLevel(event, duration) {
    let stress = 0;
    const title = (event.title || '').toLowerCase();
    const notes = (event.notes || '').toLowerCase();
    const content = `${title} ${notes}`;

    // Mots-clés stressants
    this.STRESS_KEYWORDS.forEach(keyword => {
      if (content.includes(keyword)) {
        stress += 2;
      }
    });

    // Mots-clés de récupération (négatifs)
    this.RECOVERY_KEYWORDS.forEach(keyword => {
      if (content.includes(keyword)) {
        stress -= 1;
      }
    });

    // Durée excessive
    if (duration > 90) stress += 2;
    if (duration > 120) stress += 1;

    // Heure de la journée (creux circadien 14h-16h)
    const hour = new Date(event.startDate).getHours();
    if (hour >= 14 && hour <= 16) stress += 1;

    return Math.max(0, stress);
  }

  /**
   * Identifier raison du stress
   */
  identifyStressReason(event, duration) {
    const reasons = [];
    const content = `${event.title} ${event.notes || ''}`.toLowerCase();

    if (duration > 90) reasons.push('Durée excessive');
    
    if (this.STRESS_KEYWORDS.some(k => content.includes(k))) {
      reasons.push('Contenu stressant détecté');
    }

    const hour = new Date(event.startDate).getHours();
    if (hour >= 14 && hour <= 16) reasons.push('Creux circadien');

    return reasons.join(' • ');
  }

  /**
   * Catégoriser score de stress global
   */
  categorizeStressScore(score) {
    if (score <= 5) return 'faible';
    if (score <= 10) return 'modéré';
    if (score <= 20) return 'élevé';
    return 'critique';
  }

  /**
   * Identifier moments optimaux pour pauses
   */
  identifyOptimalBreakTimes(sortedEvents) {
    const breakTimes = [];
    const now = new Date();

    for (let i = 0; i < sortedEvents.length - 1; i++) {
      const current = sortedEvents[i];
      const next = sortedEvents[i + 1];
      
      const gapStart = new Date(current.endDate);
      const gapEnd = new Date(next.startDate);
      const gapDuration = (gapEnd - gapStart) / 60000; // minutes

      // Gap de 15-60 min = parfait pour pause
      if (gapDuration >= 15 && gapDuration <= 60) {
        // Seulement si dans le futur
        if (gapStart > now) {
          breakTimes.push({
            start: gapStart,
            end: gapEnd,
            duration: gapDuration,
            type: gapDuration >= 30 ? 'extended' : 'quick',
            recommendedTechnique: this.recommendTechniqueForGap(gapDuration, current, next)
          });
        }
      }

      // Pas de gap mais meeting stressant à venir = pause préventive
      if (gapDuration < 15) {
        const nextStress = this.calculateEventStressLevel(next, 
          (new Date(next.endDate) - new Date(next.startDate)) / 60000
        );
        
        if (nextStress > 2 && gapStart > now) {
          breakTimes.push({
            start: new Date(gapStart.getTime() - 10 * 60000), // 10 min avant
            duration: 10,
            type: 'preventive',
            reason: `Préparation mentale avant "${next.title}"`,
            recommendedTechnique: 'box-breathing-seals'
          });
        }
      }
    }

    return breakTimes;
  }

  /**
   * Recommander technique selon durée de gap
   */
  recommendTechniqueForGap(duration, beforeEvent, afterEvent) {
    // Analyser contexte
    const beforeStress = this.calculateEventStressLevel(beforeEvent, 
      (new Date(beforeEvent.endDate) - new Date(beforeEvent.startDate)) / 60000
    );
    const afterStress = this.calculateEventStressLevel(afterEvent,
      (new Date(afterEvent.endDate) - new Date(afterEvent.startDate)) / 60000
    );

    // Gap long + fatigue = sieste
    if (duration >= 30 && beforeStress > 2) {
      return 'nasa-nap-protocol';
    }

    // Préparation meeting stressant
    if (afterStress > 2 && duration >= 5) {
      return 'box-breathing-seals';
    }

    // Gap court = technique rapide
    if (duration < 15) {
      return 'physiological-sigh';
    }

    // Défaut
    return 'vision-tunneling';
  }

  /**
   * Générer recommandations intelligentes
   */
  generateSmartRecommendations(events, stressScore, backToBackCount, breakTimes) {
    const recs = [];

    // Stress critique
    if (stressScore > 20) {
      recs.push('🚨 Journée très chargée détectée - Priorisez votre bien-être');
      recs.push('Envisagez de reporter 1-2 réunions non-critiques si possible');
    }

    // Back-to-back
    if (backToBackCount > 2) {
      recs.push(`⚠️ ${backToBackCount} périodes sans pause - Risque burnout élevé`);
      recs.push('Ajoutez des buffers de 10 min entre meetings dans votre calendrier');
    }

    // Pauses optimales identifiées
    if (breakTimes.length > 0) {
      const nextBreak = breakTimes[0];
      const timeStr = new Date(nextBreak.start).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      recs.push(`✅ Pause optimale programmée: ${timeStr} (${nextBreak.duration} min)`);
    } else {
      recs.push('⚡ Aucune pause naturelle - Bloquez 10 min toutes les 2h');
    }

    // Charge de travail
    const totalHours = events.reduce((sum, e) => 
      sum + (new Date(e.endDate) - new Date(e.startDate)) / 3600000, 0
    );
    
    if (totalHours > 6) {
      recs.push(`⏱️ ${totalHours.toFixed(1)}h de réunions - Au-dessus recommandation (max 6h)`);
    }

    // Moments critiques (creux circadien)
    const afternoonMeetings = events.filter(e => {
      const hour = new Date(e.startDate).getHours();
      return hour >= 14 && hour <= 16;
    });

    if (afternoonMeetings.length > 0) {
      recs.push('🌅 Réunions pendant creux circadien - NSDR recommandé à 14h');
    }

    return recs;
  }

  /**
   * Programmer notifications préventives
   */
  async schedulePreventiveNotifications(optimalBreakTimes) {
    // TODO: Intégrer avec services/notifications.js
    // Pour chaque pause optimale, programmer notification 5 min avant
    
    const notifications = optimalBreakTimes.map(breakTime => ({
      time: new Date(new Date(breakTime.start).getTime() - 5 * 60000),
      title: 'Pause optimale dans 5 minutes',
      body: `${breakTime.duration} min disponibles - ${breakTime.recommendedTechnique || 'Technique recommandée'}`,
      data: {
        type: 'preventive-break',
        techniqueId: breakTime.recommendedTechnique
      }
    }));

    return notifications;
  }

  /**
   * Injecter pauses automatiques dans calendrier
   */
  async createBreakEvents(optimalBreakTimes, calendarId) {
    try {
      const createdEvents = [];

      for (const breakTime of optimalBreakTimes) {
        // Créer événement "Pause bien-être"
        const eventDetails = {
          title: `🧘 Pause Bien-être (${breakTime.recommendedTechnique || 'Auto'})`,
          startDate: breakTime.start,
          endDate: new Date(breakTime.start.getTime() + breakTime.duration * 60000),
          notes: `Pause optimale détectée par Rockwhale AI\nTechnique: ${breakTime.recommendedTechnique || 'À choisir'}`,
          alarms: [{ relativeOffset: -5 }] // Alerte 5 min avant
        };

        const eventId = await Calendar.createEventAsync(calendarId, eventDetails);
        createdEvents.push(eventId);
      }

      return { 
        success: true, 
        count: createdEvents.length,
        message: `${createdEvents.length} pauses bien-être ajoutées à votre calendrier` 
      };
    } catch (error) {
      console.error('Erreur création événements:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new CalendarIntegrationService();
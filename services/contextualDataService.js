// services/contextualDataService.js - VERSION COMPLÈTE AVEC FALLBACKS
import { Platform } from 'react-native';

class ContextualDataService {
  
  constructor() {
    this.weatherCache = null;
    this.weatherCacheTime = null;
    this.CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
    this.isInitialized = false;
  }
  
  /**
   * 🌍 Récupérer contexte complet - MODE GRACEFUL
   */
  async getFullContext() {
    try {
      console.log('📍 Chargement contexte...');
      
      const context = {
        weather: null,
        location: null,
        calendar: null,
        timestamp: new Date().toISOString(),
        errors: []
      };
      
      // Météo
      try {
        context.weather = await this.getWeatherContext();
      } catch (error) {
        console.warn('⚠️ Météo non disponible:', error.message);
        context.errors.push('weather');
        context.weather = this.getMockWeather();
      }
      
      // Localisation
      try {
        context.location = await this.getLocationContext();
      } catch (error) {
        console.warn('⚠️ Localisation non disponible:', error.message);
        context.errors.push('location');
        context.location = this.getDefaultLocation();
      }
      
      // Calendrier
      try {
        context.calendar = await this.getCalendarContext();
      } catch (error) {
        console.warn('⚠️ Calendrier non disponible:', error.message);
        context.errors.push('calendar');
      }
      
      console.log('✅ Contexte chargé:', {
        weather: !!context.weather,
        location: !!context.location,
        calendar: !!context.calendar
      });
      
      return context;
      
    } catch (error) {
      console.error('❌ Erreur contexte complet:', error);
      return {
        weather: this.getMockWeather(),
        location: this.getDefaultLocation(),
        calendar: null,
        timestamp: new Date().toISOString(),
        errors: ['all']
      };
    }
  }
  
  /**
   * 🌤️ Contexte Météo
   */
  async getWeatherContext() {
    try {
      // Vérifier cache
      if (this.weatherCache && this.weatherCacheTime) {
        const age = Date.now() - this.weatherCacheTime;
        if (age < this.CACHE_DURATION) {
          console.log('☁️ Météo depuis cache');
          return this.weatherCache;
        }
      }
      
      // Position par défaut si géoloc échoue
      let latitude = 48.8566;
      let longitude = 2.3522;
      
      try {
        const position = await this.getCurrentPosition();
        if (position) {
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        }
      } catch (geoError) {
        console.log('📍 Utilisation position par défaut (Paris)');
      }
      
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,cloud_cover,pressure_msl,wind_speed_10m&timezone=auto`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API météo: ${response.status}`);
      }
      
      const data = await response.json();
      
      const weather = {
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        weatherCode: data.current.weather_code,
        weatherDescription: this.getWeatherDescription(data.current.weather_code),
        cloudCover: data.current.cloud_cover,
        pressure: data.current.pressure_msl,
        windSpeed: data.current.wind_speed_10m,
        stressImpact: this.calculateWeatherStressImpact(data.current)
      };
      
      this.weatherCache = weather;
      this.weatherCacheTime = Date.now();
      
      console.log('✅ Météo récupérée:', weather.weatherDescription, weather.temperature + '°C');
      return weather;
      
    } catch (error) {
      console.error('❌ Erreur météo:', error.message);
      throw error;
    }
  }
  
  /**
   * 📍 Contexte Géolocalisation AVEC FALLBACKS
   */
  async getLocationContext() {
    try {
      let Geolocation;
      try {
        Geolocation = require('@react-native-community/geolocation').default;
      } catch (importError) {
        console.warn('⚠️ Module geolocation non disponible');
        return this.getDefaultLocation();
      }
      
      const position = await this.getCurrentPositionWithModule(Geolocation);
      if (!position) {
        console.warn('⚠️ Position GPS non disponible');
        return this.getDefaultLocation();
      }
      
      const { latitude, longitude } = position.coords;
      
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=fr`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: { 
            'User-Agent': 'StressManagementApp/1.0',
            'Accept-Language': 'fr'
          }
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error('Reverse geocoding failed');
        }
        
        const data = await response.json();
        
        const city = data.address?.city 
          || data.address?.town 
          || data.address?.village
          || data.address?.municipality
          || data.address?.county
          || this.getCityFromCoordinates(latitude, longitude);
        
        const location = {
          latitude,
          longitude,
          city: city,
          country: data.address?.country || 'France',
          type: this.detectLocationType(data.address),
          stressLevel: this.estimateLocationStress(data.address),
          isDefault: false
        };
        
        console.log('✅ Localisation:', location.city);
        return location;
        
      } catch (fetchError) {
        console.error('❌ Erreur reverse geocoding:', fetchError);
        return {
          latitude,
          longitude,
          city: this.getCityFromCoordinates(latitude, longitude),
          country: 'France',
          type: 'unknown',
          stressLevel: 'neutral',
          isDefault: false
        };
      }
      
    } catch (error) {
      console.error('❌ Erreur géolocalisation:', error.message);
      return this.getDefaultLocation();
    }
  }
  
  /**
   * 🏙️ Ville par défaut
   */
  getDefaultLocation() {
    return {
      latitude: 48.8566,
      longitude: 2.3522,
      city: 'Paris',
      country: 'France',
      type: 'unknown',
      stressLevel: 'neutral',
      isDefault: true
    };
  }
  
  /**
   * 🗺️ Approximation ville depuis coordonnées
   */
  getCityFromCoordinates(lat, lon) {
    const cities = [
      { name: 'Paris', lat: 48.8566, lon: 2.3522 },
      { name: 'Lyon', lat: 45.7640, lon: 4.8357 },
      { name: 'Marseille', lat: 43.2965, lon: 5.3698 },
      { name: 'Toulouse', lat: 43.6047, lon: 1.4442 },
      { name: 'Bordeaux', lat: 44.8378, lon: -0.5792 },
      { name: 'Lille', lat: 50.6292, lon: 3.0573 },
      { name: 'Nantes', lat: 47.2184, lon: -1.5536 },
      { name: 'Strasbourg', lat: 48.5734, lon: 7.7521 },
    ];
    
    let closest = cities[0];
    let minDistance = this.calculateDistance(lat, lon, closest.lat, closest.lon);
    
    cities.forEach(city => {
      const distance = this.calculateDistance(lat, lon, city.lat, city.lon);
      if (distance < minDistance) {
        minDistance = distance;
        closest = city;
      }
    });
    
    return minDistance < 100 ? closest.name : 'Votre région';
  }
  
  /**
   * 📏 Distance Haversine
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  
  /**
   * 📅 Contexte Calendrier
   */
  async getCalendarContext() {
    try {
      let RNCalendarEvents;
      try {
        RNCalendarEvents = require('react-native-calendar-events').default;
      } catch (importError) {
        console.warn('⚠️ Module calendrier non disponible');
        return null;
      }
      
      const status = await RNCalendarEvents.requestPermissions();
      if (status !== 'authorized') {
        console.warn('⚠️ Permissions calendrier refusées');
        return null;
      }
      
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      
      const events = await RNCalendarEvents.fetchAllEvents(
        startDate.toISOString(),
        endDate.toISOString()
      );
      
      const analysis = this.analyzeCalendarEvents(events);
      
      console.log('✅ Calendrier:', analysis.todayMeetingsCount, 'réunions');
      return analysis;
      
    } catch (error) {
      console.error('❌ Erreur calendrier:', error.message);
      throw error;
    }
  }
  
  /**
   * 🌡️ Impact stress météo
   */
  calculateWeatherStressImpact(weather) {
    let impact = 0;
    const factors = [];
    
    if (weather.temperature_2m > 30 || weather.temperature_2m < 0) {
      impact += 10;
      factors.push('Température extrême');
    }
    
    if (weather.weather_code >= 61 && weather.weather_code <= 67) {
      impact += 15;
      factors.push('Temps pluvieux');
    } else if (weather.cloud_cover > 80) {
      impact += 8;
      factors.push('Temps couvert');
    }
    
    if (weather.pressure_msl < 1000) {
      impact += 12;
      factors.push('Pression basse');
    }
    
    if (weather.wind_speed_10m > 30) {
      impact += 5;
      factors.push('Vent fort');
    }
    
    return {
      score: impact,
      level: impact > 20 ? 'high' : impact > 10 ? 'moderate' : 'low',
      factors
    };
  }
  
  /**
   * 🏢 Type de lieu
   */
  detectLocationType(address) {
    if (!address) return 'unknown';
    
    const tags = [];
    if (address.office) tags.push('office');
    if (address.amenity === 'hospital') tags.push('hospital');
    if (address.amenity === 'cafe' || address.amenity === 'restaurant') tags.push('social');
    if (address.leisure === 'park') tags.push('nature');
    if (address.building === 'residential') tags.push('home');
    if (address.highway) tags.push('transit');
    
    return tags.length > 0 ? tags[0] : 'unknown';
  }
  
  /**
   * 📍 Stress selon lieu
   */
  estimateLocationStress(address) {
    const type = this.detectLocationType(address);
    
    const stressLevels = {
      'office': 'moderate',
      'hospital': 'high',
      'transit': 'moderate',
      'social': 'low',
      'nature': 'very-low',
      'home': 'low',
      'unknown': 'neutral'
    };
    
    return stressLevels[type] || 'neutral';
  }
  
  /**
   * 📅 Analyse calendrier
   */
  analyzeCalendarEvents(events) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayEvents = events.filter(e => {
      const eventDate = new Date(e.startDate);
      return eventDate >= today && eventDate < tomorrow;
    });
    
    const sortedEvents = todayEvents.sort((a, b) => 
      new Date(a.startDate) - new Date(b.startDate)
    );
    
    let backToBackCount = 0;
    for (let i = 0; i < sortedEvents.length - 1; i++) {
      const currentEnd = new Date(sortedEvents[i].endDate);
      const nextStart = new Date(sortedEvents[i + 1].startDate);
      const gap = (nextStart - currentEnd) / 1000 / 60;
      
      if (gap < 15) backToBackCount++;
    }
    
    const stressKeywords = ['urgent', 'deadline', 'review', 'evaluation', 'présentation', 'interview'];
    const stressfulEvents = todayEvents.filter(e => {
      const title = (e.title || '').toLowerCase();
      return stressKeywords.some(keyword => title.includes(keyword));
    });
    
    const upcomingEvent = sortedEvents.find(e => new Date(e.startDate) > now);
    const minutesUntilNext = upcomingEvent 
      ? Math.floor((new Date(upcomingEvent.startDate) - now) / 1000 / 60)
      : null;
    
    let mentalLoad = 0;
    if (todayEvents.length > 5) mentalLoad += 20;
    else if (todayEvents.length > 3) mentalLoad += 10;
    
    if (backToBackCount > 0) mentalLoad += backToBackCount * 10;
    if (stressfulEvents.length > 0) mentalLoad += stressfulEvents.length * 15;
    
    return {
      todayMeetingsCount: todayEvents.length,
      backToBackMeetings: backToBackCount,
      stressfulMeetings: stressfulEvents.length,
      upcomingEvent: upcomingEvent ? {
        title: upcomingEvent.title,
        startTime: upcomingEvent.startDate,
        minutesUntil: minutesUntilNext
      } : null,
      mentalLoad: {
        score: Math.min(mentalLoad, 100),
        level: mentalLoad > 40 ? 'high' : mentalLoad > 20 ? 'moderate' : 'low'
      },
      recommendation: this.getCalendarRecommendation(mentalLoad, minutesUntilNext)
    };
  }
  
  /**
   * 📅 Recommandation calendrier
   */
  getCalendarRecommendation(mentalLoad, minutesUntilNext) {
    if (mentalLoad > 40) {
      return 'Journée chargée : prévois des micro-pauses';
    }
    
    if (minutesUntilNext && minutesUntilNext < 15) {
      return 'Réunion dans <15 min : respiration rapide';
    }
    
    if (minutesUntilNext && minutesUntilNext > 60) {
      return 'Tu as du temps : pause active';
    }
    
    return null;
  }
  
  /**
   * 🌤️ Description météo
   */
  getWeatherDescription(code) {
    const descriptions = {
      0: 'Ciel dégagé',
      1: 'Principalement dégagé',
      2: 'Partiellement nuageux',
      3: 'Couvert',
      45: 'Brouillard',
      48: 'Brouillard givrant',
      51: 'Bruine légère',
      53: 'Bruine modérée',
      55: 'Bruine dense',
      61: 'Pluie légère',
      63: 'Pluie modérée',
      65: 'Pluie forte',
      71: 'Neige légère',
      73: 'Neige modérée',
      75: 'Neige forte',
      95: 'Orage'
    };
    return descriptions[code] || 'Inconnu';
  }
  
  /**
   * 📍 Position avec module
   */
  getCurrentPositionWithModule(Geolocation) {
    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        position => resolve(position),
        error => {
          console.warn('⚠️ Erreur géolocalisation:', error.message);
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
      );
    });
  }
  
  /**
   * 📍 Position générique
   */
  getCurrentPosition() {
    try {
      const Geolocation = require('@react-native-community/geolocation').default;
      return this.getCurrentPositionWithModule(Geolocation);
    } catch (error) {
      return Promise.resolve(null);
    }
  }
  
  /**
   * 🎭 Mock météo
   */
  getMockWeather() {
    return {
      temperature: 18,
      humidity: 65,
      weatherCode: 2,
      weatherDescription: 'Partiellement nuageux',
      cloudCover: 50,
      pressure: 1013,
      windSpeed: 15,
      stressImpact: {
        score: 5,
        level: 'low',
        factors: []
      }
    };
  }
}

export default new ContextualDataService();
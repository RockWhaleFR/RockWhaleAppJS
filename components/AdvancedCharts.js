// components/AdvancedCharts.js - SYSTÈME GRAPHIQUES PRO
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import theme from '../theme/enhancedTheme';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 40;

/**
 * 🔥 GRAPHIQUE HRV ÉVOLUTION
 * Science: Visualisation progrès = +250% rétention (Amabile, 2011)
 */
export function HRVTrendChart({ data, timeRange = '7d' }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Filtrer selon timeRange
    const daysToShow = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const filtered = data.slice(-daysToShow);

    return {
      labels: filtered.map(d => {
        const date = new Date(d.timestamp);
        return timeRange === '7d' 
          ? date.toLocaleDateString('fr-FR', { weekday: 'short' })
          : `${date.getDate()}/${date.getMonth() + 1}`;
      }),
      datasets: [
        {
          data: filtered.map(d => d.value),
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    };
  }, [data, timeRange]);

  if (!chartData) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="pulse-outline" size={48} color={theme.colors.sub} />
        <Text style={styles.emptyText}>
          Connecte Google Fit pour voir l'évolution de ta HRV
        </Text>
      </View>
    );
  }

  // Calculer stats
  const average = useMemo(() => {
    const values = data.slice(-parseInt(timeRange)).map(d => d.value);
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(0);
  }, [data, timeRange]);

  const trend = useMemo(() => {
    if (data.length < 2) return 'stable';
    const recent = data.slice(-7).map(d => d.value);
    const older = data.slice(-14, -7).map(d => d.value);
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'stable';
  }, [data]);

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartHeader}>
        <View>
          <Text style={styles.chartTitle}>💚 Variabilité Cardiaque</Text>
          <Text style={styles.chartSubtitle}>
            Moyenne {timeRange}: {average}ms
          </Text>
        </View>
        <View style={styles.trendBadge}>
          <Ionicons 
            name={trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'remove'} 
            size={20} 
            color={trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : theme.colors.sub}
          />
          <Text style={[styles.trendText, {
            color: trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : theme.colors.sub
          }]}>
            {trend === 'up' ? 'En hausse' : trend === 'down' ? 'En baisse' : 'Stable'}
          </Text>
        </View>
      </View>

      <LineChart
        data={chartData}
        width={CHART_WIDTH}
        height={220}
        chartConfig={{
          backgroundColor: theme.colors.card,
          backgroundGradientFrom: theme.colors.card,
          backgroundGradientTo: theme.colors.card,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          labelColor: (opacity = 1) => theme.colors.sub,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: theme.colors.primary,
          },
        }}
        bezier
        style={styles.chart}
      />

      {/* Zones HRV */}
      <View style={styles.zonesContainer}>
        <Text style={styles.zonesTitle}>Zones de performance</Text>
        <View style={styles.zones}>
          <View style={styles.zone}>
            <View style={[styles.zoneDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.zoneText}>Excellent (&gt;60ms)</Text>
          </View>
          <View style={styles.zone}>
            <View style={[styles.zoneDot, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.zoneText}>Bon (40-60ms)</Text>
          </View>
          <View style={styles.zone}>
            <View style={[styles.zoneDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.zoneText}>Modéré (25-40ms)</Text>
          </View>
          <View style={styles.zone}>
            <View style={[styles.zoneDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.zoneText}>Faible (&lt;25ms)</Text>
          </View>
        </View>
      </View>

      {/* Insights */}
      <View style={styles.insightBox}>
        <Ionicons name="bulb" size={20} color={theme.colors.accent} />
        <Text style={styles.insightText}>
          {trend === 'up' && 'Ta HRV s\'améliore ! Continue tes bonnes habitudes 💪'}
          {trend === 'down' && 'Ta HRV baisse. Priorise repos et récupération 😴'}
          {trend === 'stable' && 'HRV stable. Maintiens tes routines actuelles ✅'}
        </Text>
      </View>
    </View>
  );
}

/**
 * 😴 GRAPHIQUE SOMMEIL
 */
export function SleepTrendChart({ data, timeRange = '7d' }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const daysToShow = timeRange === '7d' ? 7 : 30;
    const filtered = data.slice(-daysToShow);

    return {
      labels: filtered.map(d => {
        const date = new Date(d.date);
        return date.toLocaleDateString('fr-FR', { weekday: 'short' });
      }),
      datasets: [
        {
          data: filtered.map(d => d.hours),
          color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    };
  }, [data, timeRange]);

  if (!chartData) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="moon-outline" size={48} color={theme.colors.sub} />
        <Text style={styles.emptyText}>
          Données de sommeil bientôt disponibles
        </Text>
      </View>
    );
  }

  const average = useMemo(() => {
    const values = data.slice(-parseInt(timeRange)).map(d => d.hours);
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  }, [data, timeRange]);

  const sleepDebt = useMemo(() => {
    const values = data.slice(-7).map(d => d.hours);
    const totalSleep = values.reduce((a, b) => a + b, 0);
    const optimal = 7.5 * 7;
    return Math.max(0, optimal - totalSleep).toFixed(1);
  }, [data]);

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartHeader}>
        <View>
          <Text style={styles.chartTitle}>😴 Durée de Sommeil</Text>
          <Text style={styles.chartSubtitle}>
            Moyenne: {average}h/nuit
          </Text>
        </View>
        {parseFloat(sleepDebt) > 0 && (
          <View style={[styles.trendBadge, { backgroundColor: '#FEE2E2' }]}>
            <Text style={[styles.trendText, { color: '#EF4444' }]}>
              Dette: {sleepDebt}h
            </Text>
          </View>
        )}
      </View>

      <LineChart
        data={chartData}
        width={CHART_WIDTH}
        height={220}
        chartConfig={{
          backgroundColor: theme.colors.card,
          backgroundGradientFrom: theme.colors.card,
          backgroundGradientTo: theme.colors.card,
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
          labelColor: (opacity = 1) => theme.colors.sub,
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#8B5CF6',
          },
        }}
        bezier
        style={styles.chart}
        fromZero
      />

      {/* Ligne objectif */}
      <View style={styles.goalLine}>
        <View style={styles.goalLineDash} />
        <Text style={styles.goalLineText}>Objectif: 7.5h</Text>
      </View>

      <View style={styles.insightBox}>
        <Ionicons name="bulb" size={20} color={theme.colors.accent} />
        <Text style={styles.insightText}>
          {parseFloat(average) >= 7.5 
            ? 'Excellent sommeil ! Optimise maintenant sa qualité 🌟'
            : `Vise +${(7.5 - parseFloat(average)).toFixed(1)}h pour atteindre l'optimal`
          }
        </Text>
      </View>
    </View>
  );
}

/**
 * 🧠 GRAPHIQUE BIEN-ÊTRE MENTAL (PSS-4 + PERMA)
 */
export function MentalWellbeingChart({ data }) {
  const radarData = useMemo(() => {
    if (!data || !data.perma) return null;

    return {
      labels: ['Émotions+', 'Engagement', 'Relations', 'Sens', 'Accompliss.'],
      datasets: [
        {
          data: [
            data.perma.positiveEmotions,
            data.perma.engagement,
            data.perma.relationships,
            data.perma.meaning,
            data.perma.accomplishment,
          ],
        },
      ],
    };
  }, [data]);

  if (!radarData) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="brain-outline" size={48} color={theme.colors.sub} />
        <Text style={styles.emptyText}>
          Passe le test PSS-4 + PERMA pour voir ton profil
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>🧠 Profil PERMA</Text>
      
      {/* Radar chart simplifié (à remplacer par vraie lib si besoin) */}
      <View style={styles.permaGrid}>
        {radarData.labels.map((label, index) => (
          <View key={index} style={styles.permaItem}>
            <Text style={styles.permaLabel}>{label}</Text>
            <View style={styles.permaBarContainer}>
              <View 
                style={[
                  styles.permaBar, 
                  { 
                    width: `${(radarData.datasets[0].data[index] / 5) * 100}%`,
                    backgroundColor: getPermaColor(radarData.datasets[0].data[index])
                  }
                ]} 
              />
            </View>
            <Text style={styles.permaValue}>
              {radarData.datasets[0].data[index].toFixed(1)}/5
            </Text>
          </View>
        ))}
      </View>

      {/* PSS-4 Timeline */}
      {data.pssHistory && data.pssHistory.length > 1 && (
        <View style={{ marginTop: 24 }}>
          <Text style={styles.chartTitle}>📊 Évolution Stress (PSS-4)</Text>
          <LineChart
            data={{
              labels: data.pssHistory.map(d => 
                new Date(d.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
              ),
              datasets: [{
                data: data.pssHistory.map(d => d.score),
              }],
            }}
            width={CHART_WIDTH}
            height={180}
            chartConfig={{
              backgroundColor: theme.colors.card,
              backgroundGradientFrom: theme.colors.card,
              backgroundGradientTo: theme.colors.card,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
              labelColor: (opacity = 1) => theme.colors.sub,
            }}
            bezier
            style={styles.chart}
          />
        </View>
      )}
    </View>
  );
}

/**
 * 🎯 TIME RANGE SELECTOR
 */
export function TimeRangeSelector({ selected, onSelect }) {
  const ranges = ['7d', '30d', '90d'];
  
  return (
    <View style={styles.timeRangeSelector}>
      {ranges.map(range => (
        <TouchableOpacity
          key={range}
          style={[
            styles.timeRangeButton,
            selected === range && styles.timeRangeButtonActive
          ]}
          onPress={() => onSelect(range)}
        >
          <Text style={[
            styles.timeRangeText,
            selected === range && styles.timeRangeTextActive
          ]}>
            {range === '7d' ? '7 jours' : range === '30d' ? '30 jours' : '3 mois'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// Helpers
function getPermaColor(value) {
  if (value >= 4) return '#10B981';
  if (value >= 3) return '#3B82F6';
  if (value >= 2) return '#F59E0B';
  return '#EF4444';
}

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...theme.psychology.shadows.soft,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.ink,
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: theme.colors.sub,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.chipBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  zonesContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.chipBg,
  },
  zonesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.ink,
    marginBottom: 12,
  },
  zones: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  zone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  zoneDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  zoneText: {
    fontSize: 12,
    color: theme.colors.sub,
  },
  insightBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.accent + '10',
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
    gap: 8,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.accent,
    lineHeight: 18,
  },
  goalLine: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalLineDash: {
    flex: 1,
    height: 2,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  goalLineText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 8,
  },
  permaGrid: {
    gap: 16,
    marginTop: 16,
  },
  permaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  permaLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.ink,
  },
  permaBarContainer: {
    flex: 2,
    height: 24,
    backgroundColor: theme.colors.chipBg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  permaBar: {
    height: '100%',
    borderRadius: 12,
  },
  permaValue: {
    width: 50,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.ink,
    textAlign: 'right',
  },
  timeRangeSelector: {
    flexDirection: 'row',
    backgroundColor: theme.colors.chipBg,
    borderRadius: 12,
    padding: 4,
    gap: 4,
    marginBottom: 16,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  timeRangeText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.sub,
  },
  timeRangeTextActive: {
    color: '#FFFFFF',
  },
  emptyState: {
    backgroundColor: theme.colors.card,
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.chipBorder,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    color: theme.colors.sub,
    textAlign: 'center',
    lineHeight: 20,
  },
});
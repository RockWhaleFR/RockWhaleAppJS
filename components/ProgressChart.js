// components/ProgressChart.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Line, Circle, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

const moodToValue = {
  'Pas top': 1,
  'Neutre': 2,
  'Bien': 3,
  'Excellent': 4,
};

export default function ProgressChart({ history }) {
  const chartData = React.useMemo(() => {
    if (!history || history.length < 2) return null;

    const dailyUplift = {};
    history.forEach(entry => {
      if (entry.moodBefore && entry.moodAfter) {
        const date = new Date(entry.date).toLocaleDateString('fr-FR');
        const uplift = (moodToValue[entry.moodAfter] || 0) - (moodToValue[entry.moodBefore] || 0);
        
        if (!dailyUplift[date]) {
          dailyUplift[date] = { totalUplift: 0, count: 0 };
        }
        dailyUplift[date].totalUplift += uplift;
        dailyUplift[date].count++;
      }
    });

    const dataPoints = Object.entries(dailyUplift)
      .map(([date, { totalUplift, count }]) => ({
        date,
        avgUplift: totalUplift / count,
      }))
      .sort((a, b) => new Date(a.date.split('/').reverse().join('-')) - new Date(b.date.split('/').reverse().join('-')))
      .slice(-7); // On garde les 7 derniers jours

    if (dataPoints.length < 2) return null;

    return dataPoints;
  }, [history]);

  if (!chartData) {
    return (
      <View style={styles.insightTeaser}>
        <Ionicons name="stats-chart-outline" size={24} color={theme.colors.sub} />
        <Text style={styles.insightTeaserText}>
          Continuez à noter votre humeur avant et après chaque habitude pour voir votre progression ici !
        </Text>
      </View>
    );
  }

  const chartWidth = 300;
  const chartHeight = 150;
  const maxUplift = Math.max(...chartData.map(d => d.avgUplift), 1);
  const minUplift = Math.min(...chartData.map(d => d.avgUplift), -1);

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing(2) }}>
        <Ionicons name="trending-up-outline" size={24} color={theme.colors.primary} />
        <Text style={styles.title}>Impact sur votre humeur</Text>
      </View>
      <Text style={styles.subtitle}>Évolution moyenne sur les 7 derniers jours</Text>

      <Svg width={chartWidth} height={chartHeight}>
        {/* Ligne de base (0) */}
        <Line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke={theme.colors.chipBorder} strokeDasharray="4, 4" />

        {chartData.map((point, index) => {
          const x = (index / (chartData.length - 1)) * chartWidth;
          const y = chartHeight / 2 - (point.avgUplift / (maxUplift - minUplift)) * (chartHeight / 2);

          return (
            <React.Fragment key={index}>
              {index > 0 && (
                <Line
                  x1={(index - 1) / (chartData.length - 1) * chartWidth}
                  y1={chartHeight / 2 - (chartData[index - 1].avgUplift / (maxUplift - minUplift)) * (chartHeight / 2)}
                  x2={x}
                  y2={y}
                  stroke={theme.colors.primary}
                  strokeWidth="2"
                />
              )}
              <Circle cx={x} cy={y} r="4" fill={theme.colors.primary} />
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    ...theme.psychology.shadows.soft,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.ink,
    marginLeft: theme.spacing(1),
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.sub,
    marginBottom: theme.spacing(2),
  },
  insightTeaser: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing(3),
    borderRadius: theme.radius.xl,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(3),
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: theme.colors.disabled,
    alignItems: 'center',
  },
  insightTeaserText: {
    color: theme.colors.sub,
    textAlign: 'center',
    marginTop: theme.spacing(1),
    fontWeight: '500',
  },
});
/**
 * HistoryChart Component
 * Line chart using react-native-chart-kit with reference range shading and date labels
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Colors } from '@/styles/colors';
import { Spacing, BorderRadius } from '@/styles/spacing';
import { Typography } from '@/styles/typography';
import { Card } from '../common/Card';

interface HistoryPoint {
  date: string;
  value: number;
}

interface HistoryChartProps {
  data: HistoryPoint[];
  normalMin?: number;
  normalMax?: number;
  unit?: string;
  color?: string;
  style?: ViewStyle;
}

const getChartWidth = () => {
  const screenWidth = Dimensions.get('window').width;
  return Math.max(screenWidth - Spacing[8], 300);
};

const formatDateLabel = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export const HistoryChart: React.FC<HistoryChartProps> = ({
  data,
  normalMin,
  normalMax,
  unit,
  color = Colors.primary,
  style,
}) => {
  if (data.length === 0) {
    return (
      <Card style={[styles.card, style]}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.emptyText}>No data available</Text>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = {
    labels: data.map((point) => formatDateLabel(point.date)),
    datasets: [
      {
        data: data.map((point) => point.value),
        color: () => color,
        strokeWidth: 2,
      },
    ],
  };

  // Calculate chart dimensions
  const chartWidth = Math.max(data.length * 60, getChartWidth());

  // Calculate y-axis limits with some padding
  const minValue = Math.min(...data.map((p) => p.value));
  const maxValue = Math.max(...data.map((p) => p.value));
  const padding = (maxValue - minValue) * 0.1 || 5;
  const yAxisMin = Math.floor(minValue - padding);
  const yAxisMax = Math.ceil(maxValue + padding);

  return (
    <Card style={[styles.card, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        {unit && (
          <Text style={styles.unit}>{unit}</Text>
        )}
      </View>

      {/* Reference Range Info */}
      {normalMin !== undefined && normalMax !== undefined && (
        <View style={styles.rangeInfo}>
          <View style={styles.rangeBadge}>
            <View
              style={[
                styles.rangeDot,
                { backgroundColor: Colors.statusNormal },
              ]}
            />
            <Text style={styles.rangeText}>
              Normal: {normalMin.toFixed(1)} - {normalMax.toFixed(1)}
            </Text>
          </View>
        </View>
      )}

      {/* Chart */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={chartWidth > getChartWidth()}
        style={styles.chartContainer}
      >
        <LineChart
          data={chartData}
          width={chartWidth}
          height={250}
          yAxisLabel=""
          yAxisSuffix={unit ? ` ${unit}` : ''}
          chartConfig={{
            backgroundGradientFrom: Colors.background,
            backgroundGradientTo: Colors.background,
            decimalPlaces: 1,
            color: () => Colors.border,
            labelColor: () => Colors.textMuted,
            strokeWidth: 2,
            barPercentage: 0.5,
            useShadowColorFromDataset: false,
            propsForLabels: {
              fontSize: 12,
            },
            propsForBackgroundLines: {
              strokeDasharray: '0',
              stroke: Colors.border,
              strokeWidth: 1,
            },
            propsForDots: {
              r: '4',
              strokeWidth: '0',
              stroke: Colors.background,
            },
          }}
          bezier
          fromZero={false}
          yMin={yAxisMin}
          yMax={yAxisMax}
          style={styles.chart}
        />
      </ScrollView>

      {/* Stats */}
      {data.length > 0 && (
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Latest</Text>
            <Text style={styles.statValue}>
              {data[data.length - 1].value.toFixed(1)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Highest</Text>
            <Text style={styles.statValue}>
              {Math.max(...data.map((p) => p.value)).toFixed(1)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Lowest</Text>
            <Text style={styles.statValue}>
              {Math.min(...data.map((p) => p.value)).toFixed(1)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Average</Text>
            <Text style={styles.statValue}>
              {(data.reduce((sum, p) => sum + p.value, 0) / data.length).toFixed(1)}
            </Text>
          </View>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: Spacing[3],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...Typography.h4,
    color: Colors.text,
  },
  unit: {
    ...Typography.label,
    color: Colors.textMuted,
  },
  rangeInfo: {
    gap: Spacing[2],
  },
  rangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    backgroundColor: getStatusBackgroundColor(),
    borderRadius: BorderRadius.md,
  },
  rangeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  rangeText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  chartContainer: {
    marginHorizontal: -Spacing[4],
    paddingHorizontal: Spacing[4],
  },
  chart: {
    marginVertical: 0,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing[3],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing[2],
  },
  statItem: {
    alignItems: 'center',
    gap: Spacing[1],
    flex: 1,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  statValue: {
    ...Typography.bodySmall,
    color: Colors.text,
    fontWeight: '600',
  },
});

// Helper function for background color
const getStatusBackgroundColor = () => '#DCFCE7';

export default HistoryChart;

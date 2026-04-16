/**
 * TrendSparkline Component
 * Mini line chart using react-native-svg (no axes, just the line shape)
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Svg, { Path, Polyline } from 'react-native-svg';
import { Colors } from '@/styles/colors';

interface TrendSparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  style?: ViewStyle;
}

const generatePath = (
  data: number[],
  width: number,
  height: number
): string => {
  if (data.length === 0) return '';
  if (data.length === 1) {
    const x = width / 2;
    const y = height / 2;
    return `M ${x} ${y}`;
  }

  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const range = maxValue - minValue || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - minValue) / range) * height * 0.8 - (height * 0.1);
    return `${x},${y}`;
  });

  return points.join(' ');
};

export const TrendSparkline: React.FC<TrendSparklineProps> = ({
  data,
  color = Colors.primary,
  width = 100,
  height = 40,
  style,
}) => {
  const pathData = generatePath(data, width, height);

  return (
    <View style={[styles.container, style]}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Polyline
          points={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.length > 0 && (
          <>
            {/* Add a subtle area fill under the line */}
            <Path
              d={`M 0,${height} ${pathData} L ${width},${height} Z`}
              fill={color}
              fillOpacity="0.1"
            />
            {/* End point dot */}
            {(() => {
              const minValue = Math.min(...data);
              const maxValue = Math.max(...data);
              const range = maxValue - minValue || 1;
              const lastValue = data[data.length - 1];
              const y = height - ((lastValue - minValue) / range) * height * 0.8 - (height * 0.1);
              return (
                <Svg.Circle
                  cx={width}
                  cy={y}
                  r="2"
                  fill={color}
                />
              );
            })()}
          </>
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TrendSparkline;

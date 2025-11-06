import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import { fetchData } from '../../src/services/supabaseClient';

export default function GraphScreen() {
  const [active, setActive] = useState<'today' | '7days' | 'custom'>('today');
  const [chartData, setChartData] = useState<{ label: string; value: number }[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current; // For horizontal slide

  const oneDay = 24 * 60 * 60 * 1000;
  const { width } = Dimensions.get('window');

  useEffect(() => {
    const loadData = async () => {
      let timewindow = oneDay;
      if (active === '7days') timewindow = oneDay * 7;
      if (active === 'custom') timewindow = oneDay * 4;

      const data = await fetchData(timewindow);
      if (!data || !Array.isArray(data)) return;

      const formatted = data.map((row) => {
        const date = new Date(row.createdat);
        let label = '';
        if (active === 'today') {
          label = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
          label = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
        return {
          value: Number(row.phvalue),
          label,
        };
      });

      setChartData(formatted);

      // Reset and run animations
      fadeAnim.setValue(0);
      slideAnim.setValue(active === 'today' ? -40 : 40);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    };

    loadData();
  }, [active]);

  return (
    <LinearGradient
      colors={['#0B0B0F', '#111827', '#1E293B']}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>pH Levels</Text>

        <View style={styles.buttonRow}>
          {['today', '7days', 'custom'].map((item) => {
            const isActive = active === item;
            return (
              <TouchableOpacity
                key={item}
                onPress={() => setActive(item as any)}
                activeOpacity={0.8}
                style={[
                  styles.timeButton,
                  isActive && styles.activeButton,
                ]}
              >
                <Text
                  style={[
                    styles.timeButtonText,
                    isActive && styles.activeButtonText,
                  ]}
                >
                  {item === 'today' ? 'Today' : item === '7days' ? '7 Days' : 'Custom'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Animated.View
          style={[
            styles.chartCard,
            {
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {chartData.length > 0 ? (
            <LineChart
              data={{
                labels: chartData.map((d) => d.label),
                datasets: [
                  {
                    data: chartData.map((d) => d.value),
                    color: () => 'rgba(59, 130, 246, 1)',
                    strokeWidth: 2,
                  },
                ],
              }}
              width={width * 0.95}
              height={width * 1.1}
              chartConfig={{
                backgroundColor: '#1E293B',
                backgroundGradientFrom: '#111827',
                backgroundGradientTo: '#1E293B',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                labelColor: () => '#9CA3AF',
                style: { borderRadius: 16 },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: '#3B82F6',
                },
              }}
              bezier
              style={styles.chart}
            />
          ) : (
            <Text style={styles.loadingText}>Loading chart...</Text>
          )}
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 60, // pushes content down
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#E0F2FE',
    marginBottom: 25,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '90%',
    marginBottom: 30, // more space below buttons
  },
  timeButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#374151',
  },
  activeButton: {
    backgroundColor: '#2563EB',
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  timeButtonText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  activeButtonText: {
    color: '#F9FAFB',
    fontWeight: '700',
  },
  chartCard: {
    backgroundColor: 'rgba(17, 24, 39, 0.85)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 6,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  chart: {
    borderRadius: 16,
  },
  loadingText: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginVertical: 40,
    fontSize: 16,
  },
});

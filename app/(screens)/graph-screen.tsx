import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { fetchData } from '../../src/services/supabaseClient';

export default function GraphScreen() {
    const [active, setActive] = useState<'today' | '7days' | 'custom'>('today');
    const [chartData, setChartData] = useState<{ label: string; value: number }[]>([]);

    const oneDay = 24 * 60 * 60 * 1000;
    const { width } = Dimensions.get('window');

    useEffect(() => {
        const loadData = async () => {
            let timewindow = oneDay;
            if (active === '7days') timewindow = oneDay * 7;
            if (active === 'custom') timewindow = oneDay * 4;

            const data = await fetchData(timewindow);

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
        };

        loadData();
    }, [active]);

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>pH Graph</Text>

            <View style={styles.buttonRow}>
                {['today', '7days', 'custom'].map((item) => (
                    <TouchableOpacity key={item} onPress={() => setActive(item as any)} style={styles.timeButton}>
                        <Text style={[styles.timeButtonText, active === item && styles.activeButtonText]}>
                            {item === 'today' ? 'Today' : item === '7days' ? '7 Days' : 'Custom'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {chartData.length > 0 ? (
                <LineChart
                    data={{
                        labels: chartData.map((d) => d.label),
                        datasets: [
                            {
                                data: chartData.map((d) => d.value),
                                color: () => 'rgba(59, 130, 246, 1)', // Line color
                                strokeWidth: 2,
                            },
                        ],
                    }}
                    width={width * 0.98}
                    height={width * 1.2}
                    yAxisSuffix=""
                    yAxisInterval={1}
                    chartConfig={{
                        backgroundColor: '#111111',
                        backgroundGradientFrom: '#111111',
                        backgroundGradientTo: '#1F2937',
                        decimalPlaces: 2,
                        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // points color
                        labelColor: () => '#9CA3AF',
                        style: {
                            borderRadius: 16,
                        },
                        propsForDots: {
                            r: '4',
                            strokeWidth: '2',
                            stroke: '#3B82F6',
                        },
                    }}
                    bezier
                    style={{
                        marginVertical: 16,
                        borderRadius: 16,
                    }}
                />
            ) : (
                <Text style={styles.loadingText}>Loading chart...</Text>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111111',
        padding: 16,
    },
    title: {
        fontSize: 26,
        fontWeight: '600',
        marginTop: 20,
        marginBottom: 12,
        color: '#E0F2FE',
        textAlign: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    timeButton: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#1F2937',
    },
    timeButtonText: {
        fontSize: 16,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    activeButtonText: {
        color: '#3B82F6',
        fontWeight: '700',
    },
    loadingText: {
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    },
});

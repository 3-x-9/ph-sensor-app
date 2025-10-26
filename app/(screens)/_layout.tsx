import {View, Text, Image} from 'react-native'
import React from 'react'
import {Tabs} from "expo-router";
import { images } from "@/constants/icons"

const _Layout = () => {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#111111', // 👈 your custom color
                    borderTopColor: 'transparent', // optional: cleaner look
                },
                tabBarActiveTintColor: '#007AFF',  // active icon/text color
                tabBarInactiveTintColor: '#888',   // inactive icon/text color
            }}
        >
            <Tabs.Screen
                name="index"
                options={{headerShown: false, title: 'Home', tabBarIcon: ({color}) => (
                    <Image source={images.homepageIcon
                    } style={{ width: 24, height: 24}} />
                    )}}>
            </Tabs.Screen>
            <Tabs.Screen
                name="settings"
                options={{headerShown: false, title: 'Settings', tabBarIcon: ({focused}) => (
                        <Image source={images.settingsIcon
                        } style={{ width: 24, height: 24}} />
                    )}}>
            </Tabs.Screen>
            <Tabs.Screen
                name="graph-screen"
                options={{headerShown: false, title: 'Graph Screen', tabBarIcon: ({focused}) => (
                        <Image source={images.graphIcon
                        } style={{ width: 24, height: 24}} />
                    )}}>
            </Tabs.Screen>
        </Tabs>
    )
}
export default _Layout


import React from "react";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const C = {
  background: "#111513",
  border: "#2B3732",
  active: "#35BDB3",
  inactive: "#829088",
};

type TabIconName = React.ComponentProps<typeof Feather>["name"];

function TabIcon({
  name,
  color,
}: {
  name: TabIconName;
  color: string;
}) {
  return <Feather name={name} size={18} color={color} />;
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 20);

  return (
    <>
      <StatusBar style="light" backgroundColor={C.background} />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: C.active,
          tabBarInactiveTintColor: C.inactive,
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            backgroundColor: C.background,
            borderTopColor: C.border,
            borderTopWidth: 1,
            height: 54 + bottomPadding,
            paddingTop: 8,
            paddingBottom: bottomPadding,
            elevation: 0,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "600",
            marginTop: 2,
          },
          tabBarItemStyle: {
            paddingVertical: 0,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Chat",
            tabBarIcon: ({ color }) => (
              <TabIcon name="message-circle" color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="analysis"
          options={{
            title: "Analysis",
            tabBarIcon: ({ color }) => (
              <TabIcon name="bar-chart-2" color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => (
              <TabIcon name="user" color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="history"
          options={{
            href: null,
            headerShown: false,
          }}
        />
      </Tabs>
    </>
  );
}

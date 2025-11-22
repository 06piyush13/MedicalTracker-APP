import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Linking } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Typography, BorderRadius } from "@/constants/theme";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  distance: string;
  rating: number;
  address: string;
}

const MOCK_DOCTORS: Doctor[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialty: "General Physician",
    distance: "0.5 miles",
    rating: 4.8,
    address: "123 Medical Center Dr",
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    specialty: "Internal Medicine",
    distance: "0.8 miles",
    rating: 4.9,
    address: "456 Health Plaza",
  },
  {
    id: "3",
    name: "Dr. Emily Williams",
    specialty: "Family Medicine",
    distance: "1.2 miles",
    rating: 4.7,
    address: "789 Wellness Way",
  },
];

export default function DoctorsScreen() {
  const { theme } = useTheme();
  const [location, setLocation] = useState<string>("Finding location...");
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocation("Location permission denied");
        setDoctors(MOCK_DOCTORS);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      setLocation(
        `${address.city || "Unknown"}, ${address.region || "Unknown"}`
      );
      setDoctors(MOCK_DOCTORS);
    } catch (error) {
      setLocation("Current Location");
      setDoctors(MOCK_DOCTORS);
    }
  };

  const handleGetDirections = (doctor: Doctor) => {
    const query = encodeURIComponent(`${doctor.address}, ${doctor.name}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Unable to open maps");
    });
  };

  return (
    <ScreenScrollView>
      <View style={styles.container}>
        <View style={styles.header}>
          <Feather name="map-pin" size={24} color={theme.primary} />
          <ThemedText
            style={[
              Typography.body,
              styles.locationText,
              { color: theme.textSecondary },
            ]}
          >
            {location}
          </ThemedText>
        </View>

        <ThemedText style={[Typography.h3, styles.title]}>
          Nearby Healthcare Providers
        </ThemedText>

        {doctors.length > 0 ? (
          doctors.map((doctor) => (
            <Card key={doctor.id} style={styles.doctorCard}>
              <View style={styles.doctorHeader}>
                <View
                  style={[
                    styles.doctorAvatar,
                    { backgroundColor: theme.primary },
                  ]}
                >
                  <Feather
                    name="user"
                    size={24}
                    color={theme.buttonText}
                  />
                </View>
                <View style={styles.doctorInfo}>
                  <ThemedText style={[Typography.body, styles.doctorName]}>
                    {doctor.name}
                  </ThemedText>
                  <ThemedText
                    style={[
                      Typography.small,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {doctor.specialty}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.doctorDetails}>
                <View style={styles.detailRow}>
                  <Feather
                    name="map-pin"
                    size={16}
                    color={theme.textSecondary}
                  />
                  <ThemedText
                    style={[
                      Typography.small,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {doctor.distance}
                  </ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <Feather
                    name="star"
                    size={16}
                    color={theme.warning}
                  />
                  <ThemedText
                    style={[
                      Typography.small,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {doctor.rating.toFixed(1)}
                  </ThemedText>
                </View>
              </View>

              <ThemedText
                style={[
                  Typography.small,
                  styles.address,
                  { color: theme.textSecondary },
                ]}
              >
                {doctor.address}
              </ThemedText>

              <PrimaryButton
                title="Get Directions"
                onPress={() => handleGetDirections(doctor)}
                variant="secondary"
              />
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Feather
              name="map-pin"
              size={48}
              color={theme.textSecondary}
              style={styles.emptyIcon}
            />
            <ThemedText
              style={[
                Typography.body,
                { color: theme.textSecondary },
              ]}
            >
              No doctors found nearby
            </ThemedText>
          </Card>
        )}
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  locationText: {
    fontWeight: "600",
  },
  title: {
    marginBottom: Spacing.lg,
  },
  doctorCard: {
    marginBottom: Spacing.md,
  },
  doctorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  doctorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  doctorDetails: {
    flexDirection: "row",
    gap: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  address: {
    marginBottom: Spacing.md,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
  },
  emptyIcon: {
    marginBottom: Spacing.md,
  },
});

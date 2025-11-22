import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Linking, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as WebBrowser from "expo-web-browser";
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
  distance: number;
  distanceText: string;
  rating: number;
  address: string;
  latitude: number;
  longitude: number;
}

// Extended doctor database with locations
const DOCTOR_DATABASE: Omit<Doctor, "distance" | "distanceText">[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialty: "General Physician",
    rating: 4.8,
    address: "123 Medical Center Dr",
    latitude: 40.7128,
    longitude: -74.006,
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    specialty: "Internal Medicine",
    rating: 4.9,
    address: "456 Health Plaza",
    latitude: 40.758,
    longitude: -73.9855,
  },
  {
    id: "3",
    name: "Dr. Emily Williams",
    specialty: "Family Medicine",
    rating: 4.7,
    address: "789 Wellness Way",
    latitude: 40.7489,
    longitude: -73.968,
  },
  {
    id: "4",
    name: "Dr. James Rodriguez",
    specialty: "Cardiology",
    rating: 4.9,
    address: "321 Heart Care Center",
    latitude: 40.766,
    longitude: -73.973,
  },
  {
    id: "5",
    name: "Dr. Lisa Anderson",
    specialty: "Pediatrics",
    rating: 4.6,
    address: "654 Children's Medical",
    latitude: 40.7614,
    longitude: -73.9776,
  },
];

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function DoctorsScreen() {
  const { theme } = useTheme();
  const [location, setLocation] = useState<string>("Finding location...");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocation("Location permission denied");
        // Use default location if permission not granted
        setUserCoords({ latitude: 40.7128, longitude: -74.006 });
        loadNearbyDoctors(40.7128, -74.006, "Default Area");
        return;
      }

      try {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const { latitude, longitude } = currentLocation.coords;
        setUserCoords({ latitude, longitude });

        try {
          const [address] = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });
          const locationName = `${address.city || "Unknown"}, ${address.region || "Unknown"}`;
          setLocation(locationName);
          loadNearbyDoctors(latitude, longitude, locationName);
        } catch (geocodeError) {
          // If reverse geocoding fails, still show doctors from detected location
          setLocation("Your Location");
          loadNearbyDoctors(latitude, longitude, "Your Location");
        }
      } catch (locationError) {
        // If location detection fails, use default
        setLocation("Default Area");
        setUserCoords({ latitude: 40.7128, longitude: -74.006 });
        loadNearbyDoctors(40.7128, -74.006, "Default Area");
      }
    } catch (error) {
      setLocation("Unable to determine location");
      setUserCoords({ latitude: 40.7128, longitude: -74.006 });
      loadNearbyDoctors(40.7128, -74.006, "Default Area");
    }
  };

  const loadNearbyDoctors = (userLat: number, userLon: number, locationName: string) => {
    const doctorsWithDistance = DOCTOR_DATABASE.map((doctor) => {
      const dist = calculateDistance(userLat, userLon, doctor.latitude, doctor.longitude);
      return {
        ...doctor,
        distance: dist,
        distanceText: dist < 1 ? `${(dist * 5280).toFixed(0)} ft` : `${dist.toFixed(1)} miles`,
      };
    }).sort((a, b) => a.distance - b.distance);

    setDoctors(doctorsWithDistance);
  };

  const handleGetDirections = async (doctor: Doctor) => {
    try {
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${doctor.latitude},${doctor.longitude}&travelmode=driving`;
      const appleMapsUrl = `http://maps.apple.com/?daddr=${doctor.latitude},${doctor.longitude}`;
      
      // Try web browser first (works better in web context)
      await WebBrowser.openBrowserAsync(googleMapsUrl);
    } catch (error) {
      // Fallback to Linking
      try {
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${doctor.latitude},${doctor.longitude}`;
        await Linking.openURL(googleMapsUrl);
      } catch (fallbackError) {
        Alert.alert(
          "Directions",
          `${doctor.name}\n${doctor.address}\n\nPlease open your maps app and search for this address.`
        );
      }
    }
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

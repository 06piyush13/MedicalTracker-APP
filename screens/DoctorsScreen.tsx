import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Linking, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as WebBrowser from "expo-web-browser";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Typography, BorderRadius } from "@/constants/theme";

interface HealthcareProvider {
  id: string;
  name: string;
  type: "doctor" | "hospital";
  distance: number;
  distanceText: string;
  address: string;
  latitude: number;
  longitude: number;
}

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

async function fetchNearbyHospitals(latitude: number, longitude: number): Promise<HealthcareProvider[]> {
  try {
    const radius = 5000; // 5km in meters
    const query = `[bbox=${latitude - 0.045},${longitude - 0.045},${latitude + 0.045},${longitude + 0.045}];
      (node["amenity"="hospital"];way["amenity"="hospital"];relation["amenity"="hospital"];);
      out geom;`;

    const response = await fetch(
      "https://overpass-api.de/api/interpreter",
      {
        method: "POST",
        body: query,
      }
    );

    const data = await response.json();
    const hospitals: HealthcareProvider[] = [];

    if (data.elements) {
      data.elements.forEach((element: any, index: number) => {
        const lat = element.lat || (element.center && element.center.lat);
        const lon = element.lon || (element.center && element.center.lon);

        if (lat && lon) {
          const dist = calculateDistance(latitude, longitude, lat, lon);
          if (dist <= 5) { // Show hospitals within 5 miles
            hospitals.push({
              id: `hospital-${element.id}`,
              name: element.tags.name || "Hospital",
              type: "hospital",
              distance: dist,
              distanceText: dist < 1 ? `${(dist * 5280).toFixed(0)} ft` : `${dist.toFixed(1)} miles`,
              address: element.tags["addr:full"] || element.tags["addr:street"] || "Address not available",
              latitude: lat,
              longitude: lon,
            });
          }
        }
      });
    }

    return hospitals.sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.log("Hospital fetch error:", error);
    return [];
  }
}

async function fetchNearbyDoctors(latitude: number, longitude: number): Promise<HealthcareProvider[]> {
  try {
    const query = `[bbox=${latitude - 0.045},${longitude - 0.045},${latitude + 0.045},${longitude + 0.045}];
      (node["amenity"="doctors"];node["amenity"="clinic"];way["amenity"="doctors"];way["amenity"="clinic"];relation["amenity"="doctors"];relation["amenity"="clinic"];);
      out geom;`;

    const response = await fetch(
      "https://overpass-api.de/api/interpreter",
      {
        method: "POST",
        body: query,
      }
    );

    const data = await response.json();
    const doctors: HealthcareProvider[] = [];

    if (data.elements) {
      data.elements.forEach((element: any, index: number) => {
        const lat = element.lat || (element.center && element.center.lat);
        const lon = element.lon || (element.center && element.center.lon);

        if (lat && lon) {
          const dist = calculateDistance(latitude, longitude, lat, lon);
          if (dist <= 5) { // Show doctors within 5 miles
            doctors.push({
              id: `doctor-${element.id}`,
              name: element.tags.name || "Clinic/Doctor",
              type: "doctor",
              distance: dist,
              distanceText: dist < 1 ? `${(dist * 5280).toFixed(0)} ft` : `${dist.toFixed(1)} miles`,
              address: element.tags["addr:full"] || element.tags["addr:street"] || "Address not available",
              latitude: lat,
              longitude: lon,
            });
          }
        }
      });
    }

    return doctors.sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.log("Doctor fetch error:", error);
    return [];
  }
}

export default function DoctorsScreen() {
  const { theme } = useTheme();
  const [location, setLocation] = useState<string>("Detecting location...");
  const [providers, setProviders] = useState<HealthcareProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocation("Location permission required");
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = currentLocation.coords;

      try {
        const [address] = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        const locationName = `${address.city || "Unknown"}, ${address.region || "Unknown"}`;
        setLocation(locationName);
      } catch (e) {
        setLocation("Your Location");
      }

      // Fetch hospitals and doctors from OpenStreetMap
      setLoading(true);
      const [hospitalsData, doctorsData] = await Promise.all([
        fetchNearbyHospitals(latitude, longitude),
        fetchNearbyDoctors(latitude, longitude),
      ]);

      const allProviders = [...hospitalsData, ...doctorsData].sort((a, b) => a.distance - b.distance);
      setProviders(allProviders);
      setLoading(false);
    } catch (error) {
      setLocation("Unable to detect location");
      setLoading(false);
      Alert.alert(
        "Location Error",
        "Make sure you're using Expo Go on a physical device with location services enabled."
      );
    }
  };

  const handleGetDirections = async (latitude: number, longitude: number, name: string, address: string) => {
    try {
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
      await WebBrowser.openBrowserAsync(googleMapsUrl);
    } catch (error) {
      try {
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        await Linking.openURL(googleMapsUrl);
      } catch (fallbackError) {
        Alert.alert(
          "Directions",
          `${name}\n${address}\n\nPlease open your maps app and search for this address.`
        );
      }
    }
  };

  const hospitals = providers.filter((p) => p.type === "hospital");
  const doctors = providers.filter((p) => p.type === "doctor");

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

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <ThemedText style={[Typography.body, { marginTop: Spacing.md }]}>
              Finding nearby hospitals and doctors...
            </ThemedText>
          </View>
        ) : providers.length > 0 ? (
          <>
            {hospitals.length > 0 && (
              <>
                <ThemedText style={[Typography.body, { fontWeight: "600", marginBottom: Spacing.md, marginTop: Spacing.lg }]}>
                  Nearby Hospitals ({hospitals.length})
                </ThemedText>
                {hospitals.map((hospital) => (
                  <Card key={hospital.id} style={styles.card}>
                    <View style={styles.header}>
                      <View
                        style={[
                          styles.avatar,
                          { backgroundColor: theme.warning },
                        ]}
                      >
                        <Feather
                          name="building"
                          size={24}
                          color={theme.buttonText}
                        />
                      </View>
                      <View style={styles.info}>
                        <ThemedText style={[Typography.body, styles.name]}>
                          {hospital.name}
                        </ThemedText>
                        <ThemedText
                          style={[
                            Typography.small,
                            { color: theme.textSecondary },
                          ]}
                        >
                          Hospital
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles.details}>
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
                          {hospital.distanceText}
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
                      {hospital.address}
                    </ThemedText>

                    <PrimaryButton
                      title="Get Directions"
                      onPress={() =>
                        handleGetDirections(
                          hospital.latitude,
                          hospital.longitude,
                          hospital.name,
                          hospital.address
                        )
                      }
                      variant="secondary"
                    />
                  </Card>
                ))}
              </>
            )}

            {doctors.length > 0 && (
              <>
                <ThemedText style={[Typography.body, { fontWeight: "600", marginBottom: Spacing.md, marginTop: Spacing.lg }]}>
                  Nearby Doctors & Clinics ({doctors.length})
                </ThemedText>
                {doctors.map((doctor) => (
                  <Card key={doctor.id} style={styles.card}>
                    <View style={styles.header}>
                      <View
                        style={[
                          styles.avatar,
                          { backgroundColor: theme.primary },
                        ]}
                      >
                        <Feather
                          name="user"
                          size={24}
                          color={theme.buttonText}
                        />
                      </View>
                      <View style={styles.info}>
                        <ThemedText style={[Typography.body, styles.name]}>
                          {doctor.name}
                        </ThemedText>
                        <ThemedText
                          style={[
                            Typography.small,
                            { color: theme.textSecondary },
                          ]}
                        >
                          Doctor / Clinic
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles.details}>
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
                          {doctor.distanceText}
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
                      onPress={() =>
                        handleGetDirections(
                          doctor.latitude,
                          doctor.longitude,
                          doctor.name,
                          doctor.address
                        )
                      }
                      variant="secondary"
                    />
                  </Card>
                ))}
              </>
            )}
          </>
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
              No hospitals or doctors found nearby
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
  loadingContainer: {
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
  },
  card: {
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  details: {
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

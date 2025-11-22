import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Linking } from "react-native";
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

// Extended doctor database with locations across India
const DOCTOR_DATABASE: Omit<Doctor, "distance" | "distanceText">[] = [
  // Delhi
  {
    id: "1",
    name: "Dr. Rajesh Kumar",
    specialty: "General Physician",
    rating: 4.8,
    address: "Apollo Hospital, Delhi",
    latitude: 28.5355,
    longitude: 77.3910,
  },
  {
    id: "2",
    name: "Dr. Priya Singh",
    specialty: "Internal Medicine",
    rating: 4.9,
    address: "Max Healthcare, Delhi",
    latitude: 28.5244,
    longitude: 77.1855,
  },
  {
    id: "3",
    name: "Dr. Amit Verma",
    specialty: "Cardiology",
    rating: 4.7,
    address: "Fortis Hospital, Delhi",
    latitude: 28.5645,
    longitude: 77.0937,
  },
  {
    id: "4",
    name: "Dr. Ananya Kapoor",
    specialty: "Pediatrics",
    rating: 4.9,
    address: "Dr. Ram Manohar Lohia Hospital, Delhi",
    latitude: 28.6139,
    longitude: 77.2090,
  },
  // Mumbai
  {
    id: "5",
    name: "Dr. Neha Patel",
    specialty: "Family Medicine",
    rating: 4.8,
    address: "Lilavati Hospital, Mumbai",
    latitude: 19.0176,
    longitude: 72.8292,
  },
  {
    id: "6",
    name: "Dr. Vikram Desai",
    specialty: "Pediatrics",
    rating: 4.9,
    address: "Hinduja Hospital, Mumbai",
    latitude: 19.0855,
    longitude: 72.8294,
  },
  {
    id: "7",
    name: "Dr. Anjali Gupta",
    specialty: "General Physician",
    rating: 4.7,
    address: "Breach Candy Hospital, Mumbai",
    latitude: 18.9898,
    longitude: 72.8281,
  },
  {
    id: "8",
    name: "Dr. Sanjay Mehta",
    specialty: "Internal Medicine",
    rating: 4.8,
    address: "Jaslok Hospital, Mumbai",
    latitude: 19.1136,
    longitude: 72.8291,
  },
  // Bangalore
  {
    id: "9",
    name: "Dr. Suresh Rao",
    specialty: "Internal Medicine",
    rating: 4.8,
    address: "Apollo Hospital, Bangalore",
    latitude: 12.9716,
    longitude: 77.5946,
  },
  {
    id: "10",
    name: "Dr. Divya Sharma",
    specialty: "Cardiology",
    rating: 4.9,
    address: "Manipal Hospital, Bangalore",
    latitude: 12.9352,
    longitude: 77.6245,
  },
  {
    id: "11",
    name: "Dr. Rohit Nair",
    specialty: "Pediatrics",
    rating: 4.6,
    address: "Fortis Hospital, Bangalore",
    latitude: 13.0010,
    longitude: 77.5753,
  },
  {
    id: "12",
    name: "Dr. Kavya Singh",
    specialty: "General Physician",
    rating: 4.7,
    address: "Max Healthcare, Bangalore",
    latitude: 12.9716,
    longitude: 77.6412,
  },
  // Hyderabad
  {
    id: "13",
    name: "Dr. Ravi Kumar",
    specialty: "General Physician",
    rating: 4.8,
    address: "Apollo Hospital, Hyderabad",
    latitude: 17.3850,
    longitude: 78.4867,
  },
  {
    id: "14",
    name: "Dr. Lakshmi Reddy",
    specialty: "Internal Medicine",
    rating: 4.9,
    address: "Fortis Hospital, Hyderabad",
    latitude: 17.3690,
    longitude: 78.5270,
  },
  {
    id: "15",
    name: "Dr. Arjun Rao",
    specialty: "Cardiology",
    rating: 4.7,
    address: "CARE Hospitals, Hyderabad",
    latitude: 17.4009,
    longitude: 78.4705,
  },
  // Chennai
  {
    id: "16",
    name: "Dr. Meera Iyer",
    specialty: "Family Medicine",
    rating: 4.8,
    address: "Apollo Hospital, Chennai",
    latitude: 13.1939,
    longitude: 80.2109,
  },
  {
    id: "17",
    name: "Dr. Karthik Subramanian",
    specialty: "Pediatrics",
    rating: 4.9,
    address: "Fortis Malar Hospital, Chennai",
    latitude: 13.0280,
    longitude: 80.2615,
  },
  {
    id: "18",
    name: "Dr. Sunitha Rao",
    specialty: "General Physician",
    rating: 4.7,
    address: "AIIMS, Chennai",
    latitude: 12.8328,
    longitude: 80.2184,
  },
  // Kolkata
  {
    id: "19",
    name: "Dr. Nikhil Das",
    specialty: "Internal Medicine",
    rating: 4.8,
    address: "Apollo Gleneagles, Kolkata",
    latitude: 22.5726,
    longitude: 88.3639,
  },
  {
    id: "20",
    name: "Dr. Sumitra Banerjee",
    specialty: "Cardiology",
    rating: 4.9,
    address: "Fortis Hospital, Kolkata",
    latitude: 22.5271,
    longitude: 88.3953,
  },
  {
    id: "21",
    name: "Dr. Rajesh Gupta",
    specialty: "General Physician",
    rating: 4.6,
    address: "CMRI Hospital, Kolkata",
    latitude: 22.5355,
    longitude: 88.3674,
  },
  // Pune
  {
    id: "22",
    name: "Dr. Priya Sharma",
    specialty: "Family Medicine",
    rating: 4.8,
    address: "Apollo Hospital, Pune",
    latitude: 18.5204,
    longitude: 73.8567,
  },
  {
    id: "23",
    name: "Dr. Aditya Kulkarni",
    specialty: "Pediatrics",
    rating: 4.9,
    address: "Fortis Hospital, Pune",
    latitude: 18.5670,
    longitude: 73.8207,
  },
  {
    id: "24",
    name: "Dr. Sneha Desai",
    specialty: "General Physician",
    rating: 4.7,
    address: "Sassoon Hospital, Pune",
    latitude: 18.5204,
    longitude: 73.8456,
  },
  // Ahmedabad
  {
    id: "25",
    name: "Dr. Vikram Patel",
    specialty: "Internal Medicine",
    rating: 4.8,
    address: "Apollo Hospital, Ahmedabad",
    latitude: 23.0225,
    longitude: 72.5714,
  },
  {
    id: "26",
    name: "Dr. Hemal Shah",
    specialty: "Cardiology",
    rating: 4.9,
    address: "Fortis Hospital, Ahmedabad",
    latitude: 23.0330,
    longitude: 72.5584,
  },
  {
    id: "27",
    name: "Dr. Swati Singh",
    specialty: "General Physician",
    rating: 4.7,
    address: "Civil Hospital, Ahmedabad",
    latitude: 23.0225,
    longitude: 72.5714,
  },
  // Jaipur
  {
    id: "28",
    name: "Dr. Arvind Kumar",
    specialty: "Family Medicine",
    rating: 4.8,
    address: "Apollo Hospital, Jaipur",
    latitude: 26.9124,
    longitude: 75.7873,
  },
  {
    id: "29",
    name: "Dr. Pooja Verma",
    specialty: "Pediatrics",
    rating: 4.9,
    address: "Fortis Hospital, Jaipur",
    latitude: 26.8467,
    longitude: 75.8240,
  },
  {
    id: "30",
    name: "Dr. Ravi Sharma",
    specialty: "General Physician",
    rating: 4.6,
    address: "Manipal Hospital, Jaipur",
    latitude: 26.9124,
    longitude: 75.7873,
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
  const [location, setLocation] = useState<string>("Detecting location...");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocation("Location permission required");
        return;
      }

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
      } catch (e) {
        setLocation("Your Location");
      }

      loadNearbyDoctors(latitude, longitude);
    } catch (error) {
      setLocation("Unable to detect location");
      Alert.alert(
        "Location Error",
        "Make sure you're using Expo Go on a physical device with location services enabled."
      );
    }
  };

  const loadNearbyDoctors = (userLat: number, userLon: number) => {
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

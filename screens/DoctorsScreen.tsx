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

interface Hospital {
  id: string;
  name: string;
  type: string;
  distance: number;
  distanceText: string;
  rating: number;
  address: string;
  latitude: number;
  longitude: number;
}

// Comprehensive doctor database across entire India
const DOCTOR_DATABASE: Omit<Doctor, "distance" | "distanceText">[] = [
  // North - Delhi, NCR
  { id: "1", name: "Dr. Rajesh Kumar", specialty: "General Physician", rating: 4.8, address: "Apollo Hospital, Delhi", latitude: 28.5355, longitude: 77.3910 },
  { id: "2", name: "Dr. Priya Singh", specialty: "Internal Medicine", rating: 4.9, address: "Max Healthcare, Delhi", latitude: 28.5244, longitude: 77.1855 },
  { id: "3", name: "Dr. Amit Verma", specialty: "Cardiology", rating: 4.7, address: "Fortis Hospital, Delhi", latitude: 28.5645, longitude: 77.0937 },
  { id: "4", name: "Dr. Ananya Kapoor", specialty: "Pediatrics", rating: 4.9, address: "AIIMS, Delhi", latitude: 28.6139, longitude: 77.2090 },
  // North - Noida
  { id: "5", name: "Dr. Sunil Sharma", specialty: "Family Medicine", rating: 4.8, address: "Fortis Hospital, Noida", latitude: 28.5921, longitude: 77.3560 },
  { id: "6", name: "Dr. Neha Srivastava", specialty: "General Physician", rating: 4.7, address: "Apollo Hospital, Noida", latitude: 28.5900, longitude: 77.3660 },
  // North - Lucknow
  { id: "7", name: "Dr. Vikram Singh", specialty: "Internal Medicine", rating: 4.8, address: "Medanta, Lucknow", latitude: 26.8467, longitude: 80.9462 },
  { id: "8", name: "Dr. Kajal Verma", specialty: "Pediatrics", rating: 4.7, address: "Apollo Hospital, Lucknow", latitude: 26.8495, longitude: 80.9479 },
  // North - Chandigarh
  { id: "9", name: "Dr. Arjun Patel", specialty: "Cardiology", rating: 4.9, address: "PGIMER, Chandigarh", latitude: 30.7633, longitude: 76.7794 },
  { id: "10", name: "Dr. Meera Sharma", specialty: "General Physician", rating: 4.8, address: "Fortis Hospital, Chandigarh", latitude: 30.7010, longitude: 76.6909 },
  // West - Mumbai
  { id: "11", name: "Dr. Neha Patel", specialty: "Family Medicine", rating: 4.8, address: "Lilavati Hospital, Mumbai", latitude: 19.0176, longitude: 72.8292 },
  { id: "12", name: "Dr. Vikram Desai", specialty: "Pediatrics", rating: 4.9, address: "Hinduja Hospital, Mumbai", latitude: 19.0855, longitude: 72.8294 },
  { id: "13", name: "Dr. Anjali Gupta", specialty: "General Physician", rating: 4.7, address: "Breach Candy Hospital, Mumbai", latitude: 18.9898, longitude: 72.8281 },
  { id: "14", name: "Dr. Sanjay Mehta", specialty: "Internal Medicine", rating: 4.8, address: "Jaslok Hospital, Mumbai", latitude: 19.1136, longitude: 72.8291 },
  // West - Pune
  { id: "15", name: "Dr. Priya Sharma", specialty: "Family Medicine", rating: 4.8, address: "Apollo Hospital, Pune", latitude: 18.5204, longitude: 73.8567 },
  { id: "16", name: "Dr. Aditya Kulkarni", specialty: "Pediatrics", rating: 4.9, address: "Fortis Hospital, Pune", latitude: 18.5670, longitude: 73.8207 },
  { id: "17", name: "Dr. Sneha Desai", specialty: "General Physician", rating: 4.7, address: "Sassoon Hospital, Pune", latitude: 18.5204, longitude: 73.8456 },
  // West - Ahmedabad
  { id: "18", name: "Dr. Vikram Patel", specialty: "Internal Medicine", rating: 4.8, address: "Apollo Hospital, Ahmedabad", latitude: 23.0225, longitude: 72.5714 },
  { id: "19", name: "Dr. Hemal Shah", specialty: "Cardiology", rating: 4.9, address: "Fortis Hospital, Ahmedabad", latitude: 23.0330, longitude: 72.5584 },
  // West - Surat
  { id: "20", name: "Dr. Rajesh Nair", specialty: "General Physician", rating: 4.8, address: "Apollo Hospital, Surat", latitude: 21.1458, longitude: 72.8300 },
  { id: "21", name: "Dr. Sunita Verma", specialty: "Pediatrics", rating: 4.9, address: "Fortis Hospital, Surat", latitude: 21.1600, longitude: 72.8100 },
  // East - Kolkata
  { id: "22", name: "Dr. Nikhil Das", specialty: "Internal Medicine", rating: 4.8, address: "Apollo Gleneagles, Kolkata", latitude: 22.5726, longitude: 88.3639 },
  { id: "23", name: "Dr. Sumitra Banerjee", specialty: "Cardiology", rating: 4.9, address: "Fortis Hospital, Kolkata", latitude: 22.5271, longitude: 88.3953 },
  { id: "24", name: "Dr. Rajesh Gupta", specialty: "General Physician", rating: 4.6, address: "CMRI Hospital, Kolkata", latitude: 22.5355, longitude: 88.3674 },
  // East - Guwahati
  { id: "25", name: "Dr. Arjun Roy", specialty: "Family Medicine", rating: 4.7, address: "Apollo Hospital, Guwahati", latitude: 26.1445, longitude: 91.7362 },
  { id: "26", name: "Dr. Priya Borah", specialty: "General Physician", rating: 4.8, address: "Fortis Hospital, Guwahati", latitude: 26.1500, longitude: 91.7500 },
  // Central - Indore
  { id: "27", name: "Dr. Rajesh Kumar", specialty: "Internal Medicine", rating: 4.8, address: "Apollo Hospital, Indore", latitude: 22.7196, longitude: 75.8577 },
  { id: "28", name: "Dr. Anjali Singh", specialty: "Pediatrics", rating: 4.9, address: "Fortis Hospital, Indore", latitude: 22.7500, longitude: 75.8500 },
  // Central - Bhopal
  { id: "29", name: "Dr. Vikram Rao", specialty: "Cardiology", rating: 4.7, address: "Apollo Hospital, Bhopal", latitude: 23.1815, longitude: 79.9864 },
  { id: "30", name: "Dr. Neha Sharma", specialty: "General Physician", rating: 4.8, address: "Fortis Hospital, Bhopal", latitude: 23.2000, longitude: 79.9800 },
  // Central - Naya Raipur
  { id: "51", name: "Dr. Arjun Singh", specialty: "General Physician", rating: 4.8, address: "Shree Satya Sai Hospital, Naya Raipur", latitude: 21.2300, longitude: 81.6400 },
  { id: "52", name: "Dr. Priya Mishra", specialty: "Internal Medicine", rating: 4.9, address: "City Heart Clinic, Naya Raipur", latitude: 21.2250, longitude: 81.6350 },
  { id: "53", name: "Dr. Ravi Patel", specialty: "Pediatrics", rating: 4.7, address: "Amar Jyoti Hospital, Naya Raipur", latitude: 21.2400, longitude: 81.6450 },
  // South - Bangalore
  { id: "31", name: "Dr. Suresh Rao", specialty: "Internal Medicine", rating: 4.8, address: "Apollo Hospital, Bangalore", latitude: 12.9716, longitude: 77.5946 },
  { id: "32", name: "Dr. Divya Sharma", specialty: "Cardiology", rating: 4.9, address: "Manipal Hospital, Bangalore", latitude: 12.9352, longitude: 77.6245 },
  { id: "33", name: "Dr. Rohit Nair", specialty: "Pediatrics", rating: 4.6, address: "Fortis Hospital, Bangalore", latitude: 13.0010, longitude: 77.5753 },
  { id: "34", name: "Dr. Kavya Singh", specialty: "General Physician", rating: 4.7, address: "Max Healthcare, Bangalore", latitude: 12.9716, longitude: 77.6412 },
  // South - Hyderabad
  { id: "35", name: "Dr. Ravi Kumar", specialty: "General Physician", rating: 4.8, address: "Apollo Hospital, Hyderabad", latitude: 17.3850, longitude: 78.4867 },
  { id: "36", name: "Dr. Lakshmi Reddy", specialty: "Internal Medicine", rating: 4.9, address: "Fortis Hospital, Hyderabad", latitude: 17.3690, longitude: 78.5270 },
  { id: "37", name: "Dr. Arjun Rao", specialty: "Cardiology", rating: 4.7, address: "CARE Hospitals, Hyderabad", latitude: 17.4009, longitude: 78.4705 },
  // South - Chennai
  { id: "38", name: "Dr. Meera Iyer", specialty: "Family Medicine", rating: 4.8, address: "Apollo Hospital, Chennai", latitude: 13.1939, longitude: 80.2109 },
  { id: "39", name: "Dr. Karthik Subramanian", specialty: "Pediatrics", rating: 4.9, address: "Fortis Malar Hospital, Chennai", latitude: 13.0280, longitude: 80.2615 },
  { id: "40", name: "Dr. Sunitha Rao", specialty: "General Physician", rating: 4.7, address: "AIIMS, Chennai", latitude: 12.8328, longitude: 80.2184 },
  // South - Kochi
  { id: "41", name: "Dr. Anish Kumar", specialty: "Internal Medicine", rating: 4.8, address: "Fortis Hospital, Kochi", latitude: 9.9312, longitude: 76.2673 },
  { id: "42", name: "Dr. Priya Nair", specialty: "Pediatrics", rating: 4.9, address: "Apollo Hospital, Kochi", latitude: 9.9456, longitude: 76.2640 },
  // North-East - Assam
  { id: "43", name: "Dr. Supriya Das", specialty: "General Physician", rating: 4.7, address: "Assam Medical College, Guwahati", latitude: 26.1445, longitude: 91.7362 },
  // North-West - Jaipur
  { id: "44", name: "Dr. Arvind Kumar", specialty: "Family Medicine", rating: 4.8, address: "Apollo Hospital, Jaipur", latitude: 26.9124, longitude: 75.7873 },
  { id: "45", name: "Dr. Pooja Verma", specialty: "Pediatrics", rating: 4.9, address: "Fortis Hospital, Jaipur", latitude: 26.8467, longitude: 75.8240 },
  { id: "46", name: "Dr. Ravi Sharma", specialty: "General Physician", rating: 4.6, address: "Manipal Hospital, Jaipur", latitude: 26.9124, longitude: 75.7873 },
  // North-West - Ludhiana
  { id: "47", name: "Dr. Harpreet Singh", specialty: "Internal Medicine", rating: 4.8, address: "Apollo Hospital, Ludhiana", latitude: 30.9010, longitude: 75.8573 },
  { id: "48", name: "Dr. Simran Kaur", specialty: "Cardiology", rating: 4.9, address: "Fortis Hospital, Ludhiana", latitude: 30.9100, longitude: 75.8600 },
  // West - Rajkot
  { id: "49", name: "Dr. Manish Patel", specialty: "General Physician", rating: 4.7, address: "Apollo Hospital, Rajkot", latitude: 22.3039, longitude: 70.8022 },
  { id: "50", name: "Dr. Ishita Shah", specialty: "Pediatrics", rating: 4.8, address: "Fortis Hospital, Rajkot", latitude: 22.3100, longitude: 70.8100 },
];

// Hospital database across India
const HOSPITAL_DATABASE: Omit<Hospital, "distance" | "distanceText">[] = [
  // Delhi
  { id: "h1", name: "Apollo Hospital", type: "Multi-specialty", rating: 4.9, address: "Apollo Hospital, Delhi", latitude: 28.5355, longitude: 77.3910 },
  { id: "h2", name: "Max Healthcare", type: "Multi-specialty", rating: 4.8, address: "Max Healthcare, Delhi", latitude: 28.5244, longitude: 77.1855 },
  { id: "h3", name: "AIIMS", type: "Government", rating: 4.7, address: "AIIMS, Delhi", latitude: 28.6139, longitude: 77.2090 },
  // Noida
  { id: "h4", name: "Fortis Hospital", type: "Multi-specialty", rating: 4.8, address: "Fortis Hospital, Noida", latitude: 28.5921, longitude: 77.3560 },
  { id: "h5", name: "Apollo Hospital", type: "Multi-specialty", rating: 4.9, address: "Apollo Hospital, Noida", latitude: 28.5900, longitude: 77.3660 },
  // Lucknow
  { id: "h6", name: "Medanta", type: "Multi-specialty", rating: 4.8, address: "Medanta, Lucknow", latitude: 26.8467, longitude: 80.9462 },
  { id: "h7", name: "Apollo Hospital", type: "Multi-specialty", rating: 4.7, address: "Apollo Hospital, Lucknow", latitude: 26.8495, longitude: 80.9479 },
  // Chandigarh
  { id: "h8", name: "PGIMER", type: "Government", rating: 4.9, address: "PGIMER, Chandigarh", latitude: 30.7633, longitude: 76.7794 },
  { id: "h9", name: "Fortis Hospital", type: "Multi-specialty", rating: 4.8, address: "Fortis Hospital, Chandigarh", latitude: 30.7010, longitude: 76.6909 },
  // Mumbai
  { id: "h10", name: "Lilavati Hospital", type: "Multi-specialty", rating: 4.9, address: "Lilavati Hospital, Mumbai", latitude: 19.0176, longitude: 72.8292 },
  { id: "h11", name: "Hinduja Hospital", type: "Multi-specialty", rating: 4.8, address: "Hinduja Hospital, Mumbai", latitude: 19.0855, longitude: 72.8294 },
  { id: "h12", name: "Breach Candy Hospital", type: "Multi-specialty", rating: 4.9, address: "Breach Candy Hospital, Mumbai", latitude: 18.9898, longitude: 72.8281 },
  { id: "h13", name: "Jaslok Hospital", type: "Multi-specialty", rating: 4.7, address: "Jaslok Hospital, Mumbai", latitude: 19.1136, longitude: 72.8291 },
  // Pune
  { id: "h14", name: "Apollo Hospital", type: "Multi-specialty", rating: 4.8, address: "Apollo Hospital, Pune", latitude: 18.5204, longitude: 73.8567 },
  { id: "h15", name: "Fortis Hospital", type: "Multi-specialty", rating: 4.9, address: "Fortis Hospital, Pune", latitude: 18.5670, longitude: 73.8207 },
  { id: "h16", name: "Sassoon Hospital", type: "Government", rating: 4.7, address: "Sassoon Hospital, Pune", latitude: 18.5204, longitude: 73.8456 },
  // Ahmedabad
  { id: "h17", name: "Apollo Hospital", type: "Multi-specialty", rating: 4.8, address: "Apollo Hospital, Ahmedabad", latitude: 23.0225, longitude: 72.5714 },
  { id: "h18", name: "Fortis Hospital", type: "Multi-specialty", rating: 4.9, address: "Fortis Hospital, Ahmedabad", latitude: 23.0330, longitude: 72.5584 },
  // Surat
  { id: "h19", name: "Apollo Hospital", type: "Multi-specialty", rating: 4.8, address: "Apollo Hospital, Surat", latitude: 21.1458, longitude: 72.8300 },
  { id: "h20", name: "Fortis Hospital", type: "Multi-specialty", rating: 4.9, address: "Fortis Hospital, Surat", latitude: 21.1600, longitude: 72.8100 },
  // Kolkata
  { id: "h21", name: "Apollo Gleneagles", type: "Multi-specialty", rating: 4.9, address: "Apollo Gleneagles, Kolkata", latitude: 22.5726, longitude: 88.3639 },
  { id: "h22", name: "Fortis Hospital", type: "Multi-specialty", rating: 4.8, address: "Fortis Hospital, Kolkata", latitude: 22.5271, longitude: 88.3953 },
  { id: "h23", name: "CMRI Hospital", type: "Multi-specialty", rating: 4.7, address: "CMRI Hospital, Kolkata", latitude: 22.5355, longitude: 88.3674 },
  // Guwahati
  { id: "h24", name: "Apollo Hospital", type: "Multi-specialty", rating: 4.8, address: "Apollo Hospital, Guwahati", latitude: 26.1445, longitude: 91.7362 },
  { id: "h25", name: "Fortis Hospital", type: "Multi-specialty", rating: 4.9, address: "Fortis Hospital, Guwahati", latitude: 26.1500, longitude: 91.7500 },
  // Indore
  { id: "h26", name: "Apollo Hospital", type: "Multi-specialty", rating: 4.8, address: "Apollo Hospital, Indore", latitude: 22.7196, longitude: 75.8577 },
  { id: "h27", name: "Fortis Hospital", type: "Multi-specialty", rating: 4.9, address: "Fortis Hospital, Indore", latitude: 22.7500, longitude: 75.8500 },
  // Bhopal
  { id: "h28", name: "Apollo Hospital", type: "Multi-specialty", rating: 4.8, address: "Apollo Hospital, Bhopal", latitude: 23.1815, longitude: 79.9864 },
  { id: "h29", name: "Fortis Hospital", type: "Multi-specialty", rating: 4.9, address: "Fortis Hospital, Bhopal", latitude: 23.2000, longitude: 79.9800 },
  // Naya Raipur
  { id: "h47", name: "Shree Satya Sai Hospital", type: "Multi-specialty", rating: 4.8, address: "Shree Satya Sai Hospital, Naya Raipur", latitude: 21.2300, longitude: 81.6400 },
  { id: "h48", name: "City Heart Clinic", type: "Multi-specialty", rating: 4.9, address: "City Heart Clinic, Naya Raipur", latitude: 21.2250, longitude: 81.6350 },
  { id: "h49", name: "Amar Jyoti Hospital", type: "Multi-specialty", rating: 4.8, address: "Amar Jyoti Hospital, Naya Raipur", latitude: 21.2400, longitude: 81.6450 },
  // Bangalore
  { id: "h30", name: "Apollo Hospital", type: "Multi-specialty", rating: 4.9, address: "Apollo Hospital, Bangalore", latitude: 12.9716, longitude: 77.5946 },
  { id: "h31", name: "Manipal Hospital", type: "Multi-specialty", rating: 4.8, address: "Manipal Hospital, Bangalore", latitude: 12.9352, longitude: 77.6245 },
  { id: "h32", name: "Fortis Hospital", type: "Multi-specialty", rating: 4.7, address: "Fortis Hospital, Bangalore", latitude: 13.0010, longitude: 77.5753 },
  // Hyderabad
  { id: "h33", name: "Apollo Hospital", type: "Multi-specialty", rating: 4.9, address: "Apollo Hospital, Hyderabad", latitude: 17.3850, longitude: 78.4867 },
  { id: "h34", name: "Fortis Hospital", type: "Multi-specialty", rating: 4.8, address: "Fortis Hospital, Hyderabad", latitude: 17.3690, longitude: 78.5270 },
  { id: "h35", name: "CARE Hospitals", type: "Multi-specialty", rating: 4.9, address: "CARE Hospitals, Hyderabad", latitude: 17.4009, longitude: 78.4705 },
  // Chennai
  { id: "h36", name: "Apollo Hospital", type: "Multi-specialty", rating: 4.9, address: "Apollo Hospital, Chennai", latitude: 13.1939, longitude: 80.2109 },
  { id: "h37", name: "Fortis Malar Hospital", type: "Multi-specialty", rating: 4.8, address: "Fortis Malar Hospital, Chennai", latitude: 13.0280, longitude: 80.2615 },
  { id: "h38", name: "AIIMS", type: "Government", rating: 4.7, address: "AIIMS, Chennai", latitude: 12.8328, longitude: 80.2184 },
  // Kochi
  { id: "h39", name: "Fortis Hospital", type: "Multi-specialty", rating: 4.8, address: "Fortis Hospital, Kochi", latitude: 9.9312, longitude: 76.2673 },
  { id: "h40", name: "Apollo Hospital", type: "Multi-specialty", rating: 4.9, address: "Apollo Hospital, Kochi", latitude: 9.9456, longitude: 76.2640 },
  // Jaipur
  { id: "h41", name: "Apollo Hospital", type: "Multi-specialty", rating: 4.8, address: "Apollo Hospital, Jaipur", latitude: 26.9124, longitude: 75.7873 },
  { id: "h42", name: "Fortis Hospital", type: "Multi-specialty", rating: 4.9, address: "Fortis Hospital, Jaipur", latitude: 26.8467, longitude: 75.8240 },
  // Ludhiana
  { id: "h43", name: "Apollo Hospital", type: "Multi-specialty", rating: 4.8, address: "Apollo Hospital, Ludhiana", latitude: 30.9010, longitude: 75.8573 },
  { id: "h44", name: "Fortis Hospital", type: "Multi-specialty", rating: 4.9, address: "Fortis Hospital, Ludhiana", latitude: 30.9100, longitude: 75.8600 },
  // Rajkot
  { id: "h45", name: "Apollo Hospital", type: "Multi-specialty", rating: 4.8, address: "Apollo Hospital, Rajkot", latitude: 22.3039, longitude: 70.8022 },
  { id: "h46", name: "Fortis Hospital", type: "Multi-specialty", rating: 4.9, address: "Fortis Hospital, Rajkot", latitude: 22.3100, longitude: 70.8100 },
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
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
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
    // Calculate distances for all doctors
    const doctorsWithDistance = DOCTOR_DATABASE.map((doctor) => {
      const dist = calculateDistance(userLat, userLon, doctor.latitude, doctor.longitude);
      return {
        ...doctor,
        distance: dist,
        distanceText: dist < 1 ? `${(dist * 5280).toFixed(0)} ft` : `${dist.toFixed(1)} miles`,
      };
    });

    // Calculate distances for all hospitals
    const hospitalsWithDistance = HOSPITAL_DATABASE.map((hospital) => {
      const dist = calculateDistance(userLat, userLon, hospital.latitude, hospital.longitude);
      return {
        ...hospital,
        distance: dist,
        distanceText: dist < 1 ? `${(dist * 5280).toFixed(0)} ft` : `${dist.toFixed(1)} miles`,
      };
    });

    // Find the nearest doctor to determine user's city
    if (doctorsWithDistance.length > 0) {
      const nearestDoctor = doctorsWithDistance.reduce((prev, current) =>
        prev.distance < current.distance ? prev : current
      );

      // Extract city name from address (last part before comma)
      const userCity = nearestDoctor.address.split(",").pop()?.trim() || "";

      // Filter doctors to show only those from the same city
      const filteredDoctors = doctorsWithDistance
        .filter((doctor) => doctor.address.includes(userCity))
        .sort((a, b) => a.distance - b.distance);

      // Filter hospitals to show only those from the same city
      const filteredHospitals = hospitalsWithDistance
        .filter((hospital) => hospital.address.includes(userCity))
        .sort((a, b) => a.distance - b.distance);

      setDoctors(filteredDoctors);
      setHospitals(filteredHospitals);
    }
  };

  const handleGetDirections = async (latitude: number, longitude: number, name: string, address: string) => {
    try {
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
      
      // Try web browser first (works better in web context)
      await WebBrowser.openBrowserAsync(googleMapsUrl);
    } catch (error) {
      // Fallback to Linking
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

        {doctors.length > 0 || hospitals.length > 0 ? (
          <>
            {doctors.length > 0 && (
              <>
                <ThemedText style={[Typography.body, { fontWeight: "600", marginBottom: Spacing.md, marginTop: Spacing.lg }]}>
                  Doctors
                </ThemedText>
                {doctors.map((doctor) => (
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
                          {doctor.distanceText}
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
                      onPress={() => handleGetDirections(doctor.latitude, doctor.longitude, doctor.name, doctor.address)}
                      variant="secondary"
                    />
                  </Card>
                ))}
              </>
            )}

            {hospitals.length > 0 && (
              <>
                <ThemedText style={[Typography.body, { fontWeight: "600", marginBottom: Spacing.md, marginTop: Spacing.lg }]}>
                  Nearby Hospitals
                </ThemedText>
                {hospitals.map((hospital) => (
                  <Card key={hospital.id} style={styles.doctorCard}>
                    <View style={styles.doctorHeader}>
                      <View
                        style={[
                          styles.doctorAvatar,
                          { backgroundColor: theme.warning },
                        ]}
                      >
                        <Feather
                          name="building"
                          size={24}
                          color={theme.buttonText}
                        />
                      </View>
                      <View style={styles.doctorInfo}>
                        <ThemedText style={[Typography.body, styles.doctorName]}>
                          {hospital.name}
                        </ThemedText>
                        <ThemedText
                          style={[
                            Typography.small,
                            { color: theme.textSecondary },
                          ]}
                        >
                          {hospital.type}
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
                          {hospital.distanceText}
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
                          {hospital.rating.toFixed(1)}
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
                      onPress={() => handleGetDirections(hospital.latitude, hospital.longitude, hospital.name, hospital.address)}
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
              No healthcare providers found nearby
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

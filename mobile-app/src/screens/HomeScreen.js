import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';

const HomeScreen = ({ navigation }) => {
  const [stationInfo, setStationInfo] = useState({ name: 'Fuel Station' });
  const [todayStats, setTodayStats] = useState({
    transactions: 0,
    fuelDispensed: 0
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStationInfo();
    loadTodayStats();
  }, []);

  const loadStationInfo = async () => {
    try {
      // For now, just show a simple station name
      setStationInfo({ name: 'dummy' });
    } catch (error) {
      console.error('Failed to load station info:', error);
    }
  };

  const loadTodayStats = async () => {
    try {
      // Mock data - replace with actual API call
      setTodayStats({
        transactions: 24,
        fuelDispensed: 1250.57
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadStationInfo(), loadTodayStats()]);
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout', style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove(['authToken', 'userRole', 'stationId']);
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={true}
    >
      {/* Header */}
      <LinearGradient colors={Colors.gradients.header} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIconContainer}>
              <MaterialIcons
                name="local-gas-station"
                size={24}
                color={Colors.textWhite}
              />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.welcomeText}>Hello Mr. Dummy</Text>
              <Text style={styles.stationName}>
                {stationInfo?.name || 'Fuel Station'}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton} activeOpacity={0.5}>
            <MaterialIcons
              name="logout"
              size={24}
              color={Colors.textWhite}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Today's Statistics */}
      

      {/* Quick Actions */}
      
      {/* Station Information */}
      <View style={styles.infoContainer}>
        <Text style={styles.sectionTitle}>Station Information</Text>
        <View style={styles.infoCard}>
          {/* Status */}
          <View style={styles.infoRow}>
            <MaterialIcons
              name="business"
              size={20}
              color={Colors.primary}
            />
            <Text style={styles.infoText}>Status: dummy status</Text>
          </View>

          {/* Fuel Types */}
          <View style={styles.infoRow}>
            <MaterialIcons
              name="local-gas-station"
              size={20}
              color={Colors.secondary}
            />
            <Text style={styles.infoText}>Fuel Types: dummy availabe</Text>
          </View>

          {/* Address */}
          <View style={styles.infoRow}>
            <MaterialIcons
              name="location-on"
              size={20}
              color={Colors.primary}
            />
            <Text style={styles.infoText}>dummy address</Text>
          </View>

          {/* Contact */}
          <View style={styles.infoRow}>
            <MaterialIcons
              name="phone"
              size={20}
              color={Colors.primary}
            />
            <Text style={styles.infoText}>Contact: dummy contact</Text>
          </View>
        </View>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  welcomeText: {
    color: Colors.textWhite,
    fontSize: 14,
    opacity: 0.9,
    fontWeight: '500',
  },
  stationName: {
    color: Colors.textWhite,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statsContainer: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: Colors.surface,
    flex: 1,
    marginHorizontal: 4,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  actionsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    // marginBottom: 16,
    // borderRadius: 12,
    // overflow: 'hidden',
  },
  primaryAction: {
    marginBottom: 24,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    borderRadius: 12,
    overflow: 'hidden'
  },
  actionGradient: {
    padding: 24,
    alignItems: 'center',
  },
  actionButtonText: {
    color: Colors.textWhite,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  actionButtonSubtext: {
    color: Colors.textWhite,
    fontSize: 14,
    opacity: 0.9,
    textAlign: 'center',
    fontWeight: '500',
  },
  actionContent: {
    backgroundColor: Colors.surface,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  infoContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    gap: 20,
    // paddingHorizontal: 16,
    // paddingVertical: 8,
    borderRadius: 12,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // margin: 8,
  },
  infoText: {
    marginLeft: 16,
    fontSize: 14,
    color: Colors.textPrimary,
    flex: 1,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default HomeScreen;
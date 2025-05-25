import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ApiService from '../services/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';

const TransactionHistoryScreen = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const stationId = await AsyncStorage.getItem('stationId');
      if (!stationId) {
        throw new Error('Station ID not found. Please login again.');
      }
      
      const data = await ApiService.getStationTransactions(stationId);
      setTransactions(data || []);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      Alert.alert('Error', 'Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  const renderTransactionItem = ({ item }) => (
    <View style={styles.transactionCard}>
      {/* Header */}
      <View style={styles.transactionHeader}>
        <View style={styles.vehicleInfo}>
          <View style={styles.vehicleIconContainer}>
            <MaterialIcons 
              name="directions-car" 
              size={18} 
              color={Colors.primary} 
            />
          </View>
          <Text style={styles.vehicleNumber}>{item.vehicleRegNo}</Text>
        </View>
        <View style={styles.timestampContainer}>
          <MaterialIcons 
            name="access-time" 
            size={14} 
            color={Colors.textSecondary} 
          />
          <Text style={styles.transactionDate}>{item.timestamp}</Text>
        </View>
      </View>

      {/* Transaction Details */}
      <View style={styles.transactionDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailLabelContainer}>
            <MaterialIcons 
              name="local-gas-station" 
              size={16} 
              color={Colors.textSecondary} 
            />
            <Text style={styles.detailLabel}>Fuel Type</Text>
          </View>
          <Text style={styles.detailValue}>{item.fuelType}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailLabelContainer}>
            <MaterialIcons 
              name="opacity" 
              size={16} 
              color={Colors.textSecondary} 
            />
            <Text style={styles.detailLabel}>Amount</Text>
          </View>
          <Text style={[styles.detailValue, styles.fuelValue]}>{item.amount}L</Text>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailLabelContainer}>
            <MaterialIcons 
              name="account-balance" 
              size={16} 
              color={Colors.textSecondary} 
            />
            <Text style={styles.detailLabel}>Remaining Quota</Text>
          </View>
          <Text style={[styles.detailValue, styles.quotaValue]}>{item.quotaAfter}L</Text>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailLabelContainer}>
            <MaterialIcons 
              name="notifications" 
              size={16} 
              color={Colors.textSecondary} 
            />
            <Text style={styles.detailLabel}>Notification</Text>
          </View>
          <View style={[
            styles.statusBadge, 
            item.notificationSent ? styles.statusSuccess : styles.statusPending
          ]}>
            <MaterialIcons 
              name={item.notificationSent ? "check-circle" : "schedule"} 
              size={12} 
              color={item.notificationSent ? Colors.success : Colors.warning} 
            />
            <Text style={[
              styles.statusText,
              { color: item.notificationSent ? Colors.success : Colors.warning }
            ]}>
              {item.notificationSent ? 'Sent' : 'Pending'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <MaterialIcons 
          name="receipt-long" 
          size={64} 
          color={Colors.textLight} 
        />
      </View>
      <Text style={styles.emptyStateText}>No transactions found</Text>
      <Text style={styles.emptyStateSubtext}>
        Transactions will appear here after you process fuel dispensing
      </Text>
      <TouchableOpacity 
        style={styles.emptyActionButton}
        onPress={() => navigation.navigate('QRScanner')}
      >
        <MaterialIcons 
          name="qr-code-scanner" 
          size={20} 
          color={Colors.textWhite} 
        />
        <Text style={styles.emptyActionText}>Start Scanning</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <MaterialIcons 
            name="hourglass-empty" 
            size={48} 
            color={Colors.primary} 
          />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Summary Header */}
      <LinearGradient 
        colors={[Colors.surface, Colors.surfaceSecondary]} 
        style={styles.summaryCard}
      >
        <View style={styles.summaryHeader}>
          <MaterialIcons 
            name="analytics" 
            size={24} 
            color={Colors.primary} 
          />
          <Text style={styles.summaryTitle}>Transaction Summary</Text>
          {/* <Text style={styles.summaryTitle}>Today's Summary</Text> */}
        </View>
        {/* Summary Stats */}
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <MaterialIcons 
              name="receipt" 
              size={20} 
              color={Colors.primary} 
            />
            <Text style={styles.statNumber}>{transactions.length}</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons 
              name="local-gas-station" 
              size={20} 
              color={Colors.secondary} 
            />
            <Text style={styles.statNumber}>
              {transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0).toFixed(1)}L
            </Text>
            <Text style={styles.statLabel}>Total Fuel</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons 
              name="notifications-active" 
              size={20} 
              color={Colors.accent} 
            />
            <Text style={styles.statNumber}>
              {transactions.reduce((sum, t) => sum + parseFloat(t.notificationSent ? 1 : 0), 0)}
            </Text>
            <Text style={styles.statLabel}>Notifications Sent</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Transaction List */}
      <FlatList
        data={transactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.transactionList}
        contentContainerStyle={transactions.length === 0 ? styles.emptyContainer : styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  summaryCard: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginLeft: 8,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  transactionList: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  transactionCard: {
    backgroundColor: Colors.surface,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  vehicleIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  vehicleNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  transactionDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '600',
    textAlign: 'right',
  },
  fuelValue: {
    color: Colors.secondary,
  },
  quotaValue: {
    color: Colors.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
  },
  statusSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  statusPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateText: {
    fontSize: 18,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyActionText: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default TransactionHistoryScreen;
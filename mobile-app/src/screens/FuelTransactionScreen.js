import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import ApiService from '../services/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';

const FuelTransactionScreen = ({ route, navigation }) => {
  const { vehicleData, qrCode } = route.params;
  const [litersToDispense, setLitersToDispense] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [transactionData, setTransactionData] = useState(null);

  useEffect(() => {
    // Set the navigation title to include vehicle number
    navigation.setOptions({
      title: `Transaction - ${vehicleData.registrationNumber}`,
    });
  }, [vehicleData, navigation]);

  const validateLiters = () => {
    const liters = parseFloat(litersToDispense);

    if (isNaN(liters) || liters <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount of liters');
      return false;
    }

    if (liters > vehicleData.remainingQuota) {
      Alert.alert(
        'Insufficient Quota',
        `Vehicle has only ${vehicleData.remainingQuota}L remaining quota. You entered ${liters}L.`
      );
      return false;
    }

    return true;
  };

  const handleProcessTransaction = () => {
    if (!validateLiters()) return;

    const liters = parseFloat(litersToDispense);

    setTransactionData({
      vehicleNumber: vehicleData.registrationNumber,
      ownerName: vehicleData.ownerName,
      ownerPhone: vehicleData.ownerPhone,
      liters: liters,
      fuelType: vehicleData.fuelType,
      remainingQuota: vehicleData.remainingQuota - liters,
      timestamp: new Date().toISOString(),
    });

    setShowConfirmModal(true);
  };

  const confirmTransaction = async () => {
    setIsProcessing(true);
    setShowConfirmModal(false);

    try {
      // Get station ID from storage
      const stationId = await AsyncStorage.getItem('stationId');
      if (!stationId) {
        throw new Error('Station ID not found. Please login again.');
      }

      // Prepare fuel pump request according to backend DTO
      const fuelPumpRequest = {
        vehicleId: vehicleData.vehicleId,
        stationId: parseInt(stationId),
        fuelType: vehicleData.fuelType,
        amount: transactionData.liters
      };

      // Process the transaction using backend API
      const result = await ApiService.recordFuelPump(fuelPumpRequest);

      if (result.message) {
        Alert.alert(
          'Transaction Successful',
          result.message,
          [
            {
              text: 'New Transaction',
              onPress: () => navigation.navigate('QRScanner'),
            },
            {
              text: 'Back to Home',
              onPress: () => navigation.navigate('Home'),
            },
          ]
        );
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Transaction error:', error);
      let errorMessage = 'Something went wrong';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Transaction Failed', errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const quickAmountButtons = [5, 10, 20, 30];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
      {/* Vehicle Information Card */}
      <View style={styles.vehicleCard}>
        <LinearGradient colors={Colors.gradients.success} style={styles.vehicleHeader}>
          <View style={styles.vehicleHeaderIcon}>
            <MaterialIcons name="directions-car" size={32} color={Colors.textWhite} />
          </View>
          <View style={styles.vehicleHeaderText}>
            <Text style={styles.vehicleHeaderLabel}>Registration Number</Text>
            <Text style={styles.vehicleNumber}>{vehicleData.registrationNumber}</Text>
          </View>
          <View style={styles.quotaBadge}>
            <Text style={styles.quotaBadgeText}>{vehicleData.remainingQuota}L</Text>
            <Text style={styles.quotaBadgeLabel}>Available</Text>
          </View>
        </LinearGradient>

        <View style={styles.vehicleDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <MaterialIcons name="person" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.detailLabel}>Owner</Text>
            <Text style={styles.detailValue}>{vehicleData.ownerName}</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <MaterialIcons name="phone" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.detailLabel}>Contact</Text>
            <Text style={styles.detailValue}>{vehicleData.ownerPhone}</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <MaterialIcons name="directions-car" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.detailLabel}>Vehicle Type</Text>
            <Text style={styles.detailValue}>{vehicleData.vehicleType}</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <MaterialIcons name="local-gas-station" size={18} color={Colors.secondary} />
            </View>
            <Text style={styles.detailLabel}>Fuel Type</Text>
            <Text style={[styles.detailValue, styles.fuelTypeValue]}>{vehicleData.fuelType}</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <MaterialIcons name="account-balance" size={18} color={Colors.accent} />
            </View>
            <Text style={styles.detailLabel}>Remaining Quota</Text>
            <Text style={[styles.detailValue, styles.quotaValue]}>{vehicleData.remainingQuota}L</Text>
          </View>
        </View>
      </View>

      {/* Fuel Dispensing Section */}
      <View style={styles.dispensingCard}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="local-gas-station" size={24} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Fuel Dispensing</Text>
        </View>

        {/* Quick Amount Buttons */}
        <View style={styles.quickAmountContainer}>
          <Text style={styles.quickAmountLabel}>Quick Selection (Liters)</Text>
          <View style={styles.quickAmountButtons}>
            {quickAmountButtons.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.quickAmountButton,
                  litersToDispense === amount.toString() && styles.quickAmountButtonSelected
                ]}
                onPress={() => setLitersToDispense(amount.toString())}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.quickAmountButtonText,
                  litersToDispense === amount.toString() && styles.quickAmountButtonTextSelected
                ]}>
                  {amount}L
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Manual Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputSectionTitle}>Custom Amount</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.literInput}
                value={litersToDispense}
                onChangeText={setLitersToDispense}
                placeholder="0.00"
                placeholderTextColor={Colors.placeholder}
                keyboardType="decimal-pad"
                maxLength={3}
              />
              <Text style={styles.inputUnit}>Liters</Text>
            </View>
          </View>
        </View>

        {/* Process Button */}
        <TouchableOpacity
          style={[
            styles.processButton,
            (!litersToDispense || isProcessing) && styles.processButtonDisabled
          ]}
          onPress={handleProcessTransaction}
          disabled={!litersToDispense || isProcessing}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={(!litersToDispense || isProcessing) ? 
              [Colors.textLight, Colors.textLight] : 
              ['#FF6B35', '#FF5722']
            }
            style={styles.processButtonGradient}
          >
            <MaterialIcons 
              name="local-gas-station" 
              size={24} 
              color={Colors.textWhite} 
            />
            <Text style={styles.processButtonText}>Process Transaction</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <MaterialIcons name="receipt" size={32} color={Colors.primary} />
              <Text style={styles.modalTitle}>Confirm Transaction</Text>
            </View>

            {transactionData && (
              <View style={styles.confirmationDetails}>
                <View style={styles.confirmationRow}>
                  <MaterialIcons name="directions-car" size={20} color={Colors.textSecondary} />
                  <Text style={styles.confirmationLabel}>Vehicle:</Text>
                  <Text style={styles.confirmationValue}>{transactionData.vehicleNumber}</Text>
                </View>
                
                <View style={styles.confirmationRow}>
                  <MaterialIcons name="local-gas-station" size={20} color={Colors.textSecondary} />
                  <Text style={styles.confirmationLabel}>Fuel Type:</Text>
                  <Text style={styles.confirmationValue}>{transactionData.fuelType}</Text>
                </View>
                
                <View style={styles.confirmationRow}>
                  <MaterialIcons name="opacity" size={20} color={Colors.textSecondary} />
                  <Text style={styles.confirmationLabel}>Amount:</Text>
                  <Text style={[styles.confirmationValue, styles.amountValue]}>{transactionData.liters}L</Text>
                </View>
                
                <View style={styles.confirmationRow}>
                  <MaterialIcons name="account-balance" size={20} color={Colors.textSecondary} />
                  <Text style={styles.confirmationLabel}>Remaining:</Text>
                  <Text style={[styles.confirmationValue, styles.remainingValue]}>{transactionData.remainingQuota}L</Text>
                </View>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowConfirmModal(false)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="close" size={20} color={Colors.textSecondary} />
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={confirmTransaction}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={Colors.gradients.success}
                  style={styles.modalConfirmGradient}
                >
                  <MaterialIcons name="check" size={20} color={Colors.textWhite} />
                  <Text style={styles.modalConfirmText}>Confirm</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Processing Modal */}
      <Modal visible={false} transparent={true}>
        <View style={styles.processingOverlay}>
          <View style={styles.processingContent}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.processingText}>Processing Transaction...</Text>
            <Text style={styles.processingSubtext}>Please wait until fuel transaction gets completed</Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  vehicleCard: {
    margin: 20,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  vehicleHeader: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleHeaderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  vehicleHeaderText: {
    flex: 1,
  },
  vehicleHeaderLabel: {
    color: Colors.textWhite,
    fontSize: 14,
    opacity: 0.9,
    fontWeight: '500',
  },
  vehicleNumber: {
    color: Colors.textWhite,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 2,
  },
  quotaBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  quotaBadgeText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: '900',
  },
  quotaBadgeLabel: {
    color: Colors.textWhite,
    fontSize: 10,
    opacity: 0.9,
    marginTop: 2,
  },
  vehicleDetails: {
    padding: 20,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginBottom: 16,
  },
  detailIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    width: 100,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  fuelTypeValue: {
    color: Colors.secondary,
  },
  quotaValue: {
    color: Colors.accent,
    fontWeight: 'bold',
  },
  dispensingCard: {
    margin: 20,
    marginTop: 0,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginLeft: 8,
  },
  quickAmountContainer: {
    marginBottom: 24,
  },
  quickAmountLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    fontWeight: '500',
  },
  quickAmountButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickAmountButton: {
    flex: 1,
    backgroundColor: Colors.surfaceSecondary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  quickAmountButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  quickAmountButtonText: {
    color: Colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  quickAmountButtonTextSelected: {
    color: Colors.textWhite,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputSectionTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    fontWeight: '500',
  },
  inputContainer: {
    alignItems: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    width: '100%',
    maxWidth: 150,
  },
  literInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 18,
    textAlign: 'center',
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  inputUnit: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginLeft: 8,
  },
  processButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  processButtonDisabled: {
    opacity: 0.6,
  },
  processButtonGradient: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processButtonText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    margin: 20,
    borderRadius: 12,
    padding: 24,
    minWidth: 300,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginLeft: 8,
  },
  confirmationDetails: {
    marginBottom: 24,
  },
  confirmationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmationLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
    width: 80,
    fontWeight: '500',
  },
  confirmationValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  amountValue: {
    color: Colors.secondary,
  },
  remainingValue: {
    color: Colors.accent,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // padding: 14,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalCancelText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    marginLeft: 6,
  },
  modalConfirmButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  modalConfirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  modalConfirmText: {
    color: Colors.textWhite,
    fontWeight: '600',
    marginLeft: 6,
  },
  processingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingContent: {
    backgroundColor: Colors.surface,
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 200,
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  processingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default FuelTransactionScreen;
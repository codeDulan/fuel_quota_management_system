import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Camera } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ApiService from '../services/ApiService';
import { Colors } from '../constants/Colors';

const { width, height } = Dimensions.get('window');

const QRScannerScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanning) return; // Prevent multiple scans

    setScanned(true);
    setScanning(true);

    try {
      // Use the backend API to check quota by QR
      const vehicleData = await ApiService.checkQuotaByQR(data);

      if (vehicleData) {
        navigation.navigate('FuelTransaction', {
          vehicleData: vehicleData,
          qrCode: data,
        });
        setScanned(false);
        setScanning(false);
      } else {
        Alert.alert(
          'Invalid QR Code',
          'This QR code is not associated with any registered vehicle.',
          [{
            text: 'Scan Again',
            onPress: () => {
              setScanned(false);
              setScanning(false);
            }
          }]
        );
      }
    } catch (error) {
      console.error('QR scan error:', error);
      let errorMessage = 'Failed to validate QR code. Please try again.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert(
        'Validation Error',
        errorMessage,
        [{
          text: 'Scan Again',
          onPress: () => {
            setScanned(false);
            setScanning(false);
          }
        }]
      );
    }
  };

  const toggleFlash = () => {
    setFlashOn(!flashOn);
  };

  const handleScanAgain = () => {
    setScanned(false);
    setScanning(false);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.loadingContent}>
          <MaterialIcons name="camera" size={48} color={Colors.primary} />
          <Text style={styles.loadingText}>Initializing Camera...</Text>
        </View>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <LinearGradient colors={Colors.gradients.header} style={styles.centerContainer}>
        <View style={styles.permissionContent}>
          <View style={styles.permissionIconContainer}>
            <MaterialIcons name="camera-alt" size={64} color={Colors.textWhite} />
          </View>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionDescription}>
            Camera access is required to scan vehicle QR codes and process fuel transactions.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={async () => {
              const { status } = await Camera.requestCameraPermissionsAsync();
              setHasPermission(status === 'granted');
            }}
            activeOpacity={0.8}
          >
            <MaterialIcons name="camera" size={20} color={Colors.primary} />
            <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <Camera
        style={styles.scanner}
        type={Camera.Constants.Type.back}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        flashMode={flashOn ? Camera.Constants.FlashMode.torch : Camera.Constants.FlashMode.off}
      />

      {/* Main overlay */}
      <View style={styles.overlay}>
        {/* Top overlay with instructions */}
        <View style={styles.overlayTop}>
          <View style={styles.instructionContainer}>
            <MaterialIcons name="qr-code-scanner" size={32} color={Colors.textWhite} />
            <Text style={styles.instructionTitle}>Position QR Code</Text>
            <Text style={styles.instructionText}>
              Align the vehicle's QR code within the frame below to check fuel quota
            </Text>
          </View>
        </View>

        {/* Scanner frame */}
        <View style={styles.scannerFrameContainer}>
          <View style={styles.scannerFrame}>
            {/* Corner borders */}
            <View style={[styles.frameCorner, styles.topLeft]} />
            <View style={[styles.frameCorner, styles.topRight]} />
            <View style={[styles.frameCorner, styles.bottomLeft]} />
            <View style={[styles.frameCorner, styles.bottomRight]} />

            {/* Scanned overlay */}
            {scanned && (
              <View style={styles.scannedOverlay}>
                <MaterialIcons name="check-circle" size={48} color={Colors.success} />
                <Text style={styles.scannedText}>QR Code Detected</Text>
              </View>
            )}
          </View>
        </View>

        {/* Bottom overlay with controls */}
        <View style={styles.overlayBottom}>
          <View style={styles.controlsContainer}>
            {/* Flash control */}
            <TouchableOpacity
              style={[styles.controlButton, flashOn && styles.controlButtonActive]}
              onPress={toggleFlash}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name={flashOn ? "flash-on" : "flash-off"}
                size={24}
                color={flashOn ? Colors.accent : Colors.textWhite}
              />
              <Text style={[
                styles.controlButtonText,
                flashOn && styles.controlButtonTextActive
              ]}>
                {flashOn ? 'Flash On' : 'Flash Off'}
              </Text>
            </TouchableOpacity>

            {/* Scan again button */}
            {scanned && (
              <TouchableOpacity
                style={styles.scanAgainButton}
                onPress={handleScanAgain}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={Colors.gradients.primary}
                  style={styles.scanAgainGradient}
                >
                  <MaterialIcons name="qr-code-scanner" size={20} color={Colors.textWhite} />
                  <Text style={styles.scanAgainText}>Scan Again</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {/* Status indicator */}
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: scanned ? Colors.success : Colors.accent }
            ]} />
            <Text style={styles.statusText}>
              {scanned ? 'QR Code Scanned Successfully' : 'Ready to Scan'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  permissionContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textWhite,
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionDescription: {
    fontSize: 16,
    color: Colors.textWhite,
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  permissionButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  scanner: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
    paddingBottom: 30,
  },
  instructionContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  instructionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textWhite,
    marginTop: 12,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.textWhite,
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 20,
  },
  scannerFrameContainer: {
    alignItems: 'center',
  },
  scannerFrame: {
    width: width * 0.7,
    height: width * 0.7,
    position: 'relative',
  },
  frameCorner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: Colors.textWhite,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scannedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannedText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.success,
    marginTop: 8,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingTop: 30,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  controlButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 80,
  },
  controlButtonActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  controlButtonText: {
    color: Colors.textWhite,
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  controlButtonTextActive: {
    color: Colors.accent,
  },
  scanAgainButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scanAgainGradient: {
    // flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  scanAgainText: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: Colors.textWhite,
    opacity: 0.9,
    fontWeight: '500',
  },
});

export default QRScannerScreen;
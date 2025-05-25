export const Colors = {
  // Primary Colors - Deep Blue Theme (Professional & Trustworthy)
  primary: '#1E3A8A',        // Deep Blue
  primaryLight: '#3B82F6',   // Bright Blue
  primaryDark: '#1E40AF',    // Navy Blue

  // Secondary Colors
  secondary: '#059669',      // Emerald Green
  secondaryLight: '#10B981', // Light Green
  accent: '#F59E0B',         // Amber

  // Status Colors
  success: '#10B981',        // Success Green
  warning: '#F59E0B',        // Warning Amber
  error: '#EF4444',          // Error Red
  info: '#3B82F6',           // Info Blue

  // Neutral Colors
  background: '#F8FAFC',     // Very Light Gray
  surface: '#FFFFFF',        // White
  surfaceSecondary: '#F1F5F9', // Light Gray
  border: '#E2E8F0',         // Border Gray

  // Text Colors
  textPrimary: '#1E293B',    // Dark Gray
  textSecondary: '#64748B',  // Medium Gray
  textLight: '#94A3B8',      // Light Gray
  textWhite: '#FFFFFF',      // White
  placeholder: '#9CA3AF',    // Placeholder Gray

  // Gradient Arrays for LinearGradient
  gradients: {
    primary: ['#1E3A8A', '#3B82F6'],
    success: ['#059669', '#10B981'],
    warning: ['#F59E0B', '#FBBF24'],
    surface: ['#F8FAFC', '#FFFFFF'],
    header: ['#1E3A8A', '#2563EB'],
    button: ['#3babf6', '#2588eb'],
  },

  // Opacity Variants
  opacity: {
    light: 0.1,
    medium: 0.2,
    heavy: 0.3,
  },
};

// Fuel-specific color mappings
export const FuelColors = {
  petrol: {
    primary: Colors.info,
    light: '#DBEAFE',
    gradient: ['#3B82F6', '#60A5FA'],
  },
  diesel: {
    primary: Colors.secondary,
    light: '#D1FAE5',
    gradient: ['#059669', '#10B981'],
  },
};

// Status-specific mappings
export const StatusColors = {
  active: Colors.success,
  inactive: Colors.textLight,
  pending: Colors.warning,
  failed: Colors.error,
  processing: Colors.info,
};

// Component-specific color schemes
export const ComponentColors = {
  card: {
    background: Colors.surface,
    border: Colors.border,
    shadow: Colors.textPrimary,
  },
  button: {
    primary: {
      background: Colors.primary,
      text: Colors.textWhite,
      gradient: Colors.gradients.primary,
    },
    secondary: {
      background: Colors.surface,
      text: Colors.primary,
      border: Colors.primary,
    },
    success: {
      background: Colors.success,
      text: Colors.textWhite,
      gradient: Colors.gradients.success,
    },
    warning: {
      background: Colors.warning,
      text: Colors.textWhite,
      gradient: Colors.gradients.warning,
    },
  },
  input: {
    background: Colors.surface,
    border: Colors.border,
    borderFocused: Colors.primary,
    text: Colors.textPrimary,
    placeholder: Colors.placeholder,
  },
  header: {
    background: Colors.gradients.header,
    text: Colors.textWhite,
    subtitle: Colors.textWhite,
  },
};

// Usage example in component
/*
import { Colors, ComponentColors } from '../constants/Colors';
 
const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },
  card: {
    backgroundColor: ComponentColors.card.background,
    borderColor: ComponentColors.card.border,
  },
  primaryButton: {
    backgroundColor: ComponentColors.button.primary.background,
  },
  primaryButtonText: {
    color: ComponentColors.button.primary.text,
  },
});
 
// For LinearGradient
<LinearGradient colors={Colors.gradients.primary} style={styles.gradient}>
  <Text style={styles.text}>Professional Button</Text>
</LinearGradient>
*/
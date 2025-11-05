import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { Equipment } from './types';
import { STATUS_COLORS, FONTS } from './constants';

interface EquipmentItemProps {
  equipment: Equipment;
  onPress?: () => void;
}

export const EquipmentItem = ({ equipment, onPress }: EquipmentItemProps) => {
  const statusColor = STATUS_COLORS[equipment.status];
  
  // Determine icon name or use initials
  const getIconName = () => {
    if (equipment.icon && equipment.icon !== 'other') {
      return equipment.icon;
    }
    // Default icons for mic and light
    return equipment.type === 'mic' ? 'mic.fill' : 'lightbulb.fill';
  };
  
  const iconName = getIconName();
  const showInitials = equipment.icon === 'other';
  
  // Get initials: first letter of each word
  const getInitials = () => {
    const words = equipment.label.trim().split(/\s+/);
    return words.map(word => word[0]).join('').toUpperCase();
  };
  
  const initials = getInitials();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: statusColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {showInitials ? (
        <Text style={styles.initials}>{initials}</Text>
      ) : (
        <SymbolView
          name={iconName}
          weight="semibold"
          tintColor="#FFFFFF"
          style={styles.icon}
        />
      )}
      <Text style={styles.label}>{equipment.label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  icon: {
    width: 36,
    height: 36,
  },
  initials: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
  },
  label: {
    marginTop: 2,
    fontSize: 13,
    fontFamily: FONTS.semiBold,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
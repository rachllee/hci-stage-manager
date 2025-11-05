import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FilterType } from './types';
import { COLORS, FONTS } from './constants';

interface FilterButtonProps {
  label: string;
  filterType: FilterType;
  isActive: boolean;
  onPress: (filter: FilterType) => void;
}

export const FilterButton = ({
  label,
  filterType,
  isActive,
  onPress,
}: FilterButtonProps) => {
  return (
    <TouchableOpacity
      style={[styles.button, isActive && styles.buttonActive]}
      onPress={() => onPress(filterType)}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, isActive && styles.textActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.shadowBlue,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  buttonActive: {
    borderColor: COLORS.mintAccent,
    backgroundColor: 'rgba(78, 236, 163, 0.1)',
  },
  text: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.slateMist,
  },
  textActive: {
    color: COLORS.mintAccent,
    fontFamily: FONTS.semiBold,
  },
});
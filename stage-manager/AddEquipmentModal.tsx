import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import { EquipmentType } from './types';
import { COLORS, FONTS } from './constants';

interface AddEquipmentModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (equipment: {
    type: EquipmentType;
    label: string;
    icon: string;
  }) => void;
}

const EQUIPMENT_OPTIONS = [
  { type: 'mic' as EquipmentType, icon: 'mic.fill', label: 'Microphone' },
  { type: 'light' as EquipmentType, icon: 'lightbulb.fill', label: 'Light' },
  { type: 'light' as EquipmentType, icon: 'speaker.wave.2.fill', label: 'Speaker' },
  { type: 'light' as EquipmentType, icon: 'camera.fill', label: 'Camera' },
  { type: 'light' as EquipmentType, icon: 'music.note', label: 'Prop' },
  { type: 'light' as EquipmentType, icon: 'other', label: 'Other' },
];

export const AddEquipmentModal = ({
  visible,
  onClose,
  onSave,
}: AddEquipmentModalProps) => {
  const [selectedType, setSelectedType] = useState<EquipmentType>('light');
  const [selectedIcon, setSelectedIcon] = useState('lightbulb.fill');
  const [label, setLabel] = useState('');

  const handleSave = () => {
    if (!label.trim()) {
      alert('Please enter a name for the equipment');
      return;
    }

    onSave({
      type: selectedType,
      label: label.trim(),
      icon: selectedIcon,
    });

    // Reset form
    setSelectedType('light');
    setSelectedIcon('lightbulb.fill');
    setLabel('');
  };

  const handleSelectEquipment = (option: typeof EQUIPMENT_OPTIONS[0]) => {
    setSelectedType(option.type);
    setSelectedIcon(option.icon);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>×</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Add Equipment</Text>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Equipment Type Selection */}
            <Text style={styles.sectionTitle}>Select Equipment Type</Text>
            <View style={styles.iconGrid}>
              {EQUIPMENT_OPTIONS.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.iconOption,
                    selectedIcon === option.icon && styles.iconOptionSelected,
                  ]}
                  onPress={() => handleSelectEquipment(option)}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      selectedIcon === option.icon && styles.iconCircleSelected,
                    ]}
                  >
                    {option.icon === 'other' ? (
                      <Text
                        style={[
                          styles.initialsText,
                          selectedIcon === option.icon && styles.initialsTextSelected,
                        ]}
                      >
                        {label ? label.trim().split(/\s+/).map(word => word[0]).join('').toUpperCase() : 'OT'}
                      </Text>
                    ) : (
                      <SymbolView
                        name={option.icon}
                        weight="semibold"
                        tintColor={
                          selectedIcon === option.icon ? COLORS.nightSky : COLORS.foam
                        }
                        style={styles.icon}
                      />
                    )}
                  </View>
                  <Text style={styles.iconLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Name Input */}
            <Text style={styles.sectionTitle}>Equipment Name</Text>
            <TextInput
              style={styles.nameInput}
              value={label}
              onChangeText={setLabel}
              placeholder="Enter equipment name (e.g., Light 9)"
              placeholderTextColor={COLORS.slateMist}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '70%',
    height: '70%',
    backgroundColor: COLORS.nightSky,
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.shadowBlue,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 40,
    color: COLORS.foam,
    lineHeight: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.foam,
  },
  saveButton: {
    backgroundColor: COLORS.mintAccent,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.nightSky,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.foam,
    marginBottom: 16,
    marginTop: 8,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  iconOption: {
    alignItems: 'center',
    width: '30%',
  },
  iconOptionSelected: {
    opacity: 1,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.shadowBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconCircleSelected: {
    backgroundColor: COLORS.mintAccent,
    borderColor: COLORS.mintAccent,
  },
  icon: {
    width: 40,
    height: 40,
  },
  iconLabel: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.foam,
    textAlign: 'center',
  },
  nameInput: {
    backgroundColor: COLORS.shadowBlue,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.foam,
  },
  initialsText: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: COLORS.foam,
  },
  initialsTextSelected: {
    color: COLORS.nightSky,
  },
});
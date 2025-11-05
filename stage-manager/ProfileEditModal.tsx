import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { COLORS, FONTS } from './constants';

interface ProfileEditModalProps {
  visible: boolean;
  currentName: string;
  currentInitials: string;
  onClose: () => void;
  onSave: (newName: string) => void;
}

export const ProfileEditModal = ({
  visible,
  currentName,
  currentInitials,
  onClose,
  onSave,
}: ProfileEditModalProps) => {
  const [name, setName] = useState(currentName);

  useEffect(() => {
    if (visible) {
      setName(currentName);
    }
  }, [visible, currentName]);

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a name');
      return;
    }
    onSave(name.trim());
  };

  const getPreviewInitials = () => {
    if (!name.trim()) return currentInitials;
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Edit Profile</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* Profile Preview */}
            <View style={styles.previewContainer}>
              <View style={styles.previewCircle}>
                <Text style={styles.previewText}>{getPreviewInitials()}</Text>
              </View>
              <Text style={styles.previewLabel}>Preview</Text>
            </View>

            {/* Name Input */}
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor={COLORS.slateMist}
              autoCapitalize="words"
            />

            <Text style={styles.hint}>
              Initials will be automatically generated: {getPreviewInitials()}
            </Text>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
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
    width: '50%',
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
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.foam,
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
  content: {
    padding: 24,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  previewCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.mintAccent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewText: {
    fontSize: 36,
    fontFamily: FONTS.bold,
    color: COLORS.nightSky,
  },
  previewLabel: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.slateMist,
  },
  label: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.foam,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.shadowBlue,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontFamily: FONTS.regular,
    color: COLORS.foam,
    marginBottom: 12,
  },
  hint: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.slateMist,
    marginBottom: 24,
  },
  saveButton: {
    backgroundColor: COLORS.mintAccent,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.nightSky,
  },
});
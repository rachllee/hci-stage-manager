import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { COLORS, FONTS } from './constants';

interface MenuModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectStageCoordinator: () => void;
  onSelectStyleGuide: () => void;
}

export const MenuModal = ({
  visible,
  onClose,
  onSelectStageCoordinator,
  onSelectStyleGuide,
}: MenuModalProps) => {
  const handleStageCoordinator = () => {
    onSelectStageCoordinator();
    onClose();
  };

  const handleStyleGuide = () => {
    onSelectStyleGuide();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleStageCoordinator}
            activeOpacity={0.7}
          >
            <Text style={styles.menuText}>Stage Crew Coordinator</Text>
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleStyleGuide}
            activeOpacity={0.7}
          >
            <Text style={styles.menuText}>Style Guide</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 80,
    paddingLeft: 20,
  },
  menuContainer: {
    backgroundColor: COLORS.shadowBlue,
    borderRadius: 12,
    width: 280,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.slateMist + '30',
  },
  menuItem: {
    padding: 20,
  },
  menuText: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.foam,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.slateMist + '30',
  },
});

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Equipment } from './types';
import { EquipmentItem } from './EquipmentItem';
import { COLORS, FONTS } from './constants';

interface StageLayoutProps {
  equipment: Equipment[];
  onEquipmentPress?: (equipment: Equipment) => void;
  onStagePress?: (position: { x: number; y: number }) => void;
  placingMode?: boolean;
}

export const StageLayout = ({ 
  equipment, 
  onEquipmentPress,
  onStagePress,
  placingMode = false
}: StageLayoutProps) => {
  const LAYOUT_WIDTH = 900; // 1.5x wider
  const LAYOUT_HEIGHT = 600;

  const handleStagePress = (event: any) => {
    if (placingMode && onStagePress) {
      const { locationX, locationY } = event.nativeEvent;
      const relativeX = Math.max(40, Math.min(LAYOUT_WIDTH - 40, locationX)) / LAYOUT_WIDTH;
      const relativeY = Math.max(40, Math.min(LAYOUT_HEIGHT - 40, locationY)) / LAYOUT_HEIGHT;
      onStagePress({ x: relativeX, y: relativeY });
    }
  };

  return (
    <View style={styles.container}>
      {/* Audience label */}
      <Text style={[styles.areaLabel, { top: 60 }]}>AUDIENCE</Text>
      
      {/* Stage area */}
      <TouchableOpacity
        style={[styles.stageArea, { width: LAYOUT_WIDTH, height: LAYOUT_HEIGHT }]}
        onPress={handleStagePress}
        activeOpacity={placingMode ? 0.8 : 1}
        disabled={!placingMode}
      >
        {equipment.map((item) => (
          <View
            key={item.id}
            style={[
              styles.equipmentPosition,
              {
                left: item.position.x * LAYOUT_WIDTH - 40,
                top: item.position.y * LAYOUT_HEIGHT - 40,
              },
            ]}
          >
            <EquipmentItem
              equipment={item}
              onPress={() => onEquipmentPress?.(item)}
            />
          </View>
        ))}
        
        {/* Stage label */}
        <Text style={[styles.areaLabel, styles.stageLabel]}>STAGE</Text>
        
        {placingMode && (
          <View style={styles.placingOverlay}>
            <Text style={styles.placingText}>Tap anywhere to place equipment</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  stageArea: {
    backgroundColor: COLORS.shadowBlue,
    borderRadius: 16,
    position: 'relative',
  },
  equipmentPosition: {
    position: 'absolute',
    width: 80,
    height: 80,
    zIndex: 10,
  },
  areaLabel: {
    fontSize: 26,
    fontFamily: FONTS.bold,
    color: COLORS.slateMist,
    letterSpacing: 8,
    position: 'absolute',
    alignSelf: 'center',
  },
  stageLabel: {
    top: '50%',
    transform: [{ translateY: -13 }],
  },
  placingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(78, 236, 163, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  placingText: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: COLORS.mintAccent,
  },
});
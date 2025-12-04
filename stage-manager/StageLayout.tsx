import { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutChangeEvent } from 'react-native';
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
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const ASPECT_RATIO = 1.5; // Prefer a wider stage, but stay responsive

  const handleContainerLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerSize((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height }
    );
  }, []);

  const { stageWidth, stageHeight } = useMemo(() => {
    const availableWidth = Math.max(0, containerSize.width - 24);
    const availableHeight = Math.max(0, containerSize.height - 32);

    if (!availableWidth || !availableHeight) {
      return { stageWidth: 0, stageHeight: 0 };
    }

    let width = availableWidth;
    let height = width / ASPECT_RATIO;

    if (height > availableHeight) {
      height = availableHeight;
      width = height * ASPECT_RATIO;
    }

    return { stageWidth: width, stageHeight: height };
  }, [ASPECT_RATIO, containerSize.height, containerSize.width]);

  const equipmentSize = useMemo(() => {
    if (!stageWidth) return 80;
    // Scale equipment with the stage, but keep sensible bounds
    return Math.min(90, Math.max(56, stageWidth * 0.08));
  }, [stageWidth]);

  const clampToStage = useCallback(
    (value: number, max: number) => {
      const margin = equipmentSize / 2;
      return Math.max(margin, Math.min(max - margin, value));
    },
    [equipmentSize]
  );

  const handleStagePress = useCallback((event: any) => {
    if (placingMode && onStagePress && stageWidth && stageHeight) {
      const { locationX, locationY } = event.nativeEvent;
      const clampedX = clampToStage(locationX, stageWidth);
      const clampedY = clampToStage(locationY, stageHeight);
      const relativeX = clampedX / stageWidth;
      const relativeY = clampedY / stageHeight;
      onStagePress({ x: relativeX, y: relativeY });
    }
  }, [clampToStage, onStagePress, placingMode, stageHeight, stageWidth]);

  const isReady = stageWidth > 0 && stageHeight > 0;

  return (
    <View style={styles.container} onLayout={handleContainerLayout}>
      {isReady && (
        <>
          {/* Audience label */}
          <Text style={[styles.areaLabel, styles.audienceLabel]}>AUDIENCE</Text>
      
          {/* Stage area */}
          <TouchableOpacity
            style={[styles.stageArea, { width: stageWidth, height: stageHeight }]}
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
                    width: equipmentSize,
                    height: equipmentSize,
                    left: item.position.x * stageWidth - equipmentSize / 2,
                    top: item.position.y * stageHeight - equipmentSize / 2,
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
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingVertical: 12,
    paddingHorizontal: 8,
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
  },
  audienceLabel: {
    marginBottom: 12,
  },
  stageLabel: {
    position: 'absolute',
    alignSelf: 'center',
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

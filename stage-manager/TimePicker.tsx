import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { COLORS, FONTS } from './constants';

interface TimePickerProps {
  hours: number;
  minutes: number;
  seconds: number;
  onTimeChange: (hours: number, minutes: number, seconds: number) => void;
}

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

export const TimePicker = ({ hours, minutes, seconds, onTimeChange }: TimePickerProps) => {
  const hoursScrollRef = useRef<ScrollView>(null);
  const minutesScrollRef = useRef<ScrollView>(null);
  const secondsScrollRef = useRef<ScrollView>(null);

  const hoursArray = Array.from({ length: 24 }, (_, i) => i);
  const minutesArray = Array.from({ length: 60 }, (_, i) => i);
  const secondsArray = Array.from({ length: 60 }, (_, i) => i);

  useEffect(() => {
    // Scroll to initial values
    setTimeout(() => {
      hoursScrollRef.current?.scrollTo({ y: hours * ITEM_HEIGHT, animated: false });
      minutesScrollRef.current?.scrollTo({ y: minutes * ITEM_HEIGHT, animated: false });
      secondsScrollRef.current?.scrollTo({ y: seconds * ITEM_HEIGHT, animated: false });
    }, 100);
  }, []);

  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
    type: 'hours' | 'minutes' | 'seconds'
  ) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);

    if (type === 'hours') {
      onTimeChange(index, minutes, seconds);
    } else if (type === 'minutes') {
      onTimeChange(hours, index, seconds);
    } else {
      onTimeChange(hours, minutes, index);
    }
  };

  const renderColumn = (
    items: number[],
    selectedValue: number,
    scrollRef: any,
    type: 'hours' | 'minutes' | 'seconds'
  ) => (
    <View style={styles.column}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => handleScroll(e, type)}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top padding */}
        <View style={{ height: ITEM_HEIGHT * 2 }} />
        
        {items.map((item) => (
          <View
            key={item}
            style={[
              styles.item,
              item === selectedValue && styles.selectedItem,
            ]}
          >
            <Text
              style={[
                styles.itemText,
                item === selectedValue && styles.selectedItemText,
              ]}
            >
              {item.toString().padStart(2, '0')}
            </Text>
          </View>
        ))}
        
        {/* Bottom padding */}
        <View style={{ height: ITEM_HEIGHT * 2 }} />
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        {/* Selection indicator overlay */}
        <View style={styles.selectionOverlay}>
          <View style={styles.selectionIndicator} />
        </View>

        {/* Hours */}
        {renderColumn(hoursArray, hours, hoursScrollRef, 'hours')}
        <Text style={styles.separator}>:</Text>

        {/* Minutes */}
        {renderColumn(minutesArray, minutes, minutesScrollRef, 'minutes')}
        <Text style={styles.separator}>:</Text>

        {/* Seconds */}
        {renderColumn(secondsArray, seconds, secondsScrollRef, 'seconds')}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    position: 'relative',
    backgroundColor: COLORS.shadowBlue,
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
    zIndex: 1,
  },
  selectionIndicator: {
    width: '90%',
    height: ITEM_HEIGHT,
    backgroundColor: COLORS.mintAccent + '20',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.mintAccent,
  },
  column: {
    flex: 1,
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
  },
  scrollContent: {
    alignItems: 'center',
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedItem: {
    // Selected item styling handled by overlay
  },
  itemText: {
    fontSize: 20,
    fontFamily: FONTS.mono,
    color: COLORS.slateMist,
  },
  selectedItemText: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.foam,
  },
  separator: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.foam,
    marginHorizontal: 8,
    paddingTop: 4,
  },
});

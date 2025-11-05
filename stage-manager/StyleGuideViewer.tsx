import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import * as Font from 'expo-font';
import type { FontSource } from 'expo-font';
import { COLORS } from './constants';

const COLOR_PALETTE = [
  { name: "Night Sky", hex: "#1A1D29" },
  { name: "Shadow Blue", hex: "#2D3142" },
  { name: "Mint Accent", hex: "#4ECCA3" },
  { name: "Amber Highlight", hex: "#FFB84D" },
  { name: "Signal Coral", hex: "#FF6B6B" },
  { name: "Glacier", hex: "#A8DADC" },
  { name: "Foam", hex: "#F1FAEE" },
  { name: "Slate Mist", hex: "#94A3B8" },
] as const;

const FONT_RESOURCES: Record<string, FontSource> = {
  "Inter-Regular": {
    uri: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf",
    display: Font.FontDisplay.SWAP,
  },
  "Inter-Medium": {
    uri: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZg.ttf",
    display: Font.FontDisplay.SWAP,
  },
  "Inter-SemiBold": {
    uri: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYMZg.ttf",
    display: Font.FontDisplay.SWAP,
  },
  "Inter-Bold": {
    uri: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf",
    display: Font.FontDisplay.SWAP,
  },
  "RobotoMono-Regular": {
    uri: "https://fonts.gstatic.com/s/robotomono/v31/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vqPQw.ttf",
    display: Font.FontDisplay.SWAP,
  },
};

const FONT_SHOWCASE = [
  {
    key: "inter-regular",
    label: "Inter Regular",
    description: "Primary body copy and longer-form content.",
    fontFamily: "Inter-Regular",
  },
  {
    key: "inter-medium",
    label: "Inter Medium",
    description: "Action labels, supporting buttons, and secondary emphasis.",
    fontFamily: "Inter-Medium",
  },
  {
    key: "inter-semibold",
    label: "Inter SemiBold",
    description: "Section titles and emphasized statements.",
    fontFamily: "Inter-SemiBold",
  },
  {
    key: "inter-bold",
    label: "Inter Bold",
    description: "Hero headlines and high-impact messaging.",
    fontFamily: "Inter-Bold",
  },
  {
    key: "roboto-mono",
    label: "Roboto Mono",
    description: "Timestamp sample - 10:42 AM",
    fontFamily: "RobotoMono-Regular",
  },
] as const;

const ICON_SHOWCASE = [
  { name: "home", label: "Home", tintColor: "#4ECCA3" },
  { name: "calendar", label: "Schedule", tintColor: "#FFB84D" },
  { name: "person.3", label: "Crew", tintColor: "#FF6B6B" },
  { name: "bell", label: "Alerts", tintColor: "#2D3142" },
] as const;

const getReadableTextColor = (hex: string) => {
  const [r, g, b] = hex
    .replace("#", "")
    .match(/.{2}/g)!
    .map((value) => parseInt(value, 16) / 255);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.6 ? "#1A1D29" : "#F1FAEE";
};

const ColorSwatch = ({
  name,
  hex,
}: (typeof COLOR_PALETTE)[number]) => {
  const textColor = getReadableTextColor(hex);
  return (
    <View style={[styles.colorCard, { backgroundColor: hex }]}>
      <Text style={[styles.colorLabel, { color: textColor }]}>{name}</Text>
      <Text style={[styles.colorCode, { color: textColor }]}>{hex}</Text>
    </View>
  );
};

interface StyleGuideViewerProps {
  visible: boolean;
  onClose: () => void;
}

export default function StyleGuideViewer({ visible, onClose }: StyleGuideViewerProps) {
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadFonts = async () => {
      try {
        await Font.loadAsync(FONT_RESOURCES);
        if (isMounted) {
          setFontsReady(true);
        }
      } catch (error) {
        console.warn("Failed to load fonts", error);
      }
    };

    if (visible) {
      loadFonts();
    }

    return () => {
      isMounted = false;
    };
  }, [visible]);

  if (!fontsReady) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.mintAccent} />
            <Text style={styles.loadingText}>Loading style guide...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <SymbolView
                name="xmark"
                size={24}
                tintColor={COLORS.shadowBlue}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Style Guide</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Content */}
          <ScrollView style={styles.scrollContent} contentContainerStyle={styles.content}>
            <View style={styles.hero}>
              <Text style={styles.title}>Hello, world!</Text>
              <Text style={styles.subtitle}>
                This is your stage manager sandbox. Explore the palette, typography,
                and iconography that shape the experience.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Brand Palette</Text>
              <Text style={styles.sectionSubtitle}>
                Core colors render as swatches below for quick reference.
              </Text>
              <View style={styles.paletteGrid}>
                {COLOR_PALETTE.map((color) => (
                  <ColorSwatch key={color.hex} {...color} />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Typography</Text>
              <Text style={styles.sectionSubtitle}>
                Inter handles most messaging, with Roboto Mono capturing precise
                timestamps.
              </Text>
              <View style={styles.fontList}>
                {FONT_SHOWCASE.map(({ key, label, description, fontFamily }) => (
                  <View key={key} style={styles.fontCard}>
                    <Text style={[styles.fontLabel, { fontFamily }]}>{label}</Text>
                    <Text style={[styles.fontSample, { fontFamily }]}>
                      {description}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Material Symbols</Text>
              <Text style={styles.sectionSubtitle}>
                Sample glyphs pulled from the Material Symbols collection.
              </Text>
              <View style={styles.iconRow}>
                {ICON_SHOWCASE.map(({ name, label, tintColor }) => (
                  <View key={name} style={styles.iconCard}>
                    <SymbolView
                      name={name}
                      weight="bold"
                      tintColor={tintColor}
                      style={styles.icon}
                    />
                    <Text style={[styles.iconLabel, { color: tintColor }]}>
                      {label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '95%',
    height: '95%',
    backgroundColor: COLORS.foam,
    borderRadius: 24,
    overflow: 'hidden',
  },
  loadingContainer: {
    backgroundColor: COLORS.foam,
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: COLORS.shadowBlue,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glacier,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.shadowBlue,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 32,
  },
  hero: {
    gap: 12,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    color: COLORS.nightSky,
    fontFamily: "Inter-Bold",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.shadowBlue,
    fontFamily: "Inter-Regular",
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 28,
    color: COLORS.shadowBlue,
    fontFamily: "Inter-SemiBold",
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.mintAccent,
    fontFamily: "Inter-Medium",
  },
  paletteGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  colorCard: {
    flexBasis: "48%",
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
    justifyContent: "space-between",
  },
  colorLabel: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
  },
  colorCode: {
    fontSize: 14,
    fontFamily: "RobotoMono-Regular",
  },
  fontList: {
    gap: 12,
  },
  fontCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.foam,
    borderWidth: 1,
    borderColor: COLORS.glacier,
    gap: 6,
  },
  fontLabel: {
    fontSize: 15,
    color: COLORS.shadowBlue,
  },
  fontSample: {
    fontSize: 16,
    color: COLORS.shadowBlue,
  },
  iconRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 24,
  },
  iconCard: {
    alignItems: "center",
    gap: 8,
  },
  icon: {
    width: 48,
    height: 48,
  },
  iconLabel: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
  },
});
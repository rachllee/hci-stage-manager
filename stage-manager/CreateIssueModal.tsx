import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { Equipment, Issue, IssueStatus } from './types';
import { COLORS, FONTS, TEAM_MEMBERS } from './constants';
import { TimePicker } from './TimePicker';

// Custom status colors (excluding red, yellow, green)
const CUSTOM_COLORS = [
  '#9333EA', // Purple
  '#3B82F6', // Blue
  '#EC4899', // Pink
  '#F97316', // Orange
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#A855F7', // Purple-light
  '#6366F1', // Indigo
];

interface CreateIssueModalProps {
  visible: boolean;
  equipment: Equipment | null;
  existingIssue?: Issue | null;
  onClose: () => void;
  onSave: (issueData: {
    equipmentId: string;
    equipmentLabel: string;
    title: string;
    description: string;
    estimatedTime: string;
    assignedTo: string[];
    status: IssueStatus;
    customStatus?: { name: string; color: string };
  }) => void;
}

export const CreateIssueModal = ({
  visible,
  equipment,
  existingIssue,
  onClose,
  onSave,
}: CreateIssueModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus>('problem-detected');
  const [customStatusName, setCustomStatusName] = useState('');
  const [customStatusColor, setCustomStatusColor] = useState('#9333EA'); // Purple default
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Time picker states
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  // Load existing issue data when modal opens
  useEffect(() => {
    if (visible) {
      if (existingIssue) {
        setTitle(existingIssue.title);
        setDescription(existingIssue.description || '');
        
        // Parse time
        const totalMinutes = existingIssue.estimatedResolutionTime || 0;
        setHours(Math.floor(totalMinutes / 60));
        setMinutes(totalMinutes % 60);
        setSeconds(0);
        
        setSelectedMembers(existingIssue.assignedTo || []);
        setSelectedStatus(existingIssue.status);
        
        // Load custom status if exists
        if (existingIssue.status === 'custom' && existingIssue.customStatus) {
          setCustomStatusName(existingIssue.customStatus.name);
          setCustomStatusColor(existingIssue.customStatus.color);
        }
      } else {
        // Reset for new issue
        setTitle('');
        setDescription('');
        setHours(0);
        setMinutes(0);
        setSeconds(0);
        setSelectedMembers([]);
        setSelectedStatus('problem-detected');
        setCustomStatusName('');
        setCustomStatusColor('#9333EA');
      }
    }
  }, [existingIssue, visible]);

  // Update time every second while modal is open
  useEffect(() => {
    if (visible) {
      const timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [visible]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSave = () => {
    if (!equipment) return;
    if (!title.trim()) {
      alert('Please enter a problem name');
      return;
    }
    
    if (selectedStatus === 'custom' && !customStatusName.trim()) {
      alert('Please enter a name for the custom status');
      return;
    }

    // Calculate total time in minutes
    const totalMinutes = (hours * 60) + minutes + (seconds / 60);

    onSave({
      equipmentId: equipment.id,
      equipmentLabel: equipment.label,
      title,
      description,
      estimatedTime: totalMinutes.toString(),
      assignedTo: selectedMembers,
      status: selectedStatus,
      customStatus: selectedStatus === 'custom' ? {
        name: customStatusName,
        color: customStatusColor,
      } : undefined,
    });
  };

  if (!equipment) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter Problem Name Here"
              placeholderTextColor={COLORS.slateMist}
            />
            <TouchableOpacity onPress={handleSave} style={styles.saveButtonHeader}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Current Time Display - Updates Live */}
            <View style={styles.timeDisplay}>
              <Text style={styles.timeLabel}>Current Time</Text>
              <Text style={styles.timeValue}>{formatTime(currentTime)}</Text>
            </View>

            <View style={styles.row}>
              {/* Problem Details */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Problem Details</Text>
                <TextInput
                  style={styles.textArea}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Enter Problem Here"
                  placeholderTextColor={COLORS.slateMist}
                  multiline
                  numberOfLines={6}
                />
              </View>

              {/* Problem Assignment */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Problem Assignment</Text>
                {TEAM_MEMBERS.map((member) => (
                  <TouchableOpacity
                    key={member.id}
                    style={[
                      styles.optionButton,
                      selectedMembers.includes(member.id) && styles.optionSelected,
                    ]}
                    onPress={() => toggleMember(member.id)}
                  >
                    <View
                      style={[
                        styles.radio,
                        selectedMembers.includes(member.id) && styles.radioSelected,
                      ]}
                    />
                    <Text style={styles.optionText}>{member.initials}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.row}>
              {/* Planned Fix Time */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Planned Fix Time</Text>
                <TimePicker
                  hours={hours}
                  minutes={minutes}
                  seconds={seconds}
                  onTimeChange={(h, m, s) => {
                    setHours(h);
                    setMinutes(m);
                    setSeconds(s);
                  }}
                />
              </View>

              {/* Problem Status */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Problem Status</Text>
                
                {/* Problem Detected - Red */}
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    selectedStatus === 'problem-detected' && styles.optionSelectedRed,
                  ]}
                  onPress={() => setSelectedStatus('problem-detected')}
                >
                  <View
                    style={[
                      styles.radio,
                      selectedStatus === 'problem-detected' && styles.radioSelectedRed,
                    ]}
                  />
                  <Text style={[styles.optionText, { color: COLORS.signalCoral }]}>
                    Problem Detected
                  </Text>
                </TouchableOpacity>

                {/* Working on Problem - Yellow */}
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    selectedStatus === 'in-progress' && styles.optionSelectedYellow,
                  ]}
                  onPress={() => setSelectedStatus('in-progress')}
                >
                  <View
                    style={[
                      styles.radio,
                      selectedStatus === 'in-progress' && styles.radioSelectedYellow,
                    ]}
                  />
                  <Text style={[styles.optionText, { color: COLORS.amberHighlight }]}>
                    Working on Problem
                  </Text>
                </TouchableOpacity>

                {/* Problem Resolved - Green */}
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    selectedStatus === 'resolved' && styles.optionSelectedGreen,
                  ]}
                  onPress={() => setSelectedStatus('resolved')}
                >
                  <View
                    style={[
                      styles.radio,
                      selectedStatus === 'resolved' && styles.radioSelectedGreen,
                    ]}
                  />
                  <Text style={[styles.optionText, { color: COLORS.mintAccent }]}>
                    Problem Resolved
                  </Text>
                </TouchableOpacity>

                {/* Custom Status */}
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    selectedStatus === 'custom' && {
                      ...styles.optionSelectedCustom,
                      borderColor: customStatusColor,
                    },
                  ]}
                  onPress={() => setSelectedStatus('custom')}
                >
                  <View
                    style={[
                      styles.radio,
                      selectedStatus === 'custom' && {
                        ...styles.radioSelectedCustom,
                        backgroundColor: customStatusColor,
                        borderColor: customStatusColor,
                      },
                    ]}
                  />
                  <Text style={[styles.optionText, { color: customStatusColor }]}>
                    {customStatusName || 'Custom Status'}
                  </Text>
                </TouchableOpacity>

                {/* Custom Status Configuration */}
                {selectedStatus === 'custom' && (
                  <View style={styles.customStatusConfig}>
                    <TextInput
                      style={styles.customStatusInput}
                      value={customStatusName}
                      onChangeText={setCustomStatusName}
                      placeholder="Enter custom status name"
                      placeholderTextColor={COLORS.slateMist}
                    />
                    
                    <Text style={styles.customColorLabel}>Select Color:</Text>
                    <View style={styles.colorGrid}>
                      {CUSTOM_COLORS.map((color) => (
                        <TouchableOpacity
                          key={color}
                          style={[
                            styles.colorOption,
                            { backgroundColor: color },
                            customStatusColor === color && styles.colorOptionSelected,
                          ]}
                          onPress={() => setCustomStatusColor(color)}
                        />
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>
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
    width: '85%',
    height: '80%',
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 32,
    color: COLORS.foam,
  },
  titleInput: {
    flex: 1,
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.foam,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  saveButtonHeader: {
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
  timeDisplay: {
    backgroundColor: COLORS.shadowBlue,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.slateMist,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 18,
    fontFamily: FONTS.mono,
    color: COLORS.mintAccent,
  },
  row: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 24,
  },
  section: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.foam,
    marginBottom: 12,
  },
  textArea: {
    backgroundColor: COLORS.shadowBlue,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.foam,
    height: 200,
    textAlignVertical: 'top',
  },
  timeInput: {
    backgroundColor: COLORS.shadowBlue,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: FONTS.mono,
    color: COLORS.foam,
    textAlign: 'center',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.shadowBlue,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  optionSelected: {
    backgroundColor: COLORS.shadowBlue,
    borderWidth: 2,
    borderColor: COLORS.foam,
  },
  optionSelectedYellow: {
    backgroundColor: COLORS.shadowBlue,
    borderWidth: 2,
    borderColor: COLORS.amberHighlight,
  },
  optionSelectedGreen: {
    backgroundColor: COLORS.shadowBlue,
    borderWidth: 2,
    borderColor: COLORS.mintAccent,
  },
  optionSelectedRed: {
    backgroundColor: COLORS.shadowBlue,
    borderWidth: 2,
    borderColor: COLORS.signalCoral,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.slateMist,
  },
  radioSelected: {
    backgroundColor: COLORS.foam,
    borderColor: COLORS.foam,
  },
  radioSelectedYellow: {
    backgroundColor: COLORS.amberHighlight,
    borderColor: COLORS.amberHighlight,
  },
  radioSelectedGreen: {
    backgroundColor: COLORS.mintAccent,
    borderColor: COLORS.mintAccent,
  },
  radioSelectedRed: {
    backgroundColor: COLORS.signalCoral,
    borderColor: COLORS.signalCoral,
  },
  optionText: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.foam,
  },
  optionSelectedCustom: {
    backgroundColor: COLORS.shadowBlue,
    borderWidth: 2,
  },
  radioSelectedCustom: {
    borderWidth: 2,
  },
  customStatusConfig: {
    marginTop: 12,
    padding: 16,
    backgroundColor: COLORS.nightSky,
    borderRadius: 12,
    gap: 12,
  },
  customStatusInput: {
    backgroundColor: COLORS.shadowBlue,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.foam,
  },
  customColorLabel: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.foam,
    marginTop: 8,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: COLORS.foam,
  },
});
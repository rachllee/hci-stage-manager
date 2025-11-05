import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Issue } from './types';
import { STATUS_COLORS, FONTS, COLORS } from './constants';

interface IssueCardProps {
  issue: Issue;
  onPress?: () => void;
}

export const IssueCard = ({ issue, onPress }: IssueCardProps) => {
  const statusColor = issue.status === 'custom' && issue.customStatus
    ? issue.customStatus.color
    : STATUS_COLORS[issue.status];
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    });
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
      <View style={styles.content}>
        <Text style={styles.title}>
          {issue.equipmentLabel} - {issue.title}
        </Text>
        <Text style={styles.subtitle}>
          Reported by {issue.reportedBy.toUpperCase()} at {formatTime(issue.reportedAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.shadowBlue,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
    marginTop: 6,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.foam,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: FONTS.mono,
    color: COLORS.slateMist,
  },
});
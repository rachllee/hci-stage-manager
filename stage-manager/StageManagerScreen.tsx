import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import * as Font from 'expo-font';
import type { FontSource } from 'expo-font';
import { FilterButton } from './FilterButton';
import { StageLayout } from './StageLayout';
import { IssueCard } from './IssueCard';
import { CreateIssueModal } from './CreateIssueModal';
import { AddEquipmentModal } from './AddEquipmentModal';
import { ProfileEditModal } from './ProfileEditModal';
import { MenuModal } from './MenuModal';
import StyleGuideViewer from './StyleGuideViewer';
import { FilterType, Equipment, Issue } from './types';
import { COLORS, FONTS, MOCK_EQUIPMENT, MOCK_ISSUES, TEAM_MEMBERS, updateTeamMember } from './constants';

const FONT_RESOURCES: Record<string, FontSource> = {
  'Inter-Regular': {
    uri: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf',
    display: Font.FontDisplay.SWAP,
  },
  'Inter-Medium': {
    uri: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZg.ttf',
    display: Font.FontDisplay.SWAP,
  },
  'Inter-SemiBold': {
    uri: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYMZg.ttf',
    display: Font.FontDisplay.SWAP,
  },
  'Inter-Bold': {
    uri: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf',
    display: Font.FontDisplay.SWAP,
  },
  'RobotoMono-Regular': {
    uri: 'https://fonts.gstatic.com/s/robotomono/v31/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vqPQw.ttf',
    display: Font.FontDisplay.SWAP,
  },
};

export default function StageManagerScreen() {
  const [fontsReady, setFontsReady] = useState(false);
  const [equipment, setEquipment] = useState<Equipment[]>(MOCK_EQUIPMENT);
  const [issues, setIssues] = useState<Issue[]>(MOCK_ISSUES);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Current user state
  const [currentUser, setCurrentUser] = useState({ id: 'kp', name: 'KP', initials: 'KP' });
  
  // Modal states
  const [createIssueModalVisible, setCreateIssueModalVisible] = useState(false);
  const [addEquipmentModalVisible, setAddEquipmentModalVisible] = useState(false);
  const [profileEditModalVisible, setProfileEditModalVisible] = useState(false);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [styleGuideVisible, setStyleGuideVisible] = useState(false);
  const [assignedTasksMenuVisible, setAssignedTasksMenuVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(currentUser.id);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [existingIssue, setExistingIssue] = useState<Issue | null>(null);
  const [placingEquipment, setPlacingEquipment] = useState(false);
  const [newEquipmentData, setNewEquipmentData] = useState<{
    type: 'mic' | 'light';
    label: string;
    icon: string;
  } | null>(null);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync(FONT_RESOURCES);
        setFontsReady(true);
      } catch (error) {
        console.warn('Failed to load fonts', error);
        setFontsReady(true);
      }
    };

    loadFonts();
  }, []);

  // Live clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Active issues - exclude resolved
  const activeIssues = issues.filter(issue => issue.status !== 'resolved');
  
  // Get all users who have assigned tasks (not resolved)
  const usersWithTasks = Array.from(
    new Set(
      issues
        .filter(issue => issue.status !== 'resolved' && issue.assignedTo)
        .flatMap(issue => issue.assignedTo || [])
    )
  );
  
  // Assigned tasks - issues where selected user is assigned AND not resolved
  const assignedTasks = issues.filter(issue => 
    issue.assignedTo && 
    issue.assignedTo.includes(selectedUserId) &&
    issue.status !== 'resolved'
  );
  
  // Get selected user info
  const selectedUserInfo = TEAM_MEMBERS.find(m => m.id === selectedUserId) || currentUser;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const handleProfileEdit = (newName: string) => {
    const { newInitials, newId } = updateTeamMember(currentUser.initials, newName);
    
    // Update current user
    setCurrentUser({ id: newId, name: newName, initials: newInitials });
    
    // Reset selected user to new current user
    setSelectedUserId(newId);
    
    // Update all issues that had the old user ID
    setIssues(issues.map(issue => ({
      ...issue,
      assignedTo: issue.assignedTo?.map(id => 
        id === currentUser.id ? newId : id
      ),
      reportedBy: issue.reportedBy === currentUser.id ? newId : issue.reportedBy,
    })));
    
    setProfileEditModalVisible(false);
  };

  const handleEquipmentPress = (item: Equipment) => {
    // Find existing issue for this equipment
    const existingEquipmentIssue = issues.find(
      issue => issue.equipmentId === item.id && issue.status !== 'resolved'
    );
    
    setSelectedEquipment(item);
    setExistingIssue(existingEquipmentIssue || null);
    setCreateIssueModalVisible(true);
  };

  const handleSaveIssue = (issueData: any) => {
    if (existingIssue) {
      // Update existing issue
      setIssues(issues.map(issue => 
        issue.id === existingIssue.id
          ? {
              ...issue,
              title: issueData.title,
              description: issueData.description,
              status: issueData.status,
              customStatus: issueData.customStatus,
              estimatedResolutionTime: parseInt(issueData.estimatedTime) || 0,
              // Remove current user from assignedTo if status is resolved
              assignedTo: issueData.status === 'resolved' 
                ? (issueData.assignedTo || []).filter((id: string) => id !== currentUser.id)
                : issueData.assignedTo,
            }
          : issue
      ));
    } else {
      // Create new issue
      const newIssue: Issue = {
        id: `issue-${Date.now()}`,
        equipmentId: issueData.equipmentId,
        equipmentLabel: issueData.equipmentLabel,
        title: issueData.title,
        description: issueData.description,
        status: issueData.status,
        customStatus: issueData.customStatus,
        reportedBy: currentUser.id, // Use current user
        reportedAt: new Date(),
        estimatedResolutionTime: parseInt(issueData.estimatedTime) || 0,
        assignedTo: issueData.assignedTo,
      };

      setIssues([...issues, newIssue]);
    }
    
    // Update equipment status
    setEquipment(equipment.map(eq => 
      eq.id === issueData.equipmentId 
        ? { ...eq, status: issueData.status }
        : eq
    ));

    setCreateIssueModalVisible(false);
    setSelectedEquipment(null);
    setExistingIssue(null);
  };

  const handleAddEquipment = () => {
    setAddEquipmentModalVisible(true);
  };

  const handleSaveNewEquipment = (equipmentData: any) => {
    setNewEquipmentData(equipmentData);
    setAddEquipmentModalVisible(false);
    setPlacingEquipment(true);
  };

  const handleStagePress = (position: { x: number; y: number }) => {
    if (placingEquipment && newEquipmentData) {
      const newEquipment: Equipment = {
        id: `${newEquipmentData.type}-${Date.now()}`,
        type: newEquipmentData.type,
        label: newEquipmentData.label,
        position,
        status: 'resolved',
        crew: newEquipmentData.type === 'mic' ? 'sound' : 'lighting',
        icon: newEquipmentData.icon, // Store the icon
      };

      setEquipment([...equipment, newEquipment]);
      setPlacingEquipment(false);
      setNewEquipmentData(null);
    }
  };

  if (!fontsReady) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.mintAccent} />
        <Text style={styles.loaderText}>Loading Stage Manager...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => setMenuModalVisible(true)}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Stage Crew Coordinator</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => setProfileEditModalVisible(true)}
          >
            <Text style={styles.profileText}>{currentUser.initials}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Stage Layout */}
        <View style={styles.stageContainer}>
          <StageLayout
            equipment={equipment}
            onEquipmentPress={handleEquipmentPress}
            onStagePress={handleStagePress}
            placingMode={placingEquipment}
          />
        </View>

        {/* Right Sidebar */}
        <View style={styles.sidebar}>
          {/* Clock */}
          <View style={styles.clockContainer}>
            <Text style={styles.clockText}>{formatTime(currentTime)}</Text>
          </View>

          {/* Active Issues */}
          <View style={styles.sidebarSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Active Issues ({activeIssues.length})
              </Text>
            </View>
            <ScrollView style={styles.issuesList}>
              {activeIssues.map((issue) => (
                <IssueCard 
                  key={issue.id} 
                  issue={issue}
                  onPress={() => {
                    const eq = equipment.find(e => e.id === issue.equipmentId);
                    if (eq) handleEquipmentPress(eq);
                  }}
                />
              ))}
              {activeIssues.length === 0 && (
                <Text style={styles.emptyText}>No active issues</Text>
              )}
            </ScrollView>
          </View>

          {/* Assigned Tasks (replaces Timeline) */}
          <View style={styles.sidebarSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Assigned Tasks ({assignedTasks.length})
              </Text>
              <TouchableOpacity 
                style={styles.hamburgerButton}
                onPress={() => setAssignedTasksMenuVisible(!assignedTasksMenuVisible)}
              >
                <Text style={styles.hamburgerIcon}>☰</Text>
              </TouchableOpacity>
            </View>
            
            {/* User Selection Dropdown */}
            {assignedTasksMenuVisible && usersWithTasks.length > 0 && (
              <View style={styles.userFilterMenu}>
                {usersWithTasks.map((userId) => {
                  const user = TEAM_MEMBERS.find(m => m.id === userId);
                  if (!user) return null;
                  return (
                    <TouchableOpacity
                      key={userId}
                      style={[
                        styles.userFilterItem,
                        userId === selectedUserId && styles.userFilterItemSelected,
                      ]}
                      onPress={() => {
                        setSelectedUserId(userId);
                        setAssignedTasksMenuVisible(false);
                      }}
                    >
                      <Text style={styles.userFilterText}>
                        {user.initials}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            
            <ScrollView style={styles.issuesList}>
              {assignedTasks.map((issue) => (
                <IssueCard 
                  key={issue.id} 
                  issue={issue}
                  onPress={() => {
                    const eq = equipment.find(e => e.id === issue.equipmentId);
                    if (eq) handleEquipmentPress(eq);
                  }}
                />
              ))}
              {assignedTasks.length === 0 && (
                <Text style={styles.emptyText}>
                  No assigned tasks for {selectedUserInfo.initials}
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </View>

      {/* Add Equipment Button (Bottom Left) */}
      <TouchableOpacity
        style={styles.addEquipmentButton}
        onPress={handleAddEquipment}
      >
        <Text style={styles.addEquipmentIcon}>+</Text>
      </TouchableOpacity>

      {/* Modals */}
      <CreateIssueModal
        visible={createIssueModalVisible}
        equipment={selectedEquipment}
        existingIssue={existingIssue}
        onClose={() => {
          setCreateIssueModalVisible(false);
          setSelectedEquipment(null);
          setExistingIssue(null);
        }}
        onSave={handleSaveIssue}
      />

      <AddEquipmentModal
        visible={addEquipmentModalVisible}
        onClose={() => setAddEquipmentModalVisible(false)}
        onSave={handleSaveNewEquipment}
      />

      <ProfileEditModal
        visible={profileEditModalVisible}
        currentName={currentUser.name}
        currentInitials={currentUser.initials}
        onClose={() => setProfileEditModalVisible(false)}
        onSave={handleProfileEdit}
      />

      <MenuModal
        visible={menuModalVisible}
        onClose={() => setMenuModalVisible(false)}
        onSelectStageCoordinator={() => {
          // Already on this screen, just close menu
        }}
        onSelectStyleGuide={() => setStyleGuideVisible(true)}
      />

      <StyleGuideViewer
        visible={styleGuideVisible}
        onClose={() => setStyleGuideVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.nightSky,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.nightSky,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.foam,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: COLORS.nightSky,
  },
  headerLeft: {
    width: 60,
  },
  menuButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 32,
    color: COLORS.foam,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.foam,
    textAlign: 'center',
  },
  headerRight: {
    width: 60,
    alignItems: 'flex-end',
  },
  profileButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.mintAccent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.nightSky,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 20,
  },
  stageContainer: {
    flex: 1,
  },
  sidebar: {
    width: 350,
    gap: 16,
  },
  clockContainer: {
    backgroundColor: COLORS.shadowBlue,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  clockText: {
    fontSize: 20,
    fontFamily: FONTS.mono,
    color: COLORS.mintAccent,
  },
  sidebarSection: {
    flex: 1,
    backgroundColor: COLORS.shadowBlue,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.foam,
  },
  hamburgerButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hamburgerIcon: {
    fontSize: 20,
    color: COLORS.foam,
  },
  userFilterMenu: {
    backgroundColor: COLORS.nightSky,
    borderRadius: 8,
    marginBottom: 12,
    padding: 8,
    gap: 4,
  },
  userFilterItem: {
    padding: 12,
    borderRadius: 6,
    backgroundColor: COLORS.shadowBlue,
  },
  userFilterItemSelected: {
    backgroundColor: COLORS.mintAccent,
  },
  userFilterText: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.foam,
    textAlign: 'center',
  },
  issuesList: {
    flex: 1,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.slateMist,
    textAlign: 'center',
    marginTop: 20,
  },
  addEquipmentButton: {
    position: 'absolute',
    bottom: 80,
    left: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.mintAccent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  addEquipmentIcon: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: COLORS.nightSky,
    lineHeight: 32,
  },
});
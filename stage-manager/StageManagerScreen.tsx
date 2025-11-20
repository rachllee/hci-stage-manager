import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import * as Font from 'expo-font';
import type { FontSource } from 'expo-font';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
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

type SyncStatus = 'connecting' | 'connected' | 'disconnected' | 'error' | 'unavailable';

type SerializedIssue = Omit<Issue, 'reportedAt'> & { reportedAt: string };

type StageStatePayload = {
  equipment: Equipment[];
  issues: SerializedIssue[];
};

type StageSyncExtra = {
  stageSyncUrl?: string;
  stageSyncHost?: string;
  stageSyncPort?: number;
};

const logSync = (...args: unknown[]) => {
  if (__DEV__) {
    console.log('[stage-sync]', ...args);
  }
};

const env =
  ((globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  }).process?.env) ?? {};

const sanitizeHost = (value: string) =>
  value
    .replace(/^https?:\/\//, '')
    .replace(/^exp:\/\/\/?/, '')
    .split('?')[0]
    .split('/')[0];

const parsePort = (value?: string | number, fallback = 4001) => {
  if (value == null) return fallback;
  const num = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(num) && num > 0 ? num : fallback;
};

const normalizeWsUrl = (input: string, port?: number) => {
  if (input.startsWith('ws://') || input.startsWith('wss://')) {
    return input;
  }
  const sanitized = sanitizeHost(input);
  const [hostPart, portPart] = sanitized.split(':');
  const resolvedPort = portPart ? Number(portPart) : port;
  return `ws://${hostPart}:${resolvedPort ?? 4001}`;
};

const getManualSyncUrl = () => {
  const extra = Constants.expoConfig?.extra as StageSyncExtra | undefined;
  const envUrl = env.EXPO_PUBLIC_STAGE_SYNC_URL ?? env.STAGE_SYNC_URL;
  if (envUrl) {
    logSync('Using EXPO_PUBLIC_STAGE_SYNC_URL/STAGE_SYNC_URL:', envUrl);
    return normalizeWsUrl(envUrl);
  }
  if (extra?.stageSyncUrl) {
    logSync('Using expo.extra.stageSyncUrl:', extra.stageSyncUrl);
    return normalizeWsUrl(extra.stageSyncUrl);
  }
  const envHost =
    env.EXPO_PUBLIC_STAGE_SYNC_HOST ??
    env.STAGE_SYNC_HOST ??
    extra?.stageSyncHost;
  if (!envHost) return null;
  logSync('Using explicit host override:', envHost);
  const envPort =
    env.EXPO_PUBLIC_STAGE_SYNC_PORT ??
    env.STAGE_SYNC_PORT ??
    extra?.stageSyncPort;
  if (envPort) {
    logSync('Using explicit port override:', envPort);
  }
  return normalizeWsUrl(envHost, parsePort(envPort));
};

const getHostCandidate = () => {
  const expoConfigHost = Constants.expoConfig?.hostUri;
  const manifestHost = (Constants as Record<string, unknown> & {
    manifest?: { hostUri?: string };
  }).manifest?.hostUri;
  const manifest2Host = (Constants as Record<string, unknown> & {
    manifest2?: { extra?: { expoClient?: { hostUri?: string } } };
  }).manifest2?.extra?.expoClient?.hostUri;
  const debuggerHost = (Constants as Record<string, unknown> & {
    expoGoConfig?: { debuggerHost?: string };
  }).expoGoConfig?.debuggerHost;

  if (expoConfigHost || manifestHost || manifest2Host || debuggerHost) {
    return expoConfigHost || manifestHost || manifest2Host || debuggerHost || null;
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const { hostname, port } = window.location;
    if (hostname) {
      const browserHost = port ? `${hostname}:${port}` : hostname;
      logSync('Using browser location as fallback host:', browserHost);
      return browserHost;
    }
  }

  return null;
};

const getSyncServerUrl = () => {
  const manualUrl = getManualSyncUrl();
  if (manualUrl) {
    logSync('Resolved manual sync URL:', manualUrl);
    return manualUrl;
  }
  const hostCandidate = getHostCandidate();
  if (!hostCandidate) {
    logSync('No host candidate from Expo manifest/debugger metadata or browser fallback.');
    return null;
  }
  const cleaned = sanitizeHost(hostCandidate);
  const host = cleaned.split(':')[0];
  if (!host) {
    logSync('Failed to parse host from candidate:', hostCandidate);
    return null;
  }
  const extra = Constants.expoConfig?.extra as { stageSyncPort?: number } | undefined;
  const port = extra?.stageSyncPort ?? 4001;
  logSync('Using Expo manifest host/port combo:', host, port);
  return `ws://${host}:${port}`;
};

const serializeStageState = (equipment: Equipment[], issues: Issue[]): StageStatePayload => ({
  equipment,
  issues: issues.map((issue) => ({
    ...issue,
    reportedAt:
      issue.reportedAt instanceof Date
        ? issue.reportedAt.toISOString()
        : new Date(issue.reportedAt).toISOString(),
  })),
});

const deserializeStageState = (payload?: StageStatePayload | null) => {
  if (!payload) return null;
  return {
    equipment: payload.equipment ?? [],
    issues: (payload.issues ?? []).map((issue) => ({
      ...issue,
      reportedAt: new Date(issue.reportedAt),
    })),
  };
};

const createClientId = () => `client-${Math.random().toString(36).slice(2, 10)}`;

export default function StageManagerScreen() {
  const [fontsReady, setFontsReady] = useState(false);
  const [equipment, setEquipment] = useState<Equipment[]>(MOCK_EQUIPMENT);
  const [issues, setIssues] = useState<Issue[]>(MOCK_ISSUES);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clientId] = useState(createClientId);
  const syncUrl = useMemo(() => getSyncServerUrl(), []);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(
    syncUrl ? 'connecting' : 'unavailable'
  );
  const [syncError, setSyncError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isApplyingRemoteRef = useRef(false);
  const lastBroadcastRef = useRef<string | null>(null);
  
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

  useEffect(() => {
    if (!syncUrl) {
      logSync('No sync URL resolved from manual or manifest info.');
      setSyncStatus('unavailable');
      setSyncError('Sync server unavailable on this build.');
      return;
    }

    let isMounted = true;

    const connect = () => {
      if (!isMounted) return;
      setSyncStatus('connecting');
      setSyncError(null);
      logSync('Attempting to connect to', syncUrl);

      const socket = new WebSocket(syncUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        if (!isMounted) return;
        setSyncStatus('connected');
        logSync('Connected to sync server.');
        socket.send(
          JSON.stringify({
            type: 'stage:request-state',
            originId: clientId,
          })
        );
      };

      socket.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'stage:state' && message.payload) {
            if (message.originId === clientId) {
              return;
            }
            const nextState = deserializeStageState(message.payload);
            if (nextState) {
              isApplyingRemoteRef.current = true;
              logSync('Received remote state', {
                origin: message.originId,
                equipment: nextState.equipment.length,
                issues: nextState.issues.length,
              });
              lastBroadcastRef.current = JSON.stringify(message.payload);
              setEquipment(nextState.equipment);
              setIssues(nextState.issues);
              setTimeout(() => {
                isApplyingRemoteRef.current = false;
              }, 0);
            }
          }
        } catch (error) {
          console.warn('Failed to parse sync payload', error);
        }
      };

      socket.onerror = () => {
        if (!isMounted) return;
        setSyncStatus('error');
        setSyncError('Cannot reach local sync server.');
        logSync('WebSocket error, marked as offline.');
      };

      socket.onclose = () => {
        if (!isMounted) return;
        setSyncStatus((prev) => (prev === 'error' ? prev : 'disconnected'));
        logSync('Connection closed, scheduling reconnect...');
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(connect, 2000);
      };
    };

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        logSync('Cleaning up WebSocket connection.');
        socketRef.current.close();
      }
    };
  }, [clientId, syncUrl]);

  // Live clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!socketRef.current || syncStatus !== 'connected' || !syncUrl) {
      return;
    }
    if (isApplyingRemoteRef.current) {
      return;
    }

    const payload = serializeStageState(equipment, issues);
    const payloadHash = JSON.stringify(payload);

    if (lastBroadcastRef.current === payloadHash) {
      return;
    }

    lastBroadcastRef.current = payloadHash;

    try {
      socketRef.current.send(
        JSON.stringify({
          type: 'stage:update',
          payload,
          originId: clientId,
        })
      );
      logSync('Broadcasted stage update', {
        equipmentCount: equipment.length,
        issueCount: issues.length,
      });
    } catch (error) {
      console.warn('Failed to broadcast stage update', error);
    }
  }, [equipment, issues, syncStatus, syncUrl, clientId]);

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

  const syncBannerMeta = useMemo(() => {
    switch (syncStatus) {
      case 'connected':
        return { color: COLORS.mintAccent, text: 'Live sync enabled' };
      case 'connecting':
        return { color: COLORS.amberHighlight, text: 'Syncing...' };
      case 'disconnected':
        return { color: COLORS.amberHighlight, text: 'Reconnecting sync...' };
      case 'error':
        return { color: COLORS.signalCoral, text: 'Sync offline' };
      case 'unavailable':
      default:
        return { color: COLORS.slateMist, text: 'Sync unavailable' };
    }
  }, [syncStatus]);

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

  const handleDeleteEquipment = (equipmentId: string) => {
    setEquipment((prev) => prev.filter((item) => item.id !== equipmentId));
    setIssues((prev) => prev.filter((issue) => issue.equipmentId !== equipmentId));
    setCreateIssueModalVisible(false);
    setSelectedEquipment(null);
    setExistingIssue(null);
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

      <View style={styles.syncBanner}>
        <View style={[styles.syncDot, { backgroundColor: syncBannerMeta.color }]} />
        <Text style={styles.syncText}>{syncBannerMeta.text}</Text>
        {syncError && (syncStatus === 'error' || syncStatus === 'unavailable') ? (
          <Text style={styles.syncErrorText}>{syncError}</Text>
        ) : null}
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
        onDeleteEquipment={handleDeleteEquipment}
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
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.shadowBlue,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  syncDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  syncText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.foam,
  },
  syncErrorText: {
    marginLeft: 'auto',
    fontSize: 12,
    fontFamily: FONTS.mono,
    color: COLORS.signalCoral,
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

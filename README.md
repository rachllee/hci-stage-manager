# Stage Crew Coordinator

A React Native application for managing stage equipment and technical issues during live performances. Built with Expo and TypeScript.
Credit: Cursor and ChatGPT Codex Medium was used to assist in generating code, as well as reformatting the README.


## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [File Descriptions](#file-descriptions)
- [Installation](#installation)
- [Running the App](#running-the-app)
- [Features](#features)

## 🎭 Overview

Stage Crew Coordinator is a real-time management tool for stage crews to:
- Track equipment placement on stage
- Report and manage technical issues
- Assign tasks to team members
- Monitor issue status with color-coded indicators
- View live clock and assigned tasks

## 🛠 Tech Stack

### Languages
- **TypeScript** - Primary language for type safety
- **JavaScript** - React Native runtime

### Frameworks & Libraries
- **React Native** (v0.74+) - Mobile app framework
- **Expo** (SDK 51+) - Development platform
- **Expo Router** - File-based routing
- **Expo Font** - Custom font loading
- **Expo Symbols** - SF Symbols icon library

### Development Tools
- **Node.js** (v18+)
- **npm** or **yarn** - Package management
- **Expo CLI** - Development server

## 📁 Project Structure

```
HCI-STAGE-MANAGER/
├── app/
│   ├── index.tsx                    # App entry point
│   ├── layout.tsx                   # Root layout wrapper
│   ├── StageManagerScreen.tsx       # Main screen component
│   ├── StageLayout.tsx              # Stage visualization
│   ├── EquipmentItem.tsx            # Equipment icon component
│   ├── IssueCard.tsx                # Issue display card
│   ├── CreateIssueModal.tsx         # Issue creation/edit modal
│   ├── AddEquipmentModal.tsx        # Equipment addition modal
│   ├── ProfileEditModal.tsx         # User profile editor
│   ├── MenuModal.tsx                # Navigation menu
│   ├── TimePicker.tsx               # iOS-style time picker
│   ├── FilterButton.tsx             # Filter button component
│   ├── StyleGuideViewer.tsx         # Design system viewer
│   ├── types.ts                     # TypeScript type definitions
│   └── constants.ts                 # App constants and mock data
├── assets/
│   └── (fonts and images)
├── node_modules/
├── .expo/
├── .gitignore
├── package.json
├── tsconfig.json
├── expo.json
└── README.md
```

## 📄 File Descriptions

### Core Files

#### `index.tsx`
- **Purpose**: Entry point that exports the main screen
- **Exports**: StageManagerScreen component
- **Lines**: ~5

#### `layout.tsx`
- **Purpose**: Root layout wrapper using Expo Router Stack
- **Exports**: RootLayout component
- **Lines**: ~8

#### `types.ts`
- **Purpose**: TypeScript type definitions for the entire app
- **Key Types**:
  - `EquipmentType` - 'mic' | 'light'
  - `IssueStatus` - Status of issues (resolved, in-progress, etc.)
  - `Equipment` - Equipment object structure
  - `Issue` - Issue/problem object structure
  - `CustomStatus` - Custom status configuration
  - `FilterType` - Filter options
- **Lines**: ~35

#### `constants.ts`
- **Purpose**: App-wide constants including colors, fonts, and initial data
- **Exports**:
  - `COLORS` - Color palette (Night Sky, Mint Accent, etc.)
  - `STATUS_COLORS` - Status-to-color mappings
  - `FONTS` - Font family names
  - `MOCK_EQUIPMENT` - Initial equipment data
  - `MOCK_ISSUES` - Initial issues data
  - `TEAM_MEMBERS` - Team member list
  - `updateTeamMember()` - Function to update team member info
- **Lines**: ~50

### Main Screen

#### `StageManagerScreen.tsx`
- **Purpose**: Main application screen and state management hub
- **Features**:
  - Font loading and initialization
  - Live clock display
  - Equipment and issue state management
  - User profile management
  - Modal state coordination
  - Active issues list
  - Assigned tasks with user filtering
- **Key Functions**:
  - `formatTime()` - Formats timestamps to 24-hour format
  - `handleProfileEdit()` - Updates current user profile
  - `handleEquipmentPress()` - Opens issue modal for equipment
  - `handleSaveIssue()` - Creates or updates issues
  - `handleAddEquipment()` - Initiates equipment placement
  - `handleStagePress()` - Places equipment on stage
- **Lines**: ~450

### Stage Components

#### `StageLayout.tsx`
- **Purpose**: Visual representation of the stage with equipment placement
- **Features**:
  - 900x600px stage area
  - Equipment positioning overlay
  - Placement mode for new equipment
  - "STAGE" and "AUDIENCE" labels
- **Props**:
  - `equipment` - Array of equipment to display
  - `onEquipmentPress` - Callback when equipment is clicked
  - `onStagePress` - Callback for stage area clicks
  - `placingMode` - Boolean for placement mode
- **Lines**: ~80

#### `EquipmentItem.tsx`
- **Purpose**: Individual equipment icon display
- **Features**:
  - Circular design (80x80px)
  - Status color coding (red/yellow/green)
  - Icon display or initials for "Other" type
  - Shadow effects
- **Props**:
  - `equipment` - Equipment object
  - `onPress` - Click callback
- **Key Logic**:
  - `getInitials()` - Extracts first letter of each word
  - `getIconName()` - Determines which SF Symbol to use
- **Lines**: ~75

### Issue Management

#### `IssueCard.tsx`
- **Purpose**: Display card for individual issues
- **Features**:
  - Status indicator dot
  - Equipment label and issue title
  - Reporter initials and timestamp (24-hour format)
  - Custom status color support
  - Clickable to edit
- **Props**:
  - `issue` - Issue object
  - `onPress` - Click callback
- **Lines**: ~55

#### `CreateIssueModal.tsx`
- **Purpose**: Full-screen modal for creating and editing issues
- **Features**:
  - Problem name/title input
  - Problem description text area
  - Team member assignment (multi-select)
  - Time picker for planned fix time
  - Status selection (4 options + custom)
  - Custom status with name and color picker
  - Live clock display
- **Props**:
  - `visible` - Modal visibility
  - `equipment` - Equipment being edited
  - `existingIssue` - Issue to edit (if editing)
  - `onClose` - Close callback
  - `onSave` - Save callback with issue data
- **Lines**: ~450

#### `TimePicker.tsx`
- **Purpose**: iOS-style scrollable time picker
- **Features**:
  - Three scrollable columns (hours, minutes, seconds)
  - 24-hour format (0-23 hours)
  - Smooth scroll snapping
  - Visual selection indicator
  - Hours: 0-23, Minutes: 0-59, Seconds: 0-59
- **Props**:
  - `hours` - Current hour value
  - `minutes` - Current minute value
  - `seconds` - Current second value
  - `onTimeChange` - Callback with new time values
- **Lines**: ~190

### Equipment Management

#### `AddEquipmentModal.tsx`
- **Purpose**: Modal for adding new equipment to stage
- **Features**:
  - Equipment type selection (6 types)
  - Icon grid with preview
  - Equipment name input
  - "Other" type shows initials preview
  - Save and close functionality
- **Equipment Types**:
  - Microphone (🎤)
  - Light (💡)
  - Speaker (🔊)
  - Camera (📷)
  - Prop (🎵)
  - Other (Initials)
- **Props**:
  - `visible` - Modal visibility
  - `onClose` - Close callback
  - `onSave` - Save callback with equipment data
- **Lines**: ~220

### User Management

#### `ProfileEditModal.tsx`
- **Purpose**: Modal for editing user profile
- **Features**:
  - Full name input
  - Live initials preview
  - Automatic initials generation
  - Profile circle visualization
- **Props**:
  - `visible` - Modal visibility
  - `currentName` - Current user name
  - `currentInitials` - Current user initials
  - `onClose` - Close callback
  - `onSave` - Save callback with new name
- **Lines**: ~150

### Navigation

#### `MenuModal.tsx`
- **Purpose**: Navigation menu from hamburger icon
- **Features**:
  - Dropdown menu from top-left
  - Two navigation options
  - Overlay with backdrop
- **Options**:
  - Stage Crew Coordinator (current view)
  - Style Guide (design system viewer)
- **Props**:
  - `visible` - Modal visibility
  - `onClose` - Close callback
  - `onSelectStageCoordinator` - Callback for first option
  - `onSelectStyleGuide` - Callback for second option
- **Lines**: ~70

### Design System

#### `StyleGuideViewer.tsx`
- **Purpose**: Interactive design system documentation
- **Features**:
  - Color palette showcase
  - Typography examples
  - Icon demonstrations
  - Font loading
- **Sections**:
  - Brand Palette (8 colors)
  - Typography (5 font weights)
  - Material Symbols (icon examples)
- **Props**:
  - `visible` - Modal visibility
  - `onClose` - Close callback
- **Lines**: ~350

### UI Components

#### `FilterButton.tsx`
- **Purpose**: Reusable filter button component
- **Features**:
  - Active/inactive states
  - Border highlighting
  - Color transitions
- **Props**:
  - `label` - Button text
  - `filterType` - Filter type identifier
  - `isActive` - Active state boolean
  - `onPress` - Click callback
- **Lines**: ~50

## 🚀 Installation

### Prerequisites

1. **Node.js** (v18 or higher)
   ```bash
   node --version
   ```

2. **npm** or **yarn**
   ```bash
   npm --version
   # or
   yarn --version
   ```

3. **Expo CLI** (optional but recommended)
   ```bash
   npm install -g expo-cli
   ```

### Setup Steps

1. **Clone or download the project**
   ```bash
   cd HCI-STAGE-MANAGER
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Verify installation**
   ```bash
   npx expo --version
   ```

## ▶️ Running the App

### Development Mode

#### Option 1: Using Expo CLI
```bash
npx expo start
```

#### Option 2: Using npm scripts
```bash
npm start
```

#### Option 3: Using yarn
```bash
yarn start
```

### Platform-Specific Commands

#### iOS (Requires macOS and Xcode)
```bash
npx expo start --ios
# or
npm run ios
```

#### Android (Requires Android Studio)
```bash
npx expo start --android
# or
npm run android
```

#### Web Browser
```bash
npx expo start --web
# or
npm run web
```

### Development Options

After running `npx expo start`, you'll see a QR code and options:

- **Press `i`** - Open iOS simulator
- **Press `a`** - Open Android emulator
- **Press `w`** - Open in web browser
- **Scan QR code** - Use Expo Go app on physical device

### Using Expo Go (Physical Device)

1. **Install Expo Go**
   - iOS: [Download from App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Download from Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Connect to same WiFi**
   - Ensure your computer and phone are on the same network

3. **Scan QR Code**
   - iOS: Use Camera app to scan QR code
   - Android: Use Expo Go app to scan QR code

4. **App loads automatically**

### Troubleshooting

#### Port already in use
```bash
npx expo start --port 8081
```

#### Clear cache
```bash
npx expo start --clear
# or
npm start -- --clear
```

## 🔄 Local Live Sync

Mirror stage changes across every device connected to the same Expo development session by running the lightweight WebSocket relay:

1. **Start the relay server (new terminal)**
   ```bash
   cd stage-manager
   npm run sync-server
   ```
2. **Launch Expo as usual**
   ```bash
   npm start
   ```
3. **Join from multiple devices**
   - Ensure all devices are on the same Wi-Fi as the dev machine.
   - Open the project via Expo Go or simulators; issue/equipment changes now propagate instantly.

The relay stores everything in memory—restart it to clear state. It listens on `ws://<dev-machine-ip>:4001` by default; set `STAGE_SYNC_PORT` before running the script to pick a different port.

#### Manual host override
If the in-app banner still reports "Sync server unavailable on this build," Metro likely didn’t expose your LAN IP. Provide it explicitly when starting Expo:

```bash
EXPO_PUBLIC_STAGE_SYNC_HOST=192.168.1.23 npm start
# or pass a full URL/port
EXPO_PUBLIC_STAGE_SYNC_URL=ws://192.168.1.23:4001 npm start
```

You can also commit a default host/port under `expo.extra` in `app.json` if your setup rarely changes.

#### Reset Metro bundler
```bash
npx expo start --reset-cache
```

## ✨ Features

### Equipment Management
- **Add Equipment**: Place microphones, lights, speakers, cameras, props, or custom items
- **Visual Stage**: Interactive stage layout with drag-and-drop positioning
- **Status Indicators**: Color-coded status (green=resolved, yellow=in progress, red=needs attention)
- **Custom Equipment**: "Other" type displays first letter of each word as initials

### Issue Tracking
- **Create Issues**: Report problems with specific equipment
- **Edit Issues**: Update existing issues with new information
- **Status Updates**: 4 built-in statuses + custom status option
- **Custom Status**: Create custom statuses with unique names and colors (8 color options)
- **Assignment**: Assign issues to multiple team members
- **Time Estimates**: Set planned fix time with iOS-style time picker

### Task Management
- **Active Issues**: View all unresolved issues
- **Assigned Tasks**: See tasks assigned to specific users
- **User Filter**: Toggle between different team members' assigned tasks
- **Auto-removal**: Resolved issues automatically remove from assigned tasks

### User Interface
- **Live Clock**: 24-hour format clock display
- **Profile Management**: Edit user name and auto-generate initials
- **Navigation Menu**: Access Style Guide via hamburger menu
- **Style Guide**: View design system colors, fonts, and icons
- **Responsive Design**: Optimized for tablet/desktop layouts

### Technical Features
- **Real-time Updates**: Live clock updates every second
- **Local Live Sync**: Optional WebSocket relay keeps multiple devices mirrored during a dev session (ephemeral state)
- **Font Loading**: Custom Inter and Roboto Mono fonts
- **Type Safety**: Full TypeScript implementation
- **State Management**: React hooks for local state
- **Modal System**: Multiple overlapping modals supported

## 🎨 Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Night Sky | `#1A1D29` | Background |
| Shadow Blue | `#2D3142` | Cards, containers |
| Mint Accent | `#4ECCA3` | Resolved status, accents |
| Amber Highlight | `#FFB84D` | In-progress status |
| Signal Coral | `#FF6B6B` | Problem detected status |
| Glacier | `#A8DADC` | Borders |
| Foam | `#F1FAEE` | Primary text |
| Slate Mist | `#94A3B8` | Secondary text |

## 🔤 Typography

- **Inter** (Regular, Medium, SemiBold, Bold) - UI text
- **Roboto Mono** (Regular) - Timestamps and codes

## 📱 Platform Support

- **iOS**: 13.0+ (tested on iOS 16-17)
- **Android**: 6.0+ (API 23+)
- **Web**: Modern browsers (Chrome, Safari, Firefox, Edge)

## 🔧 Configuration Files

- **package.json** - Dependencies and scripts
- **tsconfig.json** - TypeScript configuration
- **expo.json** - Expo configuration
- **.gitignore** - Git ignore rules

## 📦 Dependencies

### Core
- `react` - UI library
- `react-native` - Mobile framework
- `expo` - Development platform
- `expo-router` - Navigation

### Expo Modules
- `expo-font` - Font loading
- `expo-symbols` - SF Symbols icons

### Development
- `typescript` - Type checking
- `@types/react` - React type definitions

## 🏗 Architecture

### Component Hierarchy
```
StageManagerScreen (Root)
├── Header
│   ├── Menu Button → MenuModal
│   └── Profile Button → ProfileEditModal
├── Stage Container
│   └── StageLayout
│       └── EquipmentItem[] (multiple)
├── Sidebar
│   ├── Clock
│   ├── Active Issues
│   │   └── IssueCard[] (multiple)
│   └── Assigned Tasks (filtered)
│       ├── User Filter Menu
│       └── IssueCard[] (multiple)
├── Add Equipment Button → AddEquipmentModal
└── Modals
    ├── CreateIssueModal
    │   └── TimePicker
    ├── AddEquipmentModal
    ├── ProfileEditModal
    ├── MenuModal
    └── StyleGuideViewer
```

### Data Flow
```
User Action
    ↓
Event Handler (StageManagerScreen)
    ↓
State Update (useState)
    ↓
Re-render Components
    ↓
UI Updates
```

## 🤝 Contributing

To extend the app:
1. Add new types to `types.ts`
2. Update constants in `constants.ts`
3. Create new components in `app/` directory
4. Import and use in `StageManagerScreen.tsx`

**Last Updated**: November 2025  
**Version**: 1.0.0  
**Built with**: React Native + Expo + TypeScript

# Medical Tracker - Design Guidelines

## Architecture Decisions

### Authentication
**Auth Required** - Health data is sensitive and requires user accounts.

**Implementation:**
- Use SSO (Apple Sign-In for iOS, Google Sign-In for Android)
- Include email/password as fallback option
- Mock auth flow in prototype using local state
- Login/Signup screens with:
  - Privacy policy & terms of service links
  - HIPAA compliance notice
- Account screen includes:
  - Profile with user-customizable avatar (generate 3 medical-themed avatars: stethoscope, heart, medical cross)
  - Display name field
  - Log out (with confirmation)
  - Delete account (Settings > Account > Delete with double confirmation and data deletion warning)

### Navigation
**Tab Navigation** with 4 tabs + Floating Action Button (FAB):
1. **Home** - Dashboard with quick stats and recent checks
2. **History** - Past health checks timeline
3. **Check Symptoms** (FAB) - Core action for symptom analysis
4. **Doctors** - Location-based doctor finder
5. **Profile** - User account and settings

### Screen Specifications

#### 1. Home Screen
- **Purpose:** Quick overview of health tracking activity
- **Layout:**
  - Transparent header with "Medical Tracker" title
  - Main content: Scrollable view
  - Top safe area inset: headerHeight + Spacing.xl
  - Bottom safe area inset: tabBarHeight + Spacing.xl
- **Components:**
  - Welcome message with user's name
  - Quick stats cards (total checks, last check date)
  - Recent symptoms list (last 3 checks)
  - "Start New Check" CTA button linking to symptom checker
  - Health tips carousel (optional)

#### 2. History Screen
- **Purpose:** View past health checks chronologically
- **Layout:**
  - Default navigation header with search bar
  - Main content: FlatList/ScrollView
  - Right header button: Filter icon
  - Top safe area inset: Spacing.xl (non-transparent header)
  - Bottom safe area inset: tabBarHeight + Spacing.xl
- **Components:**
  - Timeline list of health checks with date grouping
  - Each check card shows: date, symptoms, prediction summary
  - Tap to view full details (navigates to detail screen)
  - Empty state with illustration when no history exists

#### 3. Check Symptoms Screen (Modal/Stack)
- **Purpose:** Input symptoms and get AI-powered predictions
- **Layout:**
  - Custom header with "Cancel" (left) and "Analyze" (right, disabled until symptoms entered)
  - Main content: Scrollable form
  - Top safe area inset: headerHeight + Spacing.xl
  - Bottom safe area inset: insets.bottom + Spacing.xl (no tab bar on modal)
- **Components:**
  - Search bar for symptom input
  - Quick-select chips: Fever, Cough, Sore Throat, Headache, Fatigue, Nausea, Body Ache, Runny Nose
  - Selected symptoms list with remove (×) icons
  - Severity slider (1-10) for each symptom
  - Duration picker (hours/days)
  - Additional notes text area (optional)
  - "Analyze Symptoms" primary button at bottom
  - "Reset" secondary button

#### 4. Results Screen (Stack)
- **Purpose:** Display AI predictions and recommendations
- **Layout:**
  - Default navigation header with "Results" title
  - Left header button: Back arrow
  - Right header button: Save/Share icon
  - Main content: Scrollable view
  - Top safe area inset: Spacing.xl
  - Bottom safe area inset: insets.bottom + Spacing.xl
- **Components:**
  - Prediction cards with severity indicators (color-coded)
  - Medication suggestions list
  - Next steps recommendations
  - "Find Nearby Doctors" CTA button
  - Disclaimer text (small, bottom)

#### 5. Doctors Screen
- **Purpose:** Find nearby healthcare providers
- **Layout:**
  - Transparent header with location indicator
  - Right header button: Filter/Sort icon
  - Main content: Map view (upper 40%) + List (lower 60%, scrollable)
  - Floating search bar over map
  - Top safe area inset: headerHeight + Spacing.xl
  - Bottom safe area inset: tabBarHeight + Spacing.xl
- **Components:**
  - Interactive map with doctor markers
  - Doctor cards in list: name, specialty, distance, rating
  - Filter chips: All, General Physician, Specialist, Hospital
  - Tap card to view details or get directions

#### 6. Profile Screen
- **Purpose:** Manage account and app settings
- **Layout:**
  - Default navigation header with "Profile" title
  - Main content: Scrollable form
  - Top safe area inset: Spacing.xl
  - Bottom safe area inset: tabBarHeight + Spacing.xl
- **Components:**
  - Avatar picker with 3 preset medical-themed avatars
  - Display name field
  - Email (read-only)
  - Settings sections:
    - Notifications toggle
    - Theme preference (Light/Dark/Auto)
    - Language
    - Privacy & Security > Delete Account
  - Log out button (destructive style)

## Design System

### Color Palette
**Primary Colors:**
- Primary: `#2E7D98` (Medical teal - trust, calm)
- Primary Light: `#4A9FB8`
- Primary Dark: `#1F5A6E`

**Accent Colors:**
- Success: `#10B981` (healthy green)
- Warning: `#F59E0B` (caution yellow)
- Error: `#EF4444` (alert red)
- Info: `#3B82F6` (informational blue)

**Neutral Colors:**
- Background: `#F8FAFC` (light mode), `#0F172A` (dark mode)
- Surface: `#FFFFFF` (light mode), `#1E293B` (dark mode)
- Text Primary: `#1E293B` (light mode), `#F1F5F9` (dark mode)
- Text Secondary: `#64748B`
- Border: `#E2E8F0`

### Typography
**Font Family:** System default (SF Pro for iOS, Roboto for Android)
- Heading 1: 32px, Bold
- Heading 2: 24px, Semibold
- Heading 3: 20px, Semibold
- Body: 16px, Regular
- Small: 14px, Regular
- Caption: 12px, Regular

### Visual Design
**Icons:**
- Use Feather icons from @expo/vector-icons
- NO emojis
- Icon size: 24px (standard), 20px (small), 32px (large)

**Cards:**
- Border radius: 16px
- Padding: 16px
- Background: Surface color
- Border: 1px solid Border color
- NO drop shadows on standard cards

**Floating Action Button (FAB):**
- Size: 64px diameter
- Position: Centered over tab bar
- Background: Primary color
- Icon: Plus or stethoscope (24px, white)
- **Shadow specifications:**
  - shadowOffset: { width: 0, height: 2 }
  - shadowOpacity: 0.10
  - shadowRadius: 2
  - elevation: 4 (Android)

**Buttons:**
- Primary: Filled with Primary color, white text, 12px border radius
- Secondary: Outlined with Primary border, Primary text, 12px border radius
- Destructive: Filled with Error color, white text, 12px border radius
- Height: 48px
- Visual feedback: Scale to 0.95 on press + haptic feedback

**Chips (Symptom Quick-Select):**
- Height: 36px
- Border radius: 18px
- Padding: 12px horizontal
- Unselected: Border color with Text Secondary
- Selected: Primary color background with white text
- Press feedback: Opacity 0.7

**Input Fields:**
- Height: 48px
- Border radius: 12px
- Border: 1px Border color
- Focus: 2px Primary color border
- Background: Surface color

### Accessibility
- Minimum touch target: 44x44px
- Text contrast ratio: 4.5:1 minimum
- Support dynamic type scaling
- Provide haptic feedback for all interactions
- Include VoiceOver/TalkBack labels
- Color-blind friendly (don't rely on color alone for severity indicators - use icons/patterns)

### Critical Assets
1. **Medical Tracker Logo** (app icon + splash screen)
   - Style: Modern, clean medical cross or stethoscope icon
   - Color: Primary color gradient
   
2. **User Avatars (3 presets):**
   - Avatar 1: Stethoscope icon in circular frame
   - Avatar 2: Heart with pulse line icon
   - Avatar 3: Medical cross icon
   - Style: Minimalist line art, Primary color on Surface background

3. **Empty State Illustrations:**
   - No history: Calendar with checkmark
   - No results: Magnifying glass over document
   - Style: Simple line drawings, Primary color
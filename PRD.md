# Planning Guide

A comprehensive HR Management System (HR-TechPro) that empowers managers with AI-driven insights to predict attendance issues, optimize task assignments, and make data-informed decisions while providing employees with seamless mobile-first attendance tracking and self-service capabilities.

**Experience Qualities**:
1. **Intelligent** - The system proactively surfaces insights and recommendations, using AI to predict lateness patterns and suggest optimal task assignments before problems arise
2. **Effortless** - One-tap attendance check-in/out with biometric security, instant notifications, and a clean Arabic interface that requires minimal interaction
3. **Transparent** - Real-time visibility into attendance status, clear deduction/bonus tracking, and immediate feedback loops that keep everyone informed

**Complexity Level**: Complex Application (advanced functionality, accounts)
  - Multi-role authentication system with admin approval workflow, AI-powered predictive analytics, real-time data synchronization, biometric security, location-based attendance validation, and comprehensive reporting dashboards

## Essential Features

### User Registration & Activation
- **Functionality**: Self-registration form capturing employee details (name, email, ID, rank, salary, department, role, region) with admin approval workflow
- **Purpose**: Controlled onboarding ensures only authorized personnel access the system
- **Trigger**: New user clicks "Register" from login screen
- **Progression**: Fill registration form → Submit → Pending approval state → Admin reviews in control panel → Admin approves/rejects → User receives activation notification → User can login
- **Success criteria**: Pending accounts visible in admin panel, activation toggles account access, email notifications sent

### Biometric Check-in/Check-out (Wi-Fi Enforced)
- **Functionality**: One-tap attendance recording with fingerprint/face authentication, validated against approved Wi-Fi network, with real-time location mapping
- **Purpose**: Secure, frictionless attendance tracking that prevents location fraud and provides live employee location tracking
- **Trigger**: Employee taps "Check-in" or "Check-out" button on mobile
- **Progression**: Select authorized Wi-Fi network → Tap button → Biometric prompt appears → Authenticate → Validate Wi-Fi connection → Record timestamp and position → Show success confirmation with time and location → Update real-time dashboard and map
- **Success criteria**: Attendance only succeeds on approved Wi-Fi networks, timestamps accurate to the second, admin dashboard updates instantly, failed attempts logged, employee location plotted on building map

### Wi-Fi Network Management (Admin)
- **Functionality**: Admin interface to configure and manage authorized Wi-Fi networks for each center/location, including custom map upload and router positioning
- **Purpose**: Flexible control over approved locations for attendance check-in, allowing admins to upload real building maps and position routers accurately, with simplified center naming (-, --, ---)
- **Trigger**: Admin navigates to "Wi-Fi Networks" settings tab
- **Progression**: View current routers → Upload custom building map image (optional) → Click "Edit" on router → Update center name (-, --, ---), SSID, position on map → Customize router appearance (color, pattern, signal rings) → Save changes → System validates new configuration → Employees see updated network list → Real-time map displays with custom background
- **Success criteria**: Map image upload (max 5MB) works seamlessly, router positions adjustable on custom maps, network changes reflect immediately in check-in options, validation prevents duplicate SSIDs, clear zone identification with simplified names (-, --, ---)

### Real-Time Attendance Dashboard with Live Location Map (Admin)
- **Functionality**: Interactive building map visualization showing live employee positions based on Wi-Fi network connections, with zone filtering, employee clustering, custom map image support, and enhanced mobile responsiveness
- **Purpose**: Instant situational awareness of workforce attendance status and physical distribution across locations, with ability to visualize on actual building floor plans
- **Trigger**: Admin navigates to dashboard
- **Progression**: Load dashboard → Display statistics (total/present/absent/late counts) → Render 3-center building map (with optional custom background image) → Plot Wi-Fi routers with customizable visual signals → Plot employee positions dynamically with initials and color coding (green=on-time, orange=late) → Filter by zone/router → Auto-refresh positions every 3 seconds → Click employee marker for details → View employee list grouped by router/center
- **Success criteria**: Updates within 5 seconds of check-in, accurate position plotting around routers, smooth animations, zone-based filtering works correctly, employee lists per router show accurate counts, custom map images display properly, mobile view fully responsive with touch-friendly controls, employee markers show initials clearly

### AI Task Assignment Engine
- **Functionality**: Manual task creation with AI suggestions for optimal assignee based on performance history and current workload
- **Purpose**: Distribute work efficiently and prevent burnout through data-driven assignments
- **Trigger**: Manager clicks "Create Task"
- **Progression**: Open task form → Enter task details → AI analyzes employee data → Display top 3 suggested assignees with confidence scores → Manager selects assignee → Task created → Employee receives notification
- **Success criteria**: AI suggestions appear within 2 seconds, confidence scores correlate with actual performance, employees notified immediately

### Predictive Lateness Analytics
- **Functionality**: Daily AI report identifying employees with high probability of being late tomorrow
- **Purpose**: Enable proactive interventions before attendance issues occur
- **Trigger**: Auto-generated each morning at 6 AM, accessible in admin analytics panel
- **Progression**: System analyzes historical patterns → ML model calculates probability scores → Generate report with ranked list → Display with risk indicators (high/medium/low) → Manager can send preemptive reminders
- **Success criteria**: Prediction accuracy >70%, report available before workday starts, actionable recommendations included

### Smart Deductions & Bonuses System
- **Functionality**: Automated deduction calculations based on rules (lateness frequency, absence), manual bonus granting with instant notifications
- **Purpose**: Fair, transparent payroll adjustments that incentivize good performance
- **Trigger**: Automatic on attendance events or manual admin action
- **Progression**: Trigger event occurs → System calculates amount → Create deduction/bonus record → Send push notification to employee → Update employee's financial summary → Reflect in monthly report
- **Success criteria**: Notifications delivered within 10 seconds, calculations accurate, full audit trail maintained

### Leave Request Management
- **Functionality**: Employee submits vacation request, system validates available balance, admin approves/rejects
- **Purpose**: Self-service time-off management with automated balance checking
- **Trigger**: Employee clicks "Request Leave"
- **Progression**: Select dates → System checks available days → Show balance warning if insufficient → Submit request → Admin receives notification → Admin reviews → Approve/reject → Employee notified → Calendar updated
- **Success criteria**: Balance validation instant, approval notification within 1 minute, calendar reflects approved leaves

### Comprehensive Attendance Reports
- **Functionality**: Filterable reports (daily/weekly/monthly/annual) with export capability, pattern analysis highlighting
- **Purpose**: Historical data analysis for performance reviews and compliance
- **Trigger**: Admin navigates to Reports section
- **Progression**: Select report type → Choose filters (date range, department, employee) → AI highlights anomalies → View visualizations (charts/tables) → Export to PDF/Excel
- **Success criteria**: Reports generate within 5 seconds, anomaly detection flags unusual patterns, exports formatted correctly

### Gamification Leaderboards
- **Functionality**: Public rankings showing top performers in attendance punctuality and task completion
- **Purpose**: Motivate employees through friendly competition and recognition
- **Trigger**: Accessible from main navigation
- **Progression**: View leaderboard → See rankings with scores → Filter by department/time period → Click employee for detailed stats
- **Success criteria**: Updates daily, scores calculated fairly, top 10 highlighted with badges

### Real-Time Notifications System
- **Functionality**: Instant push notifications for key events (task assignments, leave approvals, deductions, lateness alerts)
- **Purpose**: Keep all users immediately informed of critical updates
- **Trigger**: System events or admin actions
- **Progression**: Event occurs → Notification queued → Delivered to target users → Display in notification center → Mark as read/unread → Deep link to relevant section
- **Success criteria**: Delivery within 5 seconds, no duplicate notifications, clear actionable messages

## Edge Case Handling

- **Wi-Fi Disconnection Mid-Shift**: Allow check-out within 5-minute grace period after Wi-Fi loss, flag for admin review
- **Forgotten Check-out**: Auto-reminder notification at end-of-day, allow manual correction with approval workflow
- **Concurrent Login Attempts**: Allow multiple devices but log all sessions with device fingerprinting for security
- **Timezone Variations**: Store all timestamps in UTC, display in user's local timezone based on region setting
- **Network Failure During Check-in**: Queue attendance record locally, sync when connection restored with conflict resolution
- **AI Model Drift**: Monthly retraining pipeline with performance monitoring, fallback to rule-based system if accuracy drops
- **Arabic Text Rendering**: Ensure RTL layout support, proper font rendering, and bidirectional text handling
- **Biometric Unavailability**: Fallback to secure PIN entry with additional security logging
- **Duplicate Task Assignments**: Warn before assigning task already assigned to employee, suggest workload redistribution
- **Invalid Leave Requests**: Block submission for dates already approved for others in same critical role

## Design Direction

The interface should evoke confidence and professionalism while feeling modern and approachable, utilizing clean geometric layouts with warm orange gradients that energize without overwhelming, paired with crisp data visualizations that make complex analytics immediately digestible for busy managers making time-sensitive decisions on mobile devices.

## Color Selection

Triadic color scheme with warm orange as the energizing primary action color, deep professional blue for trust and stability, and vibrant green for success states, creating visual hierarchy that guides attention to critical information.

- **Primary Color**: Warm Orange (oklch(0.72 0.15 50)) - Energetic and motivating, communicates urgency for attendance actions and task assignments
- **Secondary Colors**: 
  - Deep Professional Blue (oklch(0.45 0.12 250)) for trustworthy backgrounds and admin sections
  - Fresh Green (oklch(0.65 0.18 145)) for success states and present status indicators
- **Accent Color**: Vibrant Coral (oklch(0.68 0.17 35)) for notifications, alerts, and important CTAs that demand immediate attention
- **Foreground/Background Pairings**:
  - Background (Light Cream oklch(0.97 0.01 80)): Dark Text (oklch(0.25 0.02 50)) - Ratio 12.8:1 ✓
  - Card (White oklch(1 0 0)): Dark Text (oklch(0.25 0.02 50)) - Ratio 14.2:1 ✓
  - Primary (Warm Orange oklch(0.72 0.15 50)): White Text (oklch(1 0 0)) - Ratio 5.2:1 ✓
  - Secondary (Deep Blue oklch(0.45 0.12 250)): White Text (oklch(1 0 0)) - Ratio 8.9:1 ✓
  - Accent (Vibrant Coral oklch(0.68 0.17 35)): White Text (oklch(1 0 0)) - Ratio 4.8:1 ✓
  - Muted (Soft Gray oklch(0.92 0.01 80)): Medium Text (oklch(0.50 0.02 50)) - Ratio 6.1:1 ✓

## Font Selection

Typography should communicate professionalism while maintaining excellent readability in Arabic script, with Cairo font providing the perfect balance of modern geometric structure and traditional calligraphic warmth that feels both authoritative and welcoming.

- **Typographic Hierarchy**:
  - H1 (Dashboard Title): Cairo Bold / 32px / -0.02em letter spacing / 1.2 line height
  - H2 (Section Headers): Cairo SemiBold / 24px / -0.01em letter spacing / 1.3 line height
  - H3 (Card Titles): Cairo SemiBold / 18px / 0em letter spacing / 1.4 line height
  - Body (Content Text): Cairo Regular / 16px / 0em letter spacing / 1.6 line height
  - Small (Meta Info): Cairo Regular / 14px / 0em letter spacing / 1.5 line height
  - Button Text: Cairo SemiBold / 16px / 0.01em letter spacing / 1.2 line height

## Animations

Animations should feel responsive and purposeful, with quick micro-interactions confirming user actions (button presses, check-ins) and smooth transitions between dashboard states that maintain spatial continuity, avoiding gratuitous motion that would delay critical HR workflows.

- **Purposeful Meaning**: Check-in success uses a satisfying scale-and-fade animation with haptic feedback, reinforcing the importance of the attendance action; status dot transitions pulse gently to draw attention to real-time changes
- **Hierarchy of Movement**: Critical actions (check-in/out buttons) get immediate tactile feedback (100ms), dashboard updates use gentle 300ms fades to avoid jarring content shifts, notification badges pulse subtly to attract attention without disrupting focus

## Component Selection

- **Components**:
  - **Card**: Attendance summaries, employee profiles, statistics widgets with subtle shadows for depth
  - **Button**: Primary (check-in/out), Secondary (view details), Destructive (reject requests) with gradient variants for primary actions
  - **Badge**: Status indicators (present/late/absent), notification counts with color-coded severity
  - **Avatar**: Employee profile images with fallback to initials, presence indicators overlaid
  - **Tabs**: Dashboard views (Overview/Analytics/Reports), employee sections with smooth transitions
  - **Dialog**: Task creation, leave requests, confirmation modals with backdrop blur
  - **Table**: Attendance logs, employee lists with sortable columns and row hover states
  - **Select**: Department filters, date range pickers with grouped options
  - **Switch**: Settings toggles (notifications, biometric auth) with smooth slide animation
  - **Progress**: Task completion, attendance rate visualizations with gradient fills
  - **Alert**: System notifications, warning messages with appropriate severity colors
  - **Input**: Form fields with RTL support, floating labels for Arabic text
  - **Calendar**: Leave request date picker with unavailable dates grayed out
  - **Tooltip**: Icon explanations, stat definitions on hover/long-press
  - **Sonner Toasts**: Instant feedback for actions (check-in success, deduction applied)

- **Customizations**: 
  - Custom gradient Button variants for primary actions (orange-to-coral gradient)
  - Building map visualization component with interactive dots (SVG-based or canvas)
  - Real-time updating statistic cards with count-up animations
  - AI confidence score visualization (circular progress with percentage)
  - Biometric authentication prompt (native browser/device API wrapper)
  - Leaderboard card component with ranking badges and trophy icons

- **States**:
  - Buttons: Gradient shifts on hover, scale down on press, disabled shows reduced opacity with loading spinner
  - Inputs: Border color change on focus (orange accent), error state shows red with shake animation
  - Cards: Subtle elevation increase on hover, selected state with accent border
  - Status dots: Pulse animation for live updates, static for stable states

- **Icon Selection**: 
  - @phosphor-icons/react: Fingerprint (biometric), WifiHigh (network), ClockCounterClockwise (attendance), UserCircle (profile), ChartLine (analytics), Bell (notifications), Trophy (leaderboard), Lightning (AI suggestions), Calendar (leave), Money (payroll)

- **Spacing**: 
  - Section gaps: gap-8 (2rem)
  - Card internal padding: p-6 (1.5rem)
  - Form field spacing: gap-4 (1rem)
  - Button padding: px-6 py-3
  - Consistent 8px grid system throughout

- **Mobile**: 
  - Bottom navigation bar for primary actions (Dashboard/Attendance/Profile/Notifications)
  - Swipeable cards for quick actions
  - Collapsible sections with accordion for dense information
  - Floating action button (FAB) for check-in/out - always accessible
  - Single column layouts, tables transform to stacked cards
  - Touch-friendly 48px minimum touch targets
  - Sticky headers during scroll for context retention

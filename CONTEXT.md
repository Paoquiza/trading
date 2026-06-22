# Forex Trading Journal - Project Context

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript 6, Vite 8 |
| Styling | Tailwind CSS 4 (dark theme) |
| Routing | React Router 7 |
| Backend | Supabase (Auth, Postgres, Storage) |
| Charts | Recharts 3 |
| Icons | lucide-react |
| Dates | date-fns 4 |
| Images | react-dropzone (drag & drop) |
| Heatmap | react-calendar-heatmap |

---

## File Structure

```
forex-journal/
├── src/
│   ├── App.tsx                          # Router + route definitions
│   ├── main.tsx                         # React entry point
│   ├── index.css                        # Tailwind + custom dark theme
│   ├── context/
│   │   └── AuthContext.tsx              # Supabase auth provider + useAuth()
│   ├── lib/
│   │   ├── types.ts                    # All TypeScript interfaces
│   │   ├── supabase.ts                 # Supabase client init
│   │   ├── calculations.ts            # Pips, P&L, position sizing math
│   │   ├── constants.ts               # Forex pairs, pip values, lot sizes
│   │   └── formatters.ts              # Currency, pips, date, color formatters
│   ├── hooks/
│   │   ├── useTrades.ts               # Trade CRUD + auto pips/P&L calc
│   │   ├── useTradeImages.ts          # Trade screenshot upload/delete
│   │   ├── useTradeStats.ts           # Stats, equity curve, daily P&L
│   │   ├── useDailyNotes.ts           # Notes CRUD (upsert by date)
│   │   ├── useNoteImages.ts           # Note screenshot upload/delete
│   │   └── useSettings.ts             # User settings CRUD (daily limits)
│   ├── pages/
│   │   ├── Login.tsx                   # Sign in / Sign up
│   │   ├── Dashboard.tsx               # Stats, equity chart, heatmap
│   │   ├── Trades.tsx                  # Trade list + filters + new trade modal
│   │   ├── TradeDetail.tsx             # Single trade view + screenshots
│   │   ├── Notes.tsx                   # Daily notes + session summary + screenshots
│   │   ├── Calculator.tsx              # Risk/position size calculator
│   │   └── Settings.tsx                # Daily limit settings
│   └── components/
│       ├── ui/                         # Reusable UI primitives
│       │   ├── Button.tsx              # variant: primary|secondary|danger|ghost
│       │   ├── Card.tsx                # Dark card with border
│       │   ├── Input.tsx               # With optional label + error
│       │   ├── Select.tsx              # Dropdown select
│       │   ├── Badge.tsx               # Color badges (green|red|blue|gray)
│       │   └── Modal.tsx               # Centered overlay modal
│       ├── layout/
│       │   ├── AppLayout.tsx           # Sidebar + Outlet
│       │   ├── Sidebar.tsx             # Nav links + sign out
│       │   └── ProtectedRoute.tsx      # Auth guard → redirect /login
│       ├── trade/
│       │   ├── TradeForm.tsx           # Create/edit trade form
│       │   ├── TradeCard.tsx           # Trade row → links to /trades/:id
│       │   ├── TradeList.tsx           # Maps trades to TradeCards
│       │   ├── TradeFilters.tsx        # Date range, pair, result filters
│       │   ├── TradeSummary.tsx        # 4-stat summary bar
│       │   └── DailyLimitWarning.tsx   # Yellow warning when limits exceeded
│       ├── notes/
│       │   ├── NoteEditor.tsx          # Textarea + save button
│       │   ├── DailyNoteCard.tsx       # Note preview card
│       │   ├── DailyNotesList.tsx      # List of note cards
│       │   └── DailySessionSummary.tsx # Trades/P&L/W-L/Pips for date
│       ├── images/
│       │   ├── ImageUploader.tsx       # Drag & drop upload zone
│       │   ├── ImageGallery.tsx        # Thumbnail grid + delete
│       │   └── ImageLightbox.tsx       # Full-screen viewer + keyboard nav
│       ├── dashboard/
│       │   ├── StatsOverview.tsx       # Key metrics cards
│       │   ├── EquityCurveChart.tsx    # Recharts area chart
│       │   ├── CalendarHeatmap.tsx     # 6-month P&L heatmap
│       │   └── RecentTrades.tsx        # Last 5 trades
│       └── calculator/
│           ├── RiskCalculatorForm.tsx  # Capital, risk%, SL, pair inputs
│           ├── PositionSizeResult.tsx  # Max loss, lot size, pip value
│           ├── ProjectionsTable.tsx    # Expected outcomes table
│           └── PipValueTable.tsx       # Pip values reference by pair
├── supabase-schema.sql                 # Full DB schema + RLS + storage
├── package.json
├── vite.config.ts
├── tsconfig.json
├── eslint.config.js
└── .env                                # VITE_SUPABASE_URL + KEY
```

---

## Database Schema

### Tables

**trades**
```
id (uuid PK), user_id (FK→auth.users), date, pair, direction (buy|sell),
entry_price, exit_price?, lot_size, pips?, profit_loss?, notes?,
stop_loss?, take_profit?, status (open|closed), created_at
```

**trade_images**
```
id (uuid PK), trade_id (FK→trades CASCADE), image_url, storage_path, created_at
```

**daily_notes**
```
id (uuid PK), user_id (FK→auth.users), date, content, created_at, updated_at
UNIQUE(user_id, date)
```

**note_images**
```
id (uuid PK), note_id (FK→daily_notes CASCADE), image_url, storage_path, created_at
```

**user_settings**
```
id (uuid PK), user_id (FK→auth.users UNIQUE), max_trades_per_day (default 2),
daily_loss_limit (default 100), daily_gain_limit (default 200), created_at, updated_at
```

### Relationships

```
auth.users
├── trades (1:N)
│   └── trade_images (1:N)
├── daily_notes (1:N, unique per date)
│   └── note_images (1:N)
└── user_settings (1:1)
```

### RLS Policies

All tables enforce `auth.uid() = user_id`. Image tables use nested EXISTS checks through their parent table.

### Storage

- Bucket: `trade-screenshots` (private)
- Trade images: `{user_id}/{trade_id}/{timestamp}.ext`
- Note images: `{user_id}/notes/{date}/{timestamp}.ext`
- Signed URLs: 1-year expiration

---

## Type Definitions

```typescript
type TradeDirection = 'buy' | 'sell'
type TradeStatus = 'open' | 'closed'

interface Trade {
  id, user_id, date, pair, direction, entry_price, exit_price?,
  lot_size, pips?, profit_loss?, notes?, stop_loss?, take_profit?,
  status, created_at
}
type TradeInsert = Omit<Trade, 'id' | 'created_at' | 'user_id'>
type TradeUpdate = Partial<TradeInsert>

interface TradeImage    { id, trade_id, image_url, storage_path, created_at }
interface NoteImage     { id, note_id, image_url, storage_path, created_at }
interface DailyNote     { id, user_id, date, content, created_at, updated_at }
interface UserSettings  { id, user_id, max_trades_per_day, daily_loss_limit, daily_gain_limit }
interface TradeFilters  { dateFrom?, dateTo?, pair?, result?: 'winner'|'loser'|'all' }
interface TradeStats    { totalTrades, winRate, avgPips, totalPL, winners, losers }
interface CalculatorInputs  { capital, riskPercent, stopLossPips, pair }
interface CalculatorResult  { maxLoss, positionSize, pipValue }
```

---

## Hooks API

| Hook | Input | Returns |
|------|-------|---------|
| `useTrades(filters?)` | TradeFilters | `{ trades, loading, fetchTrades, createTrade, updateTrade, deleteTrade }` |
| `useTrade(id)` | trade UUID | `{ trade, loading, setTrade }` |
| `useTradeImages(tradeId)` | trade UUID | `{ images, loading, uploading, uploadImage, deleteImage, refreshUrls }` |
| `useTradeStats(trades)` | Trade[] | `{ stats, equityCurve, dailyPL }` |
| `useDailyNotes()` | - | `{ notes, loading, getNote, saveNote, deleteNote, fetchNotes }` |
| `useNoteImages(noteId, date)` | note UUID + date | `{ images, loading, uploading, uploadImage, deleteImage }` |
| `useSettings()` | - | `{ settings, loading, updateSettings }` |

---

## Routes

| Path | Page | Auth |
|------|------|------|
| `/login` | LoginPage | Public |
| `/` | DashboardPage | Protected |
| `/trades` | TradesPage | Protected |
| `/trades/:id` | TradeDetailPage | Protected |
| `/notes` | NotesPage | Protected |
| `/calculator` | CalculatorPage | Protected |
| `/settings` | SettingsPage | Protected |

---

## Calculations

**Pips:** `(exitPrice - entryPrice) * multiplier` (10000 for standard, 100 for JPY pairs). Negated for sell direction.

**P&L:** `pips * PIP_VALUES[pair] * lotSize`

**Position Size:** `(capital * riskPercent / 100) / (stopLossPips * pipValue)`

**Stats:** Computed from closed trades only. Win rate = winners / total * 100.

---

## Supported Forex Pairs (25)

EUR/USD, GBP/USD, USD/JPY, USD/CHF, AUD/USD, NZD/USD, USD/CAD,
EUR/GBP, EUR/JPY, GBP/JPY, AUD/JPY, CHF/JPY, NZD/JPY,
EUR/AUD, EUR/CAD, EUR/CHF, GBP/AUD, GBP/CAD, GBP/CHF,
AUD/CAD, AUD/CHF, NZD/CAD, XAU/USD, XAG/USD

---

## Pip Values (per standard lot)

| Pairs | Value |
|-------|-------|
| EUR/USD, GBP/USD, AUD/USD, NZD/USD | $10.00 |
| USD/JPY, EUR/JPY, GBP/JPY, AUD/JPY, CHF/JPY, NZD/JPY | $6.67 |
| USD/CHF, EUR/CHF, GBP/CHF, AUD/CHF | $10.60 |
| USD/CAD, EUR/CAD, GBP/CAD, AUD/CAD, NZD/CAD | $7.25 |
| EUR/GBP | $12.50 |
| EUR/AUD, GBP/AUD | $6.50 |
| XAU/USD | $1.00 |
| XAG/USD | $50.00 |

---

## Key Workflows

### Trade Creation
1. User clicks "New Trade" → modal opens
2. DailyLimitWarning checks today's trades count and P&L vs settings
3. User fills TradeForm (pair, direction, prices, lot size, etc.)
4. On submit: hook auto-calculates pips + P&L if closed
5. Inserts to Supabase, list refreshes

### Screenshot Upload (Trade)
1. User on TradeDetail drags image onto ImageUploader
2. File uploaded to `trade-screenshots/{userId}/{tradeId}/{timestamp}.ext`
3. Signed URL generated, metadata saved to `trade_images`
4. ImageGallery refreshes, click opens ImageLightbox

### Screenshot Upload (Note)
1. User on Notes page drags image onto ImageUploader
2. If no note exists yet, auto-saves note first to get `note_id`
3. File uploaded to `trade-screenshots/{userId}/notes/{date}/{timestamp}.ext`
4. Signed URL generated, metadata saved to `note_images`

### Daily Limits (Warning Only)
1. Settings loaded via `useSettings`
2. Trades page calculates today's count + P&L
3. DailyLimitWarning compares against limits
4. Shows yellow warning banner if exceeded (does not block)

---

## Theme / Design System

- **Dark mode** by default (bg: #0a0a0f)
- **Accent color:** Indigo (#6366f1 / #818cf8)
- **Profit:** Green (#4ade80)
- **Loss:** Red (#f87171)
- **Cards:** dark-800 bg with dark-600 border
- **Text hierarchy:** dark-100 (primary) → dark-200 → dark-300 → dark-400 (muted)
- **Custom scrollbar:** 6px, dark styled (webkit)

---

## Environment Variables

```env
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
```

---

## Dev Commands

```bash
npm run dev       # Vite dev server
npm run build     # tsc -b && vite build
npm run preview   # Preview production build
npm run lint      # ESLint
```

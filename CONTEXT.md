# Forex Trading Journal - Project Context

## Overview

Trading journal app for **XAU/USD (Gold)** with auto-calculated SL/TP, daily risk management, and balance tracking. Designed to track every trade, enforce daily rules, and help review performance over time.

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
| Settings | localStorage (trading rules) |

---

## File Structure

```
forex-journal/
├── src/
│   ├── App.tsx                          # Router: /, /trades, /trades/:id, /notes, /settings
│   ├── main.tsx                         # React entry point
│   ├── index.css                        # Tailwind + custom dark theme
│   ├── context/
│   │   └── AuthContext.tsx              # Supabase auth provider + useAuth()
│   ├── lib/
│   │   ├── types.ts                    # Trade, TradingRules, TradeFilters, etc.
│   │   ├── supabase.ts                 # Supabase client init
│   │   ├── calculations.ts            # Gold SL/TP calc, pips, P&L, stats
│   │   ├── constants.ts               # Forex pairs, pip values (legacy, unused)
│   │   └── formatters.ts              # Currency, pips, date, color formatters
│   ├── hooks/
│   │   ├── useTrades.ts               # Trade CRUD + auto SL/TP + pips/P&L calc
│   │   ├── useTradeImages.ts          # Trade screenshot upload/delete
│   │   ├── useTradeStats.ts           # Stats, equity curve, daily P&L
│   │   ├── useDailyNotes.ts           # Notes CRUD (upsert by date)
│   │   ├── useNoteImages.ts           # Note screenshot upload/delete
│   │   └── useSettings.ts             # TradingRules from localStorage + updateBalance
│   ├── pages/
│   │   ├── Login.tsx                   # Sign in / Sign up
│   │   ├── Dashboard.tsx               # Stats, equity chart, heatmap, recent trades
│   │   ├── Trades.tsx                  # Trade list + daily limits + win/loss buttons
│   │   ├── TradeDetail.tsx             # Single trade view + screenshots + edit
│   │   ├── Notes.tsx                   # Daily notes + session summary + screenshots
│   │   └── Settings.tsx                # Trading rules configuration
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
│       │   ├── Sidebar.tsx             # Nav: Dashboard, Trades, Notes, Settings
│       │   └── ProtectedRoute.tsx      # Auth guard → redirect /login
│       ├── trade/
│       │   ├── TradeForm.tsx           # Create/edit form with auto-calc SL/TP
│       │   ├── TradeCard.tsx           # Trade row with Win/Loss buttons
│       │   ├── TradeList.tsx           # Maps trades to TradeCards
│       │   ├── TradeFilters.tsx        # Date range + result filters
│       │   └── TradeSummary.tsx        # 4-stat summary bar
│       ├── notes/
│       │   ├── NoteEditor.tsx          # Textarea + save button
│       │   ├── DailyNoteCard.tsx       # Note preview card
│       │   ├── DailyNotesList.tsx      # List of note cards
│       │   └── DailySessionSummary.tsx # Trades/P&L/W-L/Pips for date
│       ├── images/
│       │   ├── ImageUploader.tsx       # Drag & drop upload zone
│       │   ├── ImageGallery.tsx        # Thumbnail grid + delete
│       │   └── ImageLightbox.tsx       # Full-screen viewer + keyboard nav
│       └── dashboard/
│           ├── StatsOverview.tsx       # Key metrics cards
│           ├── EquityCurveChart.tsx    # Recharts area chart
│           ├── CalendarHeatmap.tsx     # 6-month P&L heatmap
│           └── RecentTrades.tsx        # Last 5 trades
├── supabase-schema.sql                 # Full DB schema + RLS + storage
├── package.json
├── vite.config.ts
├── tsconfig.json
├── eslint.config.js
└── .env                                # VITE_SUPABASE_URL + KEY
```

---

## Trading Rules (localStorage)

Stored in `localStorage` under key `forex-journal-rules`:

```typescript
interface TradingRules {
  balance: number              // Current account balance (auto-updates on win/loss)
  maxDailyLossPercent: number  // Default: 2%
  maxDailyGainPercent: number  // Default: 4%
  maxTradesPerDay: number      // Default: 2
  riskRewardRatio: number      // Default: 2 (1:2 risk:reward)
}
```

**Derived values:**
- `riskPerTrade = balance × maxDailyLossPercent / maxTradesPerDay`
- `maxDailyLoss = balance × maxDailyLossPercent`
- `maxDailyGain = balance × maxDailyGainPercent`

**Balance auto-update:** When a trade is resolved (Win/Loss), `updateBalance(profitLoss)` adds/subtracts the P&L from the balance. All derived values recalculate automatically.

---

## Database Schema

### Tables

**trades**
```
id (uuid PK), user_id (FK→auth.users), date, pair (always 'XAU/USD'),
direction (buy|sell), entry_price, exit_price?, lot_size, pips?, profit_loss?,
notes?, stop_loss?, take_profit?, status (open|closed),
balance?, risk_amount?, risk_reward_ratio? (default 2), created_at
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

### Relationships

```
auth.users
├── trades (1:N)
│   └── trade_images (1:N)
└── daily_notes (1:N, unique per date)
    └── note_images (1:N)
```

### RLS Policies

All tables enforce `auth.uid() = user_id`. Image tables use nested EXISTS checks through their parent table.

### Storage

- Bucket: `trade-screenshots` (private)
- Trade images: `{user_id}/{trade_id}/{timestamp}.ext`
- Note images: `{user_id}/notes/{date}/{timestamp}.ext`
- Signed URLs: 1-year expiration

### Migration (for existing databases)

```sql
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS balance numeric;
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS risk_amount numeric;
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS risk_reward_ratio numeric DEFAULT 2;
```

---

## Type Definitions

```typescript
type TradeDirection = 'buy' | 'sell'
type TradeStatus = 'open' | 'closed'

interface Trade {
  id, user_id, date, pair, direction, entry_price, exit_price?,
  lot_size, pips?, profit_loss?, notes?, stop_loss?, take_profit?,
  status, balance?, risk_amount?, risk_reward_ratio?, created_at
}
type TradeInsert = Omit<Trade, 'id' | 'created_at' | 'user_id'>
type TradeUpdate = Partial<TradeInsert>

interface TradingRules {
  balance, maxDailyLossPercent, maxDailyGainPercent, maxTradesPerDay, riskRewardRatio
}

interface TradeImage    { id, trade_id, image_url, storage_path, created_at }
interface NoteImage     { id, note_id, image_url, storage_path, created_at }
interface DailyNote     { id, user_id, date, content, created_at, updated_at }
interface TradeFilters  { dateFrom?, dateTo?, result?: 'winner'|'loser'|'all' }
interface TradeStats    { totalTrades, winRate, avgPips, totalPL, winners, losers }
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
| `useSettings()` | - | `{ rules, saveRules, updateBalance, riskPerTrade, maxDailyLoss, maxDailyGain }` |

---

## Routes

| Path | Page | Auth |
|------|------|------|
| `/login` | LoginPage | Public |
| `/` | DashboardPage | Protected |
| `/trades` | TradesPage | Protected |
| `/trades/:id` | TradeDetailPage | Protected |
| `/notes` | NotesPage | Protected |
| `/settings` | SettingsPage | Protected |

---

## Calculations (XAU/USD Gold)

**Contract size:** 1 standard lot = 100 troy ounces

**SL/TP Auto-calculation:**
```
sl_distance = risk_amount / (lot_size × 100)
tp_distance = sl_distance × risk_reward_ratio
BUY:  SL = entry - sl_distance,  TP = entry + tp_distance
SELL: SL = entry + sl_distance,  TP = entry - tp_distance
```

**Pips (price points):** `direction === 'buy' ? exit - entry : entry - exit`

**P&L:** `price_difference × lot_size × 100`

**Example:** Balance=$10,000, risk=1% per trade ($100), lot=0.01, entry=2650.000, SELL
- sl_distance = $100 / (0.01 × 100) = $100.00
- tp_distance = $100.00 × 2 = $200.00
- SL = 2750.000, TP = 2450.000

**Stats:** Computed from closed trades only. Win rate = winners / total × 100.

---

## Key Workflows

### Trade Creation
1. User clicks "New Trade" (disabled if daily limits hit)
2. Risk summary shown: balance, risk per trade, R:R ratio (from Settings)
3. User fills: entry price, direction, lot size, status, notes
4. SL/TP auto-calculated in real-time and shown as read-only cards
5. On submit: saved to Supabase with pair='XAU/USD', calculated SL/TP

### Trade Resolution (Win/Loss)
1. Open trades with SL/TP show **Win** and **Loss** buttons in TradeCard
2. **Win:** exit_price = take_profit, P&L calculated, status → closed
3. **Loss:** exit_price = stop_loss, P&L calculated, status → closed
4. Balance auto-updates: `balance += profitLoss`
5. All derived values (risk per trade, daily limits) recalculate instantly
6. Daily status bar updates (trades count, P&L today)

### Daily Limits
1. Trades page shows 4 cards: Trades Today (X/max), P&L Today, Max Loss, Gain Target
2. If gain target reached → green banner, "New Trade" disabled
3. If loss limit reached → red banner, "New Trade" disabled
4. If max trades reached → amber banner, "New Trade" disabled

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

---

## Theme / Design System

- **Dark mode** by default (bg: #0a0a0f)
- **Accent color:** Indigo (#6366f1 / #818cf8)
- **Profit:** Green (#4ade80)
- **Loss:** Red (#f87171)
- **Risk/Warning:** Amber (#fbbf24)
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

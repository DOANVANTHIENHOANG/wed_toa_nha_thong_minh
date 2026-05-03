# 🎨 Automation Dashboard V4.0 - Visual Layout Guide

## Dashboard Structure (Desktop View)

```
╔════════════════════════════════════════════════════════════════════════════╗
║  🤖 Trung tâm Tự động hóa                                                  ║
║  Quản lý các kịch bản năng lượng thông minh                               ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   ║
║  │      0       │ │      0       │ │      0       │ │      0       │   ║
║  │ Tổng kịch bản│ │ Đang hoạt độ │ │ Hôm nay kích │ │ Tiết kiệm    │   ║
║  │              │ │              │ │ hoạt (kWh)   │ │ (kWh)        │   ║
║  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   ║
║                                                                            ║
│════════════════════════════════════════════════════════════════════════════│
║                         📊 Kịch bản tự động hóa                            ║
║                                               + Thêm kịch bản              ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  ┌──────────────────────────────┐  ┌──────────────────────────────┐     ║
║  │ 💡 Tiết kiệm chiếu sáng      │  │ 🛡️  Bảo vệ thiết bị          │     ║
║  │    Tối ưu dựa trên           │  │     Bảo vệ khỏi quá tải     │     ║
║  │    ánh sáng tự nhiên          │──║                        [✓]   │     ║
║  │                               │  │                    (Green)   │     ║
║  ├──────────────────────────────┤  ├──────────────────────────────┤     ║
║  │ 🟡 Chờ điều kiện             │  │ 🔥 Hoạt động                │     ║
║  ├──────────────────────────────┤  ├──────────────────────────────┤     ║
║  │ 💾 Tiết kiệm: 5.2 kWh       │  │ 💾 Tiết kiệm: 12.5 kWh     │     ║
║  │ 🕐 Lần cuối: 15p trước  [🗑️] │  │ 🕐 Lần cuối: 2p trước   [🗑️] │     ║
║  └──────────────────────────────┘  └──────────────────────────────┘     ║
║                                                                            ║
║  ┌──────────────────────────────┐                                        ║
║  │ 🏢 Tối ưu tòa nhà            │                                        ║
║  │    Giảm tải giờ cao điểm     │──────────────────────────────  [✓]    ║
║  │                               │                          (Green)      ║
║  ├──────────────────────────────┤                                        ║
║  │ 🟡 Chờ điều kiện             │                                        ║
║  ├──────────────────────────────┤                                        ║
║  │ 💾 Tiết kiệm: 0.0 kWh       │                                        ║
║  │ 🕐 Lần cuối: Chưa         [🗑️]│                                        ║
║  └──────────────────────────────┘                                        ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
```

## Scenario Card - Detailed View

```
┌─────────────────────────────────────────────────────────────────┐
│                                                          [Green] │
│  💡  │ Tiết kiệm chiếu sáng             Toggle          Switch │
│      │ Tối ưu dựa trên ánh sáng tự nhiên                 ✓     │
│      └────────────────────────────────────────────────────────  │
├─────────────────────────────────────────────────────────────────┤
│  🟡 Chờ điều kiện (Yellow badge with pulse)                    │
├─────────────────────────────────────────────────────────────────┤
│  💾 Tiết kiệm: 5.2 kWh                                          │
│  🕐 Lần cuối: 15p trước                              [Delete]   │
└─────────────────────────────────────────────────────────────────┘
```

## Color Reference

```
ACTIVE CARD (Running):
╔═════════════════════════════════╗
║ 🔥 Active-Glow                 ║
║ Border: #ff6b6b (Red)          ║
║ Background: rgba(255,107,107,  ║
║            0.1)                ║
║ Glow: 0 0 20px rgba(255,107,   ║
║     107, 0.2)                  ║
╚═════════════════════════════════╝

WAITING CARD (Idle):
╔═════════════════════════════════╗
║ ⏸️ Normal State                  ║
║ Border: rgba(59,130,246,0.2)   ║
║ Background: rgba(30,41,59,0.5) ║
║ Backdrop-filter: blur(10px)    ║
╚═════════════════════════════════╝

DISABLED CARD:
╔═════════════════════════════════╗
║ (Opacity 0.6)                  ║
║ Same as waiting but faded      ║
╚═════════════════════════════════╝
```

## Toggle Switch States

```
❌ DISABLED (Gray):
   ┌──────────────────┐
   │ ◯  ▬▬▬▬▬▬▬▬▬▬▬  │
   └──────────────────┘
   Gradient: #475569 → #64748b

✅ ENABLED (Green):
   ┌──────────────────┐
   │ ▬▬▬▬▬▬▬▬▬▬▬  ◯   │
   └──────────────────┘
   Gradient: #10b981 → #34d399
```

## Status Badges

```
🟡 WAITING (Yellow):
   ┌────────────────────┐
   │ ⏸️ Chờ điều kiện   │
   └────────────────────┘
   Background: rgba(251,191,36,0.2)
   Color: #fcd34d
   Border: rgba(251,191,36,0.3)

🔥 ACTIVE (Red):
   ┌────────────────────┐
   │ 🔥 Hoạt động       │
   └────────────────────┘
   Background: rgba(239,68,68,0.2)
   Color: #fca5a5
   Border: rgba(239,68,68,0.3)
```

## Hover Effect Animation

```
NORMAL STATE:
- Border opacity: 0.2
- Background: rgba(30,41,59,0.5)
- Transform: translateY(0)
- Shadow: none

HOVER EFFECT (0.3s):
- Border opacity: 0.4 (brighter)
- Background: rgba(59,130,246,0.15) (glows)
- Transform: translateY(-4px) (lifts)
- Shadow: 0 12px 40px rgba(59,130,246,0.15)
```

## Stats Bar Colors

```
PRIMARY STAT (Blue):
   Stat-number: #60a5fa
   Background: rgba(59,130,246,0.1)

HIGHLIGHTED STAT (Green):
   Border: rgba(16,185,129,0.3)
   Background: rgba(16,185,129,0.05)
```

## Button Styling

```
DELETE BUTTON:
   Normal: rgba(148,163,184,0.1) background
   Hover: rgba(239,68,68,0.2) background
          #fca5a5 foreground (red)

ADD BUTTON:
   Gradient: #3b82f6 → #60a5fa
   Shadow: 0 4px 12px rgba(59,130,246,0.3)
   Hover: shadow 0 6px 20px rgba(59,130,246,0.4)
```

## Responsive Layout

```
DESKTOP (1200px+):
┌─────────────────────────────────────────┐
│  [Card 1]  [Card 2]  [Card 3]          │
│  [Card 4]  [Card 5]  [Card 6]          │
└─────────────────────────────────────────┘
Grid: repeat(auto-fill, minmax(360px, 1fr))

TABLET (768px-1199px):
┌─────────────────────────────┐
│  [Card 1]        [Card 2]   │
│  [Card 3]        [Card 4]   │
└─────────────────────────────┘
Stats: 2 columns

MOBILE (<768px):
┌──────────────────┐
│   [Card 1]       │
│   [Card 2]       │
│   [Card 3]       │
│   [Card 4]       │
└──────────────────┘
Stats: 1 column
```

## Animation Timings

```
Hover effect: 0.3s cubic-bezier(0.4, 0, 0.2, 1)
Toggle switch: 0.4s linear
Modal slide-in: 0.3s ease-out
Background blur: none (static)
Border color transition: 0.3s ease
```

## Font Hierarchy

```
PAGE TITLE:
  Font-size: 32px
  Font-weight: 700
  Color: #f1f5f9

CARD TITLE:
  Font-size: 18px
  Font-weight: 600
  Color: #f1f5f9

CARD DESCRIPTION:
  Font-size: 13px
  Color: #cbd5e1
  Line-height: 1.4

STAT LABELS:
  Font-size: 13px
  Color: #94a3b8
  Text-transform: uppercase
  Letter-spacing: 0.5px

STAT VALUES:
  Font-size: 28px
  Font-weight: 700
  Color: #60a5fa
```

## Shadow System

```
CARD NORMAL:
  box-shadow: none

CARD HOVER:
  box-shadow: 0 12px 40px rgba(59,130,246,0.15)

ACTIVE-GLOW:
  box-shadow: 0 0 20px rgba(255,107,107,0.2)

BUTTON HOVER:
  box-shadow: 0 4px 12px rgba(59,130,246,0.3)
```

## Spacing Reference

```
Container padding: 30px
Card grid gap: 20px
Card internal padding: 24px
Stats grid gap: 20px
Header margin-bottom: 40px
Section margin-bottom: 30px
Card footer margin-top: 12px
Card internal gaps: 16px, 12px, 8px
```

---

**Last Updated**: 2026-04-07
**Dashboard Version**: V4.0 (Production Ready)

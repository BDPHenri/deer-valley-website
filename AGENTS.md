# AGENTS.md — Deer Valley Basecamp Booking Site

## Project
- **Site**: Doce Lar Homes — Deer Valley Basecamp direct booking
- **URL**: docelarhomes.com/deervalleybasecamp/
- **Stack**: Static HTML + CSS + vanilla JavaScript
- **Owner**: Rafael Braghini & Vívian

## Design System

### Visual Style
- Luxury STR aesthetic (Deer Valley Resort, Ritz-Carlton inspired)
- High-quality property photography
- Clean, modern, inviting

### JavaScript — CRITICAL
- **NO arrow functions** — Safari compatibility requirement
- Use `function() {}` syntax everywhere
- Test in Safari before committing

### Links
- **Only Maps links** for restaurants/locations — no direct website links
- Pattern: restaurant name as plain text, distance as Maps link
- Consistent linking pattern throughout

## Content
- Property: "Deer Valley Basecamp | 8 Min to Slopes | Sleeps 14"
- 4BR, 8 beds, 3.5BA, 14 guests
- Amenities: Hot tub, infrared sauna, game room (Pac-Man, NBA Jam), home theater, telescope, ski drop, firepit
- Hospitable widget for direct booking

## Deploy — ⚠️ REQUIRES APPROVAL
- Push triggers preview only
- Production deploy requires Rafael's approval
- This is a GUEST-FACING site

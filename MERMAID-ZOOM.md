# Mermaid Diagram Zoom & Pan Feature

## Overview

This site now has enhanced Mermaid diagram support with **zoom and pan** functionality!

## Features

✅ **Click to Zoom** - Click any Mermaid diagram to open it in a fullscreen modal
✅ **Drag to Pan** - Click and drag to move around large diagrams  
✅ **Mouse Wheel Zoom** - Scroll to zoom in/out
✅ **Pinch to Zoom** - Touch devices support pinch-to-zoom
✅ **Keyboard Shortcuts** - Press ESC to close the modal
✅ **Reset View** - Button to reset zoom and pan to original state
✅ **Mobile Optimized** - Works great on phones and tablets
✅ **Accessible** - Keyboard navigation and screen reader friendly

## How to Use

### For Readers

1. **Hover** over any Mermaid diagram to see the zoom indicator (🔍+)
2. **Click** anywhere on the diagram to open the zoom modal
3. **Drag** with your mouse to pan around
4. **Scroll** with mouse wheel to zoom in/out
5. **Use buttons** in the top-right:
   - **+** Zoom in
   - **−** Zoom out
   - **↻** Reset view
   - **×** Close (or press ESC)

### For Content Creators

Simply enable Mermaid in your post front matter:

```yaml
---
layout: post
title: "Your Post Title"
mermaid: true
---
```

Then use Mermaid code blocks as usual:

```rst
.. code-block:: mermaid

   graph LR
       A[Start] --> B[Process]
       B --> C[End]
```

The zoom functionality activates automatically!

## Technical Implementation

- **JavaScript**: `/assets/js/mermaid-zoom.js` (12KB)
- **CSS**: `/assets/css/mermaid-zoom.css` (3.5KB)
- **Dependencies**: None (vanilla JavaScript)
- **Load Strategy**: Loaded on all pages, activates only when Mermaid diagrams are present
- **Performance**: Minimal impact (~15KB total, deferred loading)

## Configuration

The zoom behavior can be customized by editing `/assets/js/mermaid-zoom.js`:

```javascript
const config = {
  minZoom: 0.5,        // Minimum zoom level (0.5 = 50%)
  maxZoom: 5,          // Maximum zoom level (5 = 500%)
  zoomStep: 0.2,       // Zoom increment per scroll/click
  transitionDuration: 300,           // Animation duration (ms)
  hoverIndicatorDelay: 200          // Delay before showing zoom icon (ms)
};
```

## Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Credits

Implemented as Enhanced Option 1 - a custom-built zoom solution that provides:
- Full pan and zoom control
- Touch device support
- No external dependencies
- Lightweight and performant

## Future Enhancements

Potential improvements:
- [ ] Minimap/navigator for very large diagrams
- [ ] Double-click to zoom to specific area
- [ ] Zoom level indicator
- [ ] Save zoom state between page loads
- [ ] Export zoomed view as image


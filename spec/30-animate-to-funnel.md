# Spec 30: Animate Idea to Funnel View

**Status:** Failed Experiment
**Created:** 2025-12-01
**Completed:** 2025-12-01

## Overview

Create smooth, visually appealing animations when transitioning from the Ideas List view to the Funnel view. The animation should provide visual continuity and help users understand the relationship between the two views of the same data.

## Experiment Outcome

This feature was implemented with a 3D flip animation but was ultimately removed as it did not provide sufficient value and slowed down navigation. The animation was too distracting and the instant page transitions work better for this use case.

## Requirements

### Functional Requirements

1. **View Transition Animation**
   - Animate the transition when clicking "Funnel View" button from list view
   - Animate the transition when clicking "List View" button from funnel view
   - Animation should complete before the new view is fully interactive
   - User should be able to see the connection between the two views

2. **Animation Types to Consider**
   - Fade transition between views
   - Slide transition (list slides out, funnel slides in)
   - Morph/transform animation (table rows transform into cards)
   - Zoom transition (zoom out from list, zoom into funnel layout)
   - Combination approach

3. **Performance Requirements**
   - Animation should run at 60fps
   - Should work smoothly with 50+ ideas
   - Should not block user interaction for too long (< 500ms total)
   - Should be GPU-accelerated where possible

4. **User Experience**
   - Animation should feel natural and purposeful
   - Should not be jarring or disorienting
   - Should respect user's motion preferences (prefers-reduced-motion)
   - Animation should be skippable or fast-forward-able

### Technical Requirements

1. **CSS Animations vs JavaScript**
   - Prefer CSS animations/transitions for performance
   - Use CSS transforms (translate, scale) over position changes
   - Use opacity changes for fading
   - Consider Framer Motion or similar library for complex animations

2. **Next.js Page Router Considerations**
   - Work with Next.js App Router navigation
   - Consider using View Transitions API if supported
   - Handle route change events properly
   - Maintain scroll position or animate scroll

3. **Accessibility**
   - Respect `prefers-reduced-motion` media query
   - Provide instant transition for users who prefer reduced motion
   - Ensure keyboard navigation works during animation
   - Don't hide important content during animation

4. **Browser Compatibility**
   - Work in modern browsers (Chrome, Firefox, Safari, Edge)
   - Graceful degradation for older browsers
   - No animation better than broken animation

## Implementation Approaches

### Approach 1: Simple Fade Transition

**Pros:**
- Easy to implement
- Good performance
- Works well with App Router
- Accessible

**Cons:**
- Less visually interesting
- Doesn't show relationship between views

**Implementation:**
```css
.page-transition-enter {
  opacity: 0;
}

.page-transition-enter-active {
  opacity: 1;
  transition: opacity 300ms ease-in;
}

.page-transition-exit {
  opacity: 1;
}

.page-transition-exit-active {
  opacity: 0;
  transition: opacity 200ms ease-out;
}
```

### Approach 2: Slide Transition

**Pros:**
- Clear directional movement
- Shows spatial relationship
- Still performant

**Cons:**
- May feel abrupt
- Requires careful positioning

**Implementation:**
```css
.slide-enter {
  transform: translateX(100%);
}

.slide-enter-active {
  transform: translateX(0);
  transition: transform 400ms ease-out;
}

.slide-exit {
  transform: translateX(0);
}

.slide-exit-active {
  transform: translateX(-100%);
  transition: transform 400ms ease-out;
}
```

### Approach 3: Shared Element Transition

**Pros:**
- Most visually impressive
- Clearly shows data continuity
- Modern and polished

**Cons:**
- More complex to implement
- May have performance challenges
- Requires matching elements between views

**Implementation:**
- Use View Transitions API where supported
- Assign `view-transition-name` to matching elements
- Fallback to simpler animation

### Approach 4: Zoom + Reorganize

**Pros:**
- Interesting visual effect
- Shows transformation from one layout to another
- Can be very smooth

**Cons:**
- Complex to implement
- May be disorienting
- Performance intensive

## Recommended Approach

**Start with Approach 2 (Slide Transition)** with the following enhancements:

1. List view slides out to the left, funnel view slides in from the right
2. Use `transform: translateX()` for performance
3. Add slight fade (opacity) during transition
4. Duration: 350ms with ease-out timing
5. Respect `prefers-reduced-motion`

**Future Enhancement:**
- Explore View Transitions API for shared element transitions
- Could morph individual idea cards from list to funnel positions

## Implementation Plan

### Files to Create

1. **src/components/PageTransition.tsx**
   - Wrapper component for page transitions
   - Handles animation states
   - Respects motion preferences

2. **src/styles/transitions.css**
   - CSS for transition animations
   - Media queries for reduced motion
   - Keyframe animations if needed

### Files to Modify

1. **src/app/[portfolioCode]/[productCode]/ideas/page.tsx**
   - Wrap content in transition component
   - Add transition identifier

2. **src/app/[portfolioCode]/[productCode]/ideas/funnel/page.tsx**
   - Wrap content in transition component
   - Add transition identifier

3. **src/app/globals.css**
   - Import transition styles
   - Add reduced motion media query

### Test Plan

1. **Visual Testing**
   - Manually test transition smoothness
   - Test with varying numbers of ideas
   - Test on different screen sizes
   - Test on different devices/browsers

2. **Performance Testing**
   - Measure fps during animation
   - Test with 100+ ideas
   - Profile with DevTools

3. **Accessibility Testing**
   - Test with `prefers-reduced-motion: reduce`
   - Test keyboard navigation during transition
   - Test with screen readers

4. **Browser Testing**
   - Chrome (latest)
   - Firefox (latest)
   - Safari (latest)
   - Edge (latest)

## Animation Specifications

### Timing

- **Duration:** 350ms
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` (ease-out)
- **Delay:** 0ms (instant start)

### Transform

**List to Funnel:**
```css
/* List exits */
transform: translateX(-20%);
opacity: 0;

/* Funnel enters */
transform: translateX(0);
opacity: 1;
```

**Funnel to List:**
```css
/* Funnel exits */
transform: translateX(20%);
opacity: 0;

/* List enters */
transform: translateX(0);
opacity: 1;
```

### Reduced Motion

When `prefers-reduced-motion: reduce` is detected:
- Remove all transforms
- Keep only opacity fade
- Reduce duration to 150ms
- Or skip animation entirely (instant)

## Future Enhancements

1. **View Transitions API**
   - Use native browser transitions when available
   - Automatic shared element morphing
   - Better performance

2. **Idea Card Morphing**
   - Individual cards morph from table rows to funnel cards
   - Stagger animation for visual interest
   - Track position and smoothly animate

3. **Loading States**
   - Skeleton screens during transition
   - Progressive loading of funnel cards
   - Optimize perceived performance

4. **Gesture Support**
   - Swipe gestures to switch views
   - Pull-to-refresh or swipe-to-navigate
   - Touch-friendly interactions

5. **Advanced Effects**
   - Parallax scrolling during transition
   - Blur effects
   - Color transitions
   - Dynamic lighting effects

## Notes

- Animation should enhance UX, not distract from it
- Prioritize performance over visual complexity
- Always provide a reduced motion alternative
- Test on lower-end devices
- Consider network latency and data loading
- Animation timing should match user's mental model
- Avoid animation for animation's sake

## References

- [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
- [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [CSS Transforms](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)
- [Framer Motion](https://www.framer.com/motion/)
- [Material Design Motion](https://m3.material.io/styles/motion/overview)

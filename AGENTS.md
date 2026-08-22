# Project Conventions & Preferences

## Client Logos Section Design Rules
- Display company logos and names in a side-by-side horizontal alignment (image on the left, name & link on the right).
- Ensure logo images are enlarged and prominently scaled (`scale-120` on normal state, `scale-135` on hover) inside large containers (`w-32 h-22 sm:w-40 sm:h-28`).
- Maintain a tight gap between the logo image and the text (`gap-1.5` to `gap-2`).
- Do NOT apply white or translucent background overlays on hover (`hover:bg-white/80` removed). Keep hover interactions clean without box background flickering.
- Smooth slow-motion transitions: Use fluid easing curves (`cubic-bezier(0.16, 1, 0.3, 1)` or `duration-500 ease-out`), smooth vertical float lift on hover (`whileHover={{ y: -4 }}`), ambient soft aura blur behind logos on hover, and animated underline with directional arrow slide for website links.


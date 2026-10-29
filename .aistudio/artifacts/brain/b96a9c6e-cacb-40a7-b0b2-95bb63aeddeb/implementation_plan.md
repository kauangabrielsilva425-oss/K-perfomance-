# Implementation Plan — K PERFORMANCE: Full Fitness Platform & Enhancements

## Project Summary
K PERFORMANCE is a high-impact, dark metallic fitness platform combining exercise physiology, nutrition science, interactive workout tracking, and daily habit execution.

## Completed Key Requirements

### 1. Navigation Menu Bug Fix ("Mais" Button)
- **Problem**: The "Mais" button previously relied on CSS `:hover` without state handling, breaking on mobile, touch taps, and desktop clicks.
- **Solution**:
  - Implemented explicit click-toggled state (`isMoreMenuOpen`) in `src/components/HeaderNav.tsx`.
  - Added click-outside listener via `useRef` for mouse and touch events (`touchstart`, `mousedown`).
  - Added `Escape` key listener to dismiss automatically.
  - Added direct quick "Mais" access and organized categories in the mobile drawer.
  - Ensured all 4 secondary sections (`compras`, `suplementacao`, `evolucao`, `calendario`) navigate cleanly and close the menu.

### 2. Expanded Food Catalog (+100 Items & Dual Inspection)
- **Categorization**: Proteínas, Carboidratos, Frutas, Legumes & Verduras, Gorduras & Oleaginosas, Lanches & Refeições Práticas, Outras Opções, plus **★ Meus Favoritos**.
- **Inspection (Both Modes as Selected)**:
  - **Inline Quick Peek**: Expands inline to reveal healthy cooking suggestions, strategic meal timing badges, and 100g macro breakdown.
  - **Full Dossier Modal**: Comparative table (per portion vs per 100g), preparation methods, combination synergies, allergen alerts, and dietary tags.
- **Actions**: Direct 1-click addition to Meal Planner (with grams/calories calculator) and Shopping List.

### 3. Supplements & Label Comparator
- **13 Complete Scientific Dossiers**: Pré-treino, Creatina, Cafeína, BCAA, Hipercalóricos, Whey Protein (Concentrado e Isolado), Proteína Vegetal, Beta-Alanina, Citrulina, Glutamina, Eletrólitos/Isotônicos, Multivitamínicos e Ômega-3.
- **Interactive Label Comparator**: Unmasks proprietary blends, compares cost per active serving, and warns against filler maltodextrin.

### 4. Interactive Workout Calendar (Monthly & Weekly Views)
- **Dual View**: Quick toggle between **Grade Mensal** (Month Grid) and **Linha da Semana** (Week Columns).
- **Navigation**: Previous month, Next month, and instant `"Hoje"` button to return to the current date.
- **Color Coding**:
  - Emerald / Green: Completed workout (`concluido`).
  - Silver / White: Scheduled workout (`programado`).
  - Slate / Grey: Rest / Active recovery (`descanso`).
- **Day Inspector Modal**: View workouts for any date, toggle completed status, delete, schedule new custom workouts, or launch directly into the live workout tracker.

### 5. Evolution Tracker (Quantitative Metrics & Progress Photos)
- **Strength Progression**: Interactive SVG load curve with Brzycki 1RM calculator for Bench Press, Squat, and RDL.
- **Body Measurements Log**: Track weight, body fat %, chest, arms, waist, hips, thighs, and calves over time with delta comparison.
- **Private Progress Photos**: Local upload and storage of physique photos with angle tags, dates, and notes.

### 6. New Section on HomeView
- Added **02 // ECOSSISTEMA NUTRICIONAL & CATÁLOGO EXPANDIDO**:
  - Visual cards for staple fitness foods (Peito de Frango, Arroz Branco, Ovos Caipiras, Aveia em Flocos).
  - Highlights for 100g tables, instant meal planner integration, and 1-click grocery generation.
  - Direct call-to-action to explore the catalog.

## Verification
- Both `compile_applet` and `lint_applet` executed and passed with 0 errors.

# Integration Strategy for Epic #26

This document outlines the integration strategy for unifying Rivers of Reckoning and Otter River Rush into the Rivermarsh codebase.

## 🎯 Integration Goals (from Epic #26)

1. **Unified Strata Foundation**: All rendering uses `@jbcom/strata` ✅ Complete
2. **Combat System**: Port RPG combat from Rivers of Reckoning
3. **Racing Mini-Game**: Port river racing from Otter River Rush
4. **Mobile-First**: Touch controls, responsive UI
5. **Procedural Everything**: Terrain, weather, enemies, items

## 📋 Open PR Status Matrix

### ✅ Ready to Merge (Approved, No AI Blockers)

| PR | Title | User Approval | AI Status | Build | Merge Order |
|----|-------|---------------|-----------|-------|-------------|
| - | *None currently ready* | - | - | - | - |

### ⏸️ Awaiting Resolution

| PR | Title | User Approval | AI Status | Build | Blocker |
|----|-------|---------------|-----------|-------|---------|
| #9 | Update docs and Render config | ✅ jbdevprimary | ✅ Claude approved | ❌ FAILURE | Merge conflict, needs rebase |
| #23 | GPU Instancing optimization | ✅ jbdevprimary | ❌ Claude: CHANGES_REQUESTED | ❌ FAILURE | AI feedback unaddressed, merge conflict |
| #4 | Rivermarsh Beta - Pre-kiro systems | - | ⚠️ Reviews failed/cancelled | ❌ FAILURE | Build failure, needs AI review |

### 🤖 Awaiting AI Review

| PR | Title | Notes |
|----|-------|-------|
| #4 | Rivermarsh Beta | OpenRouter failed, Claude/Codex cancelled - retry after build fix |

### 📦 Dependabot (Low Priority)

| PR | Title | Status |
|----|-------|--------|
| #34 | Bump three and @types/three | Build failing |
| #35 | Bump js-yaml | Build failing |
| #19 | Bump @capacitor/cli 8.0.0 | Build failing |
| #20 | Bump vite 7.0.2 | Build failing |
| #21 | Bump @vitejs/plugin-react 5.1.2 | Build failing |
| #22 | Bump @capacitor/core 8.0.0 | Build failing |

## 🔄 Merge Priority Order

### 🚨 Phase 0: Fix Main Branch Build (BLOCKER)

**BEFORE ANY OTHER PR CAN BE MERGED:**

1. **Create build fix PR** - Fix main branch compilation errors
   - Stub missing modules or implement them
   - Fix Strata API usage
   - Fix Three.js type issues
   - **Action**: Complete within integration branch, merge first
   - **Priority**: CRITICAL BLOCKER

### Phase 1: Documentation & Infrastructure (Foundation)

2. **#9 - Update docs and Render config**
   - **Status**: Approved by user + AI, has merge conflict
   - **Action**: Rebase against main (after fix), verify build passes
   - **Priority**: HIGH - Unblocks deployment configuration

### Phase 2: Performance Optimizations

3. **#23 - GPU Instancing optimization**
   - **Status**: User approved, but Claude requested changes
   - **AI Feedback Outstanding**:
     - ❌ Material mutation bug (Line 196)
     - ❌ Inefficient effect dependencies (Line 245)
     - ❌ Missing shader validation (Line 210)
     - ❌ Unused materialRef (Lines 156, 243)
   - **Action**: Address all Claude feedback, rebase, then re-request review
   - **Priority**: MEDIUM - Performance improvement but not blocking features

### Phase 3: Feature Ports

4. **#4 - Rivermarsh Beta (Pre-kiro game systems)**
   - **Status**: Build failing, AI reviews failed/cancelled
   - **Content**: Mobile input, game state, NPC system
   - **Action**: Fix build (depends on Phase 0), wait for full AI review
   - **Priority**: HIGH - Implements mobile controls (Epic #26 Phase 4)
   - **Aligns with Issues**: #1, #32, #33

### Phase 4: Dependency Updates

5. **Dependabot PRs** - Batch after feature PRs
   - Consider batch merging after main features stabilize
   - Three.js update (#34) may require testing with Strata

## 📝 Integration Rules

### Before Merging Any PR:

1. **Build must pass** - No merging with failed CI
2. **All AI feedback addressed** - CHANGES_REQUESTED must be resolved
3. **User approval** - At least one maintainer approval
4. **No merge conflicts** - Must rebase clean against target

### For Draft PRs:

1. Move to Ready for Review when:
   - Build passes
   - Initial implementation complete
   - Test plan documented
2. Wait for AI reviewer feedback before merging
3. Address all comments before approval

## 🎯 Issue to PR Mapping

| Issue | Title | Priority | Related PRs |
|-------|-------|----------|-------------|
| #26 | EPIC: Unify games | Epic | All |
| #28 | Port combat system | HIGH | *No PR yet* |
| #29 | Port leveling system | MEDIUM | *No PR yet* |
| #30 | Port river racing | HIGH | *No PR yet* |
| #31 | Day/night cycle | MEDIUM | *No PR yet* |
| #32 | Port mobile touch controls | HIGH | #4 (partial) |
| #33 | Consolidate UI/HUD | MEDIUM | #4 (partial) |
| #1 | Audit pre-kiro code | - | #4 |
| #5 | GitHub Pages deployment | MEDIUM | #9 (related) |
| #6 | PWA support | MEDIUM | *No PR yet* |
| #8 | Playable demo | MEDIUM | *No PR yet* |

## 🚨 CRITICAL: Main Branch Build Failures

**The main branch itself is broken** - all PRs will fail CI until this is resolved.

### Root Cause Analysis

Build errors in main branch (as of 2025-12-20):

#### 1. Missing Files (References exist but files don't)

| Missing Module | Referenced In |
|----------------|---------------|
| `@/components/VolumetricEffects` | `src/App.tsx` |
| `@/shaders/fur` | `src/components/Player.tsx` |
| `@/utils/audioManager` | `src/components/Player.tsx`, `src/systems/AudioSystem.tsx` |
| `@/utils/biomeAmbience` | `src/systems/AudioSystem.tsx` |
| `@/utils/environmentalAudio` | `src/systems/AudioSystem.tsx` |
| `@/utils/adaptiveQuality` | `src/systems/GameSystems.tsx` |
| `@/utils/memoryMonitor` | `src/systems/GameSystems.tsx` |

#### 2. Strata API Mismatches

The code references `@jbcom/strata` exports that don't exist:

| Error | File | Issue |
|-------|------|-------|
| `@jbcom/strata/core` | `SDFTerrain.tsx:18` | Subpath not exported - use main export |
| `VolumetricFog` | `World.tsx:12` | Should be `VolumetricFogMesh` |
| `waterColor` prop | `Water.tsx`, `World.tsx` | Doesn't exist on `AdvancedWaterProps` |
| `sunElevation` prop | `World.tsx:285` | Doesn't exist on `ProceduralSkyProps` |
| `windStrength` prop | `World.tsx:88,92` | Doesn't exist on `RainProps`/`SnowProps` |

#### 3. Three.js Type Issues

Vector2 type assignments incorrect - using plain objects `{x, y}` instead of `Vector2` instances.

### Resolution Priority

**BLOCKER** - This must be fixed BEFORE any feature PRs can be merged.

**Options:**
1. **Option A**: Create a fix PR to stub/implement missing modules and fix API calls
2. **Option B**: Revert to last working commit and re-apply changes properly
3. **Option C**: Fix within this integration branch

### Immediate Actions Required

1. Stub or implement missing utility modules
2. Update Strata component usage to match actual API
3. Fix Three.js Vector2 type issues
4. Ensure build passes before merging any feature PRs

---

### AI Review Configuration Issues

PR #4 shows AI review failures:
- OpenRouter Review: FAILURE
- Claude Review: CANCELLED
- Codex Review: CANCELLED

May indicate workflow configuration issues that need resolution.

## 📅 Integration Timeline

| Phase | PRs | Target |
|-------|-----|--------|
| Foundation | #9 | Immediate |
| Performance | #23 (after feedback) | After #9 |
| Features | #4 (after build fix + AI review) | After #23 |
| Dependencies | #34, #35, #19-22 | Batch after features |

## 🔒 Rejected/Deferred

| PR | Reason |
|----|--------|
| #7 | CLOSED - Sync from org-github |
| #36 | CLOSED - AI review workflow fix |

---

*Last updated: 2025-12-20*  
*Integration branch: `integration/epic-26-unified-codebase`*

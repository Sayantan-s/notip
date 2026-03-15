# Building the Snackbar System

## Component Composition

### Tree Structure

```
<Notip>                          # Singleton provider (mount guard via useEffectEvent)
  <App>
    <SomeComponent>
      useSnackbar() → { show, dismiss }   # Imperative hook (no store subscription)
    </SomeComponent>
    <NotipSnackbar                # Renderer (portal to document.body)
      limit={3}                   # Max visible items
      classNames={{ toast, title, description, closeButton }}
      icons={{ success, info, warning, error, loading }}
    />
  </App>
</Notip>
```

### Component Breakdown

**`<Notip>`** (`src/notip/Notip.tsx`)

- Singleton enforcer. Uses a module-level `mountedCount` variable incremented inside `useEffectEvent` + `useEffect`. Throws if more than one instance mounts. Renders `children` passthrough — no context provider, no wrappers.

**`<NotipSnackbar>`** (`src/notip/snackbar/Snackbar.tsx`)

- Also singleton-enforced via `trackMountCountToBlock()` (same pattern, separate counter from `<Notip>`).
- Subscribes to `snackbarStore` via `useSnackbarStore(limit)`.
- Groups visible snackbars by `placement` into a `Record<Placement, SnackbarItem[]>`.
- Renders one `div.notip-snackbar-container-{placement}` per placement group, each containing `<SnackbarItemComponent>` entries.
- Entire output is portaled to `document.body` via `createPortal`.
- Merges user-provided `icons` with built-in defaults (`SuccessIcon`, `ErrorIcon`, etc.).

**`SnackbarItemComponent`** (internal, not exported)

- Renders a single toast: icon (based on variant) + title + description + close button.
- Close button calls `snackbarStore.dismiss(item.id)` directly (not via hook).
- CSS custom properties `--index` and `--total` drive stacking/animation in CSS.
- `role="alert"` for accessibility.

## Store — Execution Mechanics

### SnackbarStore (`src/notip/snackbar/store.ts`)

Module-level singleton: `export const snackbarStore = new SnackbarStore()`.

**Data Structure: Doubly-Linked List + Map**

```
Map<id, Node>          ← O(1) lookup by id
head ↔ Node ↔ Node ↔ Node ↔ tail    ← doubly-linked, newest at head
```

- `nodes: Map<string, Node>` — random-access lookup for dismiss.
- `head`/`tail` — linked list pointers, newest item prepended at head.
- Each `Node` holds `{ item: SnackbarItem, next, prev }`.

**Why linked list?** O(1) insert (prepend to head) and O(1) remove (unlink node via map lookup). The visible slice is O(limit) traversal from head, not O(n) array operations.

### `show(config: SnackbarConfig) → string`

1. Generates random id: `Math.random().toString(36).substring(2, 9)`.
2. Creates `SnackbarItem` with defaults: `placement: "bottom-right"`, `time: 3000`, `variant: "default"`.
3. Creates a `Node`, prepends it to the head of the linked list.
4. Stores node in `this.nodes` map.
5. Registers a `setTimeout` for auto-dismiss, stored in `this.timers` map.
6. Calls `updateVisibleState()` then `emitChange()`.
7. Returns the `id`.

### `dismiss(id: string)`

1. Clears the timer from `this.timers` if present.
2. Looks up node in `this.nodes` map.
3. Unlinks node from the doubly-linked list (rewires `prev`/`next` pointers).
4. Deletes node from `this.nodes` map.
5. Calls `updateVisibleState()` then `emitChange()`.

### `updateVisibleState()`

Traverses from `head` up to `this.limit` nodes, collects their items into an array, and replaces `this.state` with a new `{ snackbars: visible }` object. This is the snapshot returned by `getSnapshot()`.

### `subscribe(config: { limit? }) → (listener) → unsubscribe`

- Curried: outer call captures `limit`, returns the standard `useSyncExternalStore` subscribe signature.
- If the incoming `limit` differs from current, updates `this.limit` and calls `updateVisibleState()`.
- Adds/removes listener from `this.listeners` set.

### `emitChange()`

Iterates `this.listeners` set and calls each callback. This triggers React re-renders via `useSyncExternalStore`.

## Hooks

### `useSnackbarStore(limit?: number)` (`src/notip/snackbar/useSnackbar.ts`)

```ts
useSyncExternalStore(snackbarStore.subscribe({ limit: limit || 3 }), snackbarStore.getSnapshot);
```

Returns the current `SnackbarState` — the visible snackbar items. This is the **reactive** hook (causes re-renders). Used internally by `<NotipSnackbar>`.

### `useSnackbar()` (`src/notip/snackbar/useSnackbar.ts`)

```ts
{ show: (config) => snackbarStore.show(config),
  dismiss: (id) => snackbarStore.dismiss(id) }
```

**Not reactive** — no subscription, no re-renders. Pure imperative handle for consumer components to fire-and-forget notifications. Returns stable function references (closures over the singleton store).

## Render Pipeline

```
Consumer calls useSnackbar().show(config)
  → snackbarStore.show()
    → prepend Node to linked list
    → register setTimeout for auto-dismiss
    → updateVisibleState() — traverse head→limit, build array
    → emitChange() — notify all listeners
      → useSyncExternalStore triggers re-render in <NotipSnackbar>
        → group snackbars by placement
        → createPortal to document.body
          → one container div per placement
            → SnackbarItemComponent per item (with CSS --index/--total vars)
```

## CSS Stacking Mechanism

Snackbars use **absolute positioning within a fixed container**, not normal flow layout.

- Container: `position: fixed`, `height: 0`, `overflow: visible`, `pointer-events: none`.
- Items: `position: absolute`, `pointer-events: auto`.
- CSS custom properties `--index` and `--total` (set via inline `style`) control stacking:
  - **Default (stacked):** `translate3d(0, calc(var(--index) * ∓15px), 0) scale(calc(1 - var(--index) * 0.05))` with fading opacity.
  - **On hover (expanded):** `translate3d(0, calc(var(--index) * ∓100% ∓ var(--index) * 10px), 0) scale(1)` with full opacity.
- Bottom placements stack upward (negative Y), top placements stack downward (positive Y).
- `z-index: total - index` ensures newest item renders on top.
- Transition: `all 0.4s cubic-bezier(0.25, 1, 0.5, 1)`.

## Placement System

Six positions defined in `types.ts`:

| Placement       | Container CSS                                       |
| --------------- | --------------------------------------------------- |
| `top-left`      | `top: 0; left: 0`                                   |
| `top-right`     | `top: 0; right: 0`                                  |
| `top-center`    | `top: 0; left: 50%; transform: translateX(-50%)`    |
| `bottom-left`   | `bottom: 0; left: 0`                                |
| `bottom-right`  | `bottom: 0; right: 0` (default)                     |
| `bottom-center` | `bottom: 0; left: 50%; transform: translateX(-50%)` |

Each snackbar carries its own `placement`. The renderer groups all visible snackbars by placement and creates separate container divs — multiple placement groups can coexist simultaneously.

## Variant System

Five variants: `default`, `success`, `error`, `warning`, `info`.

- Each maps to a CSS class `notip-snackbar-{variant}` with distinct background/text/border colors.
- Non-default variants display a variant icon (customizable via `icons` prop on `<NotipSnackbar>`).
- Dark mode variants via `@media (prefers-color-scheme: dark)`.
- Built-in icon components: `CloseIcon`, `SuccessIcon`, `ErrorIcon`, `WarningIcon`, `InfoIcon`, `LoadingIcon` (with CSS spin animation).

## Customization Surface

| Prop                     | Target                | Mechanism                                                          |
| ------------------------ | --------------------- | ------------------------------------------------------------------ |
| `limit`                  | Max visible snackbars | Passed to `useSnackbarStore`, controls linked list traversal depth |
| `classNames.toast`       | Snackbar wrapper      | Appended via `clsx()` alongside `notip-snackbar`                   |
| `classNames.title`       | Title `<h4>`          | Appended alongside `notip-snackbar-title`                          |
| `classNames.description` | Description `<p>`     | Appended alongside `notip-snackbar-description`                    |
| `classNames.closeButton` | Close `<button>`      | Appended alongside `notip-close-btn`                               |
| `icons.{variant}`        | Variant icon slot     | Replaces default SVG icon component                                |

## Singleton Enforcement

Two independent singleton guards:

1. **`<Notip>`** — module-level `mountedCount` variable, checked in `useEffectEvent` inside `useEffect`. Throws on second mount.
2. **`<NotipSnackbar>`** — uses `trackMountCountToBlock()` factory from `utils/mountDetector.ts`. Same pattern but creates a closure-scoped counter, allowing reuse across components (Dialog uses the same factory).

Both decrement on unmount cleanup, allowing remounting after unmount (e.g., hot reload).

## Type Definitions

```ts
SnackbarConfig {           // Input to show()
  title?: string
  description?: string
  variant?: Variant        // "default" | "success" | "error" | "warning" | "info"
  placement?: Placement    // 6 positions, defaults to "bottom-right"
  time?: number            // auto-dismiss ms, defaults to 3000
}

SnackbarItem extends SnackbarConfig {  // Internal, enriched
  id: string               // random 7-char base36
  createdAt: number         // Date.now()
  time: number              // required (defaulted from config)
  dismissible: boolean      // required (defaulted to true)
}

SnackbarState {             // Store snapshot
  snackbars: SnackbarItem[] // visible items (up to limit)
}
```

## Composable API (Sonner-Inspired)

Three tiers of composition, from fully styled to fully headless.

### Tier 1: Default Styled

```tsx
const { show } = useSnackbar();
show({ title: "Saved!", variant: "success" });
```

Library renders the full toast with variant colors, icon, title, description, close button.

### Tier 2: Custom JSX in Styled Shell

```tsx
show({
  variant: "success",
  jsx: ({ item, dismiss }) => (
    <div>
      <strong>{item.title}</strong>
      <button onClick={dismiss}>×</button>
    </div>
  ),
});
```

Library renders the outer shell (variant colors, border, shadow via `.notip-snackbar` + `.notip-snackbar-{variant}`). The `jsx` function replaces the entire inner content. `SnackbarItemRenderProps` are passed to the function.

### Tier 3: Fully Headless (Children Render Prop)

```tsx
<NotipSnackbar limit={5}>
  {({ item, dismiss, variantClassName, variantStyle }) => (
    <div style={{ ...variantStyle, padding: 16, borderRadius: 8 }} role="alert">
      <p>{item.title}</p>
      <button onClick={dismiss}>×</button>
    </div>
  )}
</NotipSnackbar>
```

Library handles stacking, placement grouping, and portal only. Each item is wrapped in a thin stacking div with `--index`/`--total` CSS variables. The consumer renders the visual content. `variantClassName` and `variantStyle` provide opt-in variant fallback.

### Per-Toast Configuration

| Field         | Type                                            | Default         | Effect                                  |
| ------------- | ----------------------------------------------- | --------------- | --------------------------------------- |
| `jsx`         | `(props: SnackbarItemRenderProps) => ReactNode` | —               | Custom content in styled shell          |
| `unstyled`    | `boolean`                                       | `false`         | Strip all default CSS classes           |
| `classNames`  | `SnackbarClassNames`                            | —               | Per-toast class overrides               |
| `icon`        | `ReactNode`                                     | variant default | Custom icon (overrides variant icon)    |
| `action`      | `{ label, onClick }`                            | —               | Action button (auto-dismisses on click) |
| `cancel`      | `{ label, onClick }`                            | —               | Cancel button (auto-dismisses on click) |
| `dismissible` | `boolean`                                       | `true`          | Show/hide close button                  |
| `onDismiss`   | `(item) => void`                                | —               | Callback on manual dismiss              |
| `onAutoClose` | `(item) => void`                                | —               | Callback on timer dismiss               |

### Variant Style Fallback

`SnackbarItemRenderProps` includes:

- `variantClassName`: e.g. `"notip-snackbar-success"` — apply to opt into library CSS variant colors
- `variantStyle`: e.g. `{ backgroundColor: '#dcfce7', color: '#166534', borderColor: '#bbf7d0' }` — inline styles for variant colors (works without importing library CSS, does not include dark mode)

The JS map is `VARIANT_STYLES` exported from `types.ts`.

### Escape Hatch: `useSnackbarGroups`

```tsx
const { groups, dismiss } = useSnackbarGroups(5);
// groups: Array<{ placement: Placement, items: SnackbarItem[] }>
```

Full control over containers, portaling, and rendering. For consumers who need to bypass `<NotipSnackbar>` entirely.

### CSS Architecture

Stacking rules use `.notip-snackbar-container > *` selectors (class-agnostic). Any direct child of a placement container gets positioning, transforms, and hover-expand behavior automatically. The `.notip-snackbar` class carries only appearance (padding, border-radius, shadow, colors).

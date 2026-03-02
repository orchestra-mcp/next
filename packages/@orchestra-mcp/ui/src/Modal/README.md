# Modal Component

A fully accessible modal dialog component with portal rendering, keyboard navigation, and focus management.

## Features

- **Portal Rendering** - Renders outside the DOM hierarchy using `ReactDOM.createPortal`
- **Keyboard Navigation** - ESC key to close, Tab for focus trap
- **Focus Management** - Automatic focus handling and restoration
- **Backdrop Click** - Click outside to close (optional)
- **Smooth Animations** - Fade-in overlay and slide-in modal
- **Responsive** - Mobile-optimized with bottom sheet on small screens
- **Accessible** - ARIA attributes and proper focus trap
- **Theme Support** - Works with theme variants (default, compact, modern)
- **Size Variants** - Small (400px), Medium (600px), Large (900px)

## Usage

```tsx
import { Modal } from '@orchestra-mcp/ui';
import { useState } from 'react';

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="My Modal"
        size="medium"
      >
        <p>Modal content goes here.</p>
      </Modal>
    </>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Controls modal visibility (required) |
| `onClose` | `() => void` | - | Callback when modal should close (required) |
| `title` | `string` | - | Modal header title (optional) |
| `children` | `ReactNode` | - | Modal content (required) |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Modal size variant |
| `closeOnOverlayClick` | `boolean` | `true` | Allow closing by clicking overlay |
| `closeOnEsc` | `boolean` | `true` | Allow closing by pressing ESC |

## Examples

### Basic Modal

```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirmation"
  size="small"
>
  <p>Are you sure you want to continue?</p>
  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
    <Button label="Confirm" onClick={handleConfirm} />
    <Button label="Cancel" variant="secondary" onClick={() => setIsOpen(false)} />
  </div>
</Modal>
```

### Modal with Form

```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Edit Profile"
  size="medium"
>
  <form onSubmit={handleSubmit}>
    <Input label="Name" value={name} onChange={setName} />
    <Input label="Email" type="email" value={email} onChange={setEmail} />
    <Button label="Save" type="submit" />
  </form>
</Modal>
```

### Large Scrollable Modal

```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Terms and Conditions"
  size="large"
>
  <div>
    {/* Long content will be scrollable */}
    <p>Lorem ipsum dolor sit amet...</p>
    {/* ... more content ... */}
  </div>
</Modal>
```

### Custom Header Modal

```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  size="medium"
>
  {/* No title prop, so you can create custom header */}
  <div className="custom-header">
    <h2>Custom Title</h2>
    <p>Custom subtitle</p>
  </div>
  <p>Modal content...</p>
</Modal>
```

### Prevent Closing

```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Processing..."
  closeOnOverlayClick={false}
  closeOnEsc={false}
>
  <p>Please wait while we process your request.</p>
  <Spinner />
</Modal>
```

## Accessibility

The Modal component follows WAI-ARIA best practices:

- `role="dialog"` and `aria-modal="true"` on modal container
- `aria-labelledby` points to modal title
- Focus trap prevents Tab navigation outside modal
- Focus restoration when modal closes
- ESC key to close (when enabled)
- Proper keyboard navigation

## Styling

The component uses CSS classes that can be styled via theme variables:

### CSS Classes

- `.modal-overlay` - Backdrop overlay
- `.modal` - Modal container
- `.modal--small` - Small size variant
- `.modal--medium` - Medium size variant
- `.modal--large` - Large size variant
- `.modal-content` - Content wrapper
- `.modal-header` - Header section
- `.modal-title` - Title text
- `.modal-close` - Close button
- `.modal-body` - Body content (scrollable)

### Theme Variables

The Modal uses the following CSS variables from the theme system:

- `--color-bg` - Modal background
- `--color-fg` - Text color
- `--color-fg-muted` - Muted text color
- `--color-border` - Border color
- `--color-bg-active` - Active background
- `--color-accent` - Accent color

## Responsive Behavior

On mobile screens (< 640px):
- Modal slides up from bottom (sheet style)
- Takes full width
- Rounded corners only on top
- Smooth slide-up animation

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS 12+)
- Chrome Mobile (Android)

## Notes

- The modal renders using `ReactDOM.createPortal` to `document.body`
- Body scroll is prevented when modal is open
- Focus is automatically managed and restored
- Overlay has backdrop blur effect for modern browsers

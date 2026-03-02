import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from '../Button';

/**
 * Example usage of the Modal component
 * This file demonstrates various Modal configurations
 */
export const ModalExample = () => {
  const [isSmallOpen, setIsSmallOpen] = useState(false);
  const [isMediumOpen, setIsMediumOpen] = useState(false);
  const [isLargeOpen, setIsLargeOpen] = useState(false);
  const [isNoTitleOpen, setIsNoTitleOpen] = useState(false);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Modal Examples</h1>

      <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
        <Button label="Small Modal" onClick={() => setIsSmallOpen(true)} />
        <Button label="Medium Modal" onClick={() => setIsMediumOpen(true)} />
        <Button label="Large Modal" onClick={() => setIsLargeOpen(true)} />
        <Button
          label="No Title Modal"
          onClick={() => setIsNoTitleOpen(true)}
          variant="secondary"
        />
      </div>

      {/* Small Modal */}
      <Modal
        isOpen={isSmallOpen}
        onClose={() => setIsSmallOpen(false)}
        title="Small Modal"
        size="small"
      >
        <p>This is a small modal dialog.</p>
        <p>Perfect for simple confirmations or brief messages.</p>
        <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
          <Button label="Confirm" onClick={() => setIsSmallOpen(false)} />
          <Button
            label="Cancel"
            variant="secondary"
            onClick={() => setIsSmallOpen(false)}
          />
        </div>
      </Modal>

      {/* Medium Modal */}
      <Modal
        isOpen={isMediumOpen}
        onClose={() => setIsMediumOpen(false)}
        title="Medium Modal"
        size="medium"
      >
        <h3>Welcome to Orchestra MCP</h3>
        <p>
          This is a medium-sized modal, perfect for forms or content that needs
          a bit more space.
        </p>
        <div style={{ marginTop: '16px' }}>
          <label>
            Name:
            <input
              type="text"
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </label>
        </div>
        <div style={{ marginTop: '12px' }}>
          <label>
            Email:
            <input
              type="email"
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </label>
        </div>
        <div style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
          <Button label="Submit" onClick={() => setIsMediumOpen(false)} />
          <Button
            label="Cancel"
            variant="secondary"
            onClick={() => setIsMediumOpen(false)}
          />
        </div>
      </Modal>

      {/* Large Modal */}
      <Modal
        isOpen={isLargeOpen}
        onClose={() => setIsLargeOpen(false)}
        title="Large Modal with Scrollable Content"
        size="large"
      >
        <h3>Orchestra MCP Features</h3>
        <p>
          This large modal demonstrates scrollable content. When content
          exceeds the viewport height, the modal body becomes scrollable.
        </p>
        <h4>Project Management</h4>
        <p>Create and manage projects with comprehensive PRD support.</p>
        <h4>Epic Tracking</h4>
        <p>Break down work into epics, stories, and tasks.</p>
        <h4>Workflow States</h4>
        <p>13-state workflow with gated transitions and evidence tracking.</p>
        <h4>Memory System</h4>
        <p>Context-aware memory for better AI assistance.</p>
        <h4>Plugin Architecture</h4>
        <p>Extensible plugin system for custom functionality.</p>
        <h4>Multi-Platform</h4>
        <p>Desktop, Web, Chrome Extension, and Mobile support.</p>
        <h4>Real-time Sync</h4>
        <p>WebSocket-based synchronization across devices.</p>
        <div style={{ marginTop: '20px' }}>
          <Button
            label="Got it!"
            onClick={() => setIsLargeOpen(false)}
            size="large"
          />
        </div>
      </Modal>

      {/* No Title Modal */}
      <Modal
        isOpen={isNoTitleOpen}
        onClose={() => setIsNoTitleOpen(false)}
        size="medium"
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <h2 style={{ marginTop: 0 }}>Custom Header</h2>
          <p>
            This modal has no header prop, so you can create your own custom
            header layout.
          </p>
          <Button
            label="Close"
            onClick={() => setIsNoTitleOpen(false)}
            variant="ghost"
          />
        </div>
      </Modal>
    </div>
  );
};

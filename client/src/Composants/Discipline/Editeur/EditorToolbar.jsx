import React from 'react';

const StyleButton = ({ onToggle, style, active, label }) => {
  return (
    <button
      className={`btn btn-sm ${active ? 'btn-primary' : 'btn-outline-primary'} me-1`}
      onMouseDown={(e) => {
        e.preventDefault();
        onToggle(style);
      }}
    >
      {label}
    </button>
  );
};

const BLOCK_TYPES = [
  { label: 'H1', style: 'header-one' },
  { label: 'H2', style: 'header-two' },
  { label: 'H3', style: 'header-three' },
  { label: 'Citation', style: 'blockquote' },
  { label: 'Liste non ordonnée', style: 'unordered-list-item' },
  { label: 'Liste ordonnée', style: 'ordered-list-item' },
];

const INLINE_STYLES = [
  { label: 'Gras', style: 'BOLD' },
  { label: 'Italique', style: 'ITALIC' },
  { label: 'Souligné', style: 'UNDERLINE' },
];

const EditorToolbar = ({ editorState, onToggle }) => {
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();
  const currentStyle = editorState.getCurrentInlineStyle();

  return (
    <div className="mb-2">
      {BLOCK_TYPES.map((type) => (
        <StyleButton
          key={type.label}
          active={type.style === blockType}
          label={type.label}
          onToggle={onToggle}
          style={type.style}
        />
      ))}
      {INLINE_STYLES.map((type) => (
        <StyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          onToggle={onToggle}
          style={type.style}
        />
      ))}
    </div>
  );
};

export default EditorToolbar;

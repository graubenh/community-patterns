# Obsidian Notes Pattern - Design Doc

**Pattern File**: `patterns/graubenh/WIP/obsidian-notes.tsx`
**Status**: Planning
**Created**: 2024-12-06

## Purpose

A pattern for quickly capturing notes and thoughts that are written directly to Obsidian using Obsidian URIs. Primarily for categorized ideas with tags, with fallback to quick uncategorized notes.

## User Requirements

From user interview:
- **Connection Method**: Obsidian URI (`obsidian://` URLs)
- **Primary Use Case**: Ideas with tags and categorization
- **Fallback Use Case**: Quick notes/thoughts when categorization isn't immediately clear
- **Organization**: By topic/title (each thought gets its own note)

## Core Features

### Must Have (MVP)
1. **Quick Note Input**
   - Text area for note content
   - Title field for the note
   - Tags input (comma-separated or dedicated component)
   - "Send to Obsidian" button

2. **Obsidian Integration**
   - Generate `obsidian://new` URI with:
     - Note title
     - Note content
     - Tags as frontmatter or inline
   - Open in Obsidian app automatically

3. **Note Preview**
   - Show what the note will look like before sending
   - Display formatted markdown preview

### Nice to Have (Future)
1. **Recent Notes List**
   - Keep history of sent notes (just metadata, not full content)
   - Quick re-send or edit functionality

2. **Tag Suggestions**
   - Remember previously used tags
   - Autocomplete for tags

3. **Templates**
   - Pre-defined note templates for common use cases
   - "Idea", "Quick Thought", "Meeting Note" templates

4. **Vault Selection**
   - If user has multiple Obsidian vaults
   - Configure which vault to send to

## Technical Approach

### Obsidian URI Format

```
obsidian://new?vault=<vault-name>&file=<file-path>&content=<encoded-content>
```

**Parameters:**
- `vault`: (optional) Name of the vault
- `file`: Path and filename for the note (e.g., "Ideas/My Idea Title")
- `content`: URL-encoded markdown content including frontmatter

### Note Structure

```markdown
---
tags: [idea, project, tag1, tag2]
created: 2024-12-06T15:30:00
---

# Note Title

Note content goes here...
```

### Data Model

```typescript
interface ObsidianNote {
  title: string;
  content: string;
  tags: Default<string[], []>;
  folder: Default<string, "Ideas">;  // Default folder in Obsidian
  timestamp: Default<string, "">;     // ISO timestamp
}

interface ObsidianNotesInput {
  notes: Cell<ObsidianNote[]>;  // History of created notes
  currentNote: {
    title: Cell<string>;
    content: Cell<string>;
    tags: Cell<string[]>;
  };
}
```

## UI Layout

```
┌─────────────────────────────────────┐
│  📝 Send to Obsidian                │
├─────────────────────────────────────┤
│                                     │
│  Title: [________________]          │
│                                     │
│  Content:                           │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │  (text area)                │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Tags: [tag1, tag2, tag3]           │
│                                     │
│  Folder: [Ideas ▼]                  │
│                                     │
│  [Preview] [Send to Obsidian →]    │
│                                     │
├─────────────────────────────────────┤
│  Recent Notes (5)                   │
│  • My Great Idea (2 min ago)        │
│  • Quick thought (1 hour ago)       │
│  • Project brainstorm (today)       │
└─────────────────────────────────────┘
```

## Implementation Steps

### Phase 1: Basic URI Generation
- [ ] Create input form (title, content, tags)
- [ ] Build Obsidian URI from inputs
- [ ] Test URI opens Obsidian correctly
- [ ] Handle URL encoding properly

### Phase 2: Enhanced UX
- [ ] Add markdown preview
- [ ] Add tag input component (ct-input with comma separation)
- [ ] Add folder selector
- [ ] Clear form after successful send

### Phase 3: History & Polish
- [ ] Store sent notes history in pattern state
- [ ] Display recent notes list
- [ ] Add timestamp to notes
- [ ] Styling improvements

## Technical Challenges

### 1. Opening Obsidian URI
**Challenge**: How to programmatically open `obsidian://` URLs from the pattern

**Options**:
- Use `window.open(uri)` in browser
- Create a link `<a href={uri}>` and click it programmatically
- Use `window.location.href = uri`

**Decision Needed**: Test which approach works best

### 2. URL Encoding
**Challenge**: Properly encode markdown content with frontmatter

**Solution**: Use `encodeURIComponent()` for content parameter

### 3. Vault Name
**Challenge**: User needs to provide their vault name

**Solution**:
- Add vault name as a setting in the pattern
- Make it optional (Obsidian opens last active vault if not specified)
- Default to empty string

## Open Questions

1. **Should we store full note content in history or just metadata?**
   - Pro: Can re-send or edit
   - Con: Uses more storage, might duplicate Obsidian data
   - **Recommendation**: Just metadata (title, tags, timestamp)

2. **How to handle multi-line content in URI?**
   - **Answer**: URL encode it - Obsidian handles newlines in encoded content

3. **Should we add AI features?**
   - Auto-suggest tags based on content
   - Auto-generate title from content
   - **Recommendation**: Add later after MVP works

4. **Default folder structure?**
   - Start with "Ideas" as default
   - Make configurable
   - Consider date-based subfolders (Ideas/2024/12/)

## Success Criteria

MVP is successful when:
- ✅ User can write a note with title, content, and tags
- ✅ Clicking "Send to Obsidian" opens Obsidian with the note
- ✅ Note appears in Obsidian with correct formatting
- ✅ Tags are properly formatted in frontmatter
- ✅ Form clears after successful send

## Example URI

```
obsidian://new?file=Ideas/My%20Great%20Idea&content=%2D%2D%2D%0Atags%3A%20%5Bidea%2C%20project%5D%0Acreated%3A%202024-12-06T15%3A30%3A00%0A%2D%2D%2D%0A%0A%23%20My%20Great%20Idea%0A%0AThis%20is%20my%20brilliant%20idea%20content...
```

Decoded content:
```markdown
---
tags: [idea, project]
created: 2024-12-06T15:30:00
---

# My Great Idea

This is my brilliant idea content...
```

## Resources

- Obsidian URI Documentation: https://help.obsidian.md/Extending+Obsidian/Obsidian+URI
- Example Obsidian URI patterns in community

## Notes & Learnings

_(To be filled in during development)_

### Session 1 - Planning
- User wants primarily tagged ideas with topic-based organization
- Obsidian URI approach chosen for simplicity
- No file system access needed (which is good for security)

---

## Next Session Checklist

When starting work on this pattern:
- [ ] Review this design doc
- [ ] Create `patterns/graubenh/WIP/obsidian-notes.tsx`
- [ ] Start with Phase 1 (Basic URI Generation)
- [ ] Test with your actual Obsidian vault
- [ ] Update this doc with learnings

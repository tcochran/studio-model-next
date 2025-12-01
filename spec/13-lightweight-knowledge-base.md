# Spec 13: Lightweight Knowledge Base

**Status:** Not Started
**Created:** 2025-12-01

## Overview

A simple knowledge base for managing markdown files. Users can create, upload, view, and download markdown documents.

## Sub-Specs

- [13.1 - KB Page Layout](13.1-kb-page-layout.md)
- [13.2 - Create Markdown via Text Input](13.2-create-markdown-text-input.md)
- [13.3 - Upload Markdown File](13.3-upload-markdown-file.md)
- [13.4 - List Markdown Files](13.4-list-markdown-files.md)
- [13.5 - View and Download Markdown](13.5-view-download-markdown.md)

## Requirements

### Functional Requirements

1. **Create via Text Input** - Paste markdown content into a text area and save
2. **Upload File** - Upload .md files from local filesystem
3. **List Files** - View all stored markdown files
4. **View File** - Read markdown content (rendered or raw)
5. **Download File** - Download markdown files to local filesystem

### Technical Requirements

1. **Storage** - Store markdown files in DynamoDB or S3
2. **Schema** - KBDocument model with id, title, content, createdAt, updatedAt
3. **File Size** - Support reasonable file sizes for markdown docs

## Notes

- Keep it simple - no folders, tags, or search in initial version
- Markdown rendering is optional for v1 (raw text is fine)

/**
 * Core type definitions for the LinkedList application
 */

export interface User {
  id: string;
  email: string;
  createdAt: Date;
}

export interface Link {
  id: string;
  userId: string;
  url: string;
  title: string;
  description?: string;
  isPermanent: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  linkId: string;
  content: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Label {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
}

// Junction type for the many-to-many relationship
export interface LinkLabel {
  linkId: string;
  labelId: string;
}

/**
 * UI-specific types
 */

export interface LinkWithNotes extends Link {
  notes: Note[];
}

export interface LinkWithLabels extends Link {
  labels: Label[];
}

export interface LinkFull extends Link {
  notes: Note[];
  labels: Label[];
}
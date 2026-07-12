/**
 * Spec format for the read-only Linux filesystem hierarchy explorer.
 * A lesson gets one at content/worlds/<worldId>/<lessonId>.fstree.json —
 * LessonScreen loads it server-side and renders <FsTreeExplorer /> when present.
 * Unlike a lab exam, nothing here is "built" by the learner — the whole tree
 * already exists; commands only move you through it or reveal file content.
 */

export interface FsExplorerNode {
  /** Absolute path, e.g. "/etc/passwd". Every ancestor directory must also be listed. */
  path: string;
  type: "dir" | "file";
  /** Short one-line purpose (Bengali) — always shown under the node in the tree */
  desc: string;
  /** Longer explanation (Bengali) — shown in the side panel when this node is current/selected */
  detail?: string;
  /** Sample content shown by `cat` (files only) */
  content?: string;
}

export interface FsExplorerSpec {
  lessonId: string;
  title: string;
  intro: string;
  nodes: FsExplorerNode[];
}

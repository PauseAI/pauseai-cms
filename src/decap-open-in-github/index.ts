import styles from "./open-in-github.css?inline";

type Config = {
  /** Optional override for the `owner/repo`; defaults to the backend repo from the CMS config */
  repo?: string;
  /** Optional override for the base branch; defaults to the backend branch from the CMS config (or "main") */
  branch?: string;
};

type Entry = {
  path?: string;
  slug?: string;
  collection?: string;
  status?: string;
};

/** Immutable.js Map (or plain object) accessor. */
function getField(record: unknown, key: string): unknown {
  if (record && typeof (record as any).get === "function") return (record as any).get(key);
  if (record && typeof record === "object") return (record as Record<string, unknown>)[key];
  return undefined;
}

type CmsState = {
  entryDraft?: unknown;
  config?: {
    backend?: {
      repo?: string;
      branch?: string;
    };
  };
};

type Store = { getState: () => CmsState };

/** Decap's branch prefix for editorial workflow entries. */
const CMS_BRANCH_PREFIX = "cms";

const GITHUB_ICON = `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>`;

function findStore(): Store | null {
  for (const el of document.querySelectorAll("#nc-root *")) {
    const fiberKey = Object.keys(el).find(k => k.startsWith("__reactFiber"));
    if (!fiberKey) continue;
    let fiber: any = (el as any)[fiberKey];
    while (fiber) {
      const store = fiber.memoizedProps?.store;
      if (store && typeof store.getState === "function") return store;
      fiber = fiber.return;
    }
  }
  return null;
}

/**
 * Resolves the GitHub URL for the entry currently being edited.
 * Published entries link to the base branch; entries under editorial
 * workflow live on `cms/<collection>/<slug>` (a fork branch when open
 * authoring is enabled for non-maintainers).
 */
function getEntryUrl(
  store: Store,
  { repo: configRepo, branch: fallbackBranch }: Config = {},
): string | null {
  const state = store.getState();
  const entryDraft = getField(state, "entryDraft");
  const entry = getField(entryDraft, "entry") as Entry | undefined;
  const path = entry && (getField(entry, "path") as string | undefined);
  if (!path) return null;

  const backend = (getField(state, "config") as CmsState["config"] | undefined)?.backend;
  const repo = configRepo || backend?.repo;
  if (!repo) return null;

  const baseBranch = fallbackBranch || backend?.branch || "main";
  const slug = getField(entry, "slug") as string | undefined;
  const collection = getField(entry, "collection") as string | undefined;
  const status = getField(entry, "status") as string | undefined;

  if (status && slug && collection) {
    // Unpublished (editorial workflow): entry lives on cms/<collection>/<slug>
    const branch = `${CMS_BRANCH_PREFIX}/${collection}/${slug}`;
    return `https://github.com/${repo}/blob/${branch}/${path}`;
  }

  return `https://github.com/${repo}/blob/${baseBranch}/${path}`;
}

export function registerPlugin(config: Config = {}) {
  let store: Store | null | undefined;
  let updateScheduled = false;

  const update = () => {
    updateScheduled = false;

    // Only present on the entry editor page.
    const toolbar = document.querySelector('[class*="ToolbarContainer"] > [class*="ToolbarSectionMain"]');
    if (!toolbar) return;

    // The store instance is stable for the whole session; cache the lookup.
    store = store === undefined ? findStore() : store;
    const url = store ? getEntryUrl(store, config) : null;

    const existing = document.getElementById("open-in-github");
    if (existing) {
      // Keep the link fresh across entry navigation and status changes.
      if (url) existing.setAttribute("href", url);
      return;
    }
    if (!url) return;

    const link = document.createElement("a");
    link.id = "open-in-github";
    link.className = "open-in-github-button";
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.title = "Open this entry on GitHub";
    link.innerHTML = `${GITHUB_ICON}<span>Open on GitHub</span>`;

    const toolbarContainer = toolbar.parentElement;
    const meta = toolbarContainer?.querySelector('[class*="ToolbarSectionMeta"]');
    if (meta && toolbarContainer) {
      toolbarContainer.insertBefore(link, meta);
    } else {
      toolbarContainer?.appendChild(link);
    }
  };

  // Editor typing fires mutations constantly; coalesce them.
  const observer = new MutationObserver(() => {
    if (updateScheduled) return;
    updateScheduled = true;
    setTimeout(update, 100);
  });

  observer.observe(document.body, { childList: true, subtree: true });

  const sheet = new CSSStyleSheet();
  sheet.replaceSync(styles);
  document.adoptedStyleSheets.push(sheet);
}

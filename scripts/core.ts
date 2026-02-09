import { MinMPLookup } from "min-mphash";

interface RegistryData {
  lookupData: string | Uint8Array;
  baseUrl?: string;
  chunks?: Record<string, string>;
  _lookupInstance?: MinMPLookup;
}

const packageRegistry = new Map<string, RegistryData>();

export function register(
  pkg: string,
  data: {
    lookup: string | Uint8Array;
    baseUrl?: string;
    chunks?: Record<string, string>;
  },
) {
  if (!packageRegistry.has(pkg)) {
    packageRegistry.set(pkg, {
      lookupData: data.lookup,
      baseUrl: data.baseUrl,
      chunks: data.chunks,
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("hd-icon-registered", { detail: { pkg } }),
      );
    }
  }
}

export class HdIcon extends HTMLElement {
  static get observedAttributes() {
    return ["icon"];
  }

  private _use: SVGUseElement;

  constructor() {
    super();
    // Light DOM: we render directly into the element.
    // We use external reference <use href="...#...">.
    this.innerHTML = `<svg width="1em" height="1em" fill="currentColor" style="display: inline-block; vertical-align: middle; overflow: hidden;"><use width="100%" height="100%"></use></svg>`;
    this._use = this.querySelector("use")!;
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === "icon" && newValue !== oldValue) {
      this.render();
    }
  }

  connectedCallback() {
    this.render();
    if (typeof window !== "undefined") {
      window.addEventListener("hd-icon-registered", this.handleRegistration);
    }
  }

  disconnectedCallback() {
    if (typeof window !== "undefined") {
      window.removeEventListener("hd-icon-registered", this.handleRegistration);
    }
  }

  private handleRegistration = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    const iconKey = this.getAttribute("icon");
    if (iconKey && iconKey.startsWith(detail.pkg + ":")) {
      this.render();
    }
  };

  async render() {
    const iconKey = this.getAttribute("icon");
    if (!iconKey) return;

    const [pkg, name] = iconKey.split(":");
    if (!pkg || !name) {
      console.warn(
        `[hd-icon] Invalid icon format: "${iconKey}". Expected "pkg:name".`,
      );
      return;
    }

    const registry = packageRegistry.get(pkg);
    if (!registry) {
      // Package not loaded yet.
      return;
    }

    // Initialize lookup instance if needed
    if (!registry._lookupInstance) {
      let lookupData = registry.lookupData;
      if (typeof lookupData === "string") {
        const binaryString = atob(lookupData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        lookupData = bytes;
        // Update the registry to avoid re-decoding
        registry.lookupData = lookupData;
      }
      registry._lookupInstance = new MinMPLookup(lookupData as Uint8Array);
    }

    const chunkFile = registry._lookupInstance.query(name);

    if (!chunkFile) {
      console.warn(`[hd-icon] Icon "${name}" not found in package "${pkg}".`);
      return;
    }

    const symbolId = `hd-icon-${pkg}-${name}`;
    let url = chunkFile;

    // Check if bundler-resolved chunks are available
    if (registry.chunks && registry.chunks[chunkFile]) {
      url = registry.chunks[chunkFile];
    } else if (registry.baseUrl) {
      try {
        // Resolve relative to baseUrl
        url = new URL(chunkFile, registry.baseUrl).href;
      } catch (e) {
        console.warn(
          `[hd-icon] Failed to resolve icon URL: ${chunkFile} relative to ${registry.baseUrl}`,
          e,
        );
      }
    }

    this._use.setAttribute("href", `${url}#${symbolId}`);
  }
}

if (typeof customElements !== "undefined" && !customElements.get("hd-icon")) {
  customElements.define("hd-icon", HdIcon);
}

// Expose to window for inline usage
if (typeof window !== "undefined") {
  (window as any).IconPkg = { register, HdIcon };
}

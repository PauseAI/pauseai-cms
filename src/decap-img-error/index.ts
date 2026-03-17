type Config = {
    prefix: string;
};

const PROCESSED_SRC_DATA_KEY = "imgErrorProcessedSrc";

export function registerPlugin({ prefix }: Config) {
    document.addEventListener(
        "error",
        (event) => {
            // If it's not an image, ignore
            const target = event.target;
            if (!(target instanceof HTMLImageElement)) return;

            const originalSrc = target.getAttribute("src");
            const url = new URL(originalSrc, window.location.href);

            // If it was a processed URL that failed, ignore to avoid infinite loop
            if (target.dataset[PROCESSED_SRC_DATA_KEY] === originalSrc) return;

            // If it's not from this origin, ignore
            if (url.origin !== window.location.origin) return;

            const nextSrc = `${prefix}${url.pathname}`;

            target.src = nextSrc;
            target.dataset[PROCESSED_SRC_DATA_KEY] = nextSrc;
        },
        true,
    );
}

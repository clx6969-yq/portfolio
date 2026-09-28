import assert from "node:assert/strict";
import { stat } from "node:fs/promises";
import test from "node:test";

import * as introGate from "../src/utils/introGate.js";
import { observeDeferredVideo } from "../src/utils/deferredVideoLoad.js";

test("the intro gate keeps the portfolio unmounted until entry", () => {
  assert.equal(typeof introGate.shouldMountSiteContent, "function");
  assert.equal(introGate.shouldMountSiteContent(false), false);
  assert.equal(introGate.shouldMountSiteContent(true), true);
});

test("the opening video stays within the first-load performance budget", async () => {
  const info = await stat(
    new URL("../public/placeholders/videos/intro-boot.webm", import.meta.url)
  );

  assert.ok(
    info.size <= 4_000_000,
    `intro-boot.webm is ${info.size} bytes; expected at most 4,000,000 bytes`
  );
});

test("media priority keeps off-screen assets out of the initial download", async () => {
  const policy = await import("../src/utils/mediaPriority.js").catch(() => ({}));

  assert.deepEqual(policy.priorityVideoProps, { preload: "auto" });
  assert.deepEqual(policy.deferredVideoProps, { preload: "none" });
  assert.deepEqual(policy.deferredImageProps, {
    loading: "lazy",
    decoding: "async",
  });
});

test("the outro video starts loading once its section approaches the viewport", () => {
  const region = {};
  let observedTarget = null;
  let observerOptions = null;
  let intersectionCallback = null;
  let disconnectCount = 0;

  class FakeIntersectionObserver {
    constructor(callback, options) {
      intersectionCallback = callback;
      observerOptions = options;
    }

    observe(target) {
      observedTarget = target;
    }

    disconnect() {
      disconnectCount += 1;
    }
  }

  const video = {
    preload: "none",
    loadCount: 0,
    load() {
      this.loadCount += 1;
    },
  };

  const cleanup = observeDeferredVideo({
    target: region,
    video,
    Observer: FakeIntersectionObserver,
  });

  assert.equal(observedTarget, region);
  assert.deepEqual(observerOptions, { rootMargin: "1000px 0px" });

  intersectionCallback([{ isIntersecting: false }]);
  assert.equal(video.preload, "none");
  assert.equal(video.loadCount, 0);

  intersectionCallback([{ isIntersecting: true }]);
  assert.equal(video.preload, "auto");
  assert.equal(video.loadCount, 1);
  assert.equal(disconnectCount, 1);

  intersectionCallback([{ isIntersecting: true }]);
  assert.equal(video.loadCount, 1, "loading is only requested once");

  cleanup();
});

import assert from "node:assert/strict";
import test from "node:test";

import {
  getCarouselSlots,
  moveCarouselIndex,
  wrapCarouselIndex,
} from "../src/utils/fashionCarousel.js";

test("wrapCarouselIndex loops cleanly across both ends", () => {
  assert.equal(wrapCarouselIndex(-1, 6), 5);
  assert.equal(wrapCarouselIndex(6, 6), 0);
  assert.equal(wrapCarouselIndex(13, 6), 1);
  assert.equal(wrapCarouselIndex(4, 0), 0);
});

test("moveCarouselIndex supports previous and next navigation", () => {
  assert.equal(moveCarouselIndex(0, -1, 6), 5);
  assert.equal(moveCarouselIndex(5, 1, 6), 0);
  assert.equal(moveCarouselIndex(2, 2, 6), 4);
});

test("getCarouselSlots returns the active work with two unique neighbours on each side", () => {
  const items = Array.from({ length: 8 }, (_, index) => ({ id: `look-${index}` }));
  const slots = getCarouselSlots(items, 0, 2);

  assert.deepEqual(
    slots.map(({ index, offset }) => ({ index, offset })),
    [
      { index: 6, offset: -2 },
      { index: 7, offset: -1 },
      { index: 0, offset: 0 },
      { index: 1, offset: 1 },
      { index: 2, offset: 2 },
    ]
  );
  assert.equal(new Set(slots.map(({ index }) => index)).size, slots.length);
});

test("getCarouselSlots avoids duplicate cards in very small collections", () => {
  const items = [{ id: "a" }, { id: "b" }, { id: "c" }];
  const slots = getCarouselSlots(items, 1, 2);

  assert.deepEqual(slots.map(({ index }) => index), [0, 1, 2]);
  assert.deepEqual(slots.map(({ offset }) => offset), [-1, 0, 1]);
});

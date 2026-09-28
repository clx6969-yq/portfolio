/**
 * 将任意序号安全地收进轮播范围内，让首尾可以无缝循环。
 */
export function wrapCarouselIndex(index, total) {
  if (!Number.isFinite(total) || total <= 0) return 0;
  return ((index % total) + total) % total;
}

export function moveCarouselIndex(currentIndex, step, total) {
  return wrapCarouselIndex(currentIndex + step, total);
}

/**
 * 只返回主卡与左右邻近卡片，避免一次加载几十张高清图。
 * offset 为 0 的是主卡，负数在左，正数在右。
 */
export function getCarouselSlots(items, activeIndex, radius = 2) {
  if (!Array.isArray(items) || items.length === 0) return [];

  const safeActiveIndex = wrapCarouselIndex(activeIndex, items.length);
  const safeRadius = Math.max(0, Math.floor(radius));
  const visibleRadius = Math.min(safeRadius, Math.floor((items.length - 1) / 2));

  return Array.from({ length: visibleRadius * 2 + 1 }, (_, slotIndex) => {
    const offset = slotIndex - visibleRadius;
    const index = wrapCarouselIndex(safeActiveIndex + offset, items.length);

    return {
      item: items[index],
      index,
      offset,
    };
  });
}

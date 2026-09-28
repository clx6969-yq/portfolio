/**
 * 为“每张图就是一个作品”的分类生成统一数据。
 * 详情图数组保持为空，这样点击封面后只放大当前这一张。
 */
export function formatSourceTitle(fileName) {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/^\d+_?/, "")
    .split("_")
    .filter(Boolean)
    .join(" · ");
}

export function makeSingleImageItems({
  idPrefix,
  titlePrefix,
  titleCnPrefix,
  tag,
  basePath,
  count,
  sourceNames,
}) {
  const itemCount = sourceNames?.length ?? count;

  return Array.from({ length: itemCount }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    const sourceName = sourceNames?.[index];

    return {
      id: `${idPrefix}-${number}`,
      title: sourceName ? formatSourceTitle(sourceName) : `${titlePrefix} ${number}`,
      titleCn: sourceName ? "" : `${titleCnPrefix} ${number}`,
      tag,
      cover: `${basePath}/look-${number}.png`,
      images: [],
    };
  });
}

/**
 * 切出当前页，并同时返回页数和全局起始序号，供书脊继续显示总编号。
 */
export function paginateItems(items, requestedPage, pageSize) {
  const safePageSize = Math.max(1, pageSize);
  const pageCount = Math.max(1, Math.ceil(items.length / safePageSize));
  const page = Math.min(Math.max(1, requestedPage), pageCount);
  const startIndex = (page - 1) * safePageSize;

  return {
    items: items.slice(startIndex, startIndex + safePageSize),
    page,
    pageCount,
    startIndex,
  };
}

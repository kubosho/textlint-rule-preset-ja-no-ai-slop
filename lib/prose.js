function blank(text) {
  return text.replace(/[^\n]/g, " ");
}

function maskQuotes(line) {
  let masked = line;
  let depth = 0;
  let start = 0;

  for (let index = 0; index < line.length; index++) {
    if (line[index] === "「" || line[index] === "『") {
      if (depth === 0) start = index;
      depth++;
    } else if ((line[index] === "」" || line[index] === "』") && depth > 0) {
      if (--depth === 0) {
        masked = masked.slice(0, start) + blank(line.slice(start, index + 1)) + masked.slice(index + 1);
      }
    }
  }

  return masked;
}

function maskNonProse(source) {
  let fence;

  return source
    .replace(/^---\n[\s\S]*?\n---(?=\n|$)/, blank)
    .replace(/<!--[\s\S]*?-->/g, blank)
    .split("\n")
    .map((line) => {
      const marker = line.match(/^\s*(`{3,}|~{3,})/)?.[1];
      if (fence !== undefined) {
        const closing = line.match(/^\s*(`{3,}|~{3,})\s*$/)?.[1];
        if (closing?.[0] === fence[0] && closing.length >= fence.length) fence = undefined;
        return blank(line);
      }
      if (marker !== undefined) {
        fence = marker;
        return blank(line);
      }
      if (/^\s*>/.test(line)) return blank(line);
      return maskQuotes(line.replace(/(`+)(?!`)[^\n]*?[^`\n]\1(?!`)/g, blank));
    })
    .join("\n");
}

function sentences(document) {
  const source = document.raw;
  let prose = maskNonProse(source);

  function excludeBlockQuotes(node) {
    if (node.type === "BlockQuote") {
      prose = prose.slice(0, node.range[0]) + blank(prose.slice(...node.range)) + prose.slice(node.range[1]);
      return;
    }
    for (const child of node.children || []) excludeBlockQuotes(child);
  }
  excludeBlockQuotes(document);

  return Array.from(prose.matchAll(/[^\n。！？!?]+[。！？!?]*/g), (match) => ({
    start: match.index,
    // Excluded spans are spaces, not removed, so indices still refer to the original source.
    prose: match[0],
    original: source.slice(match.index, match.index + match[0].length),
  }));
}

export { sentences };

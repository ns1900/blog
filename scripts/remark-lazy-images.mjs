/**
 * remark 插件：为 Markdown 图片自动补上 loading="lazy" / decoding="async"，
 * 保证「正文里直接插入的图片」也具备响应式 + 延迟加载。
 * （Astro 会在构建时把尺寸写进 width/height，天然防抖动。）
 */
export default function remarkLazyImages() {
  return (tree) => {
    const visit = (node) => {
      if (!node || typeof node !== 'object') return;

      if (node.type === 'image') {
        node.data ??= {};
        const props = (node.data.hProperties ??= {});
        if (props.loading === undefined) props.loading = 'lazy';
        if (props.decoding === undefined) props.decoding = 'async';
        if (node.alt === undefined || node.alt === null) node.alt = '';
      }

      // 纯图片成段时居中展示
      if (
        node.type === 'paragraph' &&
        Array.isArray(node.children) &&
        node.children.length === 1 &&
        node.children[0].type === 'image'
      ) {
        node.data ??= {};
        node.data.hName = 'figure';
        node.data.hProperties = { className: 'md-figure' };
      }

      if (Array.isArray(node.children)) node.children.forEach(visit);
    };

    visit(tree);
  };
}

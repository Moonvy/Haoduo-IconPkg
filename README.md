# Haoduo IconPkg

[Iconify](https://iconify.design/) Icon Web Components based SVG Symbols

**[Preview | 立即预览](https://moonvy.github.io/Haoduo-IconPkg/iconpkg/)**

[Iconify](https://iconify.design/) 图标包 IconPkg SVG Symbols 格式

通过 Web Component 简单的调用 iconify 的图标包，跨框架（Vue, React, Angular, Svelte 等）使用 iconify 的图标包。

- SVG Symbols 多个 SVG 图标合并成在一个 SVG 文件中，可以避免大量小文件带来的存储问题
- SVG Symbols 分片，使用一个图标只会加载对应的 SVG Symbols 分片文件，避免大型图标包，使用一个图标就要加载全部图标的窘境
- Web Component 跨框架使用，无论使用 Vue, React, Angular, Svelte 等框架或者不使用任何框架，都可以使用 `<hd-icon name="fluent-color:alert-20"></hd-icon>` 标签来调用图标

## 安装

```bash
npm install haoduo-iconpkg
```

```js
// 自动注册 haoduo-iconpkg  Web Component
import "haoduo-iconpkg/fluent-color";
```

## 使用

```html
<hd-icon icon="fluent-color:alert-20"></hd-icon>
```

## 什么是 IconPkg

IconPkg 是把图标作为 SVG Symbols 调用的一直方式，它会把全部图标包打包成多个 SVG 分片文件，每个分片文件包含多个 SVG Symbols，用户通过跨框架的 Web Component 的方式来调用图标组件，图标组件会自动加载对应的 SVG 分片文件，然后渲染对应的 SVG Symbols。

相比每个图标存储一个 SVG 文件，IconPkg 避免大量小文件带来的存储成本膨胀，相比所有图标一个 SVG 文件，IconPkg 又可以实际使用加载对应的 SVG 分片文件，避免大型图标包，使用一个图标就要加载全部图标的问题

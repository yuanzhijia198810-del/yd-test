# yd-monorepo

一个基于 pnpm 的前端 Monorepo，包含两个私有包：

- `yd-libs`：通用工具库，提供日志和数值计算能力。
- `yd-hooks`：React Hooks 集合，内部依赖 `yd-libs`。

## 快速开始

在首次开发之前请确保已经启用了 [Corepack](https://nodejs.org/api/corepack.html)，这样可以在同一台机器上同时管理 pnpm 与 yarn。

```bash
corepack enable
```

随后安装依赖：

```bash
pnpm install
```

> 项目使用 pnpm 进行依赖管理和包间协作，所有日常开发命令都通过 pnpm 触发。

## 常用脚本

- `pnpm build`：构建所有包，输出到各自的 `dist/` 目录。
- `pnpm test`：在 JSDOM 环境下运行 Vitest 单元测试。
- `pnpm lint`：调用 TypeScript 的类型检查。
- `pnpm clean`：清理所有包的构建产物。

## 包结构

```
packages/
  yd-libs/
    src/
      index.ts            # 导出 Logger 与 calculateAverage
  yd-hooks/
    src/
      index.ts            # 导出 useLogger 与 useAverage（依赖 yd-libs）
```

两个包都使用 [tsup](https://tsup.egoist.dev/) 进行打包，生成 CommonJS 和 ES Module 双格式并输出类型声明文件。

## 使用 yarn 发版

虽然仓库的日常开发依赖 pnpm，但发布流程使用 yarn 4。推荐的做法是：

1. 确保当前环境可使用 yarn（默认 Corepack 会提供 `yarn 4.9.x`）。
2. 在发版前执行 `pnpm build` 与必要的验证流程。
3. 通过以下命令对所有需要发布的包执行 `npm publish`（默认访问权限为 `restricted`）：

   ```bash
   yarn workspaces foreach -pt npm publish --access restricted
   ```

   该命令会按依赖拓扑顺序逐个发布 workspace 包，确保 `yd-hooks` 在依赖的 `yd-libs` 之后发布。

如需指定版本号或 tag，可在发布前使用 `pnpm version <new-version>` 更新对应包的版本信息。

## 测试策略

- `yd-libs` 使用 Vitest 对数值计算与 Logger 进行基础单元测试。
- `yd-hooks` 借助 `@testing-library/react` 的 `renderHook` 验证与 `yd-libs` 的集成以及 Hooks 的行为。

## 后续规划

- 根据业务需求扩展 `yd-libs` 中的工具函数，并在 `yd-hooks` 中复用。
- 在 CI 流程中加入发布前校验（lint/build/test），保证使用 yarn 发版时的稳定性。

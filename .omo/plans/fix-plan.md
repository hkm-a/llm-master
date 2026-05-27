# LLM Master — 修复实施计划

## 目标
基于架构评估与代码审查结果，按优先级迭代修复所有问题。

## 实施阶段

### Phase 0: 安全修复 (P0)
1. **CSP安全策略配置**
   - 文件: `src-tauri/tauri.conf.json`
   - 操作: 将 `security.csp` 从 `null` 改为严格的 CSP 策略
   - 验收: CSP 策略生效，应用正常启动

2. **限制 shell:allow-execute 权限**
   - 文件: `src-tauri/capabilities/default.json`
   - 操作: 移除 `shell:allow-execute` 通配权限，或限制为安全参数
   - 验收: 权限配置收紧，不用的权限不再开放

3. **修复 KaTeX CDN integrity hash**
   - 文件: `index.html`
   - 操作: 添加正确的 SRI integrity 属性
   - 验收: integrity 校验通过

### Phase 1: 稳定性修复 (P1)
4. **添加 Error Boundary**
   - 新建: `src/components/ErrorBoundary.tsx`
   - 修改: `src/App.tsx`
   - 操作: 创建 ErrorBoundary 组件包裹 RouterProvider
   - 验收: 渲染错误时展示 fallback UI 而非白屏

5. **重构课程路由为数据驱动**
   - 修改: `src/lib/content/types.ts` — 添加 `LessonId` 联合类型
   - 修改: `src/lib/content/chapters.ts` — 添加课程 ID → 推导步骤映射
   - 修改: `src/pages/Lesson.tsx` — 重构为数据驱动
   - 验收: 课程路由不依赖硬编码，新增课程只需配置数据

### Phase 2: 可维护性提升 (P1-P2)
6. **优化 Zustand 选择器 + 消除进度计算重复**
   - 修改: `src/stores/progressStore.ts` — 添加 `completedCount`/`inProgressCount` 计算属性
   - 修改: `src/components/ui/Sidebar.tsx` — 使用精确选择器避免全量 re-render
   - 验收: 各组件使用优化后的选择器，减少不必要的渲染

7. **Sidebar 布局改用更好的方案**
   - 修改: `src/components/ui/Layout.tsx`
   - 修改: `src/components/ui/Sidebar.tsx`
   - 操作: 改进侧边栏折叠的布局方案
   - 验收: 折叠动画流畅，布局正确

### Phase 3: 测试补充 (P2)
8. **添加缺失的测试**
   - 新建: 各页面组件测试
   - 新建: derivation 组件测试
   - 验收: 核心组件和页面有基础渲染测试

9. **Rust 后端添加单元测试**
   - 修改: `src-tauri/src/commands.rs` — 添加 `#[cfg(test)]` 模块
   - 验收: Rust 测试通过

## 执行策略
- 每个 Phase 独立可验证
- Phase 内部若有独立工作，并行委托 subagent 执行
- 每次变更后运行 `lsp_diagnostics` + 测试验证

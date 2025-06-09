# 项目结构

- resume-builder/
  - package.json
  - tsconfig.json 
  - tailwind.config.js
  - next.config.js
  - components.json
  - src/
    - app/
      - layout.tsx
      - page.tsx
      - globals.css
    - components/
      - ui/
        - card.tsx
        - button.tsx
        - input.tsx
        - textarea.tsx
        - label.tsx
        - dialog.tsx
        - select.tsx
        - badge.tsx
        - alert.tsx
      - resume-builder.tsx
    - lib/
      - utils.ts
    - types/
      - resume.ts


主要功能特点：

✅ 实时编辑预览：左右分屏，实时同步
✅ 完整数据管理：个人信息、工作经历、教育背景、开源项目、技能
✅ AI优化功能：支持OpenAI协议的API调用
✅ PDF导出：基于浏览器打印功能
✅ 响应式设计：支持不同屏幕尺寸
✅ 无障碍支持：完整的键盘导航和屏幕阅读器支持
✅ TypeScript：完整的类型安全
✅ 组件化架构：易于维护和扩展

部署：
```bash
npm run build

```

开发
```bash
npm i
npm run dev
```
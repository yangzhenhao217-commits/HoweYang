# 杨振豪 · 个人作品集

一个可直接部署到 GitHub Pages 的静态个人作品集。履历优先，作品分为七个章节：

1. 网站设计与上线：RSC 智能测算工具与经营提效
2. 网易云音乐数据分析：1,330 个歌单、18,484 条歌曲记录与 11 个分析模块
3. 行业分析与研究：产业、AI 算力及电力行业
4. 商业计划书：岩安视界
5. 商务谈判：A 轮融资策划
6. 社会实践与调研：农村养老服务与三胎政策下的生育意愿
7. 设计作品集：海报、活动物料与视觉练习

## 本地预览

```bash
python3 -m http.server 4173 --directory dist
```

浏览器打开 `http://localhost:4173`。

## 部署到 GitHub Pages

1. 在 GitHub 新建仓库并推送本目录。
2. 进入 `Settings → Pages`，将 Source 设为 `GitHub Actions`。
3. 推送到 `main` 后，工作流会自动发布 `dist/`。

## 设计与技术说明

- 零框架、零运行时依赖，适合 GitHub Pages 静态托管。
- 响应式布局、键盘操作、Reduced Motion 支持。
- RSC 原站可在作品区内实时操作，并支持站内放大与新窗口打开。
- PDF、图片和视频均支持站内预览，同时保留新窗口打开能力。
- 视觉采用高留白、强层级与克制动效，不复刻任何参考站。
- 农村养老调研报告的网页副本保留可选文字，并压缩大幅图片以加快打开速度；原始文件仍保留在作品集根目录。

## GitHub 调研参考

调研过 `diyoriko/portfolio-template`、`miksrv/developer-portfolio-website`、`loneshaana/personal_web` 等 GitHub Pages / 静态作品集方案。最终未直接套用模板，而是保留了其中值得借鉴的静态部署、内容数据化、可访问性和单页导航思路。

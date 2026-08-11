# TD_MiniMax_H3_Prompt
API_KEY申请地址：https://api.aitudou.net
用于 ComfyUI 的 TD MiniMax H3 结构提示词增强节点。

## 节点功能

插件只注册一个节点：`TD MiniMax H3 提示词`。

节点输入：

1. 任务类型：中文选择 T2VA、I2VA、FL2VA、L2VA 或 Ref2VA；
2. 视频时长：目标秒数；
3. 用户需求：描述希望生成的视频；
4. API Key：Seedance.nz API Key；
5. 素材：根据任务类型自动显示需要的入口。

节点只输出一个字符串：`H3提示词`。不包含模型加载器、VAE、Conditioning、Latent、采样器或其他生成节点。

## 内置 API

- 地址：`https://api.aitudou.net/v1/chat/completions`
- 模型：`deepseek/deepseek-v4-flash`

API Key 可以填写在节点中，也可以通过环境变量 `SEEDANCE_API_KEY` 或 `TD_H3_API_KEY` 提供。

## 快捷编辑

素材入口规则：

- T2VA：不显示素材入口；
- I2VA：只显示一张首帧图片；
- FL2VA：显示首帧和尾帧图片；
- L2VA：只显示一张尾帧图片；
- Ref2VA：按连接顺序动态增加参考素材入口，最多 15 个。

编辑器操作：

- 输入 `@`：插入已连接素材的引用标签；
- 输入 `#`：选择语言并插入可编辑台词块；
- 台词块中按 `Enter`：结束台词并在下一行继续普通描述；
- 在台词开头按 `←`，或在末尾按 `→`：把光标移出台词块；
- 按 `Esc` 或 `Tab`：退出台词块，`Shift+Tab` 从左侧退出；
- 清空台词、在空台词中按 `Backspace/Delete`，或点击右侧 `×`：删除台词块。
- 光标位于台词块外侧时，可在块后按 `Backspace`、在块前按 `Delete`，也可以选中整个台词块后删除。

工作流保存或节点执行时，界面标签会自动序列化为 H3 使用的 `<Picture N>`、`<Video N>`、`<Audio N>` 和 `<d>[Language] ...</d>`。素材不会上传给提示词 API，真实参考媒体仍由下游 MiniMax H3 工作流连接。

## TD 规则

- T2VA、I2VA、FL2VA、L2VA 使用 `guides/VIDEO_PROMPT_WRITING_GUIDE_base_en.md`；
- Ref2VA 使用 `guides/VIDEO_PROMPT_WRITING_GUIDE_ref_en.md`；
- Ref2VA 输出六段式结构：`subject_definitions`、`summary`、`retention_analysis`、`detailed_description`、`overall_soundscape`、`non_diegetic_music`。

## 安装

将 `TD_MiniMax_H3_Prompt` 文件夹放入 `ComfyUI/custom_nodes/`，重启 ComfyUI 后在浏览器按 `Ctrl+F5`。

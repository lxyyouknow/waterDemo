# Water Pouring Puzzle 项目设计总结

## 1. 文档目的

这份文档用于：

- 让其他 agent / 模型快速接手当前项目
- 帮助后续把项目从当前 `React + Vite` 方案迁移到 `Egret`、`Cocos` 或其他框架
- 在重构时保留现有玩法规则、数据结构和状态流转逻辑

这份文档关注的是“项目设计思路”和“模块边界”，而不是只描述现在的前端写法。

## 2. 项目当前定位

这是一个“水排序 / 倒液体”类休闲解谜游戏原型，但当前包装主题不是传统试管，而是偏“霓虹酒吧调酒”风格。

当前版本的目标不是做大量关卡内容，而是先验证以下几件事：

- 基础倒水玩法是否跑通
- 规则系统是否可扩展
- 目标进度和关卡完成判定是否能与倒水玩法解耦
- UI 动画和玩法状态是否能分层组织

从代码现状看，这个项目已经具备一个比较好的方向：

- “纯玩法内核”基本集中在 `src/game`
- “关卡配置”集中在 `src/data`
- “表现层”集中在 `src/components`

这意味着它已经有一定的“可迁移性”，只是还没有彻底抽成框架无关内核。

## 3. 当前玩法定义

当前关卡是一个单关原型，核心规则如下：

- 棋盘上有多个杯子，每个杯子有若干颜色层
- 玩家点击一个源杯，再点击目标杯进行倒液体
- 只能把顶部连续同色液体倒出去
- 目标杯必须是空杯，或者顶部颜色与源杯顶部颜色相同
- 目标杯不能超过容量
- 当某个杯子被填满且整杯同色时，视为“完成”
- 当前规则会在完成后立即把该杯“端走”
- 被端走的杯子会清空，并标记为 `served`
- 关卡目标不是“所有杯子变同色后留在场上”，而是“按目标数量完成并端走杯子，最后场上清空”

这和经典 water sort 的差异点在于：

- 完成杯子后不是静态保留，而是直接“结算并移除”
- 关卡完成依赖“目标进度 + 场上清空”
- 设计上更像“调酒出杯 / 完成订单”

## 4. 当前技术栈

- UI 框架：`React 19`
- 构建工具：`Vite`
- 语言：`TypeScript`
- 测试：`Vitest`

当前入口主要在：

- [src/App.tsx](/E:/Work/WaterPouringPuzzle/src/App.tsx)
- [src/game/useGameController.ts](/E:/Work/WaterPouringPuzzle/src/game/useGameController.ts)

## 5. 目录和模块职责

### 5.1 `src/game`

这是当前最接近“玩法内核”的部分。

- [src/game/engine.ts](/E:/Work/WaterPouringPuzzle/src/game/engine.ts)
  - 杯子状态创建
  - 倒水合法性判断
  - 实际执行倒水
  - 初始关卡状态生成
- [src/game/rules.ts](/E:/Work/WaterPouringPuzzle/src/game/rules.ts)
  - 规则注册表
  - 倒水后的规则处理
  - 关卡完成判定
- [src/game/useGameController.ts](/E:/Work/WaterPouringPuzzle/src/game/useGameController.ts)
  - 当前项目的“状态编排层”
  - 负责把引擎、规则、动画、历史记录、UI 状态串起来
- [src/game/storage.ts](/E:/Work/WaterPouringPuzzle/src/game/storage.ts)
  - 本地进度读写
- [src/game/colors.ts](/E:/Work/WaterPouringPuzzle/src/game/colors.ts)
  - 颜色映射，偏表现层支持

### 5.2 `src/data`

- [src/data/levels.ts](/E:/Work/WaterPouringPuzzle/src/data/levels.ts)
  - 关卡配置
  - 规则说明弹窗配置

这是后续最适合继续扩展内容生产的区域。

### 5.3 `src/components`

这是纯表现层。

- [src/components/LevelScene.tsx](/E:/Work/WaterPouringPuzzle/src/components/LevelScene.tsx)
  - 主游戏场景
  - 杯子布局
  - HUD
  - 倒水动画覆盖层
- [src/components/BottleView.tsx](/E:/Work/WaterPouringPuzzle/src/components/BottleView.tsx)
  - 单个杯子的视觉表现
- [src/components/PourEffectOverlay.tsx](/E:/Work/WaterPouringPuzzle/src/components/PourEffectOverlay.tsx)
  - 倒水轨迹特效
- [src/components/HudBar.tsx](/E:/Work/WaterPouringPuzzle/src/components/HudBar.tsx)
  - 顶部目标与进度
- [src/components/RuleIntroModal.tsx](/E:/Work/WaterPouringPuzzle/src/components/RuleIntroModal.tsx)
  - 新规则提示
- [src/components/VictoryOverlay.tsx](/E:/Work/WaterPouringPuzzle/src/components/VictoryOverlay.tsx)
  - 通关弹层

另外还有 [src/components/MainScene.tsx](/E:/Work/WaterPouringPuzzle/src/components/MainScene.tsx)，但当前 `App` 中没有启用，属于保留中的主菜单方案。

## 6. 核心数据模型

核心类型都定义在 [src/types.ts](/E:/Work/WaterPouringPuzzle/src/types.ts)。

### 6.1 BottleConfig / BottleState

可以把它理解为：

- `BottleConfig`：静态配置
- `BottleState`：运行时状态

关键字段：

- `id`：唯一标识
- `layers`：液体层，从底到顶存储
- `capacity`：容量，默认 4
- `type`：杯子类型，当前有 `normal / frozen / blocked`
- `statusEffects`：状态效果扩展口
- `completed`：是否完成
- `locked`：是否锁定
- `served`：是否已被端走

其中 `served` 很重要，它体现了当前项目和传统 water sort 的设计差异。

### 6.2 ObjectiveConfig / RewardProgressState

这是“关卡目标”和“目标进度”的抽象。

当前目标不是直接绑定某个具体杯子，而是绑定“完成多少杯”。

关键字段：

- `targetCompletedBottles`：目标完成数
- `rewardName` / `rewardIcon`：完成奖励展示
- `current` / `target` / `percent`：运行时进度
- `completedBottleIds`：已经结算的杯子列表

当前实现里，`targetColor` 和 `targetQueue` 已经留了扩展空间，但现阶段进度更新实际上主要按 `served` 数量统计，还没有真正做颜色队列消费逻辑。

### 6.3 LevelRule

这是整个项目里最值得保留的设计之一。

`LevelRule` 提供了 3 个扩展时机：

- `canPour`
  - 倒水前校验
- `afterPour`
  - 倒水后加工状态、产生事件
- `isLevelCleared`
  - 关卡完成判定

它的意义是把“规则变化”从“基础倒水算法”中拆出来。

如果将来要做这些变体，这个接口很适合继续用：

- 冰冻杯 / 解锁杯
- 指定颜色订单
- 特殊障碍杯
- 限步数
- 连击奖励
- 特殊杯型容量差异

### 6.4 GameSnapshot

这是当前关卡的核心快照：

- `bottles`
- `rewardProgress`
- `selectedBottleId`
- `events`
- `completed`

这个结构已经很接近“跨框架通用状态”了，后续迁移时建议保留。

## 7. 当前运行流程

## 7.1 初始化

在 `useGameController` 中：

1. 读取本地进度
2. 选择当前关卡
3. 调用 `createLevelState(level)` 生成初始快照
4. 初始化 UI 相关状态

## 7.2 玩家点击流程

点击杯子时，当前逻辑大致是：

1. 如果正在播放胜利弹层、规则弹层、倒水动画，则不响应
2. 如果当前还没选源杯
   - 空杯不可作为起点
   - 否则记录 `selectedBottleId`
3. 如果点击的是已选中的杯子
   - 取消选择
4. 如果已有源杯且点击了其他杯子
   - 调用 `canPourBottle(...)`
   - 合法则 `performPour(...)`
   - 然后逐条执行 `rule.afterPour(...)`
   - 再执行 `evaluateLevelCleared(...)`
   - 最后进入动画和状态提交流程

## 7.3 倒水后状态流转

倒水成功后，系统会：

1. 生成 `events`
2. 更新 `bottles`
3. 更新 `rewardProgress`
4. 记录 `history` 供撤回
5. 播放倒水动画
6. 动画结束后把新快照真正提交给界面
7. 若通关则显示胜利弹层，并发奖励

这里的关键点是：

- 玩法计算先完成
- UI 状态不是立刻提交，而是延迟到动画完成后提交

这是一种“表现层时序控制”，不是玩法内核必须逻辑。

## 8. 事件设计

项目里已经有基础事件流概念：

- `BottleCompleted`
- `BottleServed`
- `ObjectiveProgressChanged`
- `LevelCleared`
- `RuleUnlocked`

虽然当前事件系统还比较轻量，但方向是对的。它适合未来做：

- 动画触发
- 音效触发
- 埋点统计
- 教学引导
- 连锁规则响应

建议后续继续把“状态变化”和“表现反馈”通过事件分离，而不是直接在 UI 中硬编码判断。

## 9. 当前规则系统的真实行为

当前启用了两条规则：

### 9.1 `standard-pour`

职责：

- 检查哪些杯子在倒水后达成“整杯同色且满杯”
- 触发 `BottleCompleted`
- 紧接着触发 `BottleServed`
- 将该杯标记为已端走并清空

注意：

- `completed` 不是一个会长期保留的状态
- 因为杯子完成后会立刻转为 `served` 并清空

### 9.2 `target-color-reward`

职责：

- 统计已 `served` 的杯子数量
- 更新目标进度
- 判断是否满足关卡完成条件

当前它名字里虽然有 `target-color`，但实际实现更偏“完成杯数目标”，颜色校验并不严格。

如果后续要做真正的“指定颜色订单”，这里需要继续补强。

## 10. 当前项目里最值得保留的设计思路

### 10.1 用配置定义关卡

关卡数据不写死在组件里，而是放在 `levels.ts` 中。

这很好，后续可以继续演化成：

- JSON 关卡文件
- Excel / 配表导入
- 编辑器导出格式

### 10.2 用规则对象扩展玩法

这比把所有特殊逻辑都塞进 `performPour` 更可维护。

建议以后继续坚持：

- 基础引擎只负责通用倒水算法
- 变体规则放在 rule 层

### 10.3 用快照支持撤回

当前 `history` 保存的是完整 `GameSnapshot`。

优点：

- 简单直观
- 适合原型期

缺点：

- 长期看可能偏重
- 后面如果关卡很大，可能要改成“命令记录 + 反向执行”或差量存储

但在现在这个规模下，完整快照法是合理的。

## 11. 当前项目和 React/Vite 的耦合点

如果未来要迁移框架，最需要识别的是哪些逻辑不是“玩法本身”，而只是“现在 React 这么写”。

当前耦合点主要有这些：

### 11.1 `useGameController` 同时承担了太多职责

它现在同时负责：

- 关卡初始化
- 持久化
- 玩家输入编排
- 规则执行
- 历史记录
- 动画时序
- Toast
- 胜利弹层
- 规则介绍弹层

这对 React 来说能跑，但如果迁移到 Egret / Cocos，会变成一个很难直接复用的文件。

### 11.2 动画与状态提交绑定在 `setTimeout`

当前倒水流程依赖：

- `moveDuration`
- `pourDuration`
- `window.setTimeout`

这类逻辑迁移到游戏引擎后，通常应该改成：

- 动画系统回调
- 时间轴/序列动画完成事件
- 状态机步骤推进

### 11.3 存档直接依赖 `localStorage`

这会限制运行环境。

以后建议抽成接口：

- `ProgressRepository.load()`
- `ProgressRepository.save(progress)`

浏览器环境可用 `localStorage`
其他引擎可用本地文件、平台存储或 SDK

### 11.4 位置计算依赖 DOM

`LevelScene.tsx` 里通过：

- `getBoundingClientRect()`
- `ref`

来计算倒水轨迹。

这套逻辑在 Canvas / Egret / Cocos 中不能直接复用，但“从源杯到目标杯生成一条倒水曲线”这个思路是可以保留的。

## 12. 推荐的重构目标架构

如果要为未来迁移做准备，建议逐步拆成 4 层。

### 12.1 Core 层：纯玩法内核

建议目录：

- `src/core/`

职责：

- 类型定义
- 杯子状态转换
- 倒水合法性校验
- 倒水执行
- 规则执行
- 胜负判定
- 事件产出

要求：

- 不依赖 React
- 不依赖 DOM
- 不依赖浏览器 API
- 尽量只做纯函数

这一层将来可以直接搬去 Egret / Cocos。

### 12.2 Application 层：流程编排

建议目录：

- `src/application/`

职责：

- 响应玩家输入
- 调用 core
- 管理历史记录
- 管理当前局状态机
- 把“立即结果”拆成“逻辑结果”和“演出步骤”

例如可以把一次操作拆成：

1. 选中源杯
2. 校验目标杯
3. 计算倒水结果
4. 生成演出命令
5. 演出完成后提交最终状态

这一层本质上是“游戏流程控制器”，未来在任意引擎里都需要。

### 12.3 Presentation 层：表现适配

React 版本中负责：

- 组件渲染
- 动画
- HUD
- 弹窗

Egret / Cocos 版本中负责：

- 节点创建
- 场景管理
- 时间轴动画
- 点击命中

### 12.4 Infrastructure 层：平台能力

职责：

- 存档
- 音效
- 资源加载
- 平台适配

这层最适合做接口化，避免 core 和 application 直接绑死平台。

## 13. 建议保留的跨框架抽象

如果要让其他 agent 更容易协作，建议未来明确这些抽象名词：

### 13.1 `GameSession`

表示当前一局游戏。

可包含：

- 当前关卡配置
- 当前快照
- 历史记录
- 演出中的动作

### 13.2 `GameAction`

表示玩家或系统触发的一次动作。

例如：

- `SelectBottle`
- `PourBottle`
- `Undo`
- `ResetLevel`
- `DismissRuleIntro`

### 13.3 `GameCommand`

表示需要表现层执行的命令。

例如：

- `PlayPourAnimation`
- `ShowToast`
- `ShowVictory`
- `ShowRuleIntro`
- `PlayServeEffect`

这样能把“逻辑计算结果”和“界面怎么演”拆开。

### 13.4 `GameReducer` 或 `GameService`

不管名字叫什么，建议有一个统一入口负责：

- 接受 action
- 更新状态
- 返回新状态与演出命令

这会比把逻辑散在多个 hook / scene / callback 中更利于迁移。

## 14. 迁移到 Egret / Cocos 时的建议

## 14.1 不要先搬 UI，先搬玩法内核

推荐顺序：

1. 把 `engine.ts + rules.ts + types.ts` 整理成框架无关模块
2. 把 `useGameController` 中的流程逻辑抽成普通类或纯函数控制器
3. 在新引擎里重新实现表现层
4. 最后再恢复动画、弹窗、特效和音效

如果一开始就直接照着 React 组件翻译，后面会很容易越写越乱。

## 14.2 Cocos 更适合这类项目

从当前项目特征看：

- 有明显的场景概念
- 有节点动画
- 有触摸交互
- 有 HUD 和弹层
- 后续可能扩展更多关卡和特效

所以相比 Egret，`Cocos` 一般会更自然一些，特别是：

- 2D 节点体系更完整
- 动画、坐标、资源管理更成熟
- 做移动端休闲游戏生态更常见

`Egret` 也能做，但如果目标是后续持续迭代休闲关卡项目，`Cocos` 往往更顺手。

当然，真正是否切换，取决于你更看重：

- Web 轻量试玩：当前 React 方案仍然方便
- 游戏化演出和后续扩展：Cocos 会更合适

## 14.3 新框架里建议的最小模块划分

如果迁移到 Cocos / Egret，建议至少分成这些类：

- `LevelConfigRepository`
- `GameEngine`
- `RuleProcessor`
- `GameSessionController`
- `BoardScene`
- `BottleNodeView`
- `HudView`
- `OverlayView`
- `ProgressStorage`

这会比“一个场景脚本里全写完”更利于长期演化。

## 15. 当前代码里的已知问题和注意点

### 15.1 只有 Level 1，且控制器基本写死在第 1 关

在 `useGameController` 里，多处逻辑直接固定使用 `1`：

- 初始化关卡
- `persistLevelProgress`
- `resetWithLevel`
- `openLevel`
- 通关后记录

说明当前还是“单关原型”，还没有真正进入多关卡流程。

### 15.2 `shuffleLevelBoard` 写死了空杯 id

当前打乱逻辑把 `b4` 和 `b8` 当作固定空杯。

这意味着：

- 关卡生成逻辑对当前关卡结构有硬编码
- 以后加新关卡时需要重构

更合理的方式是让关卡配置明确声明哪些杯子初始为空，或者直接按配置判断。

### 15.3 目标系统预留多，真实逻辑少

虽然 `ObjectiveConfig` 已经有：

- `targetColor`
- `targetQueue`
- `rewardIcon`

但现在进度更新主要只是统计 `served` 杯子数。

如果未来想做更强的“订单玩法”，需要把“完成的杯子颜色”纳入真正判定逻辑。

### 15.4 文案存在编码异常

当前多个文件中的中文文本已出现乱码。

这说明项目里可能发生过编码不一致问题。后续如果继续维护 UI 文案，建议统一检查文件编码为 `UTF-8`。

## 16. 推荐给其他 agent 的接手说明

如果让其他 agent 继续开发，建议它们优先遵守这几个原则：

1. 不要把新玩法规则直接塞进 `performPour`
2. 优先通过 `LevelRule` 扩展机制加规则
3. 把 `useGameController` 视为“待拆分”的应用层，而不是最终结构
4. 保持 `types.ts` 中核心数据结构稳定
5. 关卡内容尽量继续走配置化
6. 做框架迁移时，先保核心，再重建表现层

可以直接给其他 agent 的简版任务描述如下：

> 这是一个以调酒/出杯为包装的 water sort 原型。核心玩法在 `src/game/engine.ts` 和 `src/game/rules.ts`，UI 在 `src/components`。当前最重要的设计目标不是保留 React 写法，而是保留“纯倒水内核 + 可扩展规则系统 + 关卡配置化 + 演出层分离”的结构。若要迁移到 Egret/Cocos，请先抽离 core 和 application 层，再重建 scene/view。

## 17. 建议的下一步

如果你准备继续把这个项目做成“更容易切框架”的版本，推荐下一步按这个顺序做：

1. 把 `useGameController` 拆成纯 TS 控制器和 React 适配层
2. 把 `storage` 抽象成接口
3. 把动画时序从 `setTimeout` 改成命令式演出队列
4. 把关卡切换、多关卡解锁流程真正做通
5. 把 `shuffleLevelBoard` 去硬编码
6. 统一修复乱码文案和编码问题

## 18. 一句话总结

这个项目当前最核心的设计思路可以概括为：

**用纯倒水算法作为内核，用规则对象扩展玩法，用关卡配置驱动内容，用控制器编排状态与演出，再让表现层只是消费状态和命令。**

如果后面要换 `Egret` 或 `Cocos`，真正应该迁移的是这套结构，而不是当前 React 组件本身。

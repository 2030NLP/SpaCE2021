# 中文空间语义理解评测

---

**最新消息**

- `2021-05-05` **启用新网站**： [SpaCE2021](http://ccl.pku.edu.cn:8084/SpaCE2021/)

  > 各位SpaCE2021的参赛者：大家好。
  >
  > 为了给大家提供更安全的竞赛环境，我们对竞赛网站进行了升级。从即日起，竞赛官网迁至北大校内服务器，并且采取注册账号登录后操作的方式进行报名和数据提交。网址是： http://ccl.pku.edu.cn:8084/SpaCE2021
  > 
  > 注意事项：
  >  1、我们为已经报名的队伍设置了账号，用户名为队伍名称/注册邮箱，初始密码为space2021+报名所使用的手机号（不含加号）。请大家及时访问新网站修改密码。
  >  2、竞赛的赛程有所调整，请以最新网站说明为准。
  >  3、从即日起，每个队伍共可提交20次dev集的结果，新站启用之前提交的结果不计入次数。
  >
  > 如有任何问题、意见或Bug报告，请随时联系我们。祝大家生活愉快！
  >
  > SpaCE2021委员会联络人 孙春晖
  >  2021年5月5日

- `2021-04-10` 🚩 排行榜发布： [Leaderboard](http://ccl.pku.edu.cn:8084/SpaCE2021/rank)

- `2021-04-05` 基线系统发布： [SpaCE2021-Baseline](https://github.com/2030NLP/SpaCE2021-Baseline)

- `2021-04-05` 开放数据提交： [提交结果](http://ccl.pku.edu.cn:8084/SpaCE2021/submit)

- `2021-04-01` 开放报名： [我要报名](http://ccl.pku.edu.cn:8084/SpaCE2021/)

- `2021-04-01` 数据集 [pack1](https://github.com/2030NLP/SpaCE2021/tree/main/data) 发布，使用前请阅读 [数据集使用许可](https://github.com/2030NLP/SpaCE2021/blob/main/data/LICENSE.md)

- `2021-04-01` 供参考的评分脚本： [evaluate.py](https://github.com/2030NLP/SpaCE2021/blob/main/ref/evaluate.py)

---

## 一、任务简介

语言交际中存在大量的空间语义信息，理解这些信息是非常重要的。著名认知语言学家Jackendoff在其概念语义学理论中也指出空间结构是语言系统的四种基本结构之一（其余三个层面：语音、句法、概念语义）<sup>**`1`**</sup>。

通常认为，对文本中空间信息的理解，不仅需要掌握句段中字词的语义，还需要具备一定的常识或世界知识，甚至是超出语言范畴的空间想象等认知能力。考察机器的空间认知能力是一项系统性的工作。作为初步尝试，北京大学与复旦大学的研究团队针对中文文本中空间语义的正误判断与归因，提出了本次评测任务。

如果机器具备了空间认知能力，那么它不仅要能够识别常规、正确的空间信息，还应该能够识别异常、错误的空间信息。如对于“在四面签一个名字”，人类能够意识到其中存在异常，因为“一个名字”通常不会签在“四面”；又如对于“走过火车下”，人类能够清楚地知道通常不会有人在火车的“下”方走路。可以看出，这些异常是多种多样的，具体包括：跟空间语义理解有关的词语搭配问题、上下文信息冲突问题、与常识冲突的问题等。为了方便进行不同的后续处理，机器在识别异常的同时，也需要能够对异常的原因加以解释。

基于上述观点，本次评测试图考察计算机的以下能力：（1）计算机能否正确区分正常与错误的空间语义表达；（2）计算机能否解释空间语义表达错误的原因；（3）计算机处理上述两个任务的综合能力。对应为如下三个任务：

**子任务1，中文空间语义正误判断**：要求参赛系统对给定的中文文本中是否存在空间关系异常加以判断。

**子任务2，中文空间语义异常归因合理性判断**：要求参赛系统判断给定的归因是否可以用来解释给定的中文文本中所存在的空间关系异常。这些异常被分为词语搭配问题、语义问题、语境问题、常识问题以及其他问题（详情请看后文介绍）。

**子任务3，中文空间语义判断与归因联合任务**：参赛系统首先需要判断给定的中文文本中是否存在空间关系异常，如果存在异常，则再判断所给定的归因是否可以用来解释这一异常。

---

## 二、数据介绍

数据以json格式发布（参见后附数据样例），各个字段说明如表1所示。

> **表1    数据字段说明**
>
> | 字段      | 类型   | 说明                                                         |
> | --------- | ------ | ------------------------------------------------------------ |
> | `qID`     | int    | 试题编号。                                                   |
> | `context` | string | 文本材料。                                                   |
> | `reason`  | string | 子任务2及子任务3中，对文本材料中空间关系异常的归因。         |
> | `judge1`  | bool   | 子任务1中，对文本是否存在空间异常的判断。`true`表示句子成立，无异常；`false`表示句子不成立，有异常。 |
> | `judge2`  | bool   | 子任务2及子任务3中，对归因是否能够解释材料的空间关系异常的判断。`true`表示归因成立；`false`表示归因不成立。 |

评测任务中的语料主要来源于CCL语料库，涵盖小说、散文、词典等文体。需注意实际使用的文本材料是在原始语料的基础上，替换了具有空间方位意义的词语之后，再进行人工标注和检验后得到的。最终得到7782段有效文本材料，合计86万字。各段材料字数的平均值为110.52，标准差为53.00。这些材料根据性质和任务需要被划分至评测的三个任务的不同数据集中，具体分布情况如表2所示<sup>**`2`**</sup>。

> **表2    各子任务的数据集分布情况**
>
> | 子任务                            | 训练集 | 验证集 | 测试集 | 总计  | 备注                                                         |
> | --------------------------------- | ------ | ------ | ------ | ----- | ------------------------------------------------------------ |
> | 1、中文空间语义正误判断           | 4,237    | 806   | 800~   | 5.8k~ | 三个数据集之间，所使用的原始语料没有交集，下同。             |
> | 2、中文空间语义异常归因合理性判断 | 5,989    | 2,088  | 2k~  | 10k+  | (1)任一数据集所使用的`context`与子任务1的验证集和测试集无交集。(2)训练集使用的`context`与子任务1的训练集有交集。 |
> | 3、中文空间语义判断与归因联合任务 | 0      | 1,203    | 1k+    | 2k+ | (1)不提供训练集。(2)验证集和测试集中使用的`context`与子任务1的相应数据集相同。 |

在子任务2及子任务3中，使用了多种归因类型。类型之间并不完全独立，每段材料可能对应多种归因类型。参赛系统不需要在归因类型之中做选择，而只需要判断所提供的类型是否适合用来解释材料中的错误。各类型的简介如表3所示。

> **表3    归因类型说明**
>
> | 类型     | 内部编号 | 描述                                                         | 形式                                   |
> | -------- | -------- | ------------------------------------------------------------ | -------------------------------------- |
> | 搭配问题 | A        | `text1`、`text2`不能搭配，主要是因为语法、韵律、习惯等因素，通常不会这样说，而不是因为它们语义不兼容。 | “`text1`”和“`text2`”不宜搭配           |
> | 语义问题 | B        | `text1`、`text2`通常不一起使用，主要是因为它们语义通常不兼容，而不是因为语法、韵律、习惯等因素。 | “`text1`”和“`text2`”语义冲突           |
> | 语境问题 | C        | `text1`、`text2`之间存在冲突，主要是因为在当前语境中，具体信息存在冲突，而不是因为二者语义不兼容。 | “`text1`”与上下文“`text2`”存在信息冲突 |
> | 常识问题 | D        | `text1`所描述的内容不符合常识，这个常识由`commonsense`描述。 | “`text1`”与常识不符[：`commonsense`]   |

---

## 三、评价标准

对于**子任务一**和**子任务二**，使用准确率（Acc，Accuracy）作为评价指标。

```
Acc = 命中正确答案的题数 / 题目总数
```

对于**子任务3**，使用F1值作为评价指标。公式如下，其中 *P* 、 *R* 分别代表准确率（Precision）和召回率（Recall）：

```
F1 = 2*P*R / (P+R)
```

*P* 和 *R* 的计算公式如下，其中 *TP* 、 *TN* 、 *FP* 、 *FN* 分别代表命中数量、正确拒绝数量、误报数量、漏报数量，下标表示`judge`所属的步骤。

```
P = (TP_2 + TN_2) / (TN_1 + FN_1)
```

```
R = (TP_2 + TN_2) / (TN_1 + FP_1)
```

注意上面公式中 *TP_2* 和 *TN_2* 只计算`judge1`判断为`false` 的情况。

评分的计算脚本可参考： [evaluate.py](https://github.com/2030NLP/SpaCE2021/blob/main/ref/evaluate.py) （注：此脚本仅供参考，发现任何问题请联系我们）。

**最终排名**：在所有参赛队伍的评测结果产生之后，计算每个任务下各个队伍的标准分数（Z-score），对三个任务的标准分数取平均，作为最终排名的依据。标准分数计算公式如下，其中 *X̄* 为平均数， *s* 为标准差：

```
Z = (X - X̄) / s
```



##### 基线系统

我们提供一个基线系统供参赛队伍参考： [SpaCE2021-Baseline](https://github.com/2030NLP/SpaCE2021-Baseline)

---

## 四、比赛日程

| 日期               | 事项                                                         |
| ------------------ | ------------------------------------------------------------ |
| 2021年4月1日       | 开放[报名](http://ccl.pku.edu.cn:8084/SpaCE2021/)，发布[训练集以及无答案的验证集](https://github.com/2030NLP/SpaCE2021/tree/main/data) |
| 2021年4月5日       | 开放[结果提交](http://ccl.pku.edu.cn:8084/SpaCE2021/submit)  |
| 2021年6月1日       | 发布验证集答案                                               |
| 2021年7月1日       | 发布无答案的测试集，开始提交最终模型及技术报告               |
| 2021年7月5日       | 最终模型提交截止                                             |
| 2021年7月15日      | 技术报告提交截止                                             |
| 2021年7月23日      | 公布结果，比赛结束                                           |
| 2021年8月13日-15日 | CCL 2021评测研讨会                                           |



---

## 五、报名方式

请在网站注册并报名： [SpaCE2021](http://ccl.pku.edu.cn:8084/SpaCE2021/) 。

请注意：

1.  报名时间：2021年4月1日至2021年6月30日 ~~6月1日~~ ；
2. 一个团队只需由负责人或联系人填写一次报名表单即可；
3. 报名即表示已经阅读并承诺遵守参赛协议（ [Agreement.md](https://github.com/2030NLP/SpaCE2021/blob/main/Agreement.md) ）；
4. 如有其他问题，请直接联系评测委员会：sc_eval@163.com （孙春晖）；
5. 主办方会在每个工作日检查新的报名队伍并通过邮件发送回执。



## 六、奖项设置

**评测奖金由华为公司赞助**，奖池共计40000元：

一等奖（1名），奖金15000元；

二等奖（2名），各奖8000元；

三等奖（3名），各奖3000元。



## 七、委员会

单位：北京大学，复旦大学

主席：詹卫东，穗志方（北京大学）；邱锡鹏（复旦大学）

委员：孙春晖，唐乾桐，秦梓巍，董青秀，李卓，张洁（北京大学）；李孝男（复旦大学）等

联系人：孙春晖　　联系方式：sc_eval@163.com

---

> **脚注**
>
> `1` 参看 Jackendoff（2002）著作《Foundations of language: Brain, meaning, grammar, evolution》第1.2、1.5节。
>
> `2` 每段材料配合不同归因将会形成不同题目，因此题目数量大于材料数量。
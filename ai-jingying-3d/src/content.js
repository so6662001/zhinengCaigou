// ============================================================
// 全部文案都在这个文件里。改话术、改价值点、改上线须知,只改这里,
// 不需要动任何 3D 代码。
// ============================================================

export const BRAND = {
  title: '钢贸AI经营系统',
  subtitle: '3D 全景 · 一张订单看懂六个AI岗位',
};

export const FLOW_TYPES = {
  info: { name: '订单流', color: '#5b9dff', desc: '询价、订单、采购单' },
  goods: { name: '货物流', color: '#fb923c', desc: '到货、入库、提货' },
  money: { name: '资金流', color: '#fde047', desc: '收款、付款、对账' },
  data: { name: '数据流', color: '#22d3ee', desc: '各环节数据汇总给老板' },
};

// kind: product = 我方 AI 产品;external = 外部角色
// oldName = 「传统做法」模式下这个岗位的叫法
export const NODES = {
  customer: {
    kind: 'external',
    name: '客户',
    short: '工地 · 加工厂 · 二级商',
    color: '#94a3b8',
    tagline: '来问价、下单、提货、付款的人',
    intro:
      '客户只关心三件事:有没有货、什么价、多快能提。谁回得快、报得准、提得顺,订单就是谁的。',
    touch: [
      { to: 'sales', text: '问价、下单 → AI销售秒回报价' },
      { to: 'pickup', text: '派车提货 → AI提货宝到库即提' },
      { to: 'cashier', text: '付款、对账 → AI出纳自动核对' },
    ],
  },
  supplier: {
    kind: 'external',
    name: '供应商',
    short: '钢厂 · 一级代理',
    color: '#94a3b8',
    tagline: '报价、发货、收款的上游',
    intro:
      '同一个规格,不同供应商的价格、运费、账期、磅差都不一样。看清谁是真便宜,利润就留在自己手里。',
    touch: [
      { to: 'purchase', text: '报价、接采购单 → AI采购自动采价比价' },
      { to: 'warehouse', text: '发货到库 → AI仓库入库记账' },
      { to: 'cashier', text: '收货款 → AI出纳按计划付款' },
    ],
  },
  sales: {
    kind: 'product',
    name: 'AI销售',
    oldName: '销售',
    short: '秒报价 · 秒挂价',
    color: '#3b82f6',
    tagline: '客户一问价,秒回不丢单',
    bubble: { old: '报价要等半天', ai: '秒报价,不丢单' },
    before: [
      '客户问价,业务员要先问采购成本、再查库存,半天才回话',
      '行情一变,价格表靠手改,挂价总比同行慢一步',
      '报低了亏毛利,报高了丢客户,全凭业务员感觉',
    ],
    after: [
      '客户发来规格,AI结合库存和成本,秒出内部销售报价',
      '行情变动一键「秒挂价」,全品规价格同步更新',
      '底价和毛利红线自动把关,低于底价先预警',
    ],
    values: [
      { tag: '多成交', text: '报价从「等半天」变成「秒回」,不再因为慢而丢单' },
      { tag: '保毛利', text: '每一单卖价都对着成本和底价,少报错价' },
      { tag: '带新人', text: '新业务员也能报准价,不再只靠老师傅' },
    ],
    caps: ['内部销售报价', '秒挂价', '库存成本联动', '毛利红线预警'],
    golive: '上线前先统一品名、规格的叫法,并定好价格权限:谁能改价、最多能让多少。',
  },
  purchase: {
    kind: 'product',
    name: 'AI采购',
    oldName: '采购',
    short: '算缺口 · 10维比价',
    color: '#8b5cf6',
    tagline: '买得比同行便宜,补得比同行准',
    bubble: { old: '买贵了也不知道', ai: '10维比价,买得准' },
    before: [
      '只问两三家老关系,买贵了自己都不知道',
      '该补什么、补多少凭经验,畅销的断货、滞销的压仓',
      '供应商单据手工录入,一张单抄半天还容易错',
    ],
    after: [
      '自动计算安全库存和补货缺口,告诉你补什么、补多少',
      '自动采集供应商价格,按10维采购成本比出真正的到手价',
      '对着销售合同和期货订单比价,签字前先看到利润',
      '拍一张供应商单据,秒生成采购订单(秒录单)',
    ],
    values: [
      { tag: '买得省', text: '每一吨的真实采购成本看得见、压得下' },
      { tag: '少压货', text: '按缺口补货,不多买、不断货' },
      { tag: '管得住', text: '每一笔为什么选这家都有记录,采购过程透明' },
      { tag: '省人工', text: '录单从手抄变成拍照,一个人干几个人的活' },
    ],
    caps: [
      '安全库存',
      '补货缺口',
      '供应商价格采集',
      '10维成本比价',
      '合同/期货比价',
      '供应商画像',
      '秒录单',
    ],
    golive: '先导入供应商档案和历史采购价,画像才有底;比价维度(运费、账期、磅差等)按公司实际配置。',
  },
  warehouse: {
    kind: 'product',
    name: 'AI仓库',
    oldName: '仓库',
    short: '实时库存 · 积压预警',
    color: '#14b8a6',
    tagline: '库里有什么、压了多久,一眼看清',
    bubble: { old: '积压了没人知道', ai: '积压自动预警' },
    before: [
      '库存靠月底盘点,账上和实物经常对不上',
      '销售问「有没有货」,要打电话到仓库现查',
      '货压了几个月没人提醒,资金越压越死',
    ],
    after: [
      '入库出库实时记账,可用库存销售随时能查',
      '自动分析库存积压,压货早发现、早处理',
      '库存低于安全线,自动联动AI采购提醒补货',
    ],
    values: [
      { tag: '放现金', text: '积压早发现早处理,把压在库里的钱放出来' },
      { tag: '敢接单', text: '库存实时准确,销售敢报、敢接' },
      { tag: '少差错', text: '账实一致,少发错货、少扯皮' },
    ],
    caps: ['实时库存', '库龄跟踪', '积压分析', '安全库存联动', '盘点'],
    golive: '上线前必须彻底盘点一次,期初库存准,后面所有的数才准;垛位、库位先编号。',
  },
  pickup: {
    kind: 'product',
    name: 'AI提货宝',
    oldName: '提货',
    short: '手机提货 · 到库即提',
    color: '#f97316',
    tagline: '司机到库就提货,不排队、不扯皮',
    bubble: { old: '司机排队等开单', ai: '到库即提,全程留痕' },
    before: [
      '提货单靠纸质单或微信截图,仓库要反复打电话核对',
      '司机到了等开单,排队半天',
      '提了多少、谁提的,事后说不清',
    ],
    after: [
      '客户和司机在手机上办理提货,到库核验即可装车',
      '提货与出库数据自动关联,回单即时生成',
      '提货进度客户自己能查,少打电话',
    ],
    values: [
      { tag: '提得快', text: '提货不排队,一天能多发几车货' },
      { tag: '少纠纷', text: '每一车都留痕,数量、时间、经手人清清楚楚' },
      { tag: '留客户', text: '提货顺,客户下次还找你' },
    ],
    caps: ['手机提货', '到库核验', '提货进度', '电子回单'],
    golive: '先在老客户和常用车队里试点,同步调整门岗和仓库的放行流程。',
  },
  cashier: {
    kind: 'product',
    name: 'AI出纳',
    oldName: '出纳',
    short: '自动对账 · 到期提醒',
    color: '#eab308',
    tagline: '钱进钱出自动对,欠款到期自动提醒',
    bubble: { old: '月底对不上账', ai: '自动对账,到期催款' },
    before: [
      '收到一笔款,是谁付的哪一单,要翻聊天记录',
      '应收应付记在表格里,月底对账对到半夜',
      '账期到了没人提醒,欠款越拖越久',
    ],
    after: [
      '收款自动匹配订单,应收应付实时更新',
      '和客户、供应商的往来账自动核对',
      '账期到期自动提醒催收,付款按计划安排',
    ],
    values: [
      { tag: '回款快', text: '到期就提醒,欠款不再被忘掉' },
      { tag: '少坏账', text: '谁欠多少、欠了多久,随时看得见' },
      { tag: '省人工', text: '对账从几天变成随时可对' },
    ],
    caps: ['收款认领', '应收应付', '自动对账', '账期提醒', '资金日报'],
    golive: '期初的应收、应付余额,要和客户、供应商逐家核对无误后再导入。',
  },
  boss: {
    kind: 'product',
    name: 'AI经营',
    oldName: '老板',
    short: '老板驾驶舱',
    color: '#22d3ee',
    tagline: '每天都知道赚没赚、钱在哪',
    bubble: { old: '月底才知道赚没赚', ai: '每天看利润和现金' },
    before: [
      '赚没赚钱月底才知道,发现问题已经晚了',
      '数据散在各人手里和表格里,要数先要人',
      '凭感觉做决策,行情一变就被动',
    ],
    after: [
      '采购、销售、库存、资金的数据自动汇到一张图',
      '每天看利润、库存资金、应收和现金流',
      '异常自动预警:买贵了、压货了、欠款超期了',
    ],
    values: [
      { tag: '看得见', text: '不用等月底,每天都知道赚没赚' },
      { tag: '管得住', text: '哪个环节在漏钱,系统先告诉你' },
      { tag: '决策快', text: '行情变了,靠数据而不是靠感觉调整' },
    ],
    caps: ['经营日报', '利润分析', '库存资金', '现金流', '异常预警'],
    golive: '前面每个环节录入及时,驾驶舱才准;先定好老板每天要看的几个关键数。',
  },
};

// 导览步骤:一张订单的旅程。focus = 镜头对准的节点;flows = 这一步点亮的流动。
export const STEPS = [
  {
    id: 'overview',
    label: '全景',
    focus: null,
    flows: null,
    caption: '一张订单,从客户问价到货款收回,由六个AI岗位接力完成。',
  },
  {
    id: 'sales',
    label: 'AI销售',
    focus: 'sales',
    flows: ['customer-sales'],
    caption: '第1步 · 客户来问价:AI销售秒出报价、秒挂价,先把订单接住。',
  },
  {
    id: 'purchase',
    label: 'AI采购',
    focus: 'purchase',
    flows: ['sales-purchase', 'purchase-supplier'],
    caption: '第2步 · 订单带出缺口:AI采购算出该补多少,比完价再向供应商下单。',
  },
  {
    id: 'warehouse',
    label: 'AI仓库',
    focus: 'warehouse',
    flows: ['supplier-warehouse'],
    caption: '第3步 · 货到入库:AI仓库实时记账,库存多少、压了多久一清二楚。',
  },
  {
    id: 'pickup',
    label: 'AI提货宝',
    focus: 'pickup',
    flows: ['warehouse-pickup', 'pickup-customer'],
    caption: '第4步 · 客户来提货:司机手机办理,到库即提,每一车都有记录。',
  },
  {
    id: 'cashier',
    label: 'AI出纳',
    focus: 'cashier',
    flows: ['customer-cashier', 'cashier-supplier'],
    caption: '第5步 · 钱进钱出:AI出纳自动对账,账期到了自动提醒。',
  },
  {
    id: 'boss',
    label: 'AI经营',
    focus: 'boss',
    flows: ['data'],
    caption: '第6步 · 全部数据汇总:老板每天都知道赚没赚、钱在哪。',
  },
  {
    id: 'summary',
    label: '总结',
    focus: null,
    flows: null,
    caption: '六个岗位连成一个闭环:买得省、卖得快、库存轻、回款稳、老板看得见。',
  },
];

export const OVERVIEW = {
  title: '一张订单的旅程',
  lead: '钢贸生意就是三件事在流动:订单、货、钱。这套系统让六个AI岗位把这三件事接力干完,再把数据汇总给老板。',
  howto: [
    '点下方步骤条,或点「自动导览」,跟着一张订单走一遍',
    '点任意一栋建筑,看这个岗位以前怎么干、现在怎么干、带来什么价值',
    '切换右上角「传统做法 / AI经营」,对比前后差别',
  ],
};

export const OLD_MODE = {
  caption: '传统做法:订单靠人传,数据各管各,老板月底才看得到结果。',
  overviewLead:
    '没有系统时,每个岗位各记各的账:销售等采购回话,采购凭感觉下单,仓库月底才盘点,出纳对不上账,老板只能月底看结果。',
};

export const SUMMARY = {
  title: '一套系统,五笔钱',
  lead: '把六个岗位的价值加起来,老板真正拿到的是这五样:',
  items: [
    { node: 'purchase', title: '买得省', text: '采购成本看得见、压得下' },
    { node: 'sales', title: '卖得快', text: '秒报价、秒挂价,不因为慢丢单' },
    { node: 'warehouse', title: '库存轻', text: '积压早发现,把压着的钱放出来' },
    { node: 'cashier', title: '回款稳', text: '自动对账、到期提醒,少坏账' },
    { node: 'boss', title: '看得见', text: '每天知道赚没赚、钱在哪' },
  ],
};

// 价值测算:所有系数都是「假设」,界面上可调。默认值仅为演示起点,
// 请按真实客户数据或公司确认过的口径修改。
export const CALCULATOR = {
  title: '算算你家的账',
  note: '下面的比例都是测算假设,可以按贵司实际情况拖动调整。结果仅用于估算,不构成收益承诺。',
  inputs: [
    { id: 'tons', label: '月采购/销售量', unit: '吨', value: 3000, min: 100, max: 50000, step: 100 },
    { id: 'stock', label: '平均库存金额', unit: '万元', value: 800, min: 50, max: 20000, step: 50 },
    { id: 'margin', label: '平均吨毛利', unit: '元/吨', value: 60, min: 10, max: 500, step: 5 },
    { id: 'rate', label: '资金年化成本', unit: '%', value: 6, min: 2, max: 15, step: 0.5 },
  ],
  assumptions: [
    {
      id: 'buySave',
      node: 'purchase',
      label: '每吨采购成本降低',
      unit: '元/吨',
      value: 15,
      min: 0,
      max: 50,
      step: 1,
      hint: '多家比价、算清运费账期后的差价',
    },
    {
      id: 'moreDeal',
      node: 'sales',
      label: '报价提速多成交',
      unit: '%',
      value: 2,
      min: 0,
      max: 10,
      step: 0.5,
      hint: '原来因为回复慢丢掉的单',
    },
    {
      id: 'stockCut',
      node: 'warehouse',
      label: '库存金额下降',
      unit: '%',
      value: 15,
      min: 0,
      max: 40,
      step: 1,
      hint: '清掉积压、按缺口补货后',
    },
    {
      id: 'laborSave',
      node: 'cashier',
      label: '录单对账节省人力',
      unit: '万元/年',
      value: 8,
      min: 0,
      max: 50,
      step: 1,
      hint: '录单、对账、统计少占用的人工',
    },
  ],
};

export const GOLIVE = {
  title: '上线注意事项',
  lead: '系统再好,上线走错一步也会用不起来。按这三个阶段走,少走弯路。',
  phases: [
    {
      name: '上线前 · 把地基打好',
      items: [
        { title: '老板亲自挂帅', text: '指定一名说了算的项目负责人,各岗位都清楚「这是老板要推的事」。' },
        { title: '基础资料统一', text: '品名、材质、规格的叫法统一编码;供应商、客户、仓库库位档案整理好。' },
        { title: '期初数据核准', text: '库存彻底盘点一次;应收、应付余额与客户、供应商逐家核对。' },
        { title: '权限流程定好', text: '谁开单、谁审批、谁能改价、能让多少,上线前说清楚。' },
      ],
    },
    {
      name: '上线中 · 先跑通再铺开',
      items: [
        { title: '先跑通一条主线', text: '先让一张订单从报价走到回款,跑顺了再把其他品类和人员加进来。' },
        { title: '新旧并行有期限', text: '设定并行期,到期就切换,不给「还是用老办法」留后路。' },
        { title: '按岗位培训', text: '每个岗位只学自己用的那几步,一页纸讲清楚。' },
        { title: '每天对一次数', text: '系统库存对实物,系统余额对银行,差异当天查清。' },
      ],
    },
    {
      name: '上线后 · 用起来才有价值',
      items: [
        { title: '录入及时是纪律', text: '当天的单当天进系统,数据晚一天,老板看到的就是旧账。' },
        { title: 'AI建议先审后放', text: '刚开始AI的补货、比价建议由人确认,跑准了再逐步放手。' },
        { title: '每周复盘一次', text: '看系统给的预警有没有处理:买贵的、压货的、超期的。' },
        { title: '数据越用越准', text: '价格、供应商画像、安全库存都靠积累,坚持用,效果会越来越明显。' },
      ],
    },
  ],
};

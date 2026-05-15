import{d as j,c as u,a as s,b as t,w as n,j as o,o as r,u as T,P as Q,h as d,H as p,F as b,l as D,t as i,f as V,y as G,r as _,L as y,au as J,_ as K}from"./index-DQy5YonY.js";const R={class:"page-container"},W={class:"card-header"},X={class:"action-bar"},Y={class:"card-header"},Z={key:0,class:"parse-progress"},q={key:1,class:"parsed-list"},ee={class:"parsed-item-header"},te={class:"parsed-index"},ne={class:"parsed-content"},se={key:0,class:"parsed-options"},le={class:"parsed-answer"},ae={class:"answer-value"},oe={key:3,class:"import-bar"},re=`1. TCP协议工作在OSI模型的哪一层？
A. 应用层
B. 数据链路层
C. 传输层
D. 网络层
答案：C

2. 快速排序的平均时间复杂度是O(n log n)。
答案：正确

3. 二叉树的前序遍历顺序是？
A. 根-左-右
B. 左-根-右
C. 左-右-根
D. 右-根-左
答案：A

4. HTTP协议默认使用的端口号是____。
答案：80

5. 以下哪些是面向对象编程的特征？
A. 封装
B. 继承
C. 多态
D. 抽象
答案：ABCD`,ue=j({__name:"AiImport",setup(ce){const v=_(""),h=_(""),c=_(!1),m=_(0),C=_(!1),l=_([]);function P(){v.value=re,y.info("已加载示例文本")}function z(f){return{单选题:"",多选题:"success",判断题:"warning",填空题:"info"}[f]||"info"}function E(){c.value=!0,m.value=0,l.value=[];const f=setInterval(()=>{m.value+=Math.random()*15+5,m.value>=100&&(m.value=100,clearInterval(f),setTimeout(()=>{c.value=!1,l.value=[{type:"单选题",content:"TCP协议工作在OSI模型的哪一层？",options:["A. 应用层","B. 数据链路层","C. 传输层","D. 网络层"],answer:"C",confidence:98},{type:"判断题",content:"快速排序的平均时间复杂度是O(n log n)。",options:null,answer:"正确",confidence:95},{type:"单选题",content:"二叉树的前序遍历顺序是？",options:["A. 根-左-右","B. 左-根-右","C. 左-右-根","D. 右-根-左"],answer:"A",confidence:97},{type:"填空题",content:"HTTP协议默认使用的端口号是____。",options:null,answer:"80",confidence:92},{type:"多选题",content:"以下哪些是面向对象编程的特征？",options:["A. 封装","B. 继承","C. 多态","D. 抽象"],answer:"ABCD",confidence:96}],y.success(`成功解析 ${l.value.length} 道题目`)},300))},200)}function N(){if(!h.value){y.warning("请先选择目标题库");return}J.confirm(`确定将 ${l.value.length} 道题目导入到题库中吗？`,"确认导入",{type:"success"}).then(()=>{C.value=!0,setTimeout(()=>{C.value=!1,y.success(`成功导入 ${l.value.length} 道题目`),l.value=[],v.value=""},1e3)}).catch(()=>{})}function O(){l.value=[]}return(f,e)=>{const g=o("el-button"),H=o("el-input"),w=o("el-option"),M=o("el-select"),k=o("el-icon"),B=o("el-card"),x=o("el-col"),A=o("el-tag"),S=o("el-progress"),$=o("el-empty"),F=o("el-row");return r(),u("div",R,[e[10]||(e[10]=s("div",{class:"page-header"},[s("h2",null,"AI导题"),s("p",{class:"page-desc"},"通过AI智能解析，将文本格式的题目批量导入到题库中")],-1)),t(F,{gutter:20},{default:n(()=>[t(x,{span:12},{default:n(()=>[t(B,{shadow:"hover"},{header:n(()=>[s("div",W,[e[3]||(e[3]=s("span",null,"粘贴题目文本",-1)),t(g,{size:"small",type:"info",onClick:P},{default:n(()=>[...e[2]||(e[2]=[d("加载示例",-1)])]),_:1})])]),default:n(()=>[t(H,{modelValue:v.value,"onUpdate:modelValue":e[0]||(e[0]=a=>v.value=a),type:"textarea",rows:16,placeholder:`请粘贴题目文本，支持以下格式：

1. 题目内容
A. 选项A
B. 选项B
C. 选项C
D. 选项D
答案：A

2. 题目内容
答案：正确/错误

支持单选题、多选题、判断题、填空题等题型`},null,8,["modelValue"]),s("div",X,[t(M,{modelValue:h.value,"onUpdate:modelValue":e[1]||(e[1]=a=>h.value=a),placeholder:"选择目标题库",style:{width:"200px"}},{default:n(()=>[t(w,{label:"计算机基础期末题库",value:"1"}),t(w,{label:"数据结构练习题",value:"2"}),t(w,{label:"新建题库",value:"new"})]),_:1},8,["modelValue"]),t(g,{type:"primary",loading:c.value,onClick:E,disabled:!v.value.trim()},{default:n(()=>[t(k,null,{default:n(()=>[t(T(Q))]),_:1}),e[4]||(e[4]=d("AI智能解析 ",-1))]),_:1},8,["loading","disabled"])])]),_:1})]),_:1}),t(x,{span:12},{default:n(()=>[t(B,{shadow:"hover"},{header:n(()=>[s("div",Y,[e[5]||(e[5]=s("span",null,"解析结果预览",-1)),l.value.length?(r(),V(A,{key:0,type:"success",size:"small"},{default:n(()=>[d(" 成功解析 "+i(l.value.length)+" 道题目 ",1)]),_:1})):p("",!0)])]),default:n(()=>[c.value?(r(),u("div",Z,[t(S,{percentage:m.value,"stroke-width":10,status:"success"},null,8,["percentage"]),e[6]||(e[6]=s("p",{class:"progress-text"},"AI正在解析中，请稍候...",-1))])):p("",!0),l.value.length&&!c.value?(r(),u("div",q,[(r(!0),u(b,null,D(l.value,(a,I)=>(r(),u("div",{key:I,class:"parsed-item"},[s("div",ee,[t(A,{type:z(a.type),size:"small"},{default:n(()=>[d(i(a.type),1)]),_:2},1032,["type"]),s("span",te,"第 "+i(I+1)+" 题",1),t(A,{type:a.confidence>=90?"success":a.confidence>=70?"warning":"danger",size:"small"},{default:n(()=>[d(" 置信度 "+i(a.confidence)+"% ",1)]),_:2},1032,["type"])]),s("p",ne,i(a.content),1),a.options?(r(),u("div",se,[(r(!0),u(b,null,D(a.options,(L,U)=>(r(),u("div",{key:U,class:"parsed-option"},i(L),1))),128))])):p("",!0),s("div",le,[e[7]||(e[7]=s("span",{class:"answer-label"},"答案：",-1)),s("span",ae,i(a.answer),1)])]))),128))])):p("",!0),!l.value.length&&!c.value?(r(),V($,{key:2,description:"粘贴题目文本后点击AI智能解析"})):p("",!0),l.value.length&&!c.value?(r(),u("div",oe,[t(g,{type:"success",onClick:N,loading:C.value},{default:n(()=>[t(k,null,{default:n(()=>[t(T(G))]),_:1}),e[8]||(e[8]=d("导入到题库 ",-1))]),_:1},8,["loading"]),t(g,{onClick:O},{default:n(()=>[...e[9]||(e[9]=[d("清空结果",-1)])]),_:1})])):p("",!0)]),_:1})]),_:1})]),_:1})])}}}),ie=K(ue,[["__scopeId","data-v-0c6c116c"]]);export{ie as default};

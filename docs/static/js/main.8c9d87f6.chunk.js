(this.webpackJsonphotstuff=this.webpackJsonphotstuff||[]).push([[0],{180:function(e,n,t){},340:function(e,n,t){"use strict";t.r(n);var a,r,c,i,o,s,l,u,d,j=t(0),b=t.n(j),m=t(58),h=t.n(m),p=(t(180),t(15)),f=t(30),g=t(106),x=t(66),O=t(31),y=t(342),v=t(343),w=t(347),S=t(168),D=t(169),C=t(69),k=t(65),K=t(171),W=t(8),P=["#2ecc71","#3498db","#9b59b6","#e74c3c","#e67e22","#34495e","#16a085"],T='[\n  {\n    "name": "first",\n    "temperatureDegC": 120,\n    "capacitanceJPerDegK": 200,\n    "powerGenW": 0,\n    "isBoundary": false\n  },\n  {\n    "name": "second",\n    "temperatureDegC": 40,\n    "capacitanceJPerDegK": 10,\n    "powerGenW": 0,\n    "isBoundary": true\n  },\n  {\n    "name": "third",\n    "temperatureDegC": -10,\n    "capacitanceJPerDegK": 8,\n    "powerGenW": 10,\n    "isBoundary": false\n  },\n]',V='[\n  {\n    source: "first",\n    target: "second",\n    resistanceDegKPerW: 0.1,\n    kind: "bi",\n  },\n  {\n    source: "first",\n    target: "third",\n    resistanceDegKPerW: 0.5,\n    kind: "uni",\n  },\n  {\n    source: "second",\n    target: "third",\n    resistanceDegKPerW: 3,\n    kind: "bi",\n  },\n]',J=O.a.h1(a||(a=Object(f.a)(['\n  width: 100%;\n  text-align: center;\n  padding: 1em 0 0.5em 0;\n  margin: 0;\n\n  &&:before,\n  &&:after {\n    content: "\ud83d\udd25";\n  }\n']))),R=O.a.form(r||(r=Object(f.a)(["\n  display: flex;\n  flex-direction: column;\n  width: 100%;\n  align-items: center;\n"]))),B=O.a.div(c||(c=Object(f.a)(["\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  width: 100%;\n  margin-top: 2em;\n\n  .chart {\n    width: 60% !important;\n    max-width: 900px;\n\n    @media only screen and (max-width: 600px) {\n      width: 90% !important;\n      touch-action: pan-y;\n    }\n  }\n"]))),G=O.a.div(i||(i=Object(f.a)(["\n  display: flex;\n  width: 100%;\n  justify-content: center;\n  margin: 0.5em;\n"]))),E=O.a.div(o||(o=Object(f.a)(["\n  display: flex;\n  width: 100%;\n  justify-content: center;\n  margin: 0.5em;\n"]))),M=O.a.label(s||(s=Object(f.a)(["\n  display: flex;\n  max-width: 400px;\n  width: 95%;\n  justify-content: space-between;\n"]))),z=O.a.label(l||(l=Object(f.a)(["\n  display: flex;\n  flex-direction: column;\n  max-width: 600px;\n  width: 95%;\n  align-items: center;\n"]))),F=O.a.textarea(u||(u=Object(f.a)(["\n  width: 80%;\n  min-width: 80%;\n  max-width: 80%;\n  min-height: 200px;\n"]))),N=O.a.input(d||(d=Object(f.a)(["\n  display: flex;\n  align-items: center;\n  -webkit-appearance: none;\n  border: none;\n  border-radius: 10px;\n  padding: 0.8em 3em;\n  margin: 1em;\n  font-size: 1.2em;\n  background: #dbdbdb;\n\n  &&:hover {\n    cursor: pointer;\n  }\n"])));function A(e){return Object(W.jsx)(G,{children:Object(W.jsxs)(M,{children:[e.label,Object(W.jsx)("input",{type:"text",defaultValue:e.defaultVal,onChange:function(n){return e.onChange(n)}})]})})}function H(e){return Object(W.jsx)(E,{children:Object(W.jsxs)(z,{children:[Object(W.jsx)("div",{style:{marginRight:"10px"},children:e.label}),Object(W.jsx)(F,{onInput:function(e){return(n=e.target).style.height="auto",void(n.style.height=n.scrollHeight+"px");var n},defaultValue:e.defaultVal,onChange:function(n){return e.onChange(n)}})]})})}function I(){var e=Object(j.useState)(void 0),n=Object(p.a)(e,2),t=n[0],a=n[1],r=Object(j.useState)(50),c=Object(p.a)(r,2),i=c[0],o=c[1],s=Object(j.useState)(.1),l=Object(p.a)(s,2),u=l[0],d=l[1],b=Object(j.useState)(Y(T)),m=Object(p.a)(b,2),h=m[0],f=m[1],O=Object(j.useState)(T),G=Object(p.a)(O,2),E=G[0],M=G[1],z=Object(j.useState)(Z(Y(T),V)),F=Object(p.a)(z,2),I=F[0],L=F[1],q=Object(j.useState)(V),Q=Object(p.a)(q,2),U=Q[0],X=Q[1];function Y(e){try{return g.parse(e).map((function(e){return Object(x.makeNode)({name:e.name,temperatureDegC:e.temperatureDegC,capacitanceJPerDegK:e.capacitanceJPerDegK,powerGenW:e.powerGenW,isBoundary:e.isBoundary})}))}catch(n){return console.error(n),[]}}function Z(e,n){try{return g.parse(n).map((function(n){var t=e.filter((function(e){return e.name===n.source}))[0],a=e.filter((function(e){return e.name===n.target}))[0];return Object(x.makeConnection)({source:t,target:a,resistanceDegKPerW:n.resistanceDegKPerW,kind:n.bi})}))}catch(t){return console.error(t),[]}}Object(j.useEffect)((function(){var e=Y(E);f(e);var n=Z(e,U);L(n)}),[E,U]);var $=350,_={left:5,right:5,top:40,bottom:40};var ee=t&&t.nodeResults.length>0?t:x.emptyOutput,ne=function(e){var n=Math.floor(Math.log10(e.totalTimeS)),t=Math.pow(10,n-1),a=e.timeSeriesS.length<400,r=[],c=[];return e.timeSeriesS.forEach((function(n,i){if(a||(l=n,0===Math.abs(l%t))){var o={name:n},s={name:n};e.nodeResults.forEach((function(e){o[e.node.name]=e.tempDegC[i]})),e.connectionResults.forEach((function(e){s["".concat(e.connection.source.name," to ").concat(e.connection.target.name)]=e.heatTransferW[i]})),r.push(o),c.push(s)}var l})),[r,c]}(ee),te=Object(p.a)(ne,2),ae=te[0],re=te[1];return Object(W.jsx)("div",{children:Object(W.jsxs)(R,{onSubmit:function(e){try{a(function(){var e=Object(x.run)({nodes:h,connections:I,timeStepS:u,totalTimeS:i});return e.errors&&e.errors.map((function(e){return console.error("".concat(e.name,": ").concat(e.message))})),e}())}catch(n){console.error(n)}e.preventDefault()},children:[ee.timeSeriesS.length>0?Object(W.jsxs)(W.Fragment,{children:[Object(W.jsx)(J,{children:"Completed in ".concat(ee.computeTimeS.toFixed(2)," seconds")}),Object(W.jsxs)(B,{children:[Object(W.jsx)(y.a,{height:$,className:"chart",children:Object(W.jsxs)(v.a,{data:ae,margin:{top:0,right:_.right,left:_.left,bottom:_.bottom},children:[Object(W.jsx)(w.a,{strokeDasharray:"3 3"}),Object(W.jsx)(S.a,{dataKey:"name",label:{value:"Time [seconds]",position:"middle",dy:20}}),Object(W.jsx)(D.a,{label:{value:"Temperature [degC]",position:"middle",angle:-90,dx:-20}}),Object(W.jsx)(C.a,{}),Object(W.jsx)(k.a,{layout:"horizontal",verticalAlign:"top",align:"center",wrapperStyle:{paddingLeft:"10px"}}),ee.nodeResults.map((function(e,n){return Object(W.jsx)(K.a,{type:"monotone",dataKey:e.node.name,stroke:P[n],activeDot:{r:8}},e.node.id)}))]})}),Object(W.jsx)(y.a,{height:$,className:"chart",children:Object(W.jsxs)(v.a,{height:$,data:re,margin:{top:0,right:_.right,left:_.left,bottom:_.bottom},children:[Object(W.jsx)(w.a,{strokeDasharray:"3 3"}),Object(W.jsx)(S.a,{dataKey:"name",label:{value:"Time [seconds]",position:"middle",dy:20}}),Object(W.jsx)(D.a,{label:{value:"Heat Transfer [Watts]",position:"middle",angle:-90,dx:-20}}),Object(W.jsx)(C.a,{}),Object(W.jsx)(k.a,{layout:"horizontal",verticalAlign:"top",align:"center",wrapperStyle:{paddingLeft:"10px"},fontSize:5}),ee.connectionResults.map((function(e,n){return Object(W.jsx)(K.a,{type:"monotone",dataKey:"".concat(e.connection.source.name," to ").concat(e.connection.target.name),stroke:P[n],activeDot:{r:8}},e.connection.id)}))]})})]})]}):Object(W.jsx)(J,{children:"Welcome to hotstuff.network"}),Object(W.jsx)(N,{type:"submit",value:"Go"}),Object(W.jsx)(A,{label:"Timestep[sec]",defaultVal:.1,onChange:function(e){return d(parseFloat(e.target.value))}}),Object(W.jsx)(A,{label:"Run Time [sec]",defaultVal:50,onChange:function(e){return o(parseFloat(e.target.value))}}),Object(W.jsx)(H,{label:"Nodes",defaultVal:T,onChange:function(e){return M(e.target.value)}}),Object(W.jsx)(H,{label:"Connections",defaultVal:V,onChange:function(e){return X(e.target.value)}})]})})}h.a.render(Object(W.jsx)(b.a.StrictMode,{children:Object(W.jsx)(I,{})}),document.getElementById("root"))}},[[340,1,2]]]);
//# sourceMappingURL=main.8c9d87f6.chunk.js.map
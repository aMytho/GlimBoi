"use strict";(self.webpackChunkGlimBoard=self.webpackChunkGlimBoard||[]).push([[476],{9476:(B,c,r)=>{r.r(c),r.d(c,{SelectBoardModule:()=>f});var l=r(6895),d=r(4052),e=r(1571),i=r(5842);function s(o,n){if(1&o&&(e.TgZ(0,"option",10),e._uU(1),e.qZA()),2&o){const t=n.$implicit;e.s9C("value",t.id),e.xp6(1),e.hij(" ",t.name," ")}}function u(o,n){1&o&&(e.TgZ(0,"p",11),e._uU(1," No boards were found "),e.qZA())}const p=[{path:"**",component:(()=>{class o{constructor(t){this.boardService=t}get boards(){return this.boardService.allBoards}selectBoard(t){null!=t&&(console.log(`Selecting board with ID of ${t}`),this.boardService.setActiveBoard(Number(t)))}}return o.\u0275fac=function(t){return new(t||o)(e.Y36(i.$))},o.\u0275cmp=e.Xpm({type:o,selectors:[["app-select-board"]],decls:14,vars:2,consts:[[1,"px-4","pt-4"],[1,"text-lg","font-semibold"],[1,"p-4","pt-2"],[1,"flex","flex-row","gap-4","p-4"],[1,"max-w-sm","formBackground","cursor-pointer","appearance-none","block","w-full","text-xl","font-normal","bg-clip-padding","bg-no-repeat","border","border-solid","rounded","transition","ease-in-out","m-0","focus:outline-none"],["btn",""],[3,"value",4,"ngFor","ngForOf"],["class","ext-red-500 font-semibold text-lg",4,"ngIf"],[1,"mt-2","bg-teal-500","hover:bg-teal-700","text-white","font-bold","py-2","px-4","rounded",3,"click"],[1,"text-sm","font-normal"],[3,"value"],[1,"ext-red-500","font-semibold","text-lg"]],template:function(t,a){if(1&t){const g=e.EpF();e.TgZ(0,"div",0)(1,"h2",1),e._uU(2,"Select the board to activate it."),e.qZA()(),e.TgZ(3,"div",2)(4,"div",3)(5,"select",4,5),e.YNc(7,s,2,2,"option",6),e.qZA(),e.YNc(8,u,2,0,"p",7),e.TgZ(9,"button",8),e.NdJ("click",function(){e.CHM(g);const b=e.MAs(6);return e.KtG(a.selectBoard(b.value))}),e._uU(10," Select "),e.qZA()(),e.TgZ(11,"div")(12,"p",9),e._uU(13,"Only one board can be selected at a time."),e.qZA()()()}2&t&&(e.xp6(7),e.Q6J("ngForOf",a.boards),e.xp6(1),e.Q6J("ngIf",0==a.boards.length))},dependencies:[l.sg,l.O5]}),o})()}];let m=(()=>{class o{}return o.\u0275fac=function(t){return new(t||o)},o.\u0275mod=e.oAB({type:o}),o.\u0275inj=e.cJS({imports:[d.Bz.forChild(p),d.Bz]}),o})(),f=(()=>{class o{}return o.\u0275fac=function(t){return new(t||o)},o.\u0275mod=e.oAB({type:o}),o.\u0275inj=e.cJS({imports:[l.ez,m]}),o})()}}]);
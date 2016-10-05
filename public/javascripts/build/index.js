!function(t){function e(n){if(i[n])return i[n].exports;var o=i[n]={exports:{},id:n,loaded:!1};return t[n].call(o.exports,o,o.exports,e),o.loaded=!0,o.exports}var i={};return e.m=t,e.c=i,e.p="",e(0)}([function(t,e,i){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}var o=i(1),s=n(o);(0,s["default"])()},function(t,e,i){"use strict";function n(){function t(t){var e=new o.AuthWindow(t);e.render()}$(document).ready(function(){$("#signin, #signup").on("click",function(e){e.preventDefault();var i=(0,a.findTarget)($(e.target),"signin signup");i&&t(i.attr("id"))}),$("#signout").on("click",function(t){t.preventDefault();var e=(0,a.findTarget)($(t.target),"signout");e&&(0,s.makeAuthorizationRequest)("/signout",null,function(t){t?alert(t.message):window.location.href="/"})}),$(document.documentElement).on("click keydown",function(t){t.keyCode&&27!==t.keyCode||(0,a.findTarget)($(t.target),"mod")||((0,a.findTarget)($(t.target),"popup-button")&&27!==t.keyCode||($("#image-preview").remove(),$(".popup-menu").detach()),(0,a.findTarget)($(t.target),"details-button edit-button rm-button signin signup")&&27!==t.keyCode||o.ModalWindow.prototype.close())})})}Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=n;var o=i(2),s=i(3),a=i(4)},function(t,e,i){"use strict";function n(t){t.data&&(a.call(this,!1),this.parent=t,this.elem.attr("id","details"),this.elem.css({background:"#079",padding:"0px"}))}function o(t,e,i,o){var s={data:{_id:null,specs:t}};n.call(this,s),this.db=e,this.createData=i,this.callback=o}function s(t){a.call(this,!0),this.elem.attr("id","authentification"),this.elem.css({background:"#fff",padding:"5px",border:"1px solid #ccc",borderRadius:"5px"}),this.type=t}function a(){this.elem=$("<div class='mod'></div>"),this.elem.css({zIndex:3}),this.focusExecuted=!1}Object.defineProperty(e,"__esModule",{value:!0}),e.ModalWindow=e.AuthWindow=e.Dialog=e.Details=void 0;var r=i(3),d=i(4);n.prototype=Object.create(a.prototype),n.prototype.constructor=n,n.prototype.render=function(){if(!this.elem.html()&&(this.content=$("<form></form>"),this.createContent(),"edit"===mode)){var t=$("<button type='submit' class='btn btn-default' id='save-button'>Сохранить</button>");t.css({"float":"right"});var e=$("<button type='button' class='btn btn-default' id='add-button'>Добавить</button>"),i=$("<button type='button' class='btn btn-default' id='cancel-button'>Отмена</button>");i.css({"float":"right"}),this.content.append(i),this.content.append(e),this.content.append(t)}this.content.on("submit",this.submit.bind(this)),this.content.on("click",".btn",this.editButtonClick.bind(this)),this._render(this.content)},n.prototype.createContent=function(){this.elem.find("#details__content").remove();var t=$("<div class='panel panel-default' id='details__content'></div>");this.table=$("<table class='table'><tbody></tbody></table>");for(var e=(0,d.gatherItemsInOrder)(this.parent.data.specs),i=e.length-1;i>=0;i--)this.addField(this.table.find("tbody"),{key:e[i],val:this.parent.data.specs[e[i]]});t.append(this.table),this.content.prepend(t)},n.prototype.editButtonClick=function(t){var e=$(t.target);if(e=(0,d.findTarget)(e,"btn")){switch(e.attr("id")){case"add-button":this.addField(this.table.find("tbody"));break;case"rm-button":this.removeField(this.table.find("tbody"),e.attr("num"));break;case"cancel-button":this.createContent(),this.close()}e.blur()}},n.prototype.addField=function(t,e){"edit"===mode?t.append("<tr>\t                <td><input name='key' value='"+(e?e.key:"")+"'></td>\t                <td><input name='val' value='"+(e?e.val:"")+"'></td>\t                <td><input type='button' class='btn' id='rm-button' num='"+t.children().length+"' value='Удалить'></td>\t            </tr>"):t.append("<tr>\t                <td>"+(e?e.key:"")+"</td>\t                <td>"+(e?e.val:"")+"</td>\t            </tr>")},n.prototype.removeField=function(t,e){t.children().eq(+e).remove();for(var i=+e;i<t.children().length;i++)t.children().eq(i).find("input").attr("num",i)},n.prototype.submit=function(t){var e=$(t.target),i=this;(0,r.makeDBSaveRequest)("/dbsave?db=Commodity&id="+this.parent.data._id,e.serializeArray(),function(t){t&&alert(t.message),getData(i.parent.dataUrl,createContent)}),this.close(),t.preventDefault()},o.prototype=Object.create(n.prototype),o.prototype.constructor=o,o.prototype.submit=function(t){var e=this,i=$(t.target);if(this.createData)var n=this.createData(i);else var n=i.serializeArray();!n.url&&storedData&&(n.url=storedData.url),(0,r.makeDBSaveRequest)("/dbsave?db="+this.db+"&id="+this.parent.data._id,n,function(t){return t?void(e.callback?e.callback(t):alert(t.message)):void(n&&getData(n.url,function(){createContent(),e.callback&&e.callback(null,n),"Category"===e.db&&sideMenuActive($(".side-menu a[href='"+n.url+"']"))}))}),this.close(),t.preventDefault()},s.prototype=Object.create(a.prototype),s.prototype.constructor=s,s.prototype.render=function(){this.form=$("<form>\t        <div class='form-group'>\t            <label for='username' class='sr-only'>Имя пользователя</label>\t                <input type='text' class='form-control' name='username' id='username' placeholder='Имя пользователя'>\t        </div>\t        <div class='form-group'>\t            <label for='password' class='sr-only'>Пароль</label>\t                <input type='password' class='form-control' name='password' id='password' placeholder='Пароль' autocomplete='off'>\t        </div>\t    </form>"),this.form.css({minWidth:300});var t=$("<button type='submit' class='btn btn-primary' id='auth-button'>"+("signin"===this.type?"Войти":"signup"===this.type?"Регистрация":"")+"</button>");t.css({margin:"0 10px 10px 10px","float":"right"}),this.form.append(t),this.form.on("submit",this.submit.bind(this)),this._render(this.form)},s.prototype.submit=function(t){(0,r.makeAuthorizationRequest)("/"+this.type,this.form,function(t){t?alert(t.message):(a.prototype.close(),location.reload())}),t.preventDefault()},a.prototype._render=function(t){if(this.close(),this.preventScrolling(!0),!this.elem.html()){t&&this.elem.append(t),this.closeButton=$("<div></div>"),this.closeButton.css({width:"20px",height:"20px","float":"right"});var e=$("<img src='/images/gtk-close.png'>");e.css({width:"100%",height:"100%"}),this.closeButton.append(e),this.closeButton.hover(function(){$(this).css({cursor:"pointer"})});var i=$("<div class='clearfix'></div>");this.elem.prepend(this.closeButton),i.insertAfter(this.closeButton),this.elem.css({position:"fixed"})}this.elem.css({visibility:"hidden"}),$(document.body).append(this.elem),this.closeButton.on("click",this.close.bind(this)),$(window).on("resize",this.position.bind(this)),$(document).on("focus",function(){this.focusExecuted||(this.focusExecuted=!0,$(window).off("resize",this.position.bind(this)),$(window).on("resize",this.position.bind(this)))}.bind(this)),$(document).on("click",function(t){$(t.target).attr("href")&&(this.focusExecuted=!1),$(window).off("resize",this.position.bind(this)),$(window).on("resize",this.position.bind(this))}.bind(this)),this.position()},a.prototype.position=function(){var t=this;setTimeout(function(){var e=$(window);t.elem.width()>e.width()?t.elem.css({position:"absolute",top:e.scrollTop()+30+"px",left:"0px"}):t.elem.height()+30>e.height()?t.elem.css({position:"absolute",top:e.scrollTop()+"px",left:e.scrollLeft()+e.width()/2-t.elem.width()/2+"px"}):t.elem.css({position:"fixed",top:"30px",left:e.scrollLeft()+e.width()/2-t.elem.width()/2+"px"}),t.elem.css({visibility:"visible"})},0)},a.prototype.close=function(){$(".mod").remove(),this.preventScrolling(!1)},a.prototype.preventScrolling=function(t){var e=$(document);if($(document.body).css({overflow:t?"hidden":"visible"}),t){var i=$("<div class='dim-background'></div>");i.css({position:"absolute",top:0,left:0,width:"100%",height:e.height(),background:"rgba(0,0,0,.5)",zIndex:2}),$(document.body).append(i)}else $(".dim-background").remove()},e.Details=n,e.Dialog=o,e.AuthWindow=s,e.ModalWindow=a},function(t,e){"use strict";function i(t,e){$.ajax({url:t,type:"GET",dataType:"json"}).done(function(t){e(null,t)}).fail(function(t,i,n){e(n)})}function n(t,e,i){$.ajax({url:t,type:"POST",data:e,statusCode:{200:function(){i(null)},403:function(t){i(JSON.parse(t.responseText))}}})}function o(t,e){$.ajax({url:t,type:"POST",statusCode:{200:function(){e(null)},404:function(t){e(JSON.parse(t.responseText))}}})}function s(t,e,i){$.ajax({url:t,type:"POST",data:e,headers:{"x-file-name":e.name||e},processData:!1,contentType:!1,statusCode:{200:function(){i(null)},403:function(t){i(JSON.parse(t.responseText))}}})}function a(t,e){$.ajax({url:t,type:"GET"}).done(function(){e()}).fail(function(t,i,n){e(n)})}function r(t,e){$.ajax({url:t,type:"GET",dataType:"json"}).done(function(t){e(null,t)}).fail(function(t,i,n){e(n)})}function d(t,e,i){$.ajax({url:t,type:"POST",data:e?e.serialize():null}).done(function(t){i(null,t)}).fail(function(t,e,n){i(JSON.parse(t.responseText))})}Object.defineProperty(e,"__esModule",{value:!0}),e.makeDBSearchRequest=i,e.makeDBSaveRequest=n,e.makeDBDelRequest=o,e.makeFileSaveRequest=s,e.makeFileDeleteRequest=a,e.makeListRequest=r,e.makeAuthorizationRequest=d},function(t,e){"use strict";function i(t,e,i){e=e.split(" ");do{for(var n=0;n<e.length;n++)if(t.hasClass(e[n])||t.attr("id")===e[n])return i?t.children(i):t;t=t.parent()}while(t.length)}function n(t){var e=[];for(var i in t)e.push(i);return e}Object.defineProperty(e,"__esModule",{value:!0}),e.findTarget=i,e.gatherItemsInOrder=n}]);
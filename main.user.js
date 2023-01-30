// ==UserScript==
// @name         feimaoyun 解析 飞猫云
// @namespace    feimaoyun.cf
// @version      0.8
// @description  try to take over the world!
// @website      https://www.feimaoyun.cf/
// @homepage     https://github.com/foxe6/www.feimaoyun.cf
// @homepageURL  https://github.com/foxe6/www.feimaoyun.cf
// @supportURL   https://github.com/foxe6/www.feimaoyun.cf/issues
// @author       foxe6
// @license      AGPLv3
// @match        https://www.feimaoyun.com/s/*
// @icon         https://www.feimaoyun.cf/fmy.jpg
// @require      https://cdn.bootcdn.net/ajax/libs/limonte-sweetalert2/11.7.0/sweetalert2.all.js
// @updateURL    https://raw.fastgit.org/foxe6/www.feimaoyun.cf/main/main.user.js
// @downloadURL  https://raw.fastgit.org/foxe6/www.feimaoyun.cf/main/main.user.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @connect      www.feimaoyun.cf
// @connect      www.feimaoyun.com
// @connect      cdn.bootcdn.net
// @connect      hub.fastgit.org
// ==/UserScript==


if(GM_getValue("configured")){
    GM_deleteValue("configured");
}
function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}
let ex = function(){
    let msg = [
        "白嫖很爽，更爽的还有 VIP 通道",
        "每天300次要388？VIP 通道更胜一筹",
        "我为人人，人人为我，你愿付出，我愿承担",
        "「白嫖江山，也需要你们一份发电」",
        "你的无私奉献，带给作者动力，为他人雪中送炭"
    ];
    return{
        "frequent": "操作频繁<br/>"+msg[randint(0, msg.length-1)],
        "restart": "服务器重启中",
        "not found": "文件失效",
        "timeout": "队列超时",
        "connection error": "飞猫服务器超时",
        "unknown error": "未知错误（请回报）",
        "script error": "脚本错误（请回报）",
        "incorrect link format": "链接格式不正确",
        "heavy load": "今天公用解析额满，隔天恢复<br/>试试领 VIP 试用券；重试几次蹭 VIP 通道",
        "account": "是的，炸了，隔天才能恢复",
        "retry": "验证失败",
        "token expire": "VIP 解析次数耗尽"
    };
}
let pw = window.location.search.indexOf("pucode=")!==-1&&window.location.search.split("pucode=").slice(-1)[0];
GM_registerMenuCommand("前往主站", function() {
    Swal.fire({
        "html": "前往 <a href='https://www.feimaoyun.cf/' target='_blank'>飞猫在线解析</a> 网站",
        "confirmButtonText": "关闭"
    });
});
/*GM_registerMenuCommand("重新配置", async function() {
    GM_deleteValue("token");
    GM_deleteValue("behaviors");
    await init();
    window.location.reload(true);
});
GM_registerMenuCommand("清除配置", async function() {
    let r = await Swal.fire({
        "title": "清除配置？",
        "showCancelButton": true,
        "allowOutsideClick": false,
        "allowEscapeKey": false,
        "confirmButtonText": "确认",
        "cancelButtonText": "取消",
        "focusCancel": true,
        "reverseButtons": true
    });
    if(!r.isConfirmed){
        return;
    }
    GM_deleteValue("token");
    GM_deleteValue("behaviors");
    window.location.reload(true);
});*/
GM_registerMenuCommand("清除 token", async function() {
    let r = await Swal.fire({
        "title": "清除 token？",
        "showCancelButton": true,
        "allowOutsideClick": false,
        "allowEscapeKey": false,
        "confirmButtonText": "确认",
        "cancelButtonText": "取消",
        "focusCancel": true,
        "reverseButtons": true
    });
    if(!r.isConfirmed){
        return;
    }
    GM_deleteValue("token");
    window.location.reload(true);
});
GM_registerMenuCommand("查询 token 次数", async function() {
    if(GM_getValue("token")){
        let r = await token_ct();
        Swal.fire({
            "title": "token 余 "+r+" 次",
            "confirmButtonText": "关闭"
        });
    }
    else{
        Swal.fire({
            "title": "未配置 token",
            "confirmButtonText": "关闭"
        });
    }
});
GM_registerMenuCommand("赞助 foxe6", function() {
    Swal.fire({
        "html": "请前往 <a href='https://afdian.net/a/foxe6' target='_blank'>爱发电</a> 赞助我！",
        "confirmButtonText": "关闭"
    });
});
function post(url, data){
    data = data||null;
    return new Promise(function(resolve, reject){
        $.post("https://www.feimaoyun.cf/api?"+url, data, function(r){
            resolve(r);
        }).fail(function(r){
            reject(r);
        });
    });
}
async function token_ct(){
    let token = GM_getValue("token");
    return await post("token_ct"+(token?"&"+token:""));
}
async function get_file(code, pw){
    let token = GM_getValue("token");
    return await post("get_file"+(token?"&"+token:""), JSON.stringify([code, pw, {}]));
}
async function init(first){
    let changed=0;
    if(!GM_getValue("token")){
        while(true){
            let r = await Swal.fire({
                "title": (first?"检测第一次使用\n":"")+"请输入 token",
                "input": "text",
                "showCancelButton": true,
                "allowOutsideClick": false,
                "allowEscapeKey": false,
                "inputPlaceholder": "64位字母数字",
                "confirmButtonText": "保存",
                "cancelButtonText": "没有 token，开始试用",
                "reverseButtons": true,
                "inputAttributes": {
                    "maxLength": 64,
                    "autocapitalize": "off",
                    "autocorrect": "off"
                }
            });
            if(r.isConfirmed){
                if(r.value.length!==64){
                    await Swal.fire({
                        "icon": "error",
                        "title": "token 错误\n请重新输入",
                        "allowOutsideClick": false,
                        "allowEscapeKey": false,
                        "confirmButtonText": "好的",
                    });
                    continue;
                }
                else{
                    changed = 1;
                    GM_setValue("token", r.value);
                    break;
                }
            }
            else{
                changed = 1;
                GM_setValue("token", "None");
                break;
            }
        }
    }
    /*if(GM_getValue("token").length===64&&(GM_getValue("behaviors")||[]).length!==2){
        let r = await Swal.fire({
            "title": (first?"检测第一次使用\n":"")+"请配置解析行为",
            "html": "<div id='behaviors'><div class='bgroup'><div class='bheader'>进入 文件页 后</div><label><input type='checkbox' checked='checked'/><span>开始自动解析</span></label><label><input type='checkbox'/><span>不提示消耗 token</span></label></div></div>",
            "allowOutsideClick": false,
            "allowEscapeKey": false,
            "confirmButtonText": "保存",
            "preConfirm": function(){
                return $("div#behaviors input[type='checkbox']").map(function(i, e){
                    return $(this).prop("checked");
                }).get();
            }
        });
        if(r.isConfirmed){
            changed = 1;
            GM_setValue("behaviors", r.value);
        }
    }*/
    if(first&&changed){
        await Swal.fire({
            "icon": "success",
            "title": "配置完成\n感谢使用",
            "allowOutsideClick": false,
            "allowEscapeKey": false,
            "confirmButtonText": "关闭"
        });
    }
}
async function check_token(){
    try{
        let r = await token_ct();
        if(r>=1&&r<=3){
            await Swal.fire({
                "icon": "warning",
                "title": "token 解析次数即将耗尽\n余 "+r+" 次",
                "allowOutsideClick": false,
                "allowEscapeKey": false,
                "confirmButtonText": "好的"
            });
        }
        else if(r===0){
            r = await Swal.fire({
                "icon": "warning",
                "title": "token 解析次数耗尽",
                "showCancelButton": true,
                "allowOutsideClick": false,
                "allowEscapeKey": false,
                "cancelButtonText": "忽略",
                "focusCancel": true,
                "reverseButtons": true,
                "confirmButtonText": "重新配置"
            });
            if(r.isConfirmed){
                GM_deleteValue("token");
                GM_deleteValue("behaviors");
                await init();
                return true;
            }
            else{
                throw {status: 401};
            }
        }
    }
    catch(e){
        e.status=e.status||500;
        let error = {
            401: "token expire",
            429: "frequent",
            500: "restart"
        };
        await Swal.fire({
            "icon": "error",
            "title": "发生错误，无法开始解析\n错误："+(ex()[error[e.status]]||e.status),
            "allowOutsideClick": false,
            "allowEscapeKey": false,
            "confirmButtonText": "请稍后重试"
        });
        throw e;
    }
}
async function parse_file(code, pw){
    try{
        let r = await get_file(code, pw);
        if("error" in r){
            await Swal.fire({
                "icon": "error",
                "title": "解析错误",
                "text": ex()[r["error"]]||r["error"],
                "allowOutsideClick": false,
                "allowEscapeKey": false,
                "confirmButtonText": "请稍后重试"
            });
        }
        else{
            await Swal.fire({
                "icon": "success",
                "title": "解析成功",
                "html": "<div>文件名："+r["name"]+"</div><div>文件大小："+h_size(r["size"])+"</div><div>下载链接：<a href='"+r["link"]+"' target='_blank'>"+r["link"]+"</a></div>",
                "allowOutsideClick": false,
                "allowEscapeKey": false,
                "confirmButtonText": "关闭"
            });
        }
    }
    catch(e){
        e.status=e.status||500;
        let error = {
            401: "token expire",
            429: "frequent",
            500: "restart"
        };
        await Swal.fire({
            "icon": "error",
            "title": "发生错误，无法开始解析\n错误："+(ex()[error[e.status]]||e.status),
            "allowOutsideClick": false,
            "allowEscapeKey": false,
            "confirmButtonText": "请稍后重试"
        });
        throw e;
    }
}
function h_size(size) {
    let i = size === 0 ? 0 : Math.floor( Math.log(size) / Math.log(1024) );
    return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + " " + ["B", "KiB", "MiB", "GiB", "TiB"][i];
}
async function main(override){
    $("div.fileVideoBox ul").remove();
    if(GM_getValue("token").length===64){
        let ul = $("<ul class='rightBox'><li class='videoItem'><div class='cover'><span><span>不</span>自动<br/>开始解析</span></div></li></ul>").on("click", async function(e){
            $(this).toggleClass("on").find("span span").toggle();
            let behaviors = (GM_getValue("behaviors")||[0,0]);
            behaviors[0] = !behaviors[0];
            GM_setValue("behaviors", behaviors);
        });
        if((GM_getValue("behaviors")||[0,0])[0]){
            ul.toggleClass("on").find("span span").toggle();
        }
        $("div.fileVideoBox").append(ul);
        ul = $("<ul class='rightBox'><li class='videoItem'><div class='cover'><span><span>不</span>提示消耗<br/>token</span></div></li></ul>").on("click", async function(e){
            $(this).toggleClass("on").find("span span").toggle();
            let behaviors = (GM_getValue("behaviors")||[0,0]);
            behaviors[1] = !behaviors[1];
            GM_setValue("behaviors", behaviors);
        });
        if(!(GM_getValue("behaviors")||[0,0])[1]){
            ul.toggleClass("on").find("span span").toggle();
        }
        $("div.fileVideoBox").append(ul);
    }
    $("div.fileVideoBox").append($("<ul class='rightBox'><li id='videoItem' class='videoItem'><div class='cover'><img src='https://www.feimaoyun.cf/fmy.jpg'>解析</div></li></ul>").on("click", async function(e){
        await main(1);
    }));
    $("div.main-content").scrollLeft(50);
    if(GM_getValue("token").length!==64){
        let iframe='<iframe id="fmy_embed" src="'+window.location.href.replace("n.com","n.cf")+'"></iframe>';
        $("div.normalBox").children().not("div.fileBox").remove();
        $("div.fileBox div.actBox").remove();
        $("div.normalBox").append(iframe);
    }
    else{
        if(override||(GM_getValue("behaviors")||[0,0])[0]){
            async function next(){
                let restart = await check_token();
                if(restart){
                    window.location.reload(true);
                    return;
                    //return await main(override);
                }
                let code = window.location.pathname.split("/").pop().slice(0, 8);
                pw = (pw||$("div.pucodeVal input").val()).slice(0, 4);
                await parse_file(code, pw);
            }
            let r = {"isConfirmed": true};
            if(!(GM_getValue("behaviors")||[0,0])[1]){
                r = await Swal.fire({
                    "title": "开始解析？",
                    "text": "解析将消耗次数",
                    "showCancelButton": true,
                    "allowOutsideClick": false,
                    "allowEscapeKey": false,
                    "confirmButtonText": "确认",
                    "cancelButtonText": "取消",
                    "focusCancel": true,
                    "reverseButtons": true
                });
            }
            if(r.isConfirmed){
                Swal.fire({
                    "title": "解析中",
                    "text": "请稍等",
                    "allowOutsideClick": false,
                    "allowEscapeKey": false,
                    "confirmButtonText": "确认"
                });
                Swal.showLoading();
                await next();
            }
        }
    }
}
$("head").append("<style>#videoItem .cover {border-color: #fc9c40;}ul.rightBox.on .cover{color: white;background-color:blue;}ul.rightBox .cover{text-align:center;border:1px solid #4693ff;color:#4693ff;font-size: 1.5em;display: flex;justify-content: space-evenly;align-items: center;}.fmDownA .fileBox .fileVideoBox .leftBox .fileName {width: 458px !important;}div#behaviors { display: flex; justify-content: center; align-items: center; flex-direction: column; }.bgroup label span { margin-left: 0.5em; }.bgroup label { margin-top: 0.25em;margin-left: 0.5em; display: flex; justify-content: center; align-items: center; }.bheader { font-weight: bold; font-size: 1.25em; }.bgroup { display: inline-flex; justify-content: center; align-items: flex-start; flex-direction: column;margin-top: 1em; }#fmy_embed{width: 100%;height: calc(100vh - 370px);min-width: 920px;border: 0;margin-top: 20px;}div.main-content{overflow-x:auto!important;}.swal2-popup {font-size: 1.5em !important;font-family: \"Microsoft JhengHei\", sans-serif;}#videoItem .cover{background-color: #fc9c40;color:#fff;display: flex; justify-content: space-evenly; align-items: center;}#videoItem .cover img{width: 2em; height: 2em;}</style>");
setTimeout(async function() {
    await init(1);
    if(window.location.hostname==="www.feimaoyun.com"){
        let ti = setInterval(async function(){
            if(!$("div.act.act1").is(":visible")){
                return;
            }
            clearInterval(ti);
            await main();
        },500);
    }
}, 100);

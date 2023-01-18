// ==UserScript==
// @name         feimaoyun 解析 飞猫云
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       foxe6
// @match        https://www.feimaoyun.com/s/*
// @match        https://www.feimaoyun.cf/*
// @icon         https://www.feimaoyun.cf/fmy.jpg
// @require      https://cdn.bootcdn.net/ajax/libs/limonte-sweetalert2/11.7.0/sweetalert2.all.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// ==/UserScript==


let pw = window.location.search.indexOf("pucode=")!==-1&&window.location.search.split("pucode=").slice(-1)[0];
GM_registerMenuCommand("前往主站", function() {
    Swal.fire({
        "html": "前往 <a href='https://www.feimaoyun.cf/' target='_blank'>飞猫在线解析</a> 网站",
        "confirmButtonText": "关闭"
    });
});
GM_registerMenuCommand("配置 token", async function() {
    await init();
    window.location.reload(true);
});
GM_registerMenuCommand("查询 token 次数", async function() {
    let token = GM_getValue("token");
    if(token){
        let r = await token_ct(token);
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
    GM_deleteValue("configured");
    window.location.reload(true);
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
async function token_ct(token){
    return await post("token_ct"+(token?"&"+token:""));
}
async function get_file(token, code, pw){
    return await post("get_file"+(token?"&"+token:""), JSON.stringify([code, pw, {}]));
}
async function init(first){
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
                GM_setValue("token", r.value);
                GM_setValue("configured", "1");
                break;
            }
        }
        else{
            GM_setValue("configured", "1");
            break;
        }
    }
}
async function check_token(token){
    try{
        let r = await token_ct(token);
        if(r>=1&&r<=3){
            await Swal.fire({
                "icon": "warning",
                "title": "token 解析次数即将耗尽\n余 "+r+" 次",
                "confirmButtonText": "知道"
            });
        }
        else if(r===0){
            r = await Swal.fire({
                "icon": "error",
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
                await init();
            }
        }
    }
    catch(e){
        await Swal.fire({
            "icon": "error",
            "title": "发生错误，无法开始解析",
            "allowOutsideClick": false,
            "allowEscapeKey": false,
            "confirmButtonText": "请稍后重试"
        });
        throw e;
    }
}
async function parse_file(token, code, pw){
    let r = await get_file(token, code, pw);
    if("error" in r){
        let msg = [
            "白嫖很爽，更爽的还有 VIP 通道",
            "每天300次要388？VIP 通道更胜一筹",
            "我为人人，人人为我，你愿付出，我愿承担",
            "「白嫖江山，也需要你们一份发电」",
            "你的无私奉献，带给作者动力，为他人雪中送炭"
        ]
        function randint(min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min)
        }
        let ex = {
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
        }
        await Swal.fire({
            "icon": "error",
            "title": "解析错误",
            "text": ex[r["error"]]||r["error"],
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
function h_size(size) {
    let i = size === 0 ? 0 : Math.floor( Math.log(size) / Math.log(1024) );
    return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + " " + ["B", "KiB", "MiB", "GiB", "TiB"][i];
}
async function main(){
    $("li.videoItem").parent().empty().append("<li class='videoItem'><div class='cover' style='background-color: #fc9c40;color:#fff;display: flex; justify-content: space-evenly; align-items: center;'><img src='https://www.feimaoyun.cf/fmy.jpg' style='width: 2em; height: 2em;'>重新解析</div></li>").off("click").on("click", async function(e){
        await main();
    });
    $("div.main-content").scrollLeft(50);
    let token = GM_getValue("token");
    if(!token){
        let iframe='<iframe src="'+window.location.href.replace("n.com","n.cf")+'" style="width: 100%;height: calc(100vh - 370px);min-width: 920px;border: 0;margin-top: 20px;"></iframe>';
        $("div.normalBox").children().not("div.fileBox").remove();
        $("div.fileBox div.actBox").remove();
        $("div.normalBox").append(iframe);
    }
    else{
        await check_token(token);
        let code = window.location.pathname.split("/").pop().slice(0, 8);
        pw = (pw||$("div.pucodeVal input").val()).slice(0, 4);
        await parse_file(token, code, pw);
    }
}
$("head").append("<style>div.main-content{overflow-x:auto!important;}.swal2-popup {font-size: 1.5em !important;font-family: \"Microsoft JhengHei\", sans-serif;}</style>");
setTimeout(async function() {
    if(!GM_getValue("configured")){
        await init(1);
    }
    if(window.location.hostname==="www.feimaoyun.com"){
        let ti = setInterval(async function(){
            if(!$("div.act.act1").is(":visible")){
                return;
            }
            clearInterval(ti);
            await main();
        },1000);
    }
}, 100);

/**
 * @desc index
 * */

const fs = require('fs');
const path = require('path');
const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
const EVENTS = require('../../script/events');
const fileHandler = require('../../script/file');
const dirname = __dirname;
const staticPath = path.join(dirname, '../static');
const libPath = path.join(staticPath, 'lib' , '/');
const resourcePath = path.join(dirname, '../resource');

var readExample = function(){
    return fs.readFileSync(path.join(resourcePath, 'example.md'), {encoding: 'utf8'});
};

var createEditor = function (content) {
    
    var $body = $('body');

    var editor = editormd("markdown", {
        width: "100%",
        height: 0,
        path: libPath,
        theme: "default",
        previewTheme: "default",
        editorTheme: "default",
        markdown: content,
        codeFold: true,
        htmlDecode : true,
        syncScrolling: true,
        saveHTMLToTextarea: true,
        searchReplace: true,
        watch: true,
        toolbar: true,             //关闭工具栏
        previewCodeHighlight: true, //关闭预览 HTML 的代码块高亮，默认开启
        emoji: true,
        taskList: true,
        tocm: true,                  // Using [TOCM]
        tex: true,                   // 开启科学公式TeX语言支持，默认关闭
        flowChart: true,             // 开启流程图支持，默认关闭
        sequenceDiagram: true,       // 开启时序/序列图支持，默认关闭,
        dialogLockScreen: true,   // 设置弹出层对话框不锁屏，全局通用，默认为true
        dialogShowMask: true,     // 设置弹出层对话框显示透明遮罩层，全局通用，默认为true
        dialogDraggable: true,    // 设置弹出层对话框不可拖动，全局通用，默认为true
        dialogMaskOpacity: 0.1,    // 设置透明遮罩层的透明度，全局通用，默认值为0.1
        dialogMaskBgColor: "#fff", // 设置透明遮罩层的背景颜色，全局通用，默认为#fff
        imageUpload: true,
        imageFormats: ["jpg", "jpeg", "gif", "png", "bmp", "webp"],
        onload: function () {

            $body.css({background: '#fff'});
            
            $(window).resize(function () {
                editor.height($(window).height());
                editor.width($(window).width());
            });

            this.watch().fullscreen();
        }
    });



    return editor;
};


exports.init = function (window) {
    window.$ = window.jQuery = require("../static/lib/jquery.min");
    window.editormd = require("../static/editormd");
    window.flowchart = require("../static/lib/flowchart.min");
    var JQflowchart = require("../static/lib/jquery.flowchart.min");
    var editor = createEditor(readExample());

    //register file menu events
    ipcRenderer.on(EVENTS.MENUS_EVENT.NEW_FILE, function (event, fileContent) {
        editor.clear();
    });

    ipcRenderer.on(EVENTS.MENUS_EVENT.OPEN_FILE, function (event, fileContent) {
        editor.setMarkdown(fileContent);
    });

    ipcRenderer.on(EVENTS.MENUS_EVENT.SAVE_FILE, function (event, filename) {
        if(filename){
            const ext = path.extname(filename).toLowerCase();
            const file = path.basename(filename, ext);

            if(ext != '.md'){
                filename = filename + '.md';
            }

            const content = editor.getMarkdown();
            fileHandler.saveFile(filename, content);
        }
    });

    ipcRenderer.on(EVENTS.MENUS_EVENT.EXPORT_HTML_FILE, function (event, filename) {
        if(filename){
            const ext = path.extname(filename).toLowerCase();
            const file = path.basename(filename, ext);

            if(ext != '.html'){
                filename = filename + '.html';
            }

            const content = editor.getPreviewedHTML();
            const htmlPath = path.join(resourcePath, 'template.html');

            fileHandler.readFile(htmlPath, {encoding: 'utf8'}, function (err, html) {
                if(err){
                    fileHandler.saveFile(filename, content);
                }else{

                    html = html.replace('{{content}}', content);

                    fileHandler.saveFile(filename, html, function (err) {
                        if(err){
                            console.log(err);
                        }
                    });
                }
            });
        }
    });

    ipcRenderer.on(EVENTS.MENUS_EVENT.EXPORT_PDF_FILE, function (event, fileContent) {
        //save pdf file
    });

    //view menu evnet
    ipcRenderer.on(EVENTS.MENUS_EVENT.SPLIT_VIEW, function (event) {
        if(editor.state.watching){
            editor.unwatch();
        }else{
            editor.watch();
        }
    });

    ipcRenderer.on(EVENTS.MENUS_EVENT.PRE_VIEW, function (event) {
        editor.previewing();
    });

    ipcRenderer.on(EVENTS.MENUS_EVENT.LOCK_VIEW, function (event) {
        editor.lockScreen(true);
    });
}
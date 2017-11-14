const electron = require('electron');
const path = require('path');
const fs = require('fs');
const {
    dialog
} = require('electron').remote;


const {
    ipcRenderer
} = require('electron')
const Store = require('./Store.js');

function Task(id) {
    //生成一个uuid
    this.Id = id
}

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
    return uuid;
};

function parseDateFile(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath));
    } catch (error) {
        return "error";
    }
}

function getTaskJSONFilePath(taskId) {
    const userDataPath = (electron.app || electron.remote.app).getPath('userData');
    const filePath = path.join(userDataPath, 'tasks\\' + taskId + '.json');
    return filePath;
}

const userDataPath = (electron.app || electron.remote.app).getPath('userData');
const tasksPath = userDataPath + '\\tasks';
var files;
var tasks;
try {
    fs.mkdirSync(tasksPath);
} catch (error) {
    // console.log(error);
} finally {
    try {
        files = fs.readdirSync(tasksPath);
    } catch (error) {
        // console.log(error);
    }
    if (files) {
        tasks = [];
        for (var i = 0; i < files.length; i++) {
            var filePath = tasksPath + "\\" + files[i];
            tasks.push(parseDateFile(filePath));
        }
        // console.log(tasks);
    }
}

function initTaskLayout(task) {
    var task_item_layout =
        "<div id='" + task.Id + "' class='todoitem'>" +
        "<div class='dele_btn'></div>" +
        "<input />" +
        "<div class='time_container'>" +
        "</div>" +
        "<div class='time_btn_start'></div>" +
        "</div>";
        var haveconent=$("#content").children();
        console.log(haveconent.length);
    if (haveconent.length) { 
        $("#content").prepend(task_item_layout);
    } else {
        console.log("have no chlidern");
        $("#content").append(task_item_layout);
    }

    var input_area = $("#" + task.Id).children("input");
    input_area.attr("placeholder", "None Task Title");
    input_area.blur(function () {
        task.Title = input_area.val();
        var filePath = getTaskJSONFilePath(task.Id);
        var task_json = parseDateFile(filePath);
        // console.log(task_json.task)
        task_json.task.Title = task.Title;
        fs.writeFileSync(filePath, JSON.stringify(task_json));
    });
    if (task.Title) {
        input_area.val(task.Title);
    }
    var log_div = $("#" + task.Id).children("div.time_container");
    if (task.log) {
        var log = task.log;
        var time = 0;
        for (var i = 0; i < log.length; i++) {
            var time1 = new Date(log[i].startTime);
            var time2 = new Date(log[i].endTime);
            time = time + (time2 - time1);
        }
        time = Math.floor(time / 1000);
        var h = Math.floor(time / 3600);
        var temp = time % 3600;
        var m = Math.floor(temp / 60);
        var s = temp % 60;

        var logStr = h + " h " + m + " m " + s + " s";
        log_div.text(logStr);
    } else {
        log_div.text("未开始");
    }
    var delete_btn = $("#" + task.Id).children("div.dele_btn");
    delete_btn.click(function () {
        dialog.showMessageBox({
            buttons: ["确定", "取消"],
            message: "是否删除该任务"
        }, function (response) {
            switch (response) {
                case 0:
                    delete_btn.parent().remove();
                    deleteTask(task.Id);
                    return;
                case 1:
                    return;
            }
        });

    });
    var start_btn = $("#" + task.Id).children("div.time_btn_start");
    start_btn.click(function () {
        var title = task.Title; // start_btn.parent().children("input").val();
        ipcRenderer.send('create_taskwindow', {
            title: title,
            id: task.Id,
        });
    });
}

/**
 * 删除一个任务
 */
function deleteTask(taskId) {
    var delete_path = tasksPath + "\\" + taskId + ".json";
    // console.log(path);
    if (fs.existsSync(delete_path)) {
        fs.unlink(delete_path, (err) => {
            if (err) {
                alert("An error ocurred updating the file" + err.message);
                // console.log(err);
                return;
            }
            // console.log("File succesfully deleted");
        });
    } else {
        alert("This file doesn't exist, cannot delete");
    }

}
/**
 * 进行数据刷新。
 */
function updateUI(taskId) {
    var log_div = $("#" + taskId).children("div.time_container");
    var filePath = tasksPath + "\\" + taskId + ".json";
    var task = parseDateFile(filePath);
    var log = task.task.log;
    var time = 0;
    for (var i = 0; i < log.length; i++) {
        var time1 = new Date(log[i].startTime);
        var time2 = new Date(log[i].endTime);
        time = time + (time2 - time1);
    }
    time = Math.floor(time / 1000);
    var h = Math.floor(time / 3600);
    var temp = time % 3600;
    var m = Math.floor(temp / 60);
    var s = temp % 60;

    var logStr = h + "h" + m + "m" + s + "s";
    log_div.text(logStr);
}

ipcRenderer.on('refresh', (event, arg) => {
    console.log(arg) // prints "pong"
    updateUI(arg);
})

//滚动条在Y轴上的滚动距离

function getScrollTop() {　　
    var scrollTop = 0,
        bodyScrollTop = 0,
        documentScrollTop = 0;　　
    if (document.body) {　　　　
        bodyScrollTop = document.body.scrollTop;　　
    }　　
    if (document.documentElement) {　　　　
        documentScrollTop = document.documentElement.scrollTop;　　
    }　　
    scrollTop = (bodyScrollTop - documentScrollTop > 0) ? bodyScrollTop : documentScrollTop;　　
    return scrollTop;
}

//文档的总高度

function getScrollHeight() {　　
    var scrollHeight = 0,
        bodyScrollHeight = 0,
        documentScrollHeight = 0;　　
    if (document.body) {　　　　
        bodyScrollHeight = document.body.scrollHeight;　　
    }　　
    if (document.documentElement) {　　　　
        documentScrollHeight = document.documentElement.scrollHeight;　　
    }　　
    scrollHeight = (bodyScrollHeight - documentScrollHeight > 0) ? bodyScrollHeight : documentScrollHeight;　　
    return scrollHeight;
}

//浏览器视口的高度

function getWindowHeight() {　　
    var windowHeight = 0;　　
    if (document.compatMode == "CSS1Compat") {　　　　
        windowHeight = document.documentElement.clientHeight;　　
    } else {　　　　
        windowHeight = document.body.clientHeight;　　
    }　　
    return windowHeight;
}


$(document).ready(function () {
    //页面滚动到底部监听
    $(window).scroll(function (event) {
        if (getScrollTop() + getWindowHeight() == getScrollHeight()) {
            // console.log("you are in the bottom!");
            $("#addbtn").hide();
        } else {
            $("#addbtn").show();
        }
    });
    if (tasks) {
        for (x in tasks) {
            var t = new Task(tasks[x].task.Id);
            t.Title = tasks[x].task.Title;
            t.CreatTime = tasks[x].task.CreatTime;
            t.log = tasks[x].task.log;
            initTaskLayout(t);
        }
    }
    /**
     * 点击添加按钮，添加一个todoitem
     */
    $("#addbtn").click(function () {
        var task = new Task(generateUUID());
        var CreatTime = new Date();
        const store = new Store({
            configName: task.Id,
            defaults: {
                task: {
                    Id: task.Id,
                    Title: "",
                    CreatTime: CreatTime,
                    log: []
                }
            }
        });
        initTaskLayout(task);
        store.set();
    });
});
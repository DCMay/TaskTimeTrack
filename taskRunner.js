const electron = require('electron');
const path = require('path');
const fs = require('fs');

const {
    ipcRenderer
} = require('electron')

var taskWindow = require('electron').remote.getCurrentWindow();
var taskTitle = taskWindow.data.title;
if(!taskTitle){
    taskTitle="None Task Title";
}
var taskId = taskWindow.data.taskId;

var timer;
var startTime;
var endTime;

function getTaskJSONFilePath(taskId){
    const userDataPath = (electron.app || electron.remote.app).getPath('userData');
    const filePath = path.join(userDataPath, 'tasks\\'+taskId + '.json');
    return filePath;
}
function parseDateFile(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath));
    } catch (error) {
        return "error";
    }
}

$(document).ready(function () {
    startTime = new Date();
    $("#task_title span").text(taskTitle);
    var h = 0;
    var m = 0;
    var s = 0;
    var text_s = 0;
    var text_m = 0;
    var text_h = 0;
    timer = setInterval(function () {
        s = s + 1;
        if (s > 59) {
            s = 0;
            m = m + 1;
            text_s = s
        }
        if (m > 59) {
            m = 0;
            h = h + 1;
            text_m = m;
        }
        if (s < 10) {
            text_s = "0" + s;
        } else {
            text_s = s;
        }
        if (m < 10) {
            text_m = "0" + m;
        } else {
            text_m = m;
        }
        if (h < 10) {
            text_h = "0" + h;
        } else {
            text_h = h;
        }
        $("#task_time").text(text_h + ":" + text_m + ":" + text_s)

    }, 1000);
    $("#btn_close").click(function () {
        clearInterval(timer);
        var filePath = getTaskJSONFilePath(taskId);
        var task_json= parseDateFile(filePath);
        // console.log(task_json.task)
        task_json.task.Title = $("#task_title span").text();
        task_json.task.log.push({
            'startTime': startTime,
            'endTime': new Date()
        });
        fs.writeFileSync(filePath, JSON.stringify(task_json));

        ipcRenderer.send('task_window_close',taskId);
    });
})
const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const {
  dialog
} = require('electron')

const path = require('path')
const url = require('url')
//主进程
const {ipcMain} = require('electron')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let taskWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    resizable:false,
    maximizable:false,
  })
  mainWindow.setMenu(null);//取消默认的菜单栏

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  });
}

//这里是新建任务执行窗口
function createTaskWindow(arg) {
  // console.log("creating task window")
  const screen = require('electron').screen
  const display = screen.getPrimaryDisplay()
  // console.log(display.workArea)//{ x: 0, y: 0, width: 1920, height: 1040 }
  // console.log(display.workArea.width)//1920

  // Create the browser window.
  var win_width = 600;
  var win_height = 50;
  var screen_width =display.workArea.width;

  taskWindow = new BrowserWindow({
    width: win_width,
    height: win_height,
    maxWidth:win_width,
    maxHeight:win_height,
    resizable:false,
    maximizable:false,
    frame: false
  })
  taskWindow.data={
    'title':arg.title,
    'taskId':arg.id,
  }

  taskWindow.on('close', function () {
    taskWindow = null
  })
  taskWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'doing.html'),
    protocol: 'file:',
    slashes: true
  }))
  taskWindow.setAlwaysOnTop(true, "floating", 1);
  taskWindow.setVisibleOnAllWorkspaces(true);
  taskWindow.setPosition(screen_width / 2 - win_width / 2, 0)
  taskWindow.show()
  // taskWindow.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {
  createWindow();
  // console.log(app.getPath('userData'))//这里输出默认的用户文件位置。
 
})

ipcMain.on('task_window_close', (event,arg)=>{
  taskWindow.close();
  mainWindow.restore();
  mainWindow.focus();
  mainWindow.webContents.send("refresh",arg);
})
ipcMain.on('create_taskwindow', (event,arg)=>{
  if(taskWindow){
    dialog.showErrorBox("已经有任务在执行中","");
    return;
  }
  createTaskWindow(arg);
  mainWindow.minimize();
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

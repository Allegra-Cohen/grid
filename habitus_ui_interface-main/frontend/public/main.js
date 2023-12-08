const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const isDev = require('electron-is-dev');
const log = require('electron-log');
const fs = require('fs')
const url = require('url')

// Initialize remote module to enable interaction with the main process
require('@electron/remote/main').initialize();

let backendProcess;

// Function to create the main window
function createMainWindow() {
  // Define the command and arguments for running the backend server
  //const command = 'python3';
  const command = isDev ? path.join(__dirname, '../../venv/bin/python') : path.join(app.getAppPath(), '../venv/bin/python');
  log.info("pythonPath", command);
  const args = ['-m', 'uvicorn', 'main2:app'];

  // Define the server directory based on the environment
  const serverDirectory = isDev ? path.join(__dirname, '../../') : path.join(app.getAppPath(), '../');

  // Spawn the backend process
  backendProcess = spawn(command, args, { cwd: serverDirectory });

  // Handle backend process output
  backendProcess.stdout.on('data', (data) => {
    log.info(`Backend process stdout: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    const errorMessage = data.toString();
    log.info(`Backend process stderr: ${errorMessage}`);
  });

  backendProcess.on('close', (code) => {
    log.info(`Backend process exited with code ${code}`);
    backendProcess.kill();
  });

  // Create the main application window
  const win = new BrowserWindow({
    width: 1024,
    height: 800,
    icon: path.join(__dirname, 'grid_logo.png'), // Set the window icon
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      devTools: true
    }
  });

  // Load the application URL based on the environment
  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );
}

// Initialize the Electron app
app.on('ready', () => {

  // Define the path for the installation flag file

  const installationFlagPath = path.join(app.getPath('userData'), 'installation-flag');

  log.info('installation flag path: ', installationFlagPath);

  //log.info('!fs.existsSync(installationFlagPath)', !fs.existsSync(installationFlagPath));


  // Check if the installation flag file exists

  if (!fs.existsSync(installationFlagPath)) {

    // Create a new window to show installation progress

    let installationWindow = new BrowserWindow({
      icon: path.join(__dirname, 'grid_logo.png'), // Set the window icon
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        devTools: true,
      }

    });

    // Define the path for the installation HTML file
    const fileInstallPackages = isDev
      ? path.join(__dirname, 'installPackages.html')
      : path.join(app.getAppPath(), '../', 'installPackages.html');


    // Define the path for the installation HTML file
    const errorInstallPackages = isDev
      ? path.join(__dirname, 'errorInstall.html')
      : path.join(app.getAppPath(), '../', 'errorInstall.html');
    // Load the installation HTML file into the window

    isDev
      ? installationWindow.loadFile(fileInstallPackages)
      : installationWindow.loadURL(url.format({
        pathname: fileInstallPackages,
        protocol: 'file:',
        slashes: true,
      }));

    const venvPath = isDev ? path.join(__dirname, '../../venv') : path.join(app.getAppPath(), '../venv');
    const requirementsPath = isDev ? path.join(__dirname, '../../requirements.txt') : path.join(app.getAppPath(), '../requirements.txt');

    exec(`python3 -m venv ${venvPath}`, (error, stdout, stderr) => {
      //log.info('stdout', stdout)
      //log.info('stderr', stderr)
      if (error) {
        log.info(`Error creating virtual environment: ${error.message}`);
        isDev
          ? installationWindow.loadFile(errorInstallPackages)
          : installationWindow.loadURL(url.format({
            pathname: errorInstallPackages,
            protocol: 'file:',
            slashes: true,
          }));
        return;
      }
      log.info(`Virtual environment created!`);
      // Virutal environment activation and modules installation
      // console.log(venvPath)
      exec(`cd ${venvPath} && source bin/activate && pip3 install -r ${requirementsPath} && python3 -m spacy download en_core_web_sm`, (error, stdout, stderr) => {
        log.info('stdout', stdout)
        log.info('stderr', stderr)
        if (error) {
          log.info(`Error on install modules: ${error.message}`);
          isDev
            ? installationWindow.loadFile(errorInstallPackages)
            : installationWindow.loadURL(url.format({
              pathname: errorInstallPackages,
              protocol: 'file:',
              slashes: true,
            }));
          return;
        }
        log.info('Modules installed!');
        // Define the path for the Python script
        const pythonScriptPath = isDev ? path.join(__dirname, '../../') : path.join(app.getAppPath(), '../');
        // Spawn the Python process to install packages
        const pythonProcess = spawn('python3', ['installPackages.py'], { cwd: pythonScriptPath });
        // Handle Python process output
        pythonProcess.stdout.on('data', (data) => {
          const output = data.toString();
          log.info(output);
        });
        pythonProcess.stderr.on('data', (data) => {
          const errorOutput = data.toString();
          //log.info('errorOutput', errorOutput);
          // Send the error message to the installation window
        });
        //log.info('pythonScriptPath', pythonScriptPath);
        // Handle Python process exit
        pythonProcess.on('exit', (code) => {
          log.info('code', code);
          // Check if the installation was successful
          if (code === 0) {
            fs.writeFileSync(installationFlagPath, '');
            log.info('packages installed ------------');
            installationWindow.on('closed', () => {
              createMainWindow();
            });

            installationWindow.close();
            // Create the installation flag file
            // After installation, create the main window
          } else {
            log.error("Error installing packages (nltk)");
            isDev
              ? installationWindow.loadFile(errorInstallPackages)
              : installationWindow.loadURL(url.format({
                pathname: errorInstallPackages,
                protocol: 'file:',
                slashes: true,
              }));
          }
        });
      });
    });
  }
  else {
    createMainWindow();
  }
});

// Quit when all windows are closed
app.on('window-all-closed', function () {
  // On macOS, quit the app only if explicitly closed with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Re-create the main window when the app is activated
/*app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});*/

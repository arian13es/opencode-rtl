#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import picocolors from 'picocolors';
import ora from 'ora';
import prompts from 'prompts';
import * as asar from '@electron/asar';
import figlet from 'figlet';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { blue, cyan, green, red, yellow, bold, magenta, dim } = picocolors;

const pkgPath = path.join(__dirname, '..', 'package.json');
let pkg = { version: '1.0.0' };
try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
} catch (e) {}

function printBanner() {
    try {
        const fullArt = figlet.textSync('OpenCode', { font: 'Standard' }).split('\n');
        console.log('');
        for (const line of fullArt) {
            if (!line.trim()) continue;
            console.log(bold(cyan(line)));
        }
        console.log('');
        console.log(bold(`  OpenCode Pro RTL Injector | v${pkg.version}`));
        console.log(`  GitHub: https://github.com/arian13es/opencode-rtl\n`);
    } catch (err) {
        console.log(bold(`\n✨ OpenCode Pro RTL Injector v${pkg.version}`));
        console.log(`  GitHub: https://github.com/arian13es/opencode-rtl\n`);
    }
}

printBanner();

const args = process.argv.slice(2);
const isRestore = args.includes('--restore');
const isHelp = args.includes('--help') || args.includes('-h');

if (isHelp) {
    console.log(`
Usage: opencode-rtl [options]

Options:
  --restore     Revert OpenCode to its original factory state from backup
  --help, -h    Display this help menu
`);
    process.exit(0);
}

let discoveredRunningPaths = [];

function checkRunningProcesses() {
    discoveredRunningPaths = [];
    try {
        if (os.platform() === 'win32') {
            try {
                const psCmd = `powershell -NoProfile -Command "(Get-CimInstance Win32_Process -Filter \\"Name like '%OpenCode%\\").ExecutablePath"`;
                const psOut = execSync(psCmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
                const lines = psOut.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
                for (const exePath of lines) {
                    if (fs.existsSync(exePath)) {
                        const dir = path.dirname(exePath);
                        const asar = path.join(dir, 'resources', 'app.asar');
                        const unpacked = path.join(dir, 'resources', 'app');
                        if (fs.existsSync(asar) && !discoveredRunningPaths.includes(asar)) discoveredRunningPaths.push(asar);
                        if (fs.existsSync(unpacked) && !discoveredRunningPaths.includes(unpacked)) discoveredRunningPaths.push(unpacked);
                    }
                }
            } catch (e) {}

            const out = execSync('tasklist /FI "IMAGENAME eq OpenCode.exe" /NH', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
            return out.toLowerCase().includes('opencode.exe') || discoveredRunningPaths.length > 0;
        } else {
            const out = execSync('pgrep -i opencode || true', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
            return out.trim().length > 0;
        }
    } catch (e) {
        return false;
    }
}

function getCandidatePaths() {
    const candidates = [...discoveredRunningPaths];
    const platform = os.platform();

    if (platform === 'win32') {
        const localAppData = process.env.LOCALAPPDATA || '';
        const programFiles = process.env.ProgramFiles || 'C:\\Program Files';
        const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';

        // High priority: modern and legacy OpenCode install directories
        const knownFolderNames = [
            'ai.opencode.desktop',
            '@opencode-aidesktop',
            '@opencodedesktop',
            'OpenCode',
            'opencode',
            'OpenCode Beta',
            'OpenCode Dev'
        ];

        for (const folder of knownFolderNames) {
            candidates.push(
                path.join(localAppData, 'Programs', folder, 'resources', 'app.asar'),
                path.join(localAppData, 'Programs', folder, 'resources', 'app'),
                path.join(programFiles, folder, 'resources', 'app.asar'),
                path.join(programFiles, folder, 'resources', 'app'),
                path.join(programFilesX86, folder, 'resources', 'app.asar'),
                path.join(programFilesX86, folder, 'resources', 'app')
            );
        }

        // Dynamic auto-discovery: scan program roots for any folder with "opencode"
        const searchRoots = [
            path.join(localAppData, 'Programs'),
            programFiles,
            programFilesX86
        ];

        for (const root of searchRoots) {
            if (fs.existsSync(root)) {
                try {
                    const entries = fs.readdirSync(root, { withFileTypes: true });
                    for (const entry of entries) {
                        if (entry.isDirectory() && /opencode/i.test(entry.name)) {
                            const asar = path.join(root, entry.name, 'resources', 'app.asar');
                            const unpacked = path.join(root, entry.name, 'resources', 'app');
                            if (fs.existsSync(asar) && !candidates.includes(asar)) candidates.push(asar);
                            if (fs.existsSync(unpacked) && !candidates.includes(unpacked)) candidates.push(unpacked);
                        }
                    }
                } catch (e) {}
            }
        }

        // Shortcut auto-detection (.lnk)
        const userProfile = process.env.USERPROFILE || '';
        const shortcutLocations = [
            path.join(userProfile, 'Desktop', 'OpenCode.lnk'),
            path.join(userProfile, 'OneDrive', 'Desktop', 'OpenCode.lnk'),
            path.join(process.env.APPDATA || '', 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'OpenCode.lnk'),
            path.join(process.env.APPDATA || '', 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'OpenCode', 'OpenCode.lnk')
        ];

        for (const lnk of shortcutLocations) {
            if (fs.existsSync(lnk)) {
                try {
                    const psCmd = `powershell -NoProfile -Command "(New-Object -ComObject WScript.Shell).CreateShortcut('${lnk.replace(/'/g, "''")}').TargetPath"`;
                    const targetExe = execSync(psCmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
                    if (targetExe && fs.existsSync(targetExe)) {
                        const dir = path.dirname(targetExe);
                        const asar = path.join(dir, 'resources', 'app.asar');
                        const unpacked = path.join(dir, 'resources', 'app');
                        if (fs.existsSync(asar) && !candidates.includes(asar)) candidates.push(asar);
                        if (fs.existsSync(unpacked) && !candidates.includes(unpacked)) candidates.push(unpacked);
                    }
                } catch (e) {}
            }
        }
    } else if (platform === 'darwin') {
        const home = process.env.HOME || '';
        candidates.push(
            '/Applications/OpenCode.app/Contents/Resources/app.asar',
            path.join(home, 'Applications', 'OpenCode.app', 'Contents', 'Resources', 'app.asar'),
            '/Applications/OpenCode Beta.app/Contents/Resources/app.asar',
            '/Applications/OpenCode Dev.app/Contents/Resources/app.asar',
            '/Applications/@opencodedesktop.app/Contents/Resources/app.asar',
            '/Applications/ai.opencode.desktop.app/Contents/Resources/app.asar',
            // Unpacked
            '/Applications/OpenCode.app/Contents/Resources/app'
        );
    } else {
        // Linux
        const home = process.env.HOME || '';
        candidates.push(
            '/opt/OpenCode/resources/app.asar',
            '/opt/opencode/resources/app.asar',
            '/opt/ai.opencode.desktop/resources/app.asar',
            '/usr/lib/opencode/resources/app.asar',
            '/usr/share/opencode/resources/app.asar',
            path.join(home, '.local', 'share', 'opencode', 'resources', 'app.asar'),
            '/opt/OpenCode/resources/app'
        );
    }

    // Deduplicate and filter existing paths
    const unique = Array.from(new Set(candidates));
    return unique.filter(p => fs.existsSync(p));
}

async function patchUnpackedApp(appDir, isRestore) {
    console.log(blue(`\n[✓] Target locked: OpenCode directory located at ${appDir}`));
    const spinner = ora('Auditing OpenCode structure...').start();

    const rendererDir = path.join(appDir, 'out', 'renderer');
    const indexHtml = path.join(rendererDir, 'index.html');

    if (!fs.existsSync(indexHtml)) {
        spinner.fail('Incompatible OpenCode structure. out/renderer/index.html not found.');
        return;
    }

    const backupHtml = indexHtml + '.bak';

    if (isRestore) {
        if (fs.existsSync(backupHtml)) {
            fs.copyFileSync(backupHtml, indexHtml);
            const targetJs = path.join(rendererDir, 'opencode-payload.js');
            if (fs.existsSync(targetJs)) fs.unlinkSync(targetJs);
            spinner.succeed('OpenCode directory architecture successfully reverted to factory state.');
        } else {
            spinner.info('No backups detected. Factory reset aborted for OpenCode directory.');
        }
        return;
    }

    spinner.text = 'Deploying Pro UI payload into OpenCode renderer...';
    try {
        const payloadPath = path.join(__dirname, 'opencode-payload.js');
        let payloadCode = fs.readFileSync(payloadPath, 'utf8');

        const fontPath = path.join(__dirname, 'Vazirmatn-Variable.woff2');
        let fontBase64 = '';
        if (fs.existsSync(fontPath)) {
            fontBase64 = fs.readFileSync(fontPath).toString('base64');
        }
        payloadCode = payloadCode.replace('__FONT_BASE64__', fontBase64);

        const targetJsPath = path.join(rendererDir, 'opencode-payload.js');
        fs.writeFileSync(targetJsPath, payloadCode);

        const fontDest = path.join(rendererDir, 'Vazirmatn-Variable.woff2');
        if (fs.existsSync(fontPath)) {
            fs.copyFileSync(fontPath, fontDest);
        }

        if (!fs.existsSync(backupHtml)) {
            fs.copyFileSync(indexHtml, backupHtml);
        }

        let htmlCode = fs.readFileSync(indexHtml, 'utf8');
        let modified = false;

        if (!htmlCode.includes('opencode-payload.js')) {
            if (htmlCode.includes('</body>')) {
                htmlCode = htmlCode.replace('</body>', '  <script src="./opencode-payload.js"></script>\n</body>');
            } else {
                htmlCode = htmlCode.replace('</html>', '  <script src="./opencode-payload.js"></script>\n</html>');
            }
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(indexHtml, htmlCode);
            spinner.succeed('★ OpenCode ecosystem successfully overhauled with Pro RTL UI!');
        } else {
            spinner.succeed('OpenCode is already operating on the patched Pro RTL architecture.');
        }
    } catch (e) {
        spinner.fail('Failed to patch OpenCode directory.');
        console.error(red(e.message));
    }
}

async function patchAsar(asarPath, isRestore) {
    console.log(blue(`\n[✓] Target locked: OpenCode ASAR package located at ${asarPath}`));

    const backupPath = asarPath + '.bak';

    if (isRestore) {
        if (!fs.existsSync(backupPath)) {
            console.log(yellow('[!] Alert: Backup missing. Cannot revert OpenCode core.'));
            return;
        }
        const spinner = ora('Reverting OpenCode ASAR core to factory state...').start();
        try {
            fs.copyFileSync(backupPath, asarPath);
            spinner.succeed('OpenCode successfully reverted to factory state.');
        } catch (e) {
            spinner.fail('Critical failure during ASAR restoration.');
            console.error(red(e.message));
        }
        return;
    }

    const spinner = ora('Acquiring write permissions & establishing backup...').start();
    try {
        fs.accessSync(path.dirname(asarPath), fs.constants.W_OK);
        if (!fs.existsSync(backupPath)) {
            fs.copyFileSync(asarPath, backupPath);
        }
    } catch (e) {
        spinner.fail('Access Denied.');
        console.error(red('\n[!] OS Exception: ' + e.message));
        console.error(yellow('Action required: Elevate your terminal privileges (Run as Administrator/sudo).'));
        return;
    }

    const extractDir = path.join(path.dirname(asarPath), 'opencode-extracted-rtl-temp');
    spinner.text = 'Decrypting and unpacking OpenCode ASAR package...';
    try {
        if (fs.existsSync(extractDir)) {
            fs.rmSync(extractDir, { recursive: true, force: true });
        }
        asar.extractAll(asarPath, extractDir);
    } catch (e) {
        spinner.fail('ASAR package unpacking failed.');
        console.error(red(e.message));
        return;
    }

    spinner.text = 'Injecting Unified RTL module & Pro UI widget...';
    try {
        const rendererDir = path.join(extractDir, 'out', 'renderer');
        const indexHtmlPath = path.join(rendererDir, 'index.html');

        if (!fs.existsSync(indexHtmlPath)) {
            throw new Error('out/renderer/index.html missing inside ASAR. Unsupported OpenCode version.');
        }

        let htmlCode = fs.readFileSync(indexHtmlPath, 'utf8');

        const payloadPath = path.join(__dirname, 'opencode-payload.js');
        let payloadCode = fs.readFileSync(payloadPath, 'utf8');

        const fontPath = path.join(__dirname, 'Vazirmatn-Variable.woff2');
        let fontBase64 = '';
        if (fs.existsSync(fontPath)) {
            fontBase64 = fs.readFileSync(fontPath).toString('base64');
        }
        payloadCode = payloadCode.replace('__FONT_BASE64__', fontBase64);

        const targetJsPath = path.join(rendererDir, 'opencode-payload.js');
        fs.writeFileSync(targetJsPath, payloadCode);

        const fontDest = path.join(rendererDir, 'Vazirmatn-Variable.woff2');
        if (fs.existsSync(fontPath)) {
            fs.copyFileSync(fontPath, fontDest);
        }

        if (!htmlCode.includes('opencode-payload.js')) {
            if (htmlCode.includes('</body>')) {
                htmlCode = htmlCode.replace('</body>', '  <script src="./opencode-payload.js"></script>\n</body>');
            } else {
                htmlCode = htmlCode.replace('</html>', '  <script src="./opencode-payload.js"></script>\n</html>');
            }
            fs.writeFileSync(indexHtmlPath, htmlCode);
        }
    } catch (e) {
        spinner.fail('Module injection failed.');
        console.error(red(e.message));
        if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true, force: true });
        return;
    }

    spinner.text = 'Rebuilding core ASAR package...';
    try {
        await asar.createPackage(extractDir, asarPath);
        fs.rmSync(extractDir, { recursive: true, force: true });
        spinner.succeed('★ OpenCode ecosystem successfully overhauled with Arian Pro UI!');
    } catch (e) {
        spinner.fail('Failed to reconstruct the OpenCode ASAR package.');
        console.error(red(e.message));
    }
}

async function main() {
    console.log(green('\n⚡ Initializing OpenCode Pro RTL Injector...'));

    if (checkRunningProcesses()) {
        console.log(yellow('\n[!] Notice: OpenCode is currently running.'));
        const response = await prompts({
            type: 'confirm',
            name: 'closeApp',
            message: 'Would you like to close OpenCode now to prevent file locks?',
            initial: true
        });
        if (response && response.closeApp) {
            try {
                if (os.platform() === 'win32') {
                    execSync('taskkill /IM OpenCode.exe /F', { stdio: 'ignore' });
                } else {
                    execSync('pkill -f -i opencode || true', { stdio: 'ignore' });
                }
                console.log(green('[✓] OpenCode processes closed cleanly.\n'));
            } catch (e) {}
        } else {
            console.log(dim('    Proceeding without closing. Remember to restart OpenCode afterwards.\n'));
        }
    }

    const detected = getCandidatePaths();

    if (detected.length === 0) {
        console.log(yellow('[?] Automatic scanning failed to locate OpenCode on this machine.'));
        const response = await prompts({
            type: 'text',
            name: 'customPath',
            message: `Provide the absolute path to OpenCode ('app.asar' file or 'app' resources folder):`
        });

        if (!response.customPath || !fs.existsSync(response.customPath)) {
            console.error(red('\n[!] Invalid trajectory. Process aborted.\n'));
            process.exit(1);
        }

        const isAsar = response.customPath.endsWith('.asar');
        if (isAsar) {
            await patchAsar(response.customPath, isRestore);
        } else {
            await patchUnpackedApp(response.customPath, isRestore);
        }
    } else {
        for (const targetPath of detected) {
            const isAsar = targetPath.endsWith('.asar');
            if (isAsar) {
                await patchAsar(targetPath, isRestore);
            } else {
                await patchUnpackedApp(targetPath, isRestore);
            }
        }
    }

    console.log(green(bold('\n⚡ Master execution completed. Reboot OpenCode to initialize the Pro RTL UI.\n')));
}

main().catch(e => {
    console.error(red('\n[!] An unhandled architectural error occurred:'), e.message);
    process.exit(1);
});

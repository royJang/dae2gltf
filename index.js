const childProcess = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const rimraf = require('rimraf');

module.exports = function (srcFile, destFile, opts = []){
    return new Promise(( resolve, reject ) => {
        try {
            let binExt = os.type() === 'Windows_NT' ? '.exe' : '';
            let tool = path.join(__dirname, 'lib', os.type(), 'COLLADA2GLTF-bin' + binExt);
            if (!fs.existsSync(tool)) {
                throw new Error(`Unsupported OS: ${os.type()}`);
            }

            let destExt;
            if (destFile.endsWith('.glb')) {
                destExt = '.glb';
                opts.includes('--binary') || opts.push('--binary');
            } else if (destFile.endsWith('.gltf')) {
                destExt = '.gltf';
            } else {
                throw new Error(`Unsupported file extension: ${destFile}`);
            }

            let srcPath = fs.realpathSync(srcFile);
            let destDir = fs.realpathSync(path.dirname(destFile));
            let destPath = path.join(destDir, path.basename(destFile, destExt));

            let args = opts.slice(0);
            args.push('--input', srcPath, '--output', destPath);
            let child = childProcess.spawn(tool, args);

            let output = '';
            child.stdout.on('data', (data) => output += data);
            child.stderr.on('data', (data) => output += data);
            child.on('error', reject);
            child.on('close', code => {
                // the collada SDK may create an .dam dir during conversion; delete!
                // let damCruft = srcPath.replace(/.dae$/i, '.dam');
                // don't stick a fork in things if this fails, just log a warning
                // const onError = error =>
                //     error && console.warn(`Failed to delete ${damCruft}: ${error}`);

                // console.log(fs.existsSync(damCruft));
// 
                // try {
                //     fs.existsSync(damCruft) && rimraf(damCruft, {}, onError);
                // } catch (error) {
                //     onError(error);
                // }
                // non-zero exit code is failure
                if (code != 0) {
                    reject(new Error(`Converter output:\n` +
                        (output.length ? output : "<none>")));
                } else {
                    resolve(destPath + destExt);
                }
            });
        } catch( e ) {
            reject( e );
        }
    });
}

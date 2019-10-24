import fs from 'fs';
import path from 'path';

export default class BasicScanner {

    _showLogs = false;
    _context = '';

    showLogs(){
        this._showLogs = true;
        return this;
    }

    setContext(context){
        this._context = context;
        return this;
    }

    scan(urls = []) {
        return urls.map(url => {
            return this.scanUrl(path.join(this._context,url))
        }).flat().map(url=>{
            import(url);
            this._showLogs && console.log(`loaded modules - [${url}]`);
            return url;
        });
    }

    scanUrl(url) {
        return this.parseUrl(url);
    }

    parseUrl(url) {
        const sources = [];
        let needParseUrls = [];

        const parts = url.replace(/\*/, 'asgsdfsdf*').split('asgsdfsdf').filter(u => u);

        let lastPart = '';

        parts.forEach(part => {

            if (lastPart.endsWith('.js' || lastPart.endsWith('.JS'))) {
                sources.push(lastPart);
                return;
            }

            if (lastPart && part === '*') {
                const stat = fs.statSync(lastPart);
                if (stat.isDirectory()) {
                    const files = fs.readdirSync(lastPart);
                    files.forEach(file => {
                        const filePath = path.join(lastPart, file);
                        const fileStat = fs.statSync(filePath);
                        if (fileStat.isDirectory()) {
                            needParseUrls.push(filePath + '*');
                        } else if (file.endsWith('.js')) {
                            sources.push(filePath);
                        }
                    })
                }
                return;
            }

            if (fs.existsSync(part)) {
                lastPart = part + '';
            } else if (fs.existsSync(part + '.js')) {
                lastPart = part + '.js';
            } else if (fs.existsSync(path.join(part, 'index.js'))) {
                lastPart = part + '';
                sources.push(path.join(part, 'index.js'))
            }

        });


        if (needParseUrls.length === 0) {
            return sources;
        }

        return sources.concat(needParseUrls.map(url => this.parseUrl(url)).flat());
    }
}
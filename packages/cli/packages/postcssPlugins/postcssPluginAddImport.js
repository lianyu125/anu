const postCss = require('postcss');
const path = require('path');
const utils = require('../utils');
const config = require('../config');

const postcssPluginAddImport = postCss.plugin('postcss-plugin-add-import', function({ extName, type, dependencies } = {}) {
    return function(root, res) {
        const deps = dependencies || utils.getDeps(res.messages);
        function getRelativeImportPath(dirname, filepath) {
            const reg = (type === 'sass' ? /\.(s[c|a]ss)$/ : /\.(less)$/);
            return '\'' + path.relative(dirname, filepath)
                .replace(reg, `.${extName || '$1' }`)
                .replace(/(^\w)/, './$1') + 
                '\'';
        }
        if (!deps.length) {
            return;
        }
        // 保证只有一条css规则的情况下也有分号（有些平台@import语句必须以分号结束）
        root.raws.semicolon = true;
        for (var i = deps.length - 1; i >= 0; i--) {
            let importPath = getRelativeImportPath(path.dirname(res.opts.from), deps[i].file).replace(/\\/g, '/');
            if (config['buildType'] === 'quick') {
                importPath = importPath.replace(/\.s[ac]ss(')?$/, '.css$1');
            }
            // 遍历依赖插入@import语句
            const importNode = postCss.atRule({
                name: 'import',
                params: importPath
            });
            root.insertBefore(root.nodes[0], importNode);
        }
    };
});

module.exports = postcssPluginAddImport;
import Plugin from 'stc-plugin';
import {extend, isRemoteUrl} from 'stc-helper';
import File from 'stc-file';
import {resolve} from 'url';

const RegImport = /url\s*\((['"])([\w\-\/\.]+\.css)(?:[^\?\'\"\)\s]*)?\1\)/;

const RegInCss = [{
    // background image
    regexp: /url\s*\(\s*([\'\"]?)([\w\-\/\.\@]+\.(?:png|jpg|gif|jpeg|ico|cur|webp))(?:\?[^\?\'\"\)\s]*)?\1\s*\)/i,
    index: 2
  }, {
    // font
    regexp: /url\s*\(\s*([\'\"]?)([^\'\"\?]+\.(?:eot|woff|woff2|ttf|svg))([^\s\)\'\"]*)\1\s*\)/ig,
    index: 2
  }, {
    // ie filter
    regexp: /src\s*=\s*([\'\"])?([^\'\"]+\.(?:png|jpg|gif|jpeg|ico|cur|webp))(?:\?[^\?\'\"\)\s]*)?\1\s*/i,
    index: 2
  }
];

export default class CSSCombinePlugin extends Plugin {
  /**
   * run
   */
  async run(){
    let tokens = await this.getAst();
    let newTokens = [];

    let promises = tokens.map(async (token) => {
      // css import
      if(token.type === this.TokenType.CSS_IMPORT){
        let match = RegImport.exec(token.value);

        // cant not parse @import
        if(!match) {
          this.error(`Can not parse @import in \`${token.value}\``, token.loc.start.line, token.loc.start.column);
          newTokens.push(token);

          return;
        }

        let cssPath = match[2];

        // only deal local file
        if(isRemoteUrl(cssPath)) {
          newTokens.push(token);

          return;
        }
        
        let cssFile = await this.getFileByPath(cssPath);
        let tokens = await this.invokeSelf(cssFile);

        tokens = this.resolvePath(cssFile.path, tokens);

        [].push.apply(newTokens, tokens);
      }
      else{
        newTokens.push(token);
      }
    });

    await Promise.all(promises);

    return newTokens;
  }

  resolvePath(cssPath, tokens) {
    let newTokens = [];

    tokens.forEach(token => {
      // css value
      if(token.type === this.TokenType.CSS_VALUE){
        RegInCss.some(item => {
          let flag = false;
          token.ext.value.replace(item.regexp, (...args) => {
            let resPath = args[item.index];

            // only resolve relative path
            if(resPath && !isRemoteUrl(resPath) && /^\.{2}\//.test(resPath)) {
              flag = true;

              let baseLevel = this.file.path.split('/').length;
              let cssLevel = cssPath.split('/').length;

              let resolvedResPath;
              let levelDiff = baseLevel - cssLevel;

              if(levelDiff === 0) {
                return flag;
              }
              else if(levelDiff > 0) {
                resolvedResPath = resolve('../'.repeat(Math.abs(levelDiff)), resPath);
              }
              else if(levelDiff < 0) {
                resolvedResPath = resolve('x/'.repeat(Math.abs(levelDiff)), resPath);
              }

              token = extend({}, token);
              token.value = token.value.replace(resPath, resolvedResPath);
            }

            return flag;
          });
        });
      }

      newTokens.push(token);
    });

    return newTokens;
  }

  /**
   * update
   */
  update(tokens){
    this.setAst(tokens);

    return tokens;
  }

  /**
   * use cluster
   */
  static cluster(){
    return true;
  }

  /**
   * use cache
   */
  static cache(){
    return true;
  }
}
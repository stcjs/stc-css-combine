import Plugin from 'stc-plugin';

import {
  extend, 
  isRemoteUrl,
  ResourceRegExp
} from 'stc-helper';

import {resolve} from 'url';

const RegImport = /@import\s+url\s*\(\s*(?:[\'\"]?)([\w\/_\.\:\-]+\.css)(?:\?[^\'\"\)]*)?(?:[\'\"]?)\s*\)\s*[;]?/;

const RegInCss = [
  ResourceRegExp.background,
  ResourceRegExp.font,
  ResourceRegExp.filter
];

const MaxRecursionTimes = 20;

export default class CSSCombinePlugin extends Plugin {
  /**
   * run
   */
  async run(){
    let tokens = await this.getAst();
    let newTokens = [];

    let recursionTimes = this.file.prop('recursionTimes') || 1;

    for(let token of tokens) {
      // css import
      if(token.type === this.TokenType.CSS_IMPORT) {
        let match = RegImport.exec(token.value);

        // cant not parse @import
        if(!match) {
          this.fatal(`Can not parse @import in \`${token.value}\``, token.loc.start.line, token.loc.start.column);
          newTokens.push(token);
          continue;
        }

        let cssPath = match[1];

        // only deal local file
        if(isRemoteUrl(cssPath)) {
          newTokens.push(token);
          continue;
        }

        // check recursion times
        if(recursionTimes > MaxRecursionTimes) {
          this.fatal(`Recursion more than ${MaxRecursionTimes} times`, token.loc.start.line, token.loc.start.column);
          return [];
        }

        let cssFile = await this.getFileByPath(cssPath);

        if(cssFile) {
          cssFile.prop('recursionTimes', recursionTimes + 1);

          let tokens = await this.invokeSelf(cssFile);
          tokens = this.resolvePath(cssFile.path, tokens);
          [].push.apply(newTokens, tokens);
        }
      } else {
        newTokens.push(token);
      }
    }

    // if there is charset tokens, keep and pin one.
    newTokens = this.topCharset(newTokens);

    return newTokens;
  }

  topCharset(tokens) {
    let charsetToken = null;
    let newTokens = [];

    tokens.forEach((token, index) => {
      if(token.type === this.TokenType.CSS_CHARSET) {
        charsetToken = token;
      } else {
        newTokens.push(token);
      }
    });

    if(charsetToken) {
      newTokens.unshift(charsetToken);
    }

    return newTokens;
  }

  resolvePath(cssPath, tokens) {
    let newTokens = [];

    tokens.forEach(token => {
      // css value
      if(token.type === this.TokenType.CSS_VALUE) {
        RegInCss.some(item => {
          let flag = false;

          token.ext.value.replace(item, (...args) => {
            let resPath = args[2];

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
                resolvedResPath = resolve('../'.repeat(levelDiff), resPath);
              }
              else if(levelDiff < 0) {
                resolvedResPath = resolve('x/'.repeat(-levelDiff), resPath);
              }

              token = extend({}, token);
              token.value = token.value.replace(resPath, resolvedResPath);
              token.ext.value = token.value;
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
   * default include
   */
  static include(){
    return /\.css$/;
  }
  /**
   * use cluster
   */
  static cluster(){
    return false;
  }

  /**
   * use cache
   */
  static cache(){
    return false;
  }
}

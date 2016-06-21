import Plugin from 'stc-plugin';
import {extend} from 'stc-helper';
import {isMaster} from 'cluster';

export default class CSSCombinePlugin extends Plugin {
  /**
   * run
   */
  async run(){
    // let tokens = await this.getContent('utf-8');
    let tokens = await this.getAst();

    console.log(tokens);

    return '123';
  }
  /**
   * update
   */
  update(data){
    this.setContent(data);
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
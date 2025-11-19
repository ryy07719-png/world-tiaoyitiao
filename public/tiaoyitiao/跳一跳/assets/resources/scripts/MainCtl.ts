import { _decorator, Component, Node, Label, macro } from 'cc';
import { EventDispatcher } from './EventDispatcher';
import { GameData } from './GameData';
import { LogicCtl } from './LogicCtl';
const { ccclass, property } = _decorator;
/**
 * 主脚本,挂载canvas上
 * @author 一朵毛山
 * Construct 
 */
@ccclass('MainCtl')
export class MainCtl extends Component {

    //home_page 页面
    @property({type:Node})
    home_page:Node = null;
    //逻辑层
    @property({type:LogicCtl})
    logic_ctl:LogicCtl = null;
    //本局得分
    @property({type:Label})
    score_label:Label = null;
    

    start() {
        //设置homg page 显示在屏幕中间
        this.home_page?.setPosition(0,0);
        //注册监听自定义事件 (更新分数)
        EventDispatcher.get_instance().target.on(EventDispatcher.UPDATE_SCORE_LABEL,this.update_score_label,this);
        //注册监听自定义事件 (开始游戏)
        EventDispatcher.get_instance().target.on(EventDispatcher.START_GAME,this.start_game,this);
        //延迟2秒执行自动跳
        this.schedule(this.auto_play,2,macro.REPEAT_FOREVER,2);
    }

    update(deltaTime: number) {
    }

    /**
     * 更新本局得分
     */
    update_score_label(){
        this.score_label.string = GameData.get_total_score()+"";
    }

    /**
     * 手动开始游戏
     */
    start_game():void{
        this.unschedule(this.auto_play);
        //设置默认本局得分0
        this.score_label.string = ""+0;
        //重置游戏数据,游戏状态
        GameData.reset_data();
        //移动和隐藏,home page
        this.home_page.setPosition(-1000,0);
        this.home_page.active = false;
        //开始游戏,状态为1
        this.logic_ctl?.run_game(1);
    }
    /**
     * 自动开始游戏
     */
    auto_play(){
        // 状态合法性判断
        if(GameData.get_game_state() == -1){
            //自动跳
            this.logic_ctl.auto_jump();
        }
    }

}


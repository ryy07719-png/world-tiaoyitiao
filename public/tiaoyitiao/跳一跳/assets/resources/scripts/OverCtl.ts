import { _decorator, Component, Node, Label } from 'cc';
import { EventDispatcher } from './EventDispatcher';
import { GameData } from './GameData';
const { ccclass, property } = _decorator;
/**
 * 游戏结束界面,脚本
 * @author 一朵毛山
 * Construct 
 */
@ccclass('OverCtl')
export class OverCtl extends Component {
    //本局分数
    @property({ type: Label })
    total_score: Label = null;
    //历史最高分
    @property({ type: Label })
    history_score: Label = null;

    start() {
        //注册打开游戏结束界面事件
        EventDispatcher.get_instance().target.on(EventDispatcher.SHOW_OVER_WINDOW, this.show, this);
        this.node.active = false;
    }

    /**
     * 显示游戏结束界面
     */
    show(): void {
        this.scheduleOnce(() => {
            this.node.setPosition(0, 0);
            this.node.active = true;
            this.total_score.string = GameData.get_total_score() + "";
            let histroy = localStorage.getItem("history_score");
            if (!histroy) {
                histroy = "0";
            }
            this.history_score.string = histroy;
        },0.5);

    }

    update(deltaTime: number) {

    }
    /**
     * 重新开始游戏
     */
    restart() {
        //隐藏该界面
        this.node.setPosition(-1000, 0);
        this.node.active = false;
        //发送游戏开始事件
        EventDispatcher.get_instance().target.emit(EventDispatcher.START_GAME);
    }
}


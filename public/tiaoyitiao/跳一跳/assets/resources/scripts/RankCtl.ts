import { _decorator, Component, Node, Prefab, instantiate, Label } from 'cc';
const { ccclass, property } = _decorator;
/**
 * 排行榜界面,脚本
 * @author 一朵毛山
 * Construct 
 */
@ccclass('RankCtl')
export class RankCtl extends Component {
    //预制体,排行榜你的
    @property({type:Prefab})
    pre_rank_item:Prefab = null;
    //排行数据容器
    @property({type:Node})
    content:Node = null;



    start() {
        //默认不显示
        this.node.active = false;
    }

    update(deltaTime: number) {
        
    }
    /**
     * 显示该页面
     */
    show(){
        this.node.setPosition(0,0);
        this.node.active = true;
        this.content.removeAllChildren();
        //制造假数据
        for(let i = 0;i<15;i++){
            let item = instantiate(this.pre_rank_item);
            item.setParent(this.content);
            item.setPosition(-7,i*-72-35);

            //假数据哦
            item.getChildByName("order").getComponent(Label).string = i+1+"";
            item.getChildByName("nick_name").getComponent(Label).string = "北门👌🏻"+i+"";
            item.getChildByName("score").getComponent(Label).string = Math.round(Math.random()*100)+"";

        }
    }

    /**
     * 关闭该页面
     */
    close(){
        this.node.setPosition(-1000,0);
        this.node.active = false;
    }
}


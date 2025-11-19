import { _decorator, Component, Node, CircleCollider2D, Contact2DType, PolygonCollider2D, Collider2D } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 英雄的碰撞体脚本
 * @author 一朵毛山
 * Construct 
 */
@ccclass('HeroColliderCtl')
export class HeroColliderCtl extends Component {
    //0=踏空,1=分,2=分, -1=滑倒
    private step_score:number = 0;
    //碰撞发生的箱子node
    private collider_node:Node = null;

    start() {
        //注册碰撞事件
        this.node.getComponent(CircleCollider2D)?.on(Contact2DType.BEGIN_CONTACT,this.on_begin_contact,this);
        //注册碰撞事件
        this.node.getComponent(PolygonCollider2D)?.on(Contact2DType.BEGIN_CONTACT,this.on_begin_contact,this);
    }

    /**
     * 碰撞回调,用于处理碰撞后的逻辑
     * @param hero_collier 
     * @param box_collier 
     */
    on_begin_contact(hero_collier:Collider2D,box_collier:Collider2D){
        if(hero_collier.tag == 1 && box_collier.tag == 11){
            this.step_score = 2;
        }else if(hero_collier.tag == 1 && box_collier.tag == 12){
           if(this.step_score<1){
                this.step_score = 1;
           }     
        }else if(hero_collier.tag == 2 && box_collier.tag == 12){
            if(this.step_score == 0){
                this.step_score = -1;
            }
        }
        this.collider_node = box_collier.node.parent;
    }

    /**
     * 重置数据,每次跳跃时候调用
     */
    reset_data(){
        this.step_score = 0;
        this.collider_node = null;
    }

    /**
     * 获取本次跳跃得分
     * @returns 
     */
    get_step_score():number{
        return this.step_score;
    }

    /**
     * 获取本次跳跃发生碰撞的node
     * @returns 
     */
    get_collider_node():Node{
        return this.collider_node;
    }


    update(deltaTime: number) {
        
    }
}


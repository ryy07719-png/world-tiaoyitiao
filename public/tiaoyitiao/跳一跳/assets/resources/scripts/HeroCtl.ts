import { _decorator, Component, Node, Vec3, tween, Label, Sprite, Color, Prefab, instantiate, UITransform } from 'cc';
import { BoxCtl } from './BoxCtl';
import { HeroColliderCtl } from './HeroColliderCtl';
const { ccclass, property } = _decorator;

/**
 * 英雄脚本
 * @author 一朵毛山
 * Construct 
 */
@ccclass('HeroCtl')
export class HeroCtl extends Component {

    /**
     * 英雄碰撞体,脚本
     */
    @property({type:HeroColliderCtl})
    hero_collier_ctl: HeroColliderCtl;

    /**
     * 英雄身上的得分node
     */
    @property({type:Node})
    hero_score: Node;
    /**
     * 英雄身上的光圈
     */
    @property({type:Node})
    light: Node;
    /**
     * 小白球预制体,用于显示跳跃/落地特效的
     */
    @property({type:Prefab})
    pre_ball: Prefab;

    start() {
        //开局,得分/得分光圈都不显示
        this.hero_score.active = false;
        this.light.active =false;
    }

    update(deltaTime: number) {
        
    }

    /**
     * 英雄的初始化
     * @param parent 英雄的父节点
     * @param pos 初始化的位置,在logic_layer
     */
    init_hero(parent:Node,pos:Vec3){
        this.node.setParent(parent);
        this.node.setPosition(pos.x,pos.y+200);
        //弹跳动画
        tween(this.node)
            .to(0.2,{position:new Vec3(this.node.getPosition().x,pos.y-10)})
            .to(0.08,{position:new Vec3(this.node.getPosition().x,pos.y+50)})
            .to(0.07,{position:new Vec3(this.node.getPosition().x,pos.y-5)})
            .to(0.06,{position:new Vec3(this.node.getPosition().x,pos.y+10)})
            .to(0.02,{position:new Vec3(this.node.getPosition().x,pos.y)})
            .start();
    }

    /**
     * 触控过程中调用,实现英雄变成矮胖子效果
     * @param delta_time 帧时间
     * @param box_height 脚下箱子的高度
     */
    touch_start(delta_time: number,box_height: number){
         let y = this.node.getScale().y - delta_time/6;
         //英雄的压缩效果
         this.node.setScale(new Vec3(this.node.getScale().x,y));
         if(this.node.getScale().y<=0.8){
            this.node.setScale(new Vec3(this.node.getScale().x,0.8));
         }   
         let x = this.node.getScale().x+delta_time/10;
         this.node.setScale(new Vec3(x,this.node.getScale().y));
         if(this.node.getScale().x>=1.2){
            this.node.setScale(new Vec3(1.2,this.node.getScale().y));
         }
         //限制最大压缩比例
         if(this.node.getScale().y>0.8){
            let pos = this.node.getPosition();
            this.node.setPosition(new Vec3(pos.x,pos.y-delta_time/8*box_height));
         }

         this.jump_start_effect();

    }

    /**
     * 触控结束调用,用于恢复英雄的身高
     */
    touch_end(){
        this.node.setScale(new Vec3(1,1));
        this.node.getChildByName("ball_group").removeAllChildren();
    }

    /**
     * 根据箱子实现跳跃
     * @param target_box 目标箱子脚本
     * @param touch_time 触控的时间
     * @param callback 回调函数
     */
    jump_by_box(target_box:BoxCtl,touch_time:number,callback:Function){
        this.hero_collier_ctl.reset_data();
        //获取小白点postion
        let jump_postion = target_box.get_jump_position();
        //hero postion
        let hero_postion = this.node.getPosition();
        //归一化
        let nor_v3 = jump_postion.subtract(hero_postion).normalize();
        touch_time *=8;
        //落点
        let target_postion = new Vec3(hero_postion.x+nor_v3.x*touch_time,hero_postion.y+nor_v3.y*touch_time);
        this.jump_by_postion(target_postion,nor_v3.x,callback);
    }

    /**
     * 根据坐标实现跳跃
     * @param target_postion 目标坐标
     * @param angle_x 用于判断旋转反向
     * @param callback 回调函数
     */
    jump_by_postion(target_postion:Vec3,angle_x:number,callback:Function){
        //执行跳跃
        let jumpping = this.node.jump_to(target_postion,200,0.4);
        // 旋转
        let jump_start = tween(this.node).call(()=>{
            //跳跃前关闭碰撞
            this.close_collider();
            tween(this.node.getChildByName("body")).to(0.4,{angle:angle_x<0?360:-360}).start();
        });

        let jump_end = tween(this.node).call(()=>{
            //到达跳跃点后,打开碰撞
            this.open_collider();
            //延迟执行,用于碰撞逻辑计算,碰撞逻辑需要点时间
            this.scheduleOnce(()=>{
                this.close_collider();
                callback?.(this.hero_collier_ctl.get_step_score(),this.hero_collier_ctl.get_collider_node());
            },0.1);
        });
        //按照序列动画,顺序执行
        tween(this.node).sequence(jump_start,jumpping,jump_end).start();
    }

    /**
     * 设置英雄的sibling,控制英雄在logic_layer的显示层
     * @param index 
     */
    set_sibling(index:number){
        this.node.setSiblingIndex(index);
    }

    /**
     * 重置欧拉角,每次跳跃时候需要调用
     */
    reset_angle(){
        this.node.getChildByName("body").angle = 0;
    }
    /**
     * 打开碰撞
     */
    open_collider(){
        this.node.getChildByName("hero_collider").active = true;
    }
    /**
     * 关闭碰撞
     */
    close_collider(){
        this.node.getChildByName("hero_collider").active = false;
    }

    /**
     * 用于显示本次跳跃的最终得分,需要飘起来,还有可能出现光圈效果
     * @param score 本次得分
     * @returns 
     */
    show_score(score:number){
        this.hero_score.active = true;
        this.hero_score.getChildByName("Label").getComponent(Label).string = score+"";
        tween(this.hero_score)
        .to(1,{position:new Vec3(this.hero_score.getPosition().x,this.hero_score.getPosition().y+100)})
        .call(()=>{
            this.hero_score.setPosition(this.hero_score.getPosition().x,84);
            this.hero_score.active = false;
        })
        .start();
        if(score<=1){
            return;
        }
        //打开光圈
        this.light.active = true;
        this.light.setScale(new Vec3(0.5,0.5));
        tween(this.light)
        .to(0.4,{scale:new Vec3(3,3)})
        .call(()=>{
            this.light.active =false;
        })
        .start();
        // change alpha
        let sprite = this.light.getComponent(Sprite);
        sprite.color = new Color(sprite.color.r,sprite.color.g,sprite.color.b,255);

        let base_color = sprite.color.clone();

        let temp_color = new Color();
        tween(sprite).to(0.4,{color:new Color(base_color.r,base_color.g,base_color.b,0)},{
            onUpdate:(target?: object, ratio?: number)=>{
                let alpha = base_color.a + 50 - base_color.a*ratio;
                if(alpha>255){
                    alpha = 255;
                }
                temp_color.set(base_color.r,base_color.g,base_color.b,alpha);
                sprite.color = temp_color;
            }
        }).start();
    }

    /**
     * 滑倒效果
     */
    slip(){
       tween(this.node).by(0.5,{angle:Math.random()>0.5?30:-30}).start(); 
    }
    /**
     * 踏空效果
     * @param target  目标箱子
     * @param original 起跳时脚下的箱子
     */
    miss(target:Node,original:Node){
        let target_pos = target.getComponent(BoxCtl).get_jump_position();
        if(this.node.getPosition().y>target_pos.y){
            target.setSiblingIndex(this.node.getSiblingIndex());
        }else{
            original.setSiblingIndex(this.node.getSiblingIndex());
        }
        tween(this.node)
        .to(0.5,{position:new Vec3(this.node.getPosition().x,this.node.getPosition().y-80)}).start();
    }

    /**
     * 蓄力特效,很多小球飞向英雄
     * @returns 
     */
    private jump_start_effect(){
        if(this.node.getChildByName("ball_group").children.length>30){
            return;
        }
        let ball = instantiate(this.pre_ball);
        {
            //颜色RGB随机,透明度随机
            let r = Math.floor(Math.random()*256);
            let g = Math.floor(Math.random()*256);
            let b = Math.floor(Math.random()*256);
            let a = Math.floor(Math.random()*256);
            if(Math.random()<0.5){
                r = 255;
                g = 255;
                b = 255;
            }
            ball.getComponent(Sprite).color = new Color(r,g,b,a);
        }
        //x,y位置随机
        let r_x = Math.random()*(200-(-200))+(-200);
        let r_y = Math.random()*(250-(-50))+(-50);
        ball.getComponent(UITransform).setContentSize(10,10);
        ball.setParent(this.node.getChildByName("ball_group"));
        ball.setPosition(r_x,r_y);
        tween(ball).to(Math.random()*(0.7-(0.2)+(0.2)),{position:new Vec3(Math.random()*(10-(-10)+(-10)),0)}).removeSelf().start();
    }

    /**
     * 跳跃后落地效果,很多小球从英雄脚下飞溅
     */
    jump_end_effect(){

        for(let i =0;i<30;i++){
            let ball = instantiate(this.pre_ball);
            {
                 //颜色RGB随机,透明度随机
                let r = Math.floor(Math.random()*256);
                let g = Math.floor(Math.random()*256);
                let b = Math.floor(Math.random()*256);
                let a = Math.floor(Math.random()*256);
                if(Math.random()<0.5){
                    r = 255;
                    g = 255;
                    b = 255;
                }
                ball.getComponent(Sprite).color = new Color(r,g,b,a);
            }
             //x,y位置随机
            let r_x = Math.random()*(150-(-110))+(-110);
            let r_y = Math.random()*(150-(-50))+(-50);
            ball.getComponent(UITransform).setContentSize(10,10);
            ball.setParent(this.node.getChildByName("ball_group"));
            ball.setPosition(0,0);
            tween(ball).to(Math.random()*(0.5-(0.2)+(0.2)),
            {position:new Vec3(r_x,r_y)}).removeSelf().start();
    
        }

        
    }

}


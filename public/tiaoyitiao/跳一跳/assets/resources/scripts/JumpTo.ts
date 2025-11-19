import {Node,Vec3,tween,easing} from 'cc';
/**
 * 实现接口方法
 */
Node.prototype.jump_to= function(targetPos:Vec3, height:number,duration:number,callback:Function){
    const new_tween_postion = new Vec3();

    //跳高
    let startPosY = 0;
    this.jump_y = 0;
    const y_tween = tween().to(duration/2,{jump_y:height},{
        onStart: (my:Node)=>{
            startPosY = my.position.y;
            my.jump_y = 0;
        },
        onUpdate: (my:Node)=>{
            new_tween_postion.set(my.position);
            new_tween_postion.y = startPosY+my.jump_y;
            my.position = new_tween_postion;
        },
        onComplete:(my:Node)=>{
            my.jump_y = 0;
        },easing:'quadOut',
    }).to(duration/2,{jump_y:height},{
        onStart: (my:Node)=>{
            startPosY = my.position.y;
        },
        onUpdate: (my:Node)=>{
            new_tween_postion.set(my.position);
            new_tween_postion.y = startPosY- my.jump_y;
            my.position = new_tween_postion;
        },
        onComplete:(my:Node)=>{
            my.jump_y = 0;
        },easing:'quadIn',
    }).union();

    //修正y落点
    this.jump_offset_y = 0;
    let offsetY = 0;
    const offset_y_tween = tween().to(duration,{jump_offset_y:targetPos.y-this.position.y},{
        onStart:(my:Node) =>{
            offsetY = targetPos.y - my.position.y;
            my.jump_offset_y = 0;
        },
        onUpdate:(my:Node,r)=>{
            const oy = easing.quadOut(r)*offsetY;
            new_tween_postion.y += oy;
            my.position = new_tween_postion;
        },
        onComplete:(my:Node)=>{
            my.jump_offset_y = 0;
        }
    })

    //跳远
    this.jump_x = this.position.x;
    const x_tween = tween().to(duration,{jump_x:targetPos.x},{
        onUpdate:(my:Node)=>{
            new_tween_postion.set(my.position);;
            new_tween_postion.x = my.jump_x;
            my.position = new_tween_postion;
            callback?.();
        },
        onComplete:(my:Node)=>{
            my.jump_x = my.position.x;
        }
    });

    return tween(this).parallel(y_tween,offset_y_tween,x_tween);
}
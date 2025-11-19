import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
/**
 * 游戏数据
 * @author 一朵毛山
 * Construct 
 */
export class GameData{
    //0=没开始,1=游戏中,2=按下,3=弹起状态,4=游戏结束
    private static game_state:number = 0;
    //本局得分
    private static total_score:number = 0;
    //每次跳跃得分
    private static step_score:number = 0;

    /**
     * 获取游戏状态
     * @returns 
     */
    public static get_game_state():number{
        return GameData.game_state;
    }

    /**
     * 设置游戏状态
     * @param value 
     */
    public static set_game_state(value:number){
        GameData.game_state = value;
    }

    /**
     * 重置数据,每次开始游戏调用
     */
    public static reset_data(){
        GameData.game_state = 0;
        GameData.total_score = 0;
        GameData.step_score = 0;
    }

    /**
     * 计算最终得分,最终得分要根据上一步得分来计算(step_score*2)
     * @param score 
     * @returns 
     */
    public static computed_step_score(score:number):number{
        // 0 ,-1,1,2
        if(score ==0 || score == -1){
            GameData.step_score = 0;
            return score;
        }
        if(score == 1){
            GameData.step_score = 1;
            GameData.total_score +=score;
            return score;
        }
        if(GameData.step_score ==0){
            GameData.step_score = 1;
        }
        GameData.step_score = GameData.step_score*score;
        GameData.total_score +=GameData.step_score;


        return GameData.step_score;
    }

    public static record_history_score(){
        if(GameData.total_score>0){
            let history_score = localStorage.getItem("history_score");
            if(!history_score){
                localStorage.setItem("history_score",GameData.total_score+"");
            }else{
                let hs:number = Number(history_score);
                if(hs<GameData.total_score){
                    localStorage.setItem("history_score",GameData.total_score+"");
                }
            }
        }
    }



    /**
     * 获取本局总分数
     * @returns 
     */
    public static get_total_score():number{
        return GameData.total_score;
    }

}


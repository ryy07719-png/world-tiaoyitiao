import { _decorator, Component, Node, AudioClip, AudioSource } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 声音,脚本,挂载到canvas
 * @author 一朵毛山
 * Construct 
 */
@ccclass('SoundCtl')
export class SoundCtl extends Component {
    //跳跃声音,开始
    @property({ type: AudioClip })
    jump_start: AudioClip = null;
    //跳跃声音,循环
    @property({ type: AudioClip })
    jump_loop: AudioClip = null;
    //失败声音
    @property({ type: AudioClip })
    fail: AudioClip = null;
    //得分1
    @property({ type: AudioClip })
    score_1: AudioClip = null;
    //得分>=2
    @property({ type: AudioClip })
    score_more: AudioClip = null;
    //弹出,没用到这个
    @property({ type: AudioClip })
    pop: AudioClip = null;
    //定时器的回调函数
    play_call_back: Function = null;

    start() {

    }

    update(deltaTime: number) {

    }
    /**
     * 播放触控声音
     */
    play_start() {
        let as = this.node.getComponent(AudioSource);
        as.clip = this.jump_start;
        as.play();
        this.play_call_back = () => {
            as.stop();
            as.clip = this.jump_loop;
            as.play();
            as.loop = true;
        }
        this.scheduleOnce(this.play_call_back, 2);
    }
    /**
     * 停止播放触控声音
     */
    play_stop() {
        this.node.getComponent(AudioSource)?.stop();
        if (this.play_call_back) {
            this.unschedule(this.play_call_back);
        }
    }

    /**
     * 根据得分播放声音
     * @param score 
     */
    play_score(score: number) {
        let as = this.node.getComponent(AudioSource);
        switch (score) {
            case -1:
            case 0:
                as.playOneShot(this.fail);
                break;
            case 1:
                as.playOneShot(this.score_1);
                break;
            default:
                as.playOneShot(this.score_more);
                break;
        }
    }

}


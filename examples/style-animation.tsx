/**
 * @disc:example
 * @author:yanxinaliang
 * @time：2018/6/9 20:34
 */
import * as React from "react";
import * as ReactDOM from "react-dom";
import {Animation} from "../src/Animation";
import "./style-animation.css";

class AnimationDemo extends React.Component<any,any>{
    constructor(props:any){
        super(props);
        this.state={
            show:false
        }
    }
    toggle=()=>{
        this.setState({
            show:!this.state.show
        })
    };
    render(){
        return [<Animation key={"1"} animType={"css"} origin={"100% 0"} start={{top:0,right:0,opacity:0.3,scale:0.3}} end={{top:60,right:60,opacity:1,scale:1}}>
            {
                this.state.show?<div className={"test"}>我是动画内容</div>:null
            }
        </Animation>,
        <button key={"2"} onClick={this.toggle}>{this.state.show?"隐藏":"显示"}</button>]
    }
}


ReactDOM.render(
    <div>
        <h2>style animation</h2>
        <AnimationDemo />
    </div>,
    document.getElementById('__react-content'),
);


export default AnimationDemo;
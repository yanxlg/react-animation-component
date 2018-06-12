/**
 * @disc:动画库
 * @author:yanxinaliang
 * @time：2018/6/8 22:28
 */
import * as React from "react";
import * as ReactDOM from "react-dom";
import "web-library/lib/polyfills/animationFrame";


export declare interface IPosition{
    left?:number;
    top?:number;
    right?:number;
    bottom?:number;
    opacity?:number;
    scale?:number;
}


export declare interface IAnimationProps{
    animType:"class"|"css";
    duration?:number;
    delay?:number;
    timing?:string;
    origin?:string;
    enterClass?:string;
    leaveClass?:string;
    start?:IPosition;
    end?:IPosition;
    children?:React.ReactElement<any>|null;
    onTransitionEnd?:()=>void;
}

const transitionEnd=(()=>{
    const transEndEventNames = {
        MozTransition    : 'transitionend',
        WebkitTransition : 'webkitTransitionEnd',
        transition       : 'transitionend'
    };
    for(const name in transEndEventNames){
        if(typeof document.body.style[name] === "string"){
            return transEndEventNames[name];
        }
    }
})();

const animationEnd=(()=>{
    const animsEndEventNames = {
        MozAnimation    : 'animationend',
        WebkitAnimation : 'webkitAnimationEnd',
        animation       : 'ainmationend'
    };
    for(const name in animsEndEventNames){
        if(typeof document.body.style[name] === "string"){
            return animsEndEventNames[name];
        }
    }
})();

class Animation extends React.Component<IAnimationProps>{
    private enterOrLeave:"enter"|"leave"|"";
    private shouldUpdateFlag:boolean = true;
    private wrapElement:any;
    constructor(props:IAnimationProps){
        super(props);
        if(props.children){
            this.enterOrLeave="enter";
        }
    }
    public render(){
        const {children,enterClass="",animType} = this.props;
        const style = animType === "css"?this.calcCss():{};
        const event = animType==="class"?(this.enterOrLeave==="enter"?{onAnimationEnd:this.onAnimationEnd}:{}):(this.enterOrLeave==="enter"?{onTransitionEnd:this.onTransitionEnd}:{});
        
        // children clone
        return children?this.cloneElement((ref:HTMLDivElement)=>this.wrapElement=ReactDOM.findDOMNode(ref),enterClass,style,event):null;
        
        // return children?<div ref={(ref:HTMLDivElement)=>this.wrapElement=ref} className={(className||"")+(enterClass||"")} style={style} {...event}>{children}</div>:null;
    }
    public componentDidMount(){
        const {children,animType,start} = this.props;
        if(children&&animType==="css"){
            if(this.wrapElement){
                window.getComputedStyle(this.wrapElement).top;
                this.wrapElement.style.transform=`translate3d(0,0,0)${start&&void 0 !==start.scale?" scale(1)":""}`;
                start&&start.opacity&&(this.wrapElement.style.opacity="1")
            }
        }
    }
    public componentDidUpdate(){
        const {animType,start} = this.props;
        
        if(this.enterOrLeave==="enter"&&animType==="css"){
            window.getComputedStyle(this.wrapElement).top;
            this.enterOrLeave="";
            window.requestAnimationFrame(()=>{
                this.wrapElement.style.transform=`translate3d(0,0,0)${start&&void 0 !==start.scale?" scale(1)":""}`;
                start&&start.opacity&&(this.wrapElement.style.opacity="1");
            });
        }
    }
    public shouldComponentUpdate(){
        return this.shouldUpdateFlag;
    }
    public componentWillReceiveProps(nextProps:IAnimationProps){
        const beforeChildren = this.props.children;
        const {children,animType,leaveClass} = nextProps;
        
        if(!beforeChildren&&children){
            this.enterOrLeave="enter";
        }else if(!children&&beforeChildren){
            this.enterOrLeave="leave";
            this.shouldUpdateFlag=false;
            if(this.wrapElement){
                if(animType==="css"){
                    // css 离开动画 执行完成后刷新
                    const transitionEndCallback=()=>{
                        this.wrapElement&&this.wrapElement.removeEventListener(transitionEnd,transitionEndCallback);
                        this.shouldUpdateFlag=true;
                        this.forceUpdate();
                    };
                    this.wrapElement.addEventListener(transitionEnd, transitionEndCallback);
                    const revertCss=this.calcRevert(nextProps);
                    for(const key in revertCss){
                        this.wrapElement.style[key] = revertCss[key];
                    }
                }else{
                    if(leaveClass){
                        const animationEndCallback=()=>{
                            this.wrapElement&&this.wrapElement.removeEventListener(animationEnd,animationEndCallback);
                            this.shouldUpdateFlag=true;
                            this.forceUpdate();
                        };
                        this.wrapElement.addEventListener(animationEnd, animationEndCallback);
                        this.wrapElement.classList.add(leaveClass);
                    }else{
                        this.shouldUpdateFlag=true;
                        this.forceUpdate();
                    }
                }
            }
        }else{
            this.enterOrLeave="";
            this.shouldUpdateFlag=true;
        }
    }
    private cloneElement=(ref:(ref:any)=>void,className:string,style:any,events:any)=>{
        const {children} =this.props;
        if(children){
            return React.cloneElement(children as any,{
                className:((children as any).props.className||"") + " "+className,
                ref:ref,
                style:Object.assign({},(children as any).props.style||{},style),
                ...events
            });
        }else{
            return null;
        }
    };
    private calcCss=()=>{
        const {duration=300,delay,timing="ease",start,end,origin} = this.props;
        // 相对于end时start位置
        let transX = 0 ;
        let transY = 0;
        if(start&&end){
            if(void 0!==start.left&&void 0!==end.left){
                transX=start.left - end.left;
            }else if(void 0!==start.right&&void 0!==end.right){
                transX=end.right - start.right;
            }
            if(void 0!==start.top&&void 0!==end.top){
                transY=start.top-end.top;
            }else if(void 0!==start.bottom&&void 0!==end.bottom){
                transY=end.bottom-start.bottom;
            }
        }
        return {
            ...end?end:{},
            transform:`translate3d(${transX}px,${transY}px,0)${start&&void 0 !==start.scale?` scale(${start.scale})`:""}`,
            ...delay?{transitionDelay:delay+"ms"}:{},
            transitionDuration:duration+"ms",
            transitionProperty:"transform",
            transitionTimingFunction:timing,
            ...origin?{transformOrigin:origin}:{},
            ...start&&start.opacity?{opacity:start.opacity}:{},
        }
    };
    private calcRevert=(props:IAnimationProps)=>{
        const {duration=300,delay,timing="ease",start,end,origin} = props;
        // 相对于end时start位置
        let transX = 0 ;
        let transY = 0;
        if(start&&end){
            if(void 0!==start.left&&void 0!==end.left){
                transX=start.left - end.left;
            }else if(void 0!==start.right&&void 0!==end.right){
                transX=end.right - start.right;
            }
            if(void 0!==start.top&&void 0!==end.top){
                transY=start.top-end.top;
            }else if(void 0!==start.bottom&&void 0!==end.bottom){
                transY=end.bottom-start.bottom;
            }
        }
        return {
            transform:`translate3d(${transX}px,${transY}px,0)${start&&void 0 !==start.scale?` scale(${start.scale})`:""}`,
            ...delay?{transitionDelay:delay+"ms"}:{},
            transitionDuration:duration+"ms",
            transitionProperty:"transform",
            transitionTimingFunction:timing,
            ...origin?{transformOrigin:origin}:{},
            ...start&&start.opacity?{opacity:start.opacity}:{},
        }
    };
    private onAnimationEnd=(e:any)=>{
        const {enterClass} = this.props;
        e.target.classList.remove(enterClass);
    };
    private onTransitionEnd=()=>{
        const {onTransitionEnd} = this.props;
        onTransitionEnd&&onTransitionEnd.call(this);
    };
}

export {Animation};

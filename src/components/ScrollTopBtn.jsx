import ArrowUp from "../icons/ArrowUp";

const ScrollTopBtn = ({scrollTop}) => {
    return (
        <button className="btn-up" onClick={scrollTop}><ArrowUp /></button>
    );
};
 
export default ScrollTopBtn;
import './Context.css';

export default function Context({context}) {
    const {pre, at, post} = context;

    return (
        <div className="context">
            <div className="header"><u>Context</u></div>
            <div className="content">
                {pre} <b>{at}</b> {post}
            </div>
        </div>
    );
}

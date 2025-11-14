import { useDispatch, useSelector } from "react-redux";

export function OrderCard(props) {
    const {item} = props;
    const cost = parseFloat(item.cost.replace('₹', ''));    
    const dispatch = useDispatch();

    return (
        <div className="order-item">
            <div
                className="order-thumb"
                role="img"
                aria-label="Ghee Roast Dosa"
                style={{
                    backgroundImage:
                        `url(${item.img})`,
                }}
            />
            <div className="order-meta">
                <p className="order-title">{item.name}</p>
                <p className="order-sub">{`${item.cost}`}</p>
            </div>
            <div className="order-qty">
                <button className="order-qty-btn" aria-label="Decrease" onClick={() => dispatch({ type: "CARD_QUANTITY_DECREMENT", name: item.name })}>
                    <span className="ms ms-remove" aria-hidden="true"></span>
                </button>
                <span className="order-qty-value">{item.quantity}</span>
                <button className="order-qty-btn" aria-label="Increase" onClick={() => dispatch({ type: "CARD_QUANTITY_INCREMENT", name: item.name })}>
                    <span className="ms ms-add" aria-hidden="true"></span>
                </button>
            </div>
            <p className="order-total">{(cost * item.quantity).toFixed(2)}</p>
        </div>
    )
}
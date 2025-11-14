"use client";
import React, { memo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export const ItemCard = memo(function ItemCard(props) {
    const { item } = props;
    const dispatch = useDispatch();
    const FALLBACK = "data:image/svg+xml;utf8,<?xml version='1.0' encoding='UTF-8'?><svg xmlns='http://www.w3.org/2000/svg' width='300' height='180'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial, Helvetica, sans-serif' font-size='16'>Image unavailable</text></svg>";
    const [imgSrc, setImgSrc] = useState(item.img);

    // Use a specific selector to avoid unnecessary re-renders
    const state = useSelector((state) => state.state);

    const handleCardAdd = (item) => {
        if (state.addedItems && !state.addedItems.includes(item.name))
            dispatch({ type: "ADD_CARD", data: item.name, cost: item.cost, img: item.img });
    };
    console.log(state, 'venkadesan');

    const cardFootTemplate = state.addedItems.includes(item.name) ? (
        <div className="qty">
            <button className="qty-btn" aria-label="Decrease">
                <span className="ms ms-remove" aria-hidden="true" onClick={() => dispatch({ type: "CARD_QUANTITY_DECREMENT",name:item.name })}></span>
            </button>
            <span className="qty-value">
                {(state.cardInfo.find((card) => card.name === item.name) || { quantity: 0 }).quantity}
            </span>
            <button className="qty-btn" aria-label="Increase" onClick={() => dispatch({ type: "CARD_QUANTITY_INCREMENT", name: item.name })}>
                <span className="ms ms-add" aria-hidden="true"></span>
            </button>
        </div>
    ) : (
        <button className="btn-outline-primary" onClick={() => handleCardAdd(item)}>
            <span className="ms ms-add" aria-hidden="true"></span>
            Add
        </button>
    );
    console.log(item,'itemitem');
    
    // Retry loading original image when the tab becomes visible again
    useEffect(() => {
        const onVis = () => {
            if (document.visibilityState === 'visible' && imgSrc === FALLBACK && item.img) {
                setImgSrc(item.img);
            }
        };
        document.addEventListener('visibilitychange', onVis);
        return () => document.removeEventListener('visibilitychange', onVis);
    }, [imgSrc, item.img]);

    return (
        <div className="card">
            <img
                className="card-media"
                alt={item.label}
                src={imgSrc}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onError={() => setImgSrc(FALLBACK)}
                style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
            />
            <div className="card-body">
                <h3 className="card-title">{item.name}</h3>
                <p className="card-price">{item.cost}</p>
                {cardFootTemplate}
            </div>
        </div>
    );
});
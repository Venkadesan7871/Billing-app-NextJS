const initialState = {
    count: 0,
    addedItems: [],
    cardInfo: [],
    menuItems: [],
    report: []
};


export const Reducer = (state = initialState, action) => {
    switch (action.type) {
        case "INCREMENT":
            return { ...state, count: state.count + 1 };

        case "DECREMENT":
            return { ...state, count: state.count - 1 };

        case "ADD_MENU_ITEM":
            return { ...state, menuItems: [...state.menuItems, action.item] };

        case "UPDATE_MENU_ITEM":
            return {
                ...state,
                menuItems: state.menuItems.map((item) =>
                    item.id === action.item.id ? { ...item, ...action.item } : item
                ),
            };

        case "DELETE_MENU_ITEM":
            return {
                ...state,
                menuItems: state.menuItems.filter((item) => item.id !== action.id),
            };

        case "ADD_CARD":
            return {
                ...state,
                addedItems: [...state.addedItems, action.data],
                cardInfo: [
                    ...state.cardInfo,
                    {
                        quantity: 1,
                        name: action.data,
                        cost: action.cost,
                        img: action.img,
                    },
                ],
            };

        case "CARD_QUANTITY_DECREMENT": {
            const updatedCardInfo = state.cardInfo
                .map((item) =>
                    item.name === action.name
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                )
                .filter((item) => item.quantity > 0);

            const updatedAddedItems = updatedCardInfo.some(
                (item) => item.name === action.name
            )
                ? state.addedItems
                : state.addedItems.filter((item) => item !== action.name);

            return { ...state, cardInfo: updatedCardInfo, addedItems: updatedAddedItems };
        }

        case "CARD_QUANTITY_INCREMENT":
            return {
                ...state,
                cardInfo: state.cardInfo.map((item) =>
                    item.name === action.name && item.quantity < 10
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                ),
            };

        case "RESET_ITEMS":
            return { ...state, addedItems: [], cardInfo: [] };

        case "PAID_BILL":
            return { ...state, report: [...state.report, action.data] };

        // HYDRATE actions for loading from DB
        case "HYDRATE_ALL": {
            const p = action.payload || {};
            return {
                ...state,
                ...(p.menuItems ? { menuItems: p.menuItems } : {}),
                ...(p.addedItems ? { addedItems: p.addedItems } : {}),
                ...(p.cardInfo ? { cardInfo: p.cardInfo } : {}),
                ...(p.report ? { report: p.report } : {}),
            };
        }

        case "HYDRATE_MENU_ITEMS":
            return { ...state, menuItems: action.items || [] };

        case "HYDRATE_ADDED_ITEMS":
            return { ...state, addedItems: action.items || [] };

        case "HYDRATE_CARD_INFO":
            return { ...state, cardInfo: action.items || [] };

        case "HYDRATE_REPORT":
            return { ...state, report: action.items || [] };

        default:
            return state;
    }
};

"use client"

export function MenuItemCard(props) {
    const { menu, onEdit, onDelete } = props;
    return (
        <div className="menu-card">
            <div
                className="menu-card-media"
                role="img"
                aria-label="A colorful and healthy salad bowl with fresh vegetables and quinoa."
                style={{
                    backgroundImage:
                       `url(${menu.img})`
                }}
            />
            <div className="menu-card-body">
                <div className="menu-card-main">
                    <h3 className="menu-card-title">{menu.name}</h3>
                    <p className="menu-card-price">{menu.cost}</p>
                </div>
                <div className="menu-card-actions">
                    <button
                        className="icon-btn icon-btn-primary material-symbols-outlined"
                        aria-label="Edit item"
                        style={{ color: 'rgb(25 127 230)' }}
                        onClick={() => onEdit && onEdit(menu)}
                    >
                        edit
                    </button>
                    <button
                        className="icon-btn icon-btn-dange material-symbols-outlined"
                        aria-label="Delete item"
                        style={{ color: "rgb(239 68 68 )", backgroundColor: 'rgb(239 68 68 / 0.1)' }}
                        onClick={() => onDelete && onDelete(menu)}
                    >
                        delete
                    </button>
                </div>
            </div>
        </div>
    )
}
const React = require('react');
const superagent = require('superagent');
const PropTypes = require('prop-types');
const get = require('lodash/get');
const concat = require('lodash/concat');
const trim = require('lodash/trim');
const set = require('lodash/set');
const isEmpty = require('lodash/isEmpty');
const {formatMoney} = require('../../util');

const styles = require('./styles.scss');

class Item extends React.Component {
    constructor() {
        super();
        this.state = { data: {} };
    }
    componentDidMount() {
        const id = trim(get(this.props, 'match.params.id', ''));

        if (id === '') {
            this.props.history.push('/');
            return;
        }

        superagent.get(`/api/items/${id}`).then(res => {
            if (res.statusCode === 200) {
                superagent.get(`/api/categories/${res.body.item.category_id}`).then(response => {
                    if (response.statusCode === 200) {
                        set(res.body, 'category', response.body);
                        this.setState({ data: res.body });
                    }

                    document.title = get(res.body, 'item.title') + ' - Mercado Libre';
                });
            }
        });
    }
    render() {
        const itemData = this.state.data;
        let categories = ' ';
        const soldQuantity = get(itemData, 'item.sold_quantity', 0);
        const soldString = soldQuantity ? (' - ' + soldQuantity + (soldQuantity === 1 ? ' vendido' : ' vendidos')) : '';
        const price = get(itemData, 'item.price.currency') ? 
            `${get(itemData, 'item.price.currency')} ${formatMoney(get(itemData, 'item.price.amount'), 0, ',', '.')}` : '';
        const description = get(itemData, 'item.description', '')
            .split('\n')
            .map((item, idx) => {
                return (
                    <React.Fragment key={idx}>
                        {item}
                        <br />
                    </React.Fragment>
                );
            });

        if (!isEmpty(itemData)) {
            if (Array.isArray(itemData.category.path)) {
                categories = itemData.category.path.map(
                    (category, index, arr) => {
                        return (concat(<span key={'cat-' + index} className="category-item">{category}</span>,
                            ((arr.length - 1) !== index) ? <span key={index} className="category-separator">&gt;</span> : ''));
                    });
            }
        }
        return (
            <div className="item-container">
                <div className="categories-container">{categories}</div>
                <div className="item-data">
                    <div className="item-picture-container">
                        <div className="item-picture" style={{ backgroundImage: `url(${get(itemData, 'item.picture')})` }}>
                        </div>                        
                        <div className="item-description-container">
                            <div className="item-description-title">Descripción del producto</div>
                            <div className="item-description">{description}</div>
                        </div>
                    </div>
                    <div className="item-details">
                        <div className="item-stats">{get(itemData, 'item.condition', '')}{soldString}</div>
                        <div className="item-title">{get(itemData, 'item.title', '')}</div>
                        <div className="item-price">{price}</div>
                        <div className="item-buy">Comprar</div>
                    </div>
                </div>
            </div>);
    }
}

Item.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.string,
        }),
    }).isRequired,
    history: PropTypes.object,
    location: PropTypes.object,
};

module.exports = { Item };
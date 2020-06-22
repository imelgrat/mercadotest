const React = require('react');
const { Link } = require('react-router-dom');
const PropTypes = require('prop-types');
const get = require('lodash/get');

const styles = require('./styles.scss');
const {formatMoney} = require('../../util');

class SearchItem extends React.Component {

    render()
    {
        const itemData = this.props.data;
        return(
            <div className="search-item">
                <Link className="item-link" to={'/items/' + get(itemData, 'id')}>
                    <div className="item-thumbnail"><img src={get(itemData, 'picture')} alt={get(itemData, 'title')}></img></div>
                    <div className="item-detail">
                        <div className="item-price">
                            {get(itemData, 'price.currency')} {formatMoney(get(itemData, 'price.amount'), 0, ',', '.')}
                            {get(itemData, 'free_shipping') ? <img alt="Free Shipping" src="/images/ic_shipping.png"></img> : ''}
                        </div>
                        <div className="item-title">
                            {get(itemData, 'title')}
                        </div>
                    </div>
                    <div className="item-location">{get(itemData, 'state')}</div>
                </Link>
            </div>
        );
    }
}

SearchItem.propTypes = {
    data: PropTypes.object
};

module.exports = { SearchItem };
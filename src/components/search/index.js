const React = require('react');
const { withRouter } = require('react-router-dom');
const superagent = require('superagent');
const PropTypes = require('prop-types');
const queryString = require('query-string');
const get = require('lodash/get');
const concat = require('lodash/concat');
const {SearchItem} = require('../search-item');

const styles = require('./styles.scss');


class Search extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            categories: []
        };
    }
    componentDidMount() {
        const parsedQuery = queryString.parse(this.props.location.search);
        superagent.get(`/api/items/?search=${parsedQuery.search}`).then(res => {
            if (res.statusCode === 200) {
                this.setState({
                    items: res.body.items,
                    categories: res.body.categories
                });
            }
        });
        document.title = 'Resultados de la búsqueda - Mercado Libre';
    }

    componentDidUpdate(prevProps) {
        const prevKey = get(prevProps, 'location.key', '');
        const currentKey = get(this.props, 'location.key', '');

        if (prevKey !== currentKey) {
            const parsedQuery = queryString.parse(this.props.location.search);
            superagent.get(`/api/items/?search=${parsedQuery.search}`).then(res => {
                if (res.statusCode === 200) {
                    this.setState({ items: res.body.items, categories: res.body.categories });
                }
            });
        }
    }

    render() {
        let items = [];
        let categories = '&nbsp;';

        if (Array.isArray(this.state.items)) {
            items = this.state.items.map((item, index) => {
                return (<SearchItem key={index} data={item}></SearchItem>);
            });
        }

        if (Array.isArray(this.state.categories)) {
            categories = this.state.categories.map(
                (category, index, arr) => {
                    return (concat(<span key={index} className="category-item">{category}</span> , 
                        ((arr.length - 1) !== index) ? <span key={index} className="category-separator">&gt;</span> : '')); 
                });
        }

        return (
            <div className="results-container">
                <div className="categories-container">{categories}</div>
                <div className="items-container">{items}</div>
            </div>
        );
    }
}

Search.propTypes = {
    location: PropTypes.object
};

module.exports = { Search: withRouter(Search) };
const React = require('react');
const { withRouter, Link } = require('react-router-dom');
const styles = require('./styles.scss');
const PropTypes = require('prop-types');
const queryString = require('query-string');


class SearchBox extends React.Component {
    constructor(props) {
        super(props);
        const parsed = queryString.parse(this.props.location.search);
        this.state = {
            searchValue: parsed.search ? parsed.search : ''
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.value;
        this.setState({
            searchValue: value
        });
    }

    handleSubmit() {
        this.props.history.push(`/items?search=${this.state.searchValue}`);
    }

    handleKeyDown(event) {
        if (event.key === 'Enter') {
            this.props.history.push(`/items?search=${this.state.searchValue}`);
        }
    }

    render() {
        return (
            <div className="searchbox">
                <div className="searchbox-inner">
                    <div className="logo">
                        <Link to={'/'}><img alt="MercadoLibre" src="/images/Logo_ML.png" /></Link>
                    </div>
                    <div className="searchform">
                        <div className="form-container">
                            <input className="input-box" type="text" placeholder="Nunca dejes de buscar" 
                                value={this.state.searchValue} onChange={this.handleInputChange}  onKeyDown={this.handleKeyDown}></input>
                            <div className="search-trigger" id="search-trigger" onClick={this.handleSubmit}>
                                <img alt="Buscar" src="/images/ic_Search.png" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>);
    }
}

SearchBox.propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
};

module.exports = { SearchBox: withRouter(SearchBox) };
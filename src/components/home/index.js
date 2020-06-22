const React = require('react');
const { SearchBox } = require('../searchbox');

class Home extends React.Component {
    componentDidMount() {
        document.title = 'Bienvenidos a Mercado Libre';
    }

    render() {
        return (
            <div></div>
        );
    }
}

module.exports = { Home };
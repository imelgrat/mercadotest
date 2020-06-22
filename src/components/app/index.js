const React = require('react');
const styles = require('./main-styles.scss');

const {
    BrowserRouter,
    Switch,
    Route
} = require('react-router-dom');
const { SearchBox } = require('../searchbox');

const { Home } = require('../home');
const { Search } = require('../search');
const { Item } = require('../item');

function App() {
    return (
        <div>
            <BrowserRouter>
                <SearchBox />
                <div>
                    <Switch>
                        <Route exact path="/" component={Home} />
                        <Route path="/items/:id" component={Item} />
                        <Route path="/items" render={(location) => (<Search key={location.key}/>)}></Route>
                    </Switch>
                </div>
            </BrowserRouter>
        </div>
    );
}

module.exports = { App };
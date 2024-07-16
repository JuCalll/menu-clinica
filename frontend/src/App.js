import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Orders from './pages/Orders';
import Patients from './pages/Patients';
import './styles/App.scss';

function App() {
    return (
        <Router>
            <Switch>
                <Route path="/" exact component={Home} />
                <Route path="/menu" component={Menu} />
                <Route path="/orders" component={Orders} />
                <Route path="/patients" component={Patients} />
            </Switch>
        </Router>
    );
}

export default App;

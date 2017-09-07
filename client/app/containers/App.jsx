import React, { Component } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import LandingPage from "../components/landingPage/LandingPage.jsx";
import LoadingPage from "./loadingPage/LoadingPage.jsx";
import Auth from "../../Auth/Auth.js";
import ShopProfilePage from "../components/shopProfilePage/ShopProfilePage.jsx";
import ShopDashboard from "../components/shopDashboard/ShopDashboard.jsx";
import ShopDashboardSettings from "../components/shopDashboard/ShopDashboardSettings.jsx";
import ShopDashboardCalendarForm from "../components/shopDashboard/ShopDashboardCalendarForm.jsx";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { addAuth } from "../actions/authAction.js";
import SearchResults from "../components/searchResults/searchResults.jsx";
import UserDashBoard from "./userDashboard/UserDashboard.jsx";
import InputMaintenanceHistory from "../components/shopDashboard/InputMaintenanceHistory.jsx";
import UserReviews from "./userDashboard/UserReviews.jsx";

function mapStateToProps(state) {
  return {
    currentAuth: state.currentAuth.auth
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ addAuth }, dispatch);
}

class App extends Component {
  constructor(props) {
    super(props);
    this.props.addAuth(new Auth());
  }

  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={LandingPage} />
          <Route
            path="/loadingpage"
            render={() => <LoadingPage auth={this.props.currentAuth} />}
          />
          <Route path="/search" component={SearchResults} />
          <Route path="/shops" component={ShopProfilePage} />
          <Route path="/userdash" component={UserDashBoard} />
          <Route path="/shopdashboard" component={ShopDashboard} />
          <Route path="/shopdashsettings" component={ShopDashboardSettings} />
          <Route
            path="/shopdashcalform"
            component={ShopDashboardCalendarForm}
          />
          <Route path="/user-reviews" component={UserReviews} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);

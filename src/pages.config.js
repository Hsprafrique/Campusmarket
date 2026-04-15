import AdminListings from './pages/AdminListings';
import AdminMonetization from './pages/AdminMonetization';
import Auth from './pages/Auth';
import Browse from './pages/Browse';
import Chat from './pages/Chat';
import CreateListing from './pages/CreateListing';
import FeatureListing from './pages/FeatureListing';
import Home from './pages/Home';
import Messages from './pages/Messages';
import MyListings from './pages/MyListings';
import MyStore from './pages/MyStore';
import Onboarding from './pages/Onboarding';
import Pricing from './pages/Pricing';
import Profile from './pages/Profile';
import __Layout from './Layout.jsx';

export const PAGES = {
  "AdminListings": AdminListings,
  "AdminMonetization": AdminMonetization,
  "Auth": Auth,
  "Browse": Browse,
  "Chat": Chat,
  "CreateListing": CreateListing,
  "FeatureListing": FeatureListing,
  "Home": Home,
  "Messages": Messages,
  "MyListings": MyListings,
  "MyStore": MyStore,
  "Onboarding": Onboarding,
  "Pricing": Pricing,
  "Profile": Profile,
}

export const pagesConfig = {
  mainPage: "Home",
  Pages: PAGES,
  Layout: __Layout,
};

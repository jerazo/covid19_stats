import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import SplashScreen from '../components/screens/splash/splash-screen';
import LoginScreen from '../components/screens/auth/login-screen';
import DashboardScreen from '../components/screens/dashboard/dashboard-screen';

const AppSwitchNavigator = createSwitchNavigator(
  {
    Splash: SplashScreen,
    Login: LoginScreen,
    Dashboard: DashboardScreen,
  },
  {
    initialRouteName: 'Dashboard',
  },
);

const RootNavigation = createAppContainer(AppSwitchNavigator);

export default RootNavigation;

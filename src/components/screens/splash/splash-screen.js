import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, ActivityIndicator, ImageBackground } from 'react-native';
import moment from "moment";

class SplashScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      apifyData: null,
      histogram: [1],
    };
  }

  componentDidMount() {
    fetch('https://api.apify.com/v2/key-value-stores/lFItbkoNDXKeSWBBA/records/LATEST?disableRedirect=true')
      .then(response => response.json())
      .then(responseJson => {
        this.setState({
          loading: !(responseJson && this.state.histogram.length !== 0),
          apifyData: responseJson,
          histogram: this.state.histogram,
        });
      })
      .catch(error => console.log(error));

    fetch('https://api.apify.com/v2/datasets/sFSef5gfYg3soj8mb/items?format=json&clean=1')
      .then(response => response.json())
      .then(responseJson => {
        this.setState({
          loading: !(responseJson && this.state.apifyData),
          apifyData: this.state.apifyData,
          histogram: responseJson,
        });
      })
      .catch(error => console.log(error));
  }

  render() {
    return (
      <View style={styles.container}>
        <ImageBackground style={styles.backgroundImage} source={require('../../../../assets/wave.png')} />
        {this.state.loading && <ActivityIndicator color="#F0F0F2" size="large" />}
      </View>
    );
  }
}

export default SplashScreen;

const styles = StyleSheet.create({
  stats: {
    flex: 1,
    flexDirection: 'column',
  },
  groupedBox: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 10,
  },
  groupedBoxSub: {
    padding: '0.5%',
    margin: '0.5%',
    width: '24%',
    height: '10%',
    flexDirection: 'column',
  },
  lastUpdatedAtApify: {
    color: '#50514F',
    justifyContent: 'center',
    textAlign: 'center',
    paddingTop: 30,
    fontSize: 9,
  },
  label: {
    color: '#F0F0F2',
    justifyContent: 'center',
    textAlign: 'center',
    fontSize: 9,
  },
  value: {
    color: '#F0F0F2',
    justifyContent: 'center',
    textAlign: 'center',
    fontSize: 35,
  },
  indicator: {
    color: '#F0F0F2',
  },
  backgroundImage: {
    flex: 1,
    alignSelf: 'stretch',
    resizeMode: 'cover',
    justifyContent: 'center',
    width: '100%',
    height: 200,
    position: 'absolute',
    bottom: 0,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A0B0D',
  },
});

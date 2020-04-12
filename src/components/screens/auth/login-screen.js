import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

class LoginScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>Auth Screen Here</Text>
      </View>
    );
  }
}

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

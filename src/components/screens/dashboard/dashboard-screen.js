import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, ActivityIndicator, ImageBackground, Dimensions } from 'react-native';
import { LineChart, BarChart, PieChart, ProgressChart, ContributionGraph } from 'react-native-chart-kit';
import 'intl';
import 'intl/locale-data/jsonp/en';
import moment from 'moment';
import axios from 'axios';

class DashboardScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      infected: 0,
      recovered: 0,
      deceased: 0,
      tested: 0,
      lastUpdated: new Date(),
      rapidapiData: [],
      histogram: [1],
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,
      chartConfig: {
        backgroundColor: '#0A0B0D',
        backgroundGradientFrom: '#0A0B0D',
        backgroundGradientTo: '#0A0B0D',
        backgroundGradientFromOpacity: 0,
        backgroundGradientToOpacity: 0,
        color: (opacity = 1) => `rgba(240, 240, 242, ${isNaN(opacity) ? 0 : opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${isNaN(opacity) ? 0 : opacity})`,
        strokeWidth: 2, // optional, default 3
        barPercentage: 0.5,
      },
    };
  }

  componentDidMount() {
    axios({
      method: 'GET',
      url: 'https://coronavirus-monitor.p.rapidapi.com/coronavirus/cases_by_particular_country.php',
      headers: {
        'content-type': 'application/octet-stream',
        'x-rapidapi-host': 'coronavirus-monitor.p.rapidapi.com',
        'x-rapidapi-key': 'yGvQxeCTA3S5ON4FsZEnzJLHBxl2CRws',
      },
      params: {
        country: 'Philippines',
      },
    })
      .then((response) => {
        const data = response.data.stat_by_country;
        this.setState({
          loading: false,
          rapidapiData: data,
          infected: data[data.length - 1].total_cases,
          recovered: data[data.length - 1].total_recovered,
          deceased: data[data.length - 1].total_deaths,
          active: data[data.length - 1].active_cases,
          lastUpdated: data[data.length - 1].record_date,
        });
        console.log(Object.keys(response.data.stat_by_country[3372]), response.data.stat_by_country[3372]);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  numberFormat(
    value: string | number,
    decimals: number,
    local: string,
    notation?: string,
    notationDecimals?: number,
  ): string {
    if (value !== null) {
      const options = { minimumFractionDigits: decimals, maximumFractionDigits: decimals };
      let val = null,
        exponent = null;

      if (value.toString().indexOf('e') !== -1) {
        [val, exponent] = value.toString().split('e-');
      } else {
        val = value;
      }

      const [displayValue, notationString] = this.notation(Number(val.replace(/,/g, '')), notation);
      if (notationString !== null && value > 999) {
        options.minimumFractionDigits = notationDecimals;
        options.maximumFractionDigits = notationDecimals;
      } else {
        const displayDecimals = decimals !== null ? decimals : this.countDecimals(displayValue) === 0 ? 0 : 2;
        options.minimumFractionDigits = displayDecimals;
        options.maximumFractionDigits = displayDecimals;
      }

      return Intl.NumberFormat(local, options).format(displayValue) + notationString + (exponent ? 'e-' + exponent : '');
    }
    return 'blank';
  }

  notation(value: number, notation: string): [number, string] {
    let displayValue = value;
    let notationString = '';
    switch (notation) {
      case 'compact':
        if (value / 1000000000000 > 1) {
          displayValue = value / 1000000000000;
          notationString = 'T';
        } else if (value / 1000000000 > 1) {
          displayValue = value / 1000000000;
          notationString = 'B';
        } else if (value / 1000000 > 1) {
          displayValue = value / 1000000;
          notationString = 'M';
        } else if (value / 1000 > 1) {
          displayValue = value / 1000;
          notationString = 'K';
        }
        break;
      case 'trillion':
        displayValue = value / 1000000000000;
        notationString = 'T';
        break;
      case 'billion':
        displayValue = value / 1000000000;
        notationString = 'B';
        break;
      case 'million':
        displayValue = value / 1000000;
        notationString = 'M';
        break;
      case 'thousands':
        displayValue = value / 1000;
        notationString = 'T';
        break;
    }

    return [displayValue, notationString];
  }

  /**
   * @description returns the decimal places count
   * @param value
   */
  countDecimals(value: number) {
    return value % 1 !== 0 ? value.toString().split('.')[1].length : 0;
  }

  render() {
    const infectionPerDay = [];
    let highestInfectionPerDay = 0;
    const deathPerDay = [];
    let highestDeathPerDay = 0;
    const recoveredPerDay = [];
    const labels = [];
    const infected = [];
    const active = [];
    const recovered = [];
    const deceased = [];
    this.state.rapidapiData.forEach((item) => {

      if (!labels.includes(moment(item.record_date).format('MMM D YYYY'))) {
        highestInfectionPerDay = highestInfectionPerDay < item.new_cases ? item.new_cases : highestInfectionPerDay;
        infectionPerDay.push({
          date: moment(item.record_date).format('MMM D YYYY'),
          count: item.new_cases,
          color: (opacity = 1) => 'rgba(243, 192, 40, 1)',
        });
        highestDeathPerDay = highestDeathPerDay < item.new_deaths ? item.new_deaths : highestDeathPerDay;
        deathPerDay.push({
          date: moment(item.record_date).format('MMM D YYYY'),
          count: item.new_deaths,
          color: (opacity = 1) => 'rgba(243, 192, 40, 1)',
        });
        labels.push(moment(item.record_date).format('MMM D YYYY'));
        infected.push(Number.parseInt(item.total_cases.replace(/,/g, '')) | 0);
        recovered.push(Number.parseInt(item.total_recovered.replace(/,/g, '')) | 0);
        deceased.push(Number.parseInt(item.total_deaths.replace(/,/g, '')) | 0);
        active.push(Number.parseInt(item.active_cases.replace(/,/g, '')) | 0);
      } else {
        const index = labels.indexOf(moment(item.record_date).format('MMM D YYYY'));
        highestInfectionPerDay = highestInfectionPerDay < item.new_cases ? item.new_cases : highestInfectionPerDay;
        infectionPerDay[index] = {
          date: moment(item.record_date).format('MMM D YYYY'),
          count: item.new_cases,
          color: (opacity = 1) => 'rgba(243, 192, 40, 1)',
        };
        highestDeathPerDay = highestDeathPerDay < item.new_deaths ? item.new_deaths : highestDeathPerDay;
        deathPerDay[index] = {
          date: moment(item.record_date).format('MMM D YYYY'),
          count: item.new_deaths,
          color: (opacity = 1) => 'rgba(243, 192, 40, 1)',
        };
        labels[index] = moment(item.record_date).format('MMM D YYYY');
        infected[index] = Number.parseInt(item.total_cases.replace(/,/g, '')) | 0;
        recovered[index] = Number.parseInt(item.total_recovered.replace(/,/g, '')) | 0;
        deceased[index] = Number.parseInt(item.total_deaths.replace(/,/g, '')) | 0;
        active[index] = Number.parseInt(item.active_cases.replace(/,/g, '')) | 0;
      }
    });

    console.log(infected);
    const data = {
      labels: labels,
      datasets: [
        {
          data: infected,
          color: (opacity = 1) => 'rgba(243, 192, 40, 1)',
          strokeWidth: 1,
        },
        {
          data: recovered,
          color: (opacity = 1) => 'rgba(112, 193, 179, 1)',
          strokeWidth: 1,
        },
        {
          data: deceased,
          color: (opacity = 1) => 'rgba(242, 95, 92, 1)',
          strokeWidth: 1,
        },
        {
          data: active,
          color: (opacity = 1) => `rgba(36, 123, 160, 1)`,
          strokeWidth: 1,
        },
      ],
    };

    return (
      <View style={styles.container}>
        {!this.state.loading && (
          <View style={styles.stats}>
            <View>
              <View style={styles.groupedBox}>
                <View style={styles.groupedBoxSub}>
                  <Text style={styles.label}>infected</Text>
                  <Text style={{ ...styles.value, color: '#F3C028' }}>
                    {this.numberFormat(this.state.infected, 0, 'en-US', 'compact', 2)}
                  </Text>
                  <Text style={styles.label}>{this.state.infected}</Text>
                </View>
                <View style={styles.groupedBoxSub}>
                  <Text style={styles.label}>recovered</Text>
                  <Text style={{ ...styles.value, color: '#70C1B3' }}>
                    {this.numberFormat(this.state.recovered, 0, 'en-US', 'compact', 2)}
                  </Text>
                  <Text style={styles.label}>{this.state.recovered}</Text>
                </View>
                <View style={styles.groupedBoxSub}>
                  <Text style={styles.label}>deceased</Text>
                  <Text style={{ ...styles.value, color: '#F25F5C' }}>
                    {this.numberFormat(this.state.deceased, 0, 'en-US', 'compact', 2)}
                  </Text>
                  <Text style={styles.label}>{this.state.deceased}</Text>
                </View>
                <View style={styles.groupedBoxSub}>
                  <Text style={styles.label}>active</Text>
                  <Text style={{ ...styles.value, color: '#247BA0' }}>
                    {this.numberFormat(this.state.active, 0, 'en-US', 'compact', 2)}
                  </Text>
                  <Text style={styles.label}>{this.state.active}</Text>
                </View>
              </View>
              <View style={{ height: '87%' }}>
                <Text style={styles.lastUpdatedAtApify}>
                  {moment(this.state.lastUpdated).format('MMMM Do YYYY, h:mm:ss a')}
                </Text>
                <Text style={styles.topicLabel}>
                  &#9679; Covid19 Stats
                </Text>
                <LineChart
                  data={data}
                  width={this.state.screenWidth}
                  height={this.state.screenHeight * 0.21}
                  chartConfig={this.state.chartConfig}
                  withShadow={false}
                  withDots={false}
                  withInnerLines={false}
                  withOuterLines={false}
                  withVerticalLabels={false}
                  formatXLabel={(value) => moment(value).format('D')}
                  bezier
                  style={{
                    margin: 5,
                    borderRadius: 5,
                    backgroundColor: '#000000',
                  }}
                />
                <Text style={styles.topicLabel}>
                  <Text style={{ ...styles.topicLabel, color: '#F3C028', fontSize: 15 }}>&#9679;</Text> Infection Per Day <Text style={styles.topicLabelSub}>(surge pick {highestInfectionPerDay})</Text>
                </Text>
                <ContributionGraph
                  values={infectionPerDay}
                  endDate={new Date()}
                  numDays={100}
                  width={this.state.screenWidth}
                  height={this.state.screenHeight * 0.23}
                  chartConfig={this.state.chartConfig}
                  horizontal={true}
                  squareSize={15}
                  style={{
                    margin: 5,
                    borderRadius: 5,
                    backgroundColor: '#000000',
                  }}
                />
                <Text style={styles.topicLabel}>
                  <Text style={{ ...styles.topicLabel, color: '#F25F5C', fontSize: 15 }}>&#9679;</Text> Death Per Day <Text style={styles.topicLabelSub}>(surge pick {highestDeathPerDay})</Text>
                </Text>
                <ContributionGraph
                  values={deathPerDay}
                  endDate={new Date()}
                  numDays={100}
                  width={this.state.screenWidth}
                  height={this.state.screenHeight * 0.23}
                  chartConfig={this.state.chartConfig}
                  horizontal={true}
                  squareSize={15}
                  style={{
                    margin: 5,
                    borderRadius: 5,
                    backgroundColor: '#000000',
                  }}
                />
              </View>
            </View>
          </View>
        )}
        {this.state.loading && <ActivityIndicator color="#F0F0F2" size="large" />}
        <ImageBackground
          style={styles.backgroundImage}
          source={require('../../../../assets/wave.png')}
        />
      </View>
    );
  }
}

export default DashboardScreen;

const styles = StyleSheet.create({
  stats: {
    width: '100%',
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
    borderRadius: 5,
    backgroundColor: '#000000',
    flexDirection: 'column',
  },
  lastUpdatedAtApify: {
    color: '#50514F',
    justifyContent: 'center',
    textAlign: 'center',
    fontSize: 9,
  },
  label: {
    color: '#F0F0F2',
    justifyContent: 'center',
    textAlign: 'center',
    fontSize: 9,
  },
  topicLabel: {
    color: '#F0F0F2',
    justifyContent: 'center',
    marginTop: 10,
    textAlign: 'left',
    fontSize: 10,
    textTransform: 'uppercase',
    marginLeft: 5,
    marginRight: 5,
  },
  topicLabelSub: {
    color: '#50514F',
    justifyContent: 'center',
    marginTop: 10,
    textAlign: 'left',
    fontSize: 9,
    textTransform: 'uppercase',
    marginLeft: 5,
    marginRight: 5,
  },
  value: {
    color: '#F0F0F2',
    justifyContent: 'center',
    textAlign: 'center',
    fontSize: 30,
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
    height: '100%',
    position: 'absolute',
    bottom: 0,
    opacity: 0.4,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A0B0D',
  },
});

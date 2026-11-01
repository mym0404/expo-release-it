import { StyleSheet, Text, View } from 'react-native';

export function App() {
  return (
    <View style={styles.container}>
      <Text>Expo release integration example</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

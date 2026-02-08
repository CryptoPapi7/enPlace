import { StyleSheet, View, Text } from 'react-native';

export default function CookScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Step 1: Stir</Text>
      <Text style={styles.instruction}>Mix ingredients until combined</Text>
      <Text style={styles.mockBox}>Animation goes here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  mockBox: {
    backgroundColor: '#eee',
    padding: 40,
    borderRadius: 12,
    fontSize: 18,
    color: '#666',
  },
});

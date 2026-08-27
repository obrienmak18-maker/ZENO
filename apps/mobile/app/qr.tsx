import { Redirect } from 'expo-router';

export default function LegacyQrRoute() {
  return <Redirect href="/(auth)/scan" />;
}

import { useLocalSearchParams } from "expo-router";

import { CrateDetailScreen } from "@/features/app-shell/screens/CrateDetailScreen";

export default function CrateDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <CrateDetailScreen crateId={id} />;
}

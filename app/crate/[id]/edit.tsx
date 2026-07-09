import { useLocalSearchParams } from "expo-router";

import { EditCrateScreen } from "@/features/app-shell/screens/EditCrateScreen";

export default function EditCrateRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <EditCrateScreen crateId={id} />;
}

import { useLocalSearchParams } from "expo-router";

import { EditCopyScreen } from "@/features/app-shell/screens/EditCopyScreen";

export default function EditCopyRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <EditCopyScreen copyId={id} />;
}

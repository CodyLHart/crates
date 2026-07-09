import { useLocalSearchParams } from "expo-router";

import { CopyDetailScreen } from "@/features/app-shell/screens/CopyDetailScreen";

export default function CopyDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <CopyDetailScreen copyId={id} />;
}

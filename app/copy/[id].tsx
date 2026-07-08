import { useLocalSearchParams } from "expo-router";

import { getCopyWithRelease } from "@/constants/demoData";
import { CopyDetailScreen } from "@/features/app-shell/screens/CopyDetailScreen";

export default function CopyDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <CopyDetailScreen copy={getCopyWithRelease(id)} />;
}

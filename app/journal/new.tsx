import { useLocalSearchParams } from "expo-router";

import { AddJournalEntryScreen } from "@/features/app-shell/screens/AddJournalEntryScreen";

export default function NewJournalEntryRoute() {
  const { copyId } = useLocalSearchParams<{ copyId?: string }>();

  return <AddJournalEntryScreen copyId={copyId} />;
}

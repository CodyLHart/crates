import { useLocalSearchParams } from "expo-router";

import { EditJournalEntryScreen } from "@/features/app-shell/screens/EditJournalEntryScreen";

export default function EditJournalEntryRoute() {
  const { id, returnCopyId } = useLocalSearchParams<{ id: string; returnCopyId?: string }>();

  return <EditJournalEntryScreen journalEntryId={id} returnCopyId={returnCopyId} />;
}

import { fireEvent, render, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";
import { Keyboard, Text as RNText } from "react-native";

import { FormScreen } from "@/components/FormScreen";
import { AddCopyScreen } from "@/features/app-shell/screens/AddCopyScreen";
import { EditJournalEntryScreen } from "@/features/app-shell/screens/EditJournalEntryScreen";
import type { CopyWithRelease, JournalEntryWithCopy } from "@/types/domain";

jest.mock("react-native-keyboard-controller", () => ({
  ...mockKeyboardController(),
}));

function mockKeyboardController() {
  const { Pressable, ScrollView, Text, View } = require("react-native");

  return {
    KeyboardProvider: ({ children }: { children: ReactNode }) => <View>{children}</View>,
    KeyboardAwareScrollView: ({ children, ...props }: { children: ReactNode }) => (
      <ScrollView {...props}>{children}</ScrollView>
    ),
    KeyboardToolbar: ({ onDoneCallback }: { onDoneCallback?: () => void }) => (
      <Pressable accessibilityLabel="Done" accessibilityRole="button" onPress={onDoneCallback}>
        <Text>Done</Text>
      </Pressable>
    ),
    KeyboardController: {
      setFocusTo: jest.fn(),
    },
  };
}

jest.mock("expo-router", () => ({
  ...mockExpoRouter(),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));

function mockExpoRouter() {
  const { Text } = require("react-native");

  return {
    Link: ({ children }: { children: ReactNode }) => <Text>{children}</Text>,
    useFocusEffect: jest.fn(),
    useRouter: () => ({
      replace: jest.fn(),
      canGoBack: jest.fn(() => true),
      back: jest.fn(),
    }),
  };
}

jest.mock("@/db/repositories", () => ({
  createCustomCopy: jest.fn(async () => "copy-new"),
  getJournalEntry: jest.fn(async () => mockJournalEntry),
  listCopies: jest.fn(async () => [mockCopy]),
  listCrates: jest.fn(async () => []),
  listTags: jest.fn(async () => []),
  softDeleteJournalEntry: jest.fn(),
  updateJournalEntry: jest.fn(),
}));

const mockCopy: CopyWithRelease = {
  id: "copy-blue-train",
  releaseId: null,
  mediaType: "Vinyl",
  titleOverride: "Blue Train",
  artistOverride: "John Coltrane",
  yearOverride: 1958,
  condition: "VG+",
  conditionMedia: "VG+",
  conditionSleeve: "VG+",
  rating: 5,
  acquiredFrom: "Shop",
  acquiredAt: "2026-07-01T00:00:00.000Z",
  personalNote: "A keeper.",
  crateIds: [],
  tagIds: [],
  lastPlayedAt: "2026-07-01T00:00:00.000Z",
  createdAt: "2026-07-01T00:00:00.000Z",
  updatedAt: "2026-07-01T00:00:00.000Z",
  deletedAt: null,
  release: null,
  crates: [],
  tags: [],
  journalEntries: [],
};

const mockJournalEntry: JournalEntryWithCopy = {
  id: "journal-blue-train",
  copyId: mockCopy.id,
  type: "note",
  title: "Sleeve note",
  body: "Needs a new inner sleeve.",
  occurredAt: "2026-07-10T12:30:00.000Z",
  createdAt: "2026-07-10T12:30:00.000Z",
  updatedAt: "2026-07-10T12:30:00.000Z",
  deletedAt: null,
  copy: mockCopy,
};

describe("FormScreen", () => {
  it("renders children inside the keyboard-aware scroll content", async () => {
    const { getByTestId, getByText } = await render(
      <FormScreen>
        <RNText>Form body</RNText>
      </FormScreen>,
    );

    expect(getByTestId("keyboard-aware-form-scroll")).toBeTruthy();
    expect(getByText("Form body")).toBeTruthy();
  });

  it("dismisses the keyboard from the toolbar Done action", async () => {
    const dismissSpy = jest.spyOn(Keyboard, "dismiss").mockImplementation(jest.fn());

    const { getByLabelText } = await render(
      <FormScreen>
        <RNText>Form body</RNText>
      </FormScreen>,
    );

    fireEvent.press(getByLabelText("Done"));

    expect(dismissSpy).toHaveBeenCalled();
    dismissSpy.mockRestore();
  });
});

describe("form screens", () => {
  it("renders Add Copy inside the shared keyboard-aware scroll wrapper", async () => {
    const { getByTestId, getByText } = await render(<AddCopyScreen />);

    await waitFor(() => expect(getByText("Save Copy")).toBeTruthy());

    expect(getByTestId("keyboard-aware-form-scroll")).toBeTruthy();
    expect(getByText("Save Copy")).toBeTruthy();
  });

  it("renders Edit Journal Entry inside the shared keyboard-aware scroll wrapper", async () => {
    const { getByTestId, getByText } = await render(
      <EditJournalEntryScreen journalEntryId="journal-blue-train" />,
    );

    await waitFor(() => expect(getByText("Save Changes")).toBeTruthy());

    expect(getByTestId("keyboard-aware-form-scroll")).toBeTruthy();
    expect(getByText("Save Changes")).toBeTruthy();
  });

  it("does not submit the multiline Journal body from keyboard return", async () => {
    const repositories = jest.requireMock("@/db/repositories") as {
      updateJournalEntry: jest.Mock;
    };

    const { getByLabelText } = await render(
      <EditJournalEntryScreen journalEntryId="journal-blue-train" />,
    );

    await waitFor(() => expect(getByLabelText("Description")).toBeTruthy());

    fireEvent(getByLabelText("Description"), "submitEditing");

    expect(repositories.updateJournalEntry).not.toHaveBeenCalled();
  });
});
